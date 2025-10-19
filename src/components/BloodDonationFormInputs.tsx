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
} from "@mui/material";
import type { BloodDonationFormEntity } from "../entities/BloodDonationFormEntity";

interface InputProps {
  formData: BloodDonationFormEntity;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeBloodGroup: (e: SelectChangeEvent) => void;
  handleChangeBloodType: (e: SelectChangeEvent<string[]>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadImageAndUpdateCounter: () => void;
}

export default function BloodDonationFormInputs(props: InputProps) {
  const { t, i18n } = useTranslation();

  const selectedBloodTypes = Array.isArray(props.formData.bloodType.value)
    ? props.formData.bloodType.value
    : props.formData.bloodType.value
    ? [props.formData.bloodType.value]
    : [];

  return (
    <form className="form">
      <FormControl fullWidth margin="dense" size="small">
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
      </FormControl>

      <FormControl fullWidth margin="dense" size="small">
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
      </FormControl>

      <LabeledTextField
        label={t("fullName")}
        name="fullName"
        value={props.formData.fullName.value}
        onChange={props.handleChange}
      />

      <LabeledTextField
        type="tel"
        label={t("phone")}
        name="phone"
        value={props.formData.phone.value}
        onChange={props.handlePhoneChange}
      />

      <LabeledTextField
        type="date"
        label={t("date")}
        name="date"
        value={props.formData.date.value}
        onChange={props.handleChange}
      />

      <LabeledTextField
        label={t("hospitalName")}
        name="hospital"
        value={props.formData.hospital.value}
        onChange={props.handleChange}
        multiline
        rows={2}
      />

      <LabeledTextField
        label={t("location")}
        name="location"
        value={props.formData.location.value}
        onChange={props.handleChange}
        multiline
        rows={5}
      />

      <Box sx={{ mb: 2 }} />

      {/* İNDİRME BUTONU */}
      <img
        src={
          i18n.language === "tr"
            ? "download-button-tr.jpg"
            : "download-button-en.jpg"
        }
        alt="Son Adım: İlanı Galerine Kaydet"
        className="download-image-button"
        onClick={props.downloadImageAndUpdateCounter}
      />
    </form>
  );
}
