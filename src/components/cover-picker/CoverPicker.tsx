"use client";
import { Stack, Button, Tooltip } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NextImage from "next/image";

type Props = {
    coverUrl: string;
    coverIsExternalOrBlob: boolean;
    coverWH: { w: number; h: number } | null;
    hasGallery: boolean;
    onPickCover: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUseFirstFromGallery: () => void;
    onRemoveCover: () => void;
};

export default function CoverPicker({
                                        coverUrl, coverIsExternalOrBlob, coverWH,
                                        hasGallery, onPickCover, onUseFirstFromGallery, onRemoveCover,
                                    }: Props) {
    return (
        <Stack spacing={1}>
            <div style={{ width:"100%", display:"flex", justifyContent:"center" }}>
                <NextImage
                    src={coverUrl} alt="cover"
                    width={coverWH?.w ?? 800}
                    height={coverWH?.h ?? 600}
                    unoptimized={coverIsExternalOrBlob}
                    priority sizes="(max-width: 900px) 100vw, 800px"
                    style={{ maxWidth:"100%", height:"auto", borderRadius:12, display:"block" }}
                />
            </div>
            <Stack direction="row" spacing={1} sx={{ flexWrap:"wrap" }}>
                <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon/>}>
                    Upload cover
                    <input hidden accept="image/*" type="file" onChange={onPickCover}/>
                </Button>

                {hasGallery && (
                    <Tooltip title="Set from first gallery image (click a thumbnail to choose any)">
            <span>
              <Button variant="text" onClick={onUseFirstFromGallery} startIcon={<CheckCircleIcon/>}>
                Use first gallery as cover
              </Button>
            </span>
                    </Tooltip>
                )}

                <Button variant="text" color="error" onClick={onRemoveCover} startIcon={<DeleteOutlineIcon/>}>
                    Remove cover
                </Button>
            </Stack>
        </Stack>
    );
}
