"use client";
import { Grid, TextField, Typography } from "@mui/material";
import type { Availability } from "@/types/model";

type Props = {
    availability: Availability[];
    setAvailability: (patch: Partial<Availability>) => void;
    required?: boolean;
};

export default function AvailabilityFields({ availability, setAvailability, required }: Props) {
    const a = availability?.[0] ?? { city:"", startDate:"", endDate:"" };
    return (
        <>
            <Typography variant="subtitle1" fontWeight={700}>
                Availability {required ? "(required)" : ""}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <TextField label="City" fullWidth value={a.city} onChange={(e)=>setAvailability({ city: e.target.value })}/>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField label="Start date" type="date" fullWidth value={a.startDate}
                               onChange={(e)=>setAvailability({ startDate: e.target.value })} InputLabelProps={{ shrink:true }}/>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField label="End date" type="date" fullWidth value={a.endDate}
                               onChange={(e)=>setAvailability({ endDate: e.target.value })} InputLabelProps={{ shrink:true }}/>
                </Grid>
            </Grid>
        </>
    );
}
