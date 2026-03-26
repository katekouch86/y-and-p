"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import { CITIES, getCityLabel } from "@/constants/cities";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Stack, Button, FormControlLabel, Switch,
    Divider, Typography, Alert, CircularProgress, Chip,
    IconButton, Autocomplete, ImageList, ImageListItem, Tooltip, MenuItem, Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MovieCreationOutlinedIcon from "@mui/icons-material/MovieCreationOutlined";
import NextImage from "next/image";
import type { Availability as ModelAvailability } from "@/types/model";

type Availability = ModelAvailability;
type PriceItem = { duration: string; price: string };
type Pricing = { incall?: PriceItem[]; outcall?: PriceItem[] };

export type ModelValues = {
    _id?: string;
    slug?: string;
    name: string;

    photo?: string;
    gallery?: string[];
    videos?: string[];

    about?: string;

    age?: number;
    nationality?: string;
    languages?: string[];
    eyeColor?: string;
    hairColor?: string;
    dressSize?: string;
    shoeSize?: number;
    heightCm?: number;
    weightKg?: number;
    cupSize?: string;
    smoking?: boolean;
    drinking?: boolean;
    snowParty?: boolean;
    tattoo?: boolean;
    piercing?: boolean;
    silicone?: boolean;

    availability: Availability[];
    pricing?: Pricing;

    stories?: Story[];
};

type Story = {
    _id?: string;
    url: string;
    type: "image" | "video";
    file?: File;
};

type Mode = "create" | "edit";

type SubmitPayload = unknown;
type SubmitResult = unknown;

type Props = {
    open: boolean;
    mode: Mode;
    onClose: () => void;
    context?: { slug?: string; title?: string };
    initialValues?: Partial<ModelValues>;
    fetchUrlBuilder?: (slug: string) => string;
    onSubmit: (payload: SubmitPayload, mode: Mode) => Promise<SubmitResult>;
    onSaved?: (doc: SubmitResult) => void;
};

const LANGUAGE_OPTIONS = ["English", "Italian", "Ukrainian", "Russian", "Polish", "German", "French", "Spanish", "Portuguese", "Romanian", "Czech", "Slovak", "Hungarian", "Greek", "Turkish", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Arabic", "Hebrew", "Chinese", "Japanese", "Korean"];

const DRESS_SIZE_OPTIONS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "EU 32", "EU 34", "EU 36", "EU 38", "EU 40", "EU 42", "EU 44", "EU 46"];
const EYE_COLOR_OPTIONS = ["Blue", "Green", "Brown", "Hazel", "Grey", "Amber", "Black"];
const HAIR_COLOR_OPTIONS = ["Blonde", "Brown", "Black", "Red", "Auburn", "Chestnut", "Grey", "White", "Dyed", "Highlights"];
const createEmptyAvailability = (): Availability => ({ city: "", startDate: "", endDate: "" });

const normalizeAvailability = (availability?: Availability[]): Availability[] =>
    availability?.length
        ? availability.map((slot) => ({
            ...slot,
            city: (getCityLabel(slot.city) || "") as Availability["city"],
        }))
        : [createEmptyAvailability()];

const normalizeSrc = (s?: string) => {
    if (!s) return "/images/placeholder.jpg";
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("data:")) return s;
    return s.startsWith("/") ? s : `/${s}`;
};

const toSlug = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const filePreview = (f: File | null) => (f ? URL.createObjectURL(f) : "");

type UploadApiFile = { url: string };
type UploadApiResponse = { files?: UploadApiFile[]; message?: string };

async function uploadFiles(files: File[], destFolder: string) {
    if (!files.length) return [] as string[];
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("dest", destFolder);

    const res = await fetch("/api/upload", {method: "POST", body: form});
    const data = (await res.json()) as UploadApiResponse;
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    return (data?.files ?? []).map((x) => x.url);
}

type BoolKey = Extract<
    keyof ModelValues,
    "smoking" | "drinking" | "snowParty" | "tattoo" | "piercing" | "silicone"
>;
const TOGGLE_FIELDS: ReadonlyArray<{ key: BoolKey; label: string }> = [
    {key: "smoking", label: "Smoking"},
    {key: "drinking", label: "Drinking"},
    {key: "snowParty", label: "Snow party"},
    {key: "tattoo", label: "Tattoo"},
    {key: "piercing", label: "Piercing"},
    {key: "silicone", label: "Silicone"},
];

export default function ModelUpsertModal({
                                             open,
                                             mode,
                                             onClose,
                                             context,
                                             initialValues,
                                             fetchUrlBuilder,
                                             onSubmit,
                                             onSaved,
                                         }: Props) {
    const [values, setValues] = useState<ModelValues | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const originalRef = useRef<ModelValues | null>(null);
    const [slugTouched, setSlugTouched] = useState(false);

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>("");

    const [coverWH, setCoverWH] = useState<{ w: number; h: number } | null>(null);

    const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);
    const [videosNewFiles, setVideosNewFiles] = useState<File[]>([]);

    const title = mode === "create" ? "Add new model" : `Edit: ${context?.title ?? context?.slug ?? ""}`;
    const hasCover = Boolean(coverFile || values?.photo);

    useEffect(() => {
        return () => {
            if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
            galleryNewFiles.forEach((f) => URL.revokeObjectURL(URL.createObjectURL(f)));
            videosNewFiles.forEach((f) => URL.revokeObjectURL(URL.createObjectURL(f)));
        };
    }, [coverPreviewUrl, galleryNewFiles, videosNewFiles]);

    useEffect(() => {
        const init = async () => {
            if (!open) return;

            const baseline: ModelValues = {
                name: "",
                photo: "",
                gallery: [],
                videos: [],
                languages: [],
                nationality: "",
                availability: [createEmptyAvailability()],
                pricing: {incall: [], outcall: []},
                smoking: false,
                drinking: false,
                snowParty: false,
                about: "",
                tattoo: false,
                piercing: false,
                silicone: false,
                stories: [],
            };

            setCoverFile(null);
            setCoverPreviewUrl("");
            setGalleryNewFiles([]);
            setVideosNewFiles([]);

            if (mode === "create") {
                const merged: ModelValues = {
                    ...baseline,
                    ...initialValues,
                    slug: initialValues?.slug ?? "",
                    name: initialValues?.name ?? "",
                    languages: initialValues?.languages ?? [],
                    gallery: initialValues?.gallery ?? [],
                    videos: initialValues?.videos ?? [],
                    about: initialValues?.about ?? "",
                    availability: normalizeAvailability(initialValues?.availability),
                    pricing: {
                        incall: initialValues?.pricing?.incall ?? [],
                        outcall: initialValues?.pricing?.outcall ?? [],
                    },
                };

                originalRef.current = null;
                setValues(merged);
                setError(null);
                setLoading(false);
                return;
            }


            if (context?.slug) {
                try {
                    setLoading(true);
                    setError(null);
                    const url = fetchUrlBuilder ? fetchUrlBuilder(context.slug) : `/api/models/${context.slug}`;
                    const res = await fetch(url, {cache: "no-store"});
                    const full = await res.json();
                    if (!res.ok) throw new Error((full && (full.message as string)) || "Failed to load model");

                    const normalized: ModelValues = {
                        ...baseline,
                        ...full,
                        languages: (full.languages as string[] | undefined) ?? [],
                        gallery: (full.gallery as string[] | undefined) ?? [],
                        videos: (full.videos as string[] | undefined) ?? [],
                        about: full.about ?? "",
                        availability: normalizeAvailability(full.availability),
                        pricing: {
                            incall: full.pricing?.incall ?? [],
                            outcall: full.pricing?.outcall ?? [],
                        },
                        stories: (full.stories as { url: string; type: "image" | "video" }[] | undefined) ?? [],
                    };
                    originalRef.current = normalized;
                    setValues(normalized);
                } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : "Failed to load model");
                } finally {
                    setLoading(false);
                }
                return;
            }

            const merged: ModelValues = {
                ...baseline,
                ...initialValues,
                languages: initialValues?.languages ?? [],
                gallery: initialValues?.gallery ?? [],
                videos: initialValues?.videos ?? [],
                about: initialValues?.about ?? "",
                availability:
                    normalizeAvailability(initialValues?.availability),
                pricing: {
                    incall: initialValues?.pricing?.incall ?? [],
                    outcall: initialValues?.pricing?.outcall ?? [],
                },
            };
            originalRef.current = merged;
            setValues(merged);
            setError(null);
            setLoading(false);
        };

        init();
    }, [open, mode, context?.slug, fetchUrlBuilder, initialValues]);

    const computeDiff = (from: ModelValues | null, to: ModelValues | null) => {
        if (!from || !to) return {};
        const diff: Record<string, unknown> = {};
        const shallow: (keyof ModelValues)[] = [
            "name", "photo", "age", "nationality", "eyeColor", "hairColor", "dressSize", "shoeSize",
            "heightCm", "weightKg", "cupSize", "smoking", "drinking", "snowParty", "tattoo", "piercing", "silicone", "about",
        ];
        for (const k of shallow) if (from[k] !== to[k]) diff[k as string] = to[k];

        const jsonEq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
        if (!jsonEq(from.languages ?? [], to.languages ?? [])) diff.languages = to.languages ?? [];
        if (!jsonEq(from.gallery ?? [], to.gallery ?? [])) diff.gallery = to.gallery ?? [];
        if (!jsonEq(from.videos ?? [], to.videos ?? [])) diff.videos = to.videos ?? [];
        diff.availability = to.availability;

        if (!jsonEq(from.pricing?.incall ?? [], to.pricing?.incall ?? [])) {
            diff.pricing = {...(diff.pricing as object | undefined), incall: to.pricing?.incall ?? []};
        }
        if (!jsonEq(from.pricing?.outcall ?? [], to.pricing?.outcall ?? [])) {
            diff.pricing = {...(diff.pricing as object | undefined), outcall: to.pricing?.outcall ?? []};
        }

        if (!jsonEq(from.stories ?? [], to.stories ?? [])) {
            diff.stories = (to.stories ?? []).map(s => ({ url: s.url, type: s.type }));
        }

        return diff;
    };


    const diffPayload = useMemo(() => computeDiff(originalRef.current, values), [values]);

    const set = <K extends keyof ModelValues>(key: K, val: ModelValues[K]) =>
        setValues((v) => (v ? {...v, [key]: val} : v));

    const setAvailability = (part: Partial<Availability>) =>
        setValues((v) => (v ? {...v, availability: [{...v.availability[0], ...part}]} : v));

    const addPriceRow = (kind: "incall" | "outcall") =>
        setValues((v) => {
            if (!v) return v;
            const next = {...(v.pricing ?? {incall: [], outcall: []})};
            next[kind] = [...(next[kind] ?? []), {duration: "", price: ""}];
            return {...v, pricing: next};
        });

    const setPriceRow = (kind: "incall" | "outcall", i: number, patch: Partial<PriceItem>) =>
        setValues((v) => {
            if (!v) return v;
            const next = {...(v.pricing ?? {incall: [], outcall: []})};
            const arr = [...(next[kind] ?? [])];
            arr[i] = {...arr[i], ...patch};
            next[kind] = arr;
            return {...v, pricing: next};
        });

    const removePriceRow = (kind: "incall" | "outcall", i: number) =>
        setValues((v) => {
            if (!v) return v;
            const next = {...(v.pricing ?? {incall: [], outcall: []})};
            const arr = [...(next[kind] ?? [])];
            arr.splice(i, 1);
            next[kind] = arr;
            return {...v, pricing: next};
        });

    const canSubmit = useMemo(() => {
        if (!values) return false;
        const a = values.availability?.[0];
        if (mode === "create") {
            return Boolean(values.slug && values.name && a?.city && a?.startDate && a?.endDate);
        }
        return true;
    }, [mode, values]);

    const handleNameChange = (v: string) => {
        if (mode !== "create") {
            set("name", v);
            return;
        }
        setValues((prev) => {
            if (!prev) return prev;
            const next = {...prev, name: v};
            if (!slugTouched) next.slug = toSlug(v);
            return next;
        });
    };

    const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setCoverFile(f);
        const u = filePreview(f);
        setCoverPreviewUrl(u);
    };
    const setCoverFromGallery = (url: string) => {
        set("photo", url);
        setCoverFile(null);
        setCoverPreviewUrl("");
    };
    const removeCover = () => {
        set("photo", "");
        setCoverFile(null);
        setCoverPreviewUrl("");
    };

    const onPickGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setGalleryNewFiles((prev) => [...prev, ...files]);
    };
    const removeGalleryExisting = (url: string) => {
        set("gallery", (values?.gallery ?? []).filter((x) => x !== url));
    };
    const removeGalleryNew = (idx: number) => {
        setGalleryNewFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const onPickVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setVideosNewFiles((prev) => [...prev, ...files]);
    };
    const removeVideoExisting = (url: string) => {
        set("videos", (values?.videos ?? []).filter((x) => x !== url));
    };
    const removeVideoNew = (idx: number) => {
        setVideosNewFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const onSubmitClick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values) return;

        const slug = (mode === "create" ? values.slug : context?.slug) || "tmp";
        const baseDest = `models/${slug}`;

        let uploadedCoverUrl: string | undefined;
        if (coverFile) {
            const [u] = await uploadFiles([coverFile], `${baseDest}/cover`);
            uploadedCoverUrl = u;
        }

        let uploadedGalleryUrls: string[] = [];
        if (galleryNewFiles.length) {
            uploadedGalleryUrls = await uploadFiles(galleryNewFiles, `${baseDest}/images`);
        }

        let uploadedVideoUrls: string[] = [];
        if (videosNewFiles.length) {
            uploadedVideoUrls = await uploadFiles(videosNewFiles, `${baseDest}/videos`);
        }

        // === STORIES upload ===
        let uploadedStories: { url: string; type: "image" | "video" }[] = [];
        if (values?.stories?.length) {
            const localStories = values.stories.filter(s => s.url.startsWith("blob:"));
            if (localStories.length) {
                const imgFiles = localStories.filter(s => s.type === "image" && s.file).map(s => s.file!);
                const vidFiles = localStories.filter(s => s.type === "video" && s.file).map(s => s.file!);

                const uploadedImgs = await uploadFiles(imgFiles, `${baseDest}/stories/images`);
                const uploadedVids = await uploadFiles(vidFiles, `${baseDest}/stories/videos`);


                uploadedStories = [
                    ...uploadedImgs.map(url => ({ url, type: "image" as const })),
                    ...uploadedVids.map(url => ({ url, type: "video" as const })),
                ];
            }
        }

        const finalStories = [
            ...(values.stories?.filter(s => !s.url.startsWith("blob:")) ?? []),
            ...uploadedStories,
        ];

        // === COMMON FINAL VALUES ===
        const finalPhoto = uploadedCoverUrl ?? values.photo;
        const finalGallery = [...(values.gallery ?? []), ...uploadedGalleryUrls];
        const finalVideos = [...(values.videos ?? []), ...uploadedVideoUrls];

        if (mode === "create") {
            const payload = {
                slug: values.slug,
                name: values.name,
                photo: finalPhoto,
                gallery: finalGallery,
                videos: finalVideos,
                about: values.about?.trim() || undefined,

                age: values.age,
                nationality: values.nationality?.trim() || undefined,
                languages: values.languages ?? [],
                eyeColor: values.eyeColor,
                hairColor: values.hairColor,
                dressSize: values.dressSize,
                shoeSize: values.shoeSize,
                heightCm: values.heightCm,
                weightKg: values.weightKg,
                cupSize: values.cupSize,
                smoking: values.smoking ?? false,
                drinking: values.drinking ?? false,
                snowParty: values.snowParty ?? false,
                tattoo: values.tattoo ?? false,
                piercing: values.piercing ?? false,
                silicone: values.silicone ?? false,

                availability: values.availability,
                pricing: values.pricing,
                stories: finalStories,
            };

            setSaving(true);
            setError(null);
            try {
                const saved = await onSubmit(payload, "create");
                onSaved?.(saved);
                onClose();
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to create");
            } finally {
                setSaving(false);
            }
            return;
        }

        // === EDIT mode ===
        setValues(v => (v ? { ...v, photo: finalPhoto, gallery: finalGallery, videos: finalVideos } : v));

        const payload: Record<string, unknown> = {
            ...diffPayload,
            ...(uploadedCoverUrl ? { photo: finalPhoto } : {}),
            ...(uploadedGalleryUrls.length ? { gallery: finalGallery } : {}),
            ...(uploadedVideoUrls.length ? { videos: finalVideos } : {}),
            ...(uploadedStories.length || diffPayload.stories ? { stories: finalStories } : {}),
        };

        if (!Object.keys(payload).length) {
            onClose();
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const saved = await onSubmit(payload, "edit");
            onSaved?.(saved);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setSaving(false);
        }
    };

    const coverUrlRaw = coverFile ? coverPreviewUrl : values?.photo || "/images/placeholder.jpg";
    const coverUrl = normalizeSrc(coverUrlRaw);

    useEffect(() => {
        setCoverWH(null);
        if (!coverUrl) return;
        if (typeof window === "undefined") return;
        const imgEl = new window.Image();
        imgEl.src = coverUrl;
        imgEl.onload = () => {
            const w = imgEl.naturalWidth || 800;
            const h = imgEl.naturalHeight || 600;
            setCoverWH({w, h});
        };
    }, [coverUrl]);

    const coverIsExternalOrBlob =
        coverUrl.startsWith("http://") || coverUrl.startsWith("https://") || coverUrl.startsWith("blob:") || coverUrl.startsWith("data:");

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{sx: {overflowX: "hidden"}}}>
            <DialogTitle sx={{px: 3, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                {title}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{px: 3, overflowX: "hidden"}}>
                {loading ? (
                    <Stack alignItems="center" py={4}>
                        <CircularProgress/>
                    </Stack>
                ) : !values ? (
                    <Alert severity="error">{error || "No data"}</Alert>
                ) : (
                    <form onSubmit={onSubmitClick}>
                        <Stack spacing={3}>
                            {/* COVER */}
                            <Stack spacing={1}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Cover photo
                                </Typography>

                                {hasCover ? (
                                    <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                                        <NextImage
                                            src={coverUrl}
                                            alt="Cover photo"
                                            width={coverWH?.w ?? 800}
                                            height={coverWH?.h ?? 600}
                                            unoptimized={coverIsExternalOrBlob}
                                            priority
                                            sizes="(max-width: 900px) 100vw, 800px"
                                            style={{
                                                maxWidth: "100%",
                                                height: "auto",
                                                borderRadius: 12,
                                                display: "block",
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <Stack
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            width: "100%",
                                            height: 320,
                                            borderRadius: 2,
                                            border: "1px dashed",
                                            borderColor: "divider",
                                            bgcolor: "background.default",
                                        }}
                                        spacing={1.5}
                                    >
                                        <PhotoCameraIcon sx={{fontSize: 48, opacity: 0.6}}/>
                                        <Typography variant="body2" color="text.secondary">
                                            No cover uploaded yet
                                        </Typography>

                                        <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon/>}>
                                            Upload cover
                                            <input hidden accept="image/*" type="file" onChange={onPickCover}/>
                                        </Button>
                                    </Stack>
                                )}

                                <Stack direction="row" spacing={1} sx={{flexWrap: "wrap"}}>
                                    {!!values.gallery?.length && (
                                        <Tooltip title="Set from first gallery image (click a thumbnail to choose any)">
                      <span>
                        <Button variant="text" onClick={() => setCoverFromGallery(values.gallery![0])}
                                startIcon={<CheckCircleIcon/>}>
                          Use first gallery as cover
                        </Button>
                      </span>
                                        </Tooltip>
                                    )}
                                    {hasCover && (
                                        <Button variant="text" color="error" onClick={removeCover}
                                                startIcon={<DeleteOutlineIcon/>}>
                                            Remove cover
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>

                            <Divider/>

                            {/* BASIC FIELDS */}
                            <Grid container spacing={2}>
                                {mode === "create" ? (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField label="Name *" fullWidth value={values.name}
                                                       onChange={(e) => handleNameChange(e.target.value)}/>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Slug * (lowercase, hyphens)"
                                                fullWidth
                                                value={values.slug ?? ""}
                                                onChange={(e) => {
                                                    setSlugTouched(true);
                                                    set("slug", toSlug(e.target.value));
                                                }}
                                            />
                                        </Grid>
                                    </>
                                ) : (
                                    <Grid item xs={12}>
                                        <TextField label="Name" fullWidth value={values.name}
                                                   onChange={(e) => set("name", e.target.value)}/>
                                    </Grid>
                                )}

                                <Grid item xs={12} sm={6}>
                                    <TextField label="Nationality" fullWidth value={values.nationality ?? ""}
                                               onChange={(e) => set("nationality", e.target.value)}/>
                                </Grid>

                                {/* removed Video URL field */}

                                <Grid item xs={12} sm={3}>
                                    <TextField label="Age" type="number" fullWidth value={values.age ?? ""}
                                               onChange={(e) => set("age", Number(e.target.value) || undefined)}/>
                                </Grid>

                                {/* dropdowns */}
                                <Grid item xs={12} sm={3}>
                                    <TextField select label="Dress size" fullWidth value={values.dressSize ?? ""}
                                               onChange={(e) => set("dressSize", e.target.value)}>
                                        <MenuItem value="" disabled>Select…</MenuItem>
                                        {DRESS_SIZE_OPTIONS.map((opt) => <MenuItem key={opt}
                                                                                   value={opt}>{opt}</MenuItem>)}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField select label="Eye color" fullWidth value={values.eyeColor ?? ""}
                                               onChange={(e) => set("eyeColor", e.target.value)}>
                                        <MenuItem value="" disabled>Select…</MenuItem>
                                        {EYE_COLOR_OPTIONS.map((opt) => <MenuItem key={opt}
                                                                                  value={opt}>{opt}</MenuItem>)}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField select label="Hair color" fullWidth value={values.hairColor ?? ""}
                                               onChange={(e) => set("hairColor", e.target.value)}>
                                        <MenuItem value="" disabled>Select…</MenuItem>
                                        {HAIR_COLOR_OPTIONS.map((opt) => <MenuItem key={opt}
                                                                                   value={opt}>{opt}</MenuItem>)}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField label="Height (cm)" type="number" fullWidth value={values.heightCm ?? ""}
                                               onChange={(e) => set("heightCm", Number(e.target.value) || undefined)}/>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField label="Weight (kg)" type="number" fullWidth value={values.weightKg ?? ""}
                                               onChange={(e) => set("weightKg", Number(e.target.value) || undefined)}/>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField label="Shoe size" type="number" fullWidth value={values.shoeSize ?? ""}
                                               onChange={(e) => set("shoeSize", Number(e.target.value) || undefined)}/>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField label="Cup size" fullWidth value={values.cupSize ?? ""}
                                               onChange={(e) => set("cupSize", e.target.value)}/>
                                </Grid>

                                {/* Languages */}
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={LANGUAGE_OPTIONS}
                                        value={values.languages ?? []}
                                        onChange={(_e, newValue) => {
                                            const list = (newValue as readonly string[]) || [];
                                            const arr = Array.from(new Set(list.map((v) => v.trim()).filter(Boolean)));
                                            set("languages", arr);
                                        }}
                                        renderTags={(value: readonly string[], getTagProps) =>
                                            value.map((option: string, index: number) => (
                                                <Chip variant="outlined" label={option} {...getTagProps({index})}
                                                      key={option}/>
                                            ))
                                        }
                                        renderInput={(params) => <TextField {...params} label="Languages"
                                                                            placeholder="Select or type…"/>}
                                    />
                                </Grid>

                                {/* Toggles */}
                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        {TOGGLE_FIELDS.map(({key, label}) => (
                                            <FormControlLabel
                                                key={key}
                                                control={<Switch checked={Boolean(values[key])}
                                                                 onChange={(e) => set(key, e.target.checked)}/>}
                                                label={label}
                                            />
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Divider/>

                            <Typography variant="subtitle1" fontWeight={700}>About</Typography>
                            <TextField
                                label="Short bio / about"
                                fullWidth
                                multiline
                                minRows={4}
                                maxRows={12}
                                value={values.about ?? ""}
                                onChange={(e) => set("about", e.target.value)}
                                placeholder="Write a short bio, specialties, vibe, notes, etc."
                            />

                            {/* MULTI-CITY AVAILABILITY */}
                            <Typography variant="subtitle1" fontWeight={700}>
                                Availability (multi-city)
                            </Typography>

                            <Stack spacing={2}>

                                {values.availability.map((item, index) => (
                                    <Grid
                                        container
                                        spacing={2}
                                        key={index}
                                        sx={{
                                            border: "1px solid #ddd",
                                            borderRadius: 2,
                                            p: 2,
                                            background: "#fafafa"
                                        }}
                                    >
                                        {/* CITY */}
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                label="City"
                                                fullWidth
                                                value={item.city}
                                                onChange={(e) => {
                                                    const next = [...values.availability];
                                                    next[index].city = getCityLabel(e.target.value) || "";
                                                    set("availability", next);
                                                }}
                                                select
                                            >
                                                <MenuItem value="" disabled>Select…</MenuItem>
                                                {CITIES.map((city) => (
                                                    <MenuItem key={city} value={city}>{city}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>

                                        {/* START DATE */}
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                type="date"
                                                label="Start date"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={item.startDate}
                                                onChange={(e) => {
                                                    const next = [...values.availability];
                                                    next[index].startDate = e.target.value;
                                                    set("availability", next);
                                                }}
                                            />
                                        </Grid>

                                        {/* END DATE */}
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                type="date"
                                                label="End date"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={item.endDate}
                                                onChange={(e) => {
                                                    const next = [...values.availability];
                                                    next[index].endDate = e.target.value;
                                                    set("availability", next);
                                                }}
                                            />
                                        </Grid>

                                        {/* REMOVE */}
                                        <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center" }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => {
                                                    let next = [...values.availability];
                                                    next.splice(index, 1);

                                                    if (next.length === 0) {
                                                        next = [createEmptyAvailability()];
                                                    }

                                                    set("availability", next);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </Grid>
                                    </Grid>
                                ))}

                                {/* ADD */}
                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        set("availability", [
                                            ...values.availability,
                                            createEmptyAvailability()
                                        ])
                                    }
                                >
                                    + Add another city
                                </Button>

                            </Stack>


                            <Divider/>

                            {/* PRICING */}
                            <Typography variant="subtitle1" fontWeight={700}>Pricing</Typography>
                            <Grid container spacing={2}>
                                {/* INCALL */}
                                <Grid item xs={12} md={6}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight={600}>Incall</Typography>
                                        <Button size="small" variant="outlined" onClick={() => addPriceRow("incall")}>+
                                            Add</Button>
                                    </Stack>
                                    <Stack spacing={1}>
                                        {(values.pricing?.incall ?? []).map((row, i) => (
                                            <Grid key={`incall-${i}`} container spacing={1}>
                                                <Grid item xs={5}>
                                                    <TextField label="Duration" fullWidth value={row.duration}
                                                               onChange={(e) => setPriceRow("incall", i, {duration: e.target.value})}/>
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField label="Price" fullWidth value={row.price}
                                                               onChange={(e) => setPriceRow("incall", i, {price: e.target.value})}/>
                                                </Grid>
                                                <Grid item xs={2} sx={{display: "flex", alignItems: "center"}}>
                                                    <Button color="error"
                                                            onClick={() => removePriceRow("incall", i)}>Remove</Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        {!(values.pricing?.incall?.length) && (
                                            <Typography variant="body2" color="text.secondary">No incall
                                                items</Typography>
                                        )}
                                    </Stack>
                                </Grid>

                                {/* OUTCALL */}
                                <Grid item xs={12} md={6}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight={600}>Outcall</Typography>
                                        <Button size="small" variant="outlined" onClick={() => addPriceRow("outcall")}>+
                                            Add</Button>
                                    </Stack>
                                    <Stack spacing={1}>
                                        {(values.pricing?.outcall ?? []).map((row, i) => (
                                            <Grid key={`outcall-${i}`} container spacing={1}>
                                                <Grid item xs={5}>
                                                    <TextField label="Duration" fullWidth value={row.duration}
                                                               onChange={(e) => setPriceRow("outcall", i, {duration: e.target.value})}/>
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField label="Price" fullWidth value={row.price}
                                                               onChange={(e) => setPriceRow("outcall", i, {price: e.target.value})}/>
                                                </Grid>
                                                <Grid item xs={2} sx={{display: "flex", alignItems: "center"}}>
                                                    <Button color="error"
                                                            onClick={() => removePriceRow("outcall", i)}>Remove</Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        {!(values.pricing?.outcall?.length) && (
                                            <Typography variant="body2" color="text.secondary">No outcall
                                                items</Typography>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Divider/>

                            {/* GALLERY */}
                            <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight={700}>Gallery</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon/>}>
                                            Add images
                                            <input hidden accept="image/*" type="file" multiple
                                                   onChange={onPickGallery}/>
                                        </Button>
                                    </Stack>
                                </Stack>

                                {(values.gallery ?? []).length > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">Existing</Typography>
                                        <ImageList cols={4} gap={8} sx={{m: 0, overflow: "hidden"}}>
                                            {(values.gallery ?? []).map((rawUrl) => {
                                                const url = normalizeSrc(rawUrl);
                                                const unopt =
                                                    url.startsWith("/uploads") ||
                                                    url.startsWith("blob:") ||
                                                    url.startsWith("data:");
                                                return (
                                                    <ImageListItem key={url} sx={{position: "relative"}}>
                                                        <div style={{
                                                            position: "relative",
                                                            width: "100%",
                                                            paddingTop: "100%",
                                                            borderRadius: 8,
                                                            overflow: "hidden"
                                                        }}>
                                                            <NextImage src={url} alt="gallery" fill unoptimized={unopt}
                                                                       style={{objectFit: "cover"}}/>
                                                            <Stack direction="row" spacing={1}
                                                                   sx={{position: "absolute", top: 6, right: 6}}>
                                                                <Tooltip title="Set as cover">
                                                                    <IconButton size="small" color="primary"
                                                                                onClick={() => setCoverFromGallery(url)}>
                                                                        <CheckCircleIcon fontSize="small"/>
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Remove">
                                                                    <IconButton size="small" color="error"
                                                                                onClick={() => removeGalleryExisting(rawUrl)}>
                                                                        <DeleteOutlineIcon fontSize="small"/>
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </div>
                                                    </ImageListItem>
                                                );
                                            })}
                                        </ImageList>
                                    </>
                                )}

                                {galleryNewFiles.length > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">New (to
                                            upload)</Typography>
                                        <ImageList cols={4} gap={8} sx={{m: 0, overflow: "hidden"}}>
                                            {galleryNewFiles.map((f, idx) => {
                                                const u = URL.createObjectURL(f);
                                                return (
                                                    <ImageListItem key={idx} sx={{position: "relative"}}>
                                                        <div style={{
                                                            position: "relative",
                                                            width: "100%",
                                                            paddingTop: "100%",
                                                            borderRadius: 8,
                                                            overflow: "hidden"
                                                        }}>
                                                            <NextImage src={u} alt={`new-${idx}`} fill unoptimized
                                                                       style={{objectFit: "cover"}}/>
                                                            <Stack direction="row" spacing={1}
                                                                   sx={{position: "absolute", top: 6, right: 6}}>
                                                                <Tooltip title="Remove">
                                                                    <IconButton size="small" color="error"
                                                                                onClick={() => removeGalleryNew(idx)}>
                                                                        <DeleteOutlineIcon fontSize="small"/>
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </div>
                                                    </ImageListItem>
                                                );
                                            })}
                                        </ImageList>
                                    </>
                                )}
                            </Stack>

                            <Divider/>

                            {/* VIDEOS */}
                            <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight={700}>Videos</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button component="label" variant="outlined"
                                                startIcon={<MovieCreationOutlinedIcon/>}>
                                            Add videos
                                            <input hidden accept="video/*" type="file" multiple
                                                   onChange={onPickVideos}/>
                                        </Button>
                                    </Stack>
                                </Stack>

                                {(values.videos ?? []).length > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">Existing</Typography>
                                        <Grid container spacing={2}>
                                            {(values.videos ?? []).map((url) => (
                                                <Grid item xs={12} sm={6} md={4} key={url}>
                                                    <Stack spacing={0.5}>
                                                        <video src={url} controls
                                                               style={{width: "100%", borderRadius: 8}}/>
                                                        <Button size="small" color="error"
                                                                onClick={() => removeVideoExisting(url)}>
                                                            Remove
                                                        </Button>
                                                    </Stack>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </>
                                )}

                                {videosNewFiles.length > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">New (to
                                            upload)</Typography>
                                        <Grid container spacing={2}>
                                            {videosNewFiles.map((f, idx) => {
                                                const u = URL.createObjectURL(f);
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} key={idx}>
                                                        <Stack spacing={0.5}>
                                                            <video src={u} controls
                                                                   style={{width: "100%", borderRadius: 8}}/>
                                                            <Button size="small" color="error"
                                                                    onClick={() => removeVideoNew(idx)}>
                                                                Remove
                                                            </Button>
                                                        </Stack>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </>
                                )}
                            </Stack>

                            <Divider/>

                            {/* STORIES */}
                            <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight={700}>Stories</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon/>}>
                                            Add images
                                            <input
                                                hidden
                                                accept="image/*"
                                                type="file"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    if (!files.length) return;
                                                    setValues(v =>
                                                        v ? {
                                                            ...v,
                                                            stories: [
                                                                ...(v.stories ?? []),
                                                                ...files.map(f => ({
                                                                    url: URL.createObjectURL(f),
                                                                    type: "image" as const,
                                                                    file: f,
                                                                }))
                                                            ]
                                                        } : v
                                                    );
                                                }}
                                            />
                                        </Button>
                                        <Button component="label" variant="outlined"
                                                startIcon={<MovieCreationOutlinedIcon/>}>
                                            Add videos
                                            <input
                                                hidden
                                                accept="video/*"
                                                type="file"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    if (!files.length) return;
                                                    setValues(v =>
                                                        v ? {
                                                            ...v,
                                                            stories: [
                                                                ...(v.stories ?? []),
                                                                ...files.map(f => ({
                                                                    url: URL.createObjectURL(f),
                                                                    type: "video" as const,
                                                                    file: f,
                                                                }))
                                                            ]
                                                        } : v
                                                    );
                                                }}
                                            />
                                        </Button>
                                    </Stack>
                                </Stack>

                                {(values?.stories ?? []).length > 0 && (
                                    <Grid container spacing={2}>
                                        {values!.stories!.map((s, idx) => (
                                            <Grid item xs={12} sm={6} md={4} key={s._id || idx}>
                                                {s.type === "image" ? (
                                                    <NextImage
                                                        src={normalizeSrc(s.url)}
                                                        alt={`story-${idx}`}
                                                        width={200}
                                                        height={300}
                                                        style={{borderRadius: 8, objectFit: "cover"}}
                                                    />
                                                ) : (
                                                    <video src={normalizeSrc(s.url)} controls
                                                           style={{width: "100%", borderRadius: 8}}/>
                                                )}
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        setValues(v => v ? {
                                                            ...v,
                                                            stories: v.stories?.filter((_, i) => i !== idx)
                                                        } : v)
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Stack>

                            {error && <Alert severity="error">{error}</Alert>}
                        </Stack>
                    </form>
                )}
            </DialogContent>

            <DialogActions sx={{px: 3}}>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onSubmitClick}
                    disabled={saving || loading || !canSubmit}
                    startIcon={saving ? <CircularProgress size={18} color="inherit"/> : undefined}
                >
                    {mode === "create" ? "Create" : "Save changes"}
                </Button>
            </DialogActions>
            <Backdrop open={saving} sx={{color: '#fff', zIndex: (t) => t.zIndex.modal + 1}}>
                <CircularProgress color="inherit"/>
            </Backdrop>
        </Dialog>
    );
}
