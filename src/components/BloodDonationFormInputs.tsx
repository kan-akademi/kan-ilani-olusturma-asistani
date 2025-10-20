import { useState } from "react";
import { useTranslation } from "react-i18next";
import LabeledTextField from "./LabeledTextField";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Checkbox,
  ListItemText,
  FormHelperText,
} from "@mui/material";
import type { BloodDonationFormEntity } from "../entities/BloodDonationFormEntity";

interface InputProps {
  formData: BloodDonationFormEntity;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeBloodGroup: (e: SelectChangeEvent) => void;
  handleChangeBloodType: (e: SelectChangeEvent<string[]>) => void;
  handleChangeFullName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeLocation: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadImageAndUpdateCounter: () => void;
}

export default function BloodDonationFormInputs(props: InputProps) {
  const { t, i18n } = useTranslation();
  const [showErrors, setShowErrors] = useState(false);

  const selectedBloodTypes = Array.isArray(props.formData.bloodType.value)
    ? props.formData.bloodType.value
    : props.formData.bloodType.value
    ? [props.formData.bloodType.value]
    : [];

  const isEmpty = (val: any) => {
    if (val === null || val === undefined) return true;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === "string") return val.trim().length === 0;
    return !val;
  };

  const bloodGroupError = showErrors && isEmpty(props.formData.bloodGroup.value);
  const bloodTypeError = showErrors && selectedBloodTypes.length === 0;
  const fullNameError = showErrors && isEmpty(props.formData.fullName.value);
  const phoneError = showErrors && isEmpty(props.formData.phone.value);
  const dateError = showErrors && isEmpty(props.formData.date.value);
  const hospitalError = showErrors && isEmpty(props.formData.hospital.value);
  const locationError = showErrors && isEmpty(props.formData.location.value);

  const validate = () => {
    return (
      !isEmpty(props.formData.bloodGroup.value) &&
      selectedBloodTypes.length > 0 &&
      !isEmpty(props.formData.fullName.value) &&
      !isEmpty(props.formData.phone.value) &&
      !isEmpty(props.formData.date.value) &&
      !isEmpty(props.formData.hospital.value) &&
      !isEmpty(props.formData.location.value)
    );
  };

  const handleDownloadClick = () => {
    setShowErrors(true);
    validate();
    props.downloadImageAndUpdateCounter();
  };

  return (
    <form className="form">
      <FormControl
        fullWidth
        margin="dense"
        size="small"
        error={bloodGroupError}
      >
        <InputLabel id="blood-group-label">{t("bloodGroup")}</InputLabel>
        <Select
          labelId="blood-group-label"
          name="bloodGroup"
          label={t("bloodGroup")}
          aria-label={t("bloodGroup")}
          value={props.formData.bloodGroup.value}
          onChange={props.handleChangeBloodGroup}
        >
          <MenuItem value="A RH (+)">A RH (+)</MenuItem>
          <MenuItem value="A RH (-)">A RH (-)</MenuItem>
          <MenuItem value="B RH (+)">B RH (+)</MenuItem>
          <MenuItem value="B RH (-)">B RH (-)</MenuItem>
          <MenuItem value="AB RH (+)">AB RH (+)</MenuItem>
          <MenuItem value="AB RH (-)">AB RH (-)</MenuItem>
          <MenuItem value="0 RH (+)">0 RH (+)</MenuItem>
          <MenuItem value="0 RH (-)">0 RH (-)</MenuItem>
          <MenuItem value="Kan Grubu Fark Etmeksizin">
            {t("regardlessOfBloodType")}
          </MenuItem>
        </Select>
        {bloodGroupError && <FormHelperText>{t("requiredText")}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth margin="dense" size="small" error={bloodTypeError}>
        <InputLabel id="blood-type-label">{t("bloodType")}</InputLabel>
        <Select
          multiple
          name="bloodType"
          labelId="blood-type-label"
          label={t("bloodType")}
          aria-label={t("bloodType")}
          value={selectedBloodTypes}
          onChange={props.handleChangeBloodType}
          renderValue={(selected) =>
            Array.isArray(selected) ? selected.join(", ") : String(selected)
          }
        >
          <MenuItem value="Kırmızı Kan">
            <Checkbox checked={selectedBloodTypes.indexOf("Kırmızı Kan") > -1} />
            <ListItemText primary={t("redBlood")} />
          </MenuItem>
          <MenuItem value="Trombosit">
            <Checkbox checked={selectedBloodTypes.indexOf("Trombosit") > -1} />
            <ListItemText primary={t("platelet")} />
          </MenuItem>
          <MenuItem value="Granülosit">
            <Checkbox checked={selectedBloodTypes.indexOf("Granülosit") > -1} />
            <ListItemText primary={t("granulocyte")} />
          </MenuItem>
          <MenuItem value="Plazma">
            <Checkbox checked={selectedBloodTypes.indexOf("Plazma") > -1} />
            <ListItemText primary={t("plasma")} />
          </MenuItem>
          <MenuItem value="Kök Hücre">
            <Checkbox checked={selectedBloodTypes.indexOf("Kök Hücre") > -1} />
            <ListItemText primary={t("stemCell")} />
          </MenuItem>
        </Select>
        {bloodTypeError && <FormHelperText>{t("requiredText")}</FormHelperText>}
      </FormControl>

      <LabeledTextField
        label={t("fullName")}
        name="fullName"
        slotProps={{ htmlInput: { maxLength: 39 } }}
        value={props.formData.fullName.value}
        onChange={props.handleChangeFullName}
        error={fullNameError}
        helperText={fullNameError ? t("requiredText") : ""}
      />

      <LabeledTextField
        type="tel"
        label={t("phone")}
        name="phone"
        value={props.formData.phone.value}
        onChange={props.handlePhoneChange}
        error={phoneError}
        helperText={phoneError ? t("requiredText") : ""}
      />

      <LabeledTextField
        type="date"
        label={t("date")}
        name="date"
        value={props.formData.date.value}
        onChange={props.handleChange}
        error={dateError}
        helperText={dateError ? t("requiredText") : ""}
      />

      <LabeledTextField
        label={t("hospitalName")}
        name="hospital"
        value={props.formData.hospital.value}
        onChange={props.handleChange}
        multiline
        rows={2}
        error={hospitalError}
        helperText={hospitalError ? t("requiredText") : ""}
      />

      <LabeledTextField
        label={t("location")}
        name="location"
        slotProps={{ htmlInput: { maxLength: 330 } }}
        value={props.formData.location.value}
        onChange={props.handleChangeLocation}
        multiline
        rows={5}
        error={locationError}
        helperText={locationError ? t("requiredText") : ""}
      />

      <Box sx={{ mb: 2 }} />

      {/* İNDİRME BUTONU */}
      <img
        src={
          i18n.language === "tr"
            ? "download-button-tr.jpg"
            : "download-button-en.jpg"
        }
        alt={t("downloadButtonAlt")}
        className="download-image-button"
        onClick={handleDownloadClick}
      />
    </form>
  );
}
