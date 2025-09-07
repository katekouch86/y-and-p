"use client";
import { Stack, ImageList, ImageListItem, IconButton, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NextImage from "next/image";

type Props = {
    existing: string[];
    newFiles: File[];
    normalize: (s?: string) => string;
    onSetCoverFromExisting: (url: string) => void;
    onRemoveExisting: (url: string) => void;
    onRemoveNew: (idx: number) => void;
    onPickNew: (e: React.ChangeEvent<HTMLInputElement>) => void;
    AddButton: React.ReactNode;
};

export default function GalleryGrid({
                                        existing, newFiles, normalize,
                                        onSetCoverFromExisting, onRemoveExisting, onRemoveNew, onPickNew, AddButton,
                                    }: Props) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={700}>Gallery</Typography>
                {AddButton}
            </Stack>

            {!!existing.length && (
                <>
                    <Typography variant="caption" color="text.secondary">Existing</Typography>
                    <ImageList cols={4} gap={8} sx={{ m:0, overflow:"hidden" }}>
                        {existing.map((raw) => {
                            const url = normalize(raw);
                            const unopt = url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:");
                            return (
                                <ImageListItem key={url} sx={{ position:"relative" }}>
                                    <div style={{ position:"relative", width:"100%", paddingTop:"100%", borderRadius:8, overflow:"hidden" }}>
                                        <NextImage src={url} alt="gallery" fill unoptimized={unopt} style={{ objectFit:"cover" }} />
                                        <Stack direction="row" spacing={1} sx={{ position:"absolute", top:6, right:6 }}>
                                            <Tooltip title="Set as cover">
                                                <IconButton size="small" color="primary" onClick={() => onSetCoverFromExisting(url)}>
                                                    <CheckCircleIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Remove">
                                                <IconButton size="small" color="error" onClick={() => onRemoveExisting(raw)}>
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

            {!!newFiles.length && (
                <>
                    <Typography variant="caption" color="text.secondary">New (to upload)</Typography>
                    <ImageList cols={4} gap={8} sx={{ m:0, overflow:"hidden" }}>
                        {newFiles.map((f, idx) => {
                            const u = URL.createObjectURL(f);
                            return (
                                <ImageListItem key={idx} sx={{ position:"relative" }}>
                                    <div style={{ position:"relative", width:"100%", paddingTop:"100%", borderRadius:8, overflow:"hidden" }}>
                                        <NextImage src={u} alt={`new-${idx}`} fill unoptimized style={{ objectFit:"cover" }}/>
                                        <Stack direction="row" spacing={1} sx={{ position:"absolute", top:6, right:6 }}>
                                            <Tooltip title="Remove">
                                                <IconButton size="small" color="error" onClick={() => onRemoveNew(idx)}>
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

            <input hidden accept="image/*" type="file" multiple onChange={onPickNew}/>
        </Stack>
    );
}
