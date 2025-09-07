"use client";
import { Stack, FormControlLabel, Switch } from "@mui/material";
import type { ModelValues } from "@/types/model";
import { TOGGLE_FIELDS } from "@/configs/model-options";

type Props = {
    values: ModelValues;
    set: <K extends keyof ModelValues>(key: K, val: ModelValues[K]) => void;
};

export default function TogglesRow({ values, set }: Props) {
    return (
        <Stack direction="row" spacing={2} flexWrap="wrap">
            {TOGGLE_FIELDS.map(({ key, label }) => (
                <FormControlLabel
                    key={key}
                    control={
                        <Switch
                            checked={Boolean(values[key as keyof ModelValues])}
                            onChange={(e) => set(key as keyof ModelValues, e.target.checked)}
                        />
                    }
                    label={label}
                />
            ))}
        </Stack>
    );
}
