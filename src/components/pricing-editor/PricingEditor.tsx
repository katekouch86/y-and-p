"use client";
import { Grid, Stack, Typography, Button, TextField } from "@mui/material";
import type { Pricing, PriceItem } from "@/types/model";

type Props = {
    pricing?: Pricing;
    addRow: (kind: "incall" | "outcall") => void;
    setRow: (kind: "incall" | "outcall", i: number, patch: Partial<PriceItem>) => void;
    removeRow: (kind: "incall" | "outcall", i: number) => void;
};

export default function PricingEditor({ pricing, addRow, setRow, removeRow }: Props) {
    const renderBlock = (kind: "incall" | "outcall", title: string) => {
        const arr = pricing?.[kind] ?? [];
        return (
            <Grid item xs={12} md={6}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body1" fontWeight={600}>{title}</Typography>
                    <Button size="small" variant="outlined" onClick={() => addRow(kind)}>+ Add</Button>
                </Stack>
                <Stack spacing={1}>
                    {arr.map((row, i) => (
                        <Grid key={`${kind}-${i}`} container spacing={1}>
                            <Grid item xs={5}>
                                <TextField label="Duration" fullWidth value={row.duration}
                                           onChange={(e) => setRow(kind, i, { duration: e.target.value })}/>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField label="Price" fullWidth value={row.price}
                                           onChange={(e) => setRow(kind, i, { price: e.target.value })}/>
                            </Grid>
                            <Grid item xs={2} sx={{ display:"flex", alignItems:"center" }}>
                                <Button color="error" onClick={() => removeRow(kind, i)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))}
                    {!arr.length && <Typography variant="body2" color="text.secondary">No {title.toLowerCase()} items</Typography>}
                </Stack>
            </Grid>
        );
    };

    return (
        <Grid container spacing={2}>
            {renderBlock("incall", "Incall")}
            {renderBlock("outcall", "Outcall")}
        </Grid>
    );
}
