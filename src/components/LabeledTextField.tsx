import { TextField, type TextFieldProps } from "@mui/material";

interface LabeledTextFieldProps extends Omit<TextFieldProps, "label" | "name" | "value" | "onChange"> {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LabeledTextField({
    label,
    name,
    value,
    onChange,
    ...rest
}: LabeledTextFieldProps) {
    return (
        <TextField
            fullWidth
            size="small"
            margin="dense"
            autoComplete="off"
            variant="outlined"
            aria-label={label}
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            {...rest}
        />
    );
}