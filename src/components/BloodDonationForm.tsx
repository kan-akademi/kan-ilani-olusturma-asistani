import { useRef, useState } from "react";
import LabeledTextField from "./LabeledTextField";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import "./BloodDonationForm.css";
import { formatDateToTurkish, formatPhoneNumber } from "../utils/formUtils";
import type { BloodDonationFormEntity } from "../entities/BloodDonationFormEntity";
import { Box, FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";

const BLOOD_GROUP_LEFT_AB = 20;
const BLOOD_GROUP_LEFT_DEFAULT = 47;

const defaultCoords = {
  bloodGroup: { top: 83, left: BLOOD_GROUP_LEFT_DEFAULT },
  bloodType: { top: 212, left: 135 },
  fullName: { top: 256, left: 80 },
  phone: { top: 302, left: 65 },
  date: { top: 346, left: 50 },
  hospital: { top: 408, left: 10 },
  location: { top: 475, left: 10 },
};

export default function BloodDonationForm() {
  const { t, i18n } = useTranslation();
  const imageRef = useRef(null);

  const [formData, setFormData] = useState<BloodDonationFormEntity>({
    bloodGroup: { value: "", coord: defaultCoords.bloodGroup },
    bloodType: { value: "", coord: defaultCoords.bloodType },
    fullName: { value: "", coord: defaultCoords.fullName },
    phone: { value: "", coord: defaultCoords.phone },
    date: { value: new Date().toLocaleDateString("tr-TR"), coord: defaultCoords.date },
    hospital: { value: "", coord: defaultCoords.hospital },
    location: { value: "", coord: defaultCoords.location },
  });

  function getBloodGroupLeft(value: string) {
    return value.startsWith("AB") ? BLOOD_GROUP_LEFT_AB : BLOOD_GROUP_LEFT_DEFAULT;
  }

  const handleChangeBloodGroup = (e: SelectChangeEvent) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      bloodGroup: {
        value,
        coord: {
          ...prev.bloodGroup.coord,
          left: getBloodGroupLeft(value),
        },
      },
    }));
  };

  const handleChangeBloodType = (e: SelectChangeEvent) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: { ...prev[name as keyof BloodDonationFormEntity], value },
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: { ...prev[name as keyof BloodDonationFormEntity], value },
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({
      ...prev,
      phone: { ...prev.phone, value: formatted },
    }));
  };

  const downloadImage = () => {
    if (!imageRef.current) return;

    const allFieldsFilled = Object.values(formData).every(
      (field) => field.value.trim() !== ""
    );

    if (!allFieldsFilled) {
      Swal.fire({
        icon: "warning",
        confirmButtonText: t("close"),
        html: t("fillAllFields").replace(/\n/g, "<br />"),
      });
      return;
    }

    if (formData.phone.value.length < 11) {
      Swal.fire({
        icon: "warning",
        confirmButtonText: t("close"),
        html: t("phoneNumberInvalid").replace(/\n/g, "<br />"),
      });
      return;
    }

    html2canvas(imageRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = "kan-bagis-ilani-formu.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="container">
      {/* FORM */}
      <form className="form">
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel id="blood-group-label">{t("bloodGroup")}</InputLabel>
          <Select
            labelId="blood-group-label"
            name="bloodGroup"
            label={t("bloodGroup")}
            aria-label={t("bloodGroup")}
            value={formData.bloodGroup.value}
            onChange={handleChangeBloodGroup}
          >
            <MenuItem value="A RH (+)">A RH (+)</MenuItem>
            <MenuItem value="A RH (-)">A RH (-)</MenuItem>
            <MenuItem value="B RH (+)">B RH (+)</MenuItem>
            <MenuItem value="B RH (-)">B RH (-)</MenuItem>
            <MenuItem value="AB RH (+)">AB RH (+)</MenuItem>
            <MenuItem value="AB RH (-)">AB RH (-)</MenuItem>
            <MenuItem value="0 RH (+)">0 RH (+)</MenuItem>
            <MenuItem value="0 RH (-)">0 RH (-)</MenuItem>
            <MenuItem value="Kan Grubu Fark Etmeksizin">{t("regardlessOfBloodType")}</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" size="small">
          <InputLabel id="blood-type-label">{t("bloodType")}</InputLabel>
          <Select
            labelId="blood-type-label"
            name="bloodType"
            label={t("bloodType")}
            aria-label={t("bloodType")}
            value={formData.bloodType.value}
            onChange={handleChangeBloodType}
          >
            <MenuItem value="Kırmızı Kan">{t("redBlood")}</MenuItem>
            <MenuItem value="Trombosit">{t("platelet")}</MenuItem>
            <MenuItem value="Granülosit">{t("granulocyte")}</MenuItem>
            <MenuItem value="Plazma">{t("plasma")}</MenuItem>
            <MenuItem value="Kök Hücre">{t("stemCell")}</MenuItem>
          </Select>
        </FormControl>

        <LabeledTextField
          label={t("fullName")}
          name="fullName"
          value={formData.fullName.value}
          onChange={handleChange}
        />

        <LabeledTextField
          label={t("phone")}
          name="phone"
          value={formData.phone.value}
          onChange={handlePhoneChange}
        />

        <LabeledTextField
          type="date"
          label={t("date")}
          name="date"
          value={formData.date.value}
          onChange={handleChange}
        />

        <LabeledTextField
          label={t("hospitalName")}
          name="hospital"
          value={formData.hospital.value}
          onChange={handleChange}
          multiline
          rows={2}
        />

        <LabeledTextField
          label={t("location")}
          name="location"
          value={formData.location.value}
          onChange={handleChange}
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
          onClick={downloadImage}
        />
      </form>

      {/* GÖRSEL + YAZILAR */}
      <div className="image-wrapper" ref={imageRef}>
        <img
          src="kan-akademi-ilan-template-1.jpg"
          alt="Template"
          className="background-image"
        />

        {/* KAN GRUBU */}
        {formData.bloodGroup.value !== "Kan Grubu Fark Etmeksizin" ? (
          <div
            className="text-item blood-group"
            style={{
              top: `${formData.bloodGroup.coord.top}px`,
              left: `${formData.bloodGroup.coord.left}px`,
            }}
          >
            {formData.bloodGroup.value}
          </div>
        ) : (
          <div className="text-item blood-group regardless-blood-group">
            Kan Grubu
            <br />
            Fark Etmeksizin
          </div>
        )}

        {/* KAN TÜRÜ */}
        <div
          className="text-item"
          style={{
            top: `${formData.bloodType.coord.top}px`,
            left: `${formData.bloodType.coord.left}px`,
          }}
        >
          {formData.bloodType.value}
        </div>

        {/* AD SOYAD */}
        <div
          className="text-item"
          style={{
            top: `${formData.fullName.coord.top}px`,
            left: `${formData.fullName.coord.left}px`,
          }}
        >
          {formData.fullName.value}
        </div>

        {/* TELEFON */}
        <div
          className="text-item"
          style={{
            top: `${formData.phone.coord.top}px`,
            left: `${formData.phone.coord.left}px`,
          }}
        >
          {formData.phone.value}
        </div>

        {/* TARİH */}
        <div
          className="text-item"
          style={{
            top: `${formData.date.coord.top}px`,
            left: `${formData.date.coord.left}px`,
          }}
        >
          {formatDateToTurkish(formData.date.value.toString())}
        </div>

        {/* HASTANE */}
        <div
          className="text-item multiline"
          style={{
            top: `${formData.hospital.coord.top}px`,
            left: `${formData.hospital.coord.left}px`,
            width: "305px",
          }}
        >
          {formData.hospital.value}
        </div>

        {/* YER */}
        <div
          className="text-item multiline"
          style={{
            top: `${formData.location.coord.top}px`,
            left: `${formData.location.coord.left}px`,
            width: "340px",
          }}
        >
          {formData.location.value}
        </div>
      </div>
    </div>
  );
}
