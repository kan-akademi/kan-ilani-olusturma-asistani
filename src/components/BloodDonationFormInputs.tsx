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
import type { DonationInfo } from "../entities/DonationInfo";

interface InputProps {
  donationInfo: DonationInfo;
  selectedTemplate: number;
  handleDonationInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent | SelectChangeEvent<string[]>) => void;
  handleDonationInfoPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadImageAndUpdateCounter: () => void;
  handleTemplateChange: (index: number) => void;
}

export default function BloodDonationFormInputs(props: InputProps) {
  const { t, i18n } = useTranslation();
  const [showErrors, setShowErrors] = useState(false);

  const selectedBloodTypes = Array.isArray(props.donationInfo.bloodType) ? props.donationInfo.bloodType : props.donationInfo.bloodType ? [props.donationInfo.bloodType] : [];

  const isEmpty = (val: any) => {
    if (val === null || val === undefined) return true;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === "string") return val.trim().length === 0;
    return !val;
  };

  const bloodGroupError = showErrors && isEmpty(props.donationInfo.bloodGroup);
  const bloodTypeError = showErrors && selectedBloodTypes.length === 0;
  const fullNameError = showErrors && isEmpty(props.donationInfo.fullName);
  const phoneError = showErrors && isEmpty(props.donationInfo.phone);
  const dateError = showErrors && isEmpty(props.donationInfo.date);
  const hospitalError = showErrors && isEmpty(props.donationInfo.hospital);
  const locationError = showErrors && isEmpty(props.donationInfo.location);

  const validate = () => {
    return (
      !isEmpty(props.donationInfo.bloodGroup) &&
      selectedBloodTypes.length > 0 &&
      !isEmpty(props.donationInfo.fullName) &&
      !isEmpty(props.donationInfo.phone) &&
      !isEmpty(props.donationInfo.date) &&
      !isEmpty(props.donationInfo.hospital) &&
      !isEmpty(props.donationInfo.location)
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
          value={props.donationInfo.bloodGroup}
          onChange={props.handleDonationInfoChange}
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
          onChange={props.handleDonationInfoChange}
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
        value={props.donationInfo.fullName}
        onChange={props.handleDonationInfoChange}
        error={fullNameError}
        helperText={fullNameError ? t("requiredText") : ""}
      />

      <LabeledTextField
        type="tel"
        label={t("phone")}
        name="phone"
        value={props.donationInfo.phone}
        onChange={props.handleDonationInfoPhoneChange}
        error={phoneError}
        helperText={phoneError ? t("requiredText") : ""}
      />

      <LabeledTextField
        type="date"
        label={t("date")}
        name="date"
        value={props.donationInfo.date}
        onChange={props.handleDonationInfoChange}
        error={dateError}
        helperText={dateError ? t("requiredText") : ""}
      />

      <LabeledTextField
        label={t("hospitalName")}
        name="hospital"
        value={props.donationInfo.hospital}
        onChange={props.handleDonationInfoChange}
        multiline
        rows={2}
        error={hospitalError}
        helperText={hospitalError ? t("requiredText") : ""}
      />

      <LabeledTextField
        label={t("location")}
        name="location"
        slotProps={{ htmlInput: { maxLength: 330 } }}
        value={props.donationInfo.location}
        onChange={props.handleDonationInfoChange}
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

      {/* TEMPLATE SEÇİMİ */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2, }}>
        {[0, 1, 2, 3].map((idx) => (
          <Box
            key={idx}
            title={`Template ${idx + 1}`}
            onClick={() => props.handleTemplateChange(idx)}
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: [
                "linear-gradient(135deg, #ff5858, #f09819)",
                "linear-gradient(135deg, #43cea2, #185a9d)",
                "linear-gradient(135deg, #f7971e, #ffd200)",
                "linear-gradient(135deg, #e96443, #904e95)",
              ][idx],
              border: props.selectedTemplate === idx ? "3px solid #ffffff" : "3px solid #222",
              //boxShadow: props.selectedTemplate === idx ? "0 0 4px #aaa" : "0 0 8px #222",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              //transition: "border 0.2s, box-shadow 0.2s",
            }} />
        ))}
      </Box>
    </form>
  );
}
