import { useRef, useState } from "react";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import "./BloodDonationForm.css";
import { formatDateToTurkish, formatPhoneNumber } from "../utils/formUtils";
import type { BloodDonationFormEntity } from "../entities/BloodDonationFormEntity";

const TEXT_ITEM_DEFAULT_FONT_SIZE = 17;
const TEXT_ITEM_MULTILINE_DEFAULT_FONT_SIZE = 16;
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
    fullName: {
      value: "",
      coord: defaultCoords.fullName,
      defaultFontSize: TEXT_ITEM_DEFAULT_FONT_SIZE,
      fontRules: [
        { max: 15, size: 17, coord: { top: 256, left: 80 } },
        { max: 25, size: 15, coord: { top: 258, left: 80 } },
        { max: 40, size: 13, coord: { top: 260, left: 80 } },
      ],
      minFontSize: 13,
    },
    phone: { value: "", coord: defaultCoords.phone },
    date: { value: "", coord: defaultCoords.date },
    hospital: { value: "", coord: defaultCoords.hospital },
    location: {
      value: "",
      coord: defaultCoords.location,
      defaultFontSize: TEXT_ITEM_MULTILINE_DEFAULT_FONT_SIZE,
      fontRules: [
        { max: 240, size: 16, coord: { top: 475, left: 10 } },
        // { max: 90, size: 15, coord: { top: 473, left: 10 } },
        { max: 520, size: 14, coord: { top: 471, left: 10 } },
      ],
      minFontSize: 14,
    },
  });

  function getBloodGroupLeft(value: string) {
    return value.startsWith("AB") ? BLOOD_GROUP_LEFT_AB : BLOOD_GROUP_LEFT_DEFAULT;
  }

  function resolveFontSize(field: { value: string; fontRules: { max: number; size: number }[]; defaultFontSize: number; minFontSize?: number }) {
    const len = field.value.length;
    const match = field.fontRules.find(r => len <= r.max);
    const size = match ? match.size : field.defaultFontSize;
    return field.minFontSize ? Math.max(size, field.minFontSize) : size;
  }

  function resolveCoord(field: { value: string; fontRules: { max: number; coord?: { top: number; left: number } }[]; coord: { top: number; left: number } }) {
    const len = field.value.length;
    const match = field.fontRules.find(r => len <= r.max);
    return match && match.coord ? match.coord : field.coord;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === "bloodGroup") {
        return {
          ...prev,
          bloodGroup: {
            value,
            coord: { ...prev.bloodGroup.coord, left: getBloodGroupLeft(value) },
          },
        };
      }
      return {
        ...prev,
        [name]: { ...prev[name as keyof BloodDonationFormEntity], value },
      };
    });
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
        <label>
          {t("bloodGroup")}:
          <select
            name="bloodGroup"
            value={formData.bloodGroup.value}
            onChange={handleChange}
          >
            <option value="">{t("select")}</option>
            <option value="A RH (+)">A RH (+)</option>
            <option value="A RH (-)">A RH (-)</option>
            <option value="B RH (+)">B RH (+)</option>
            <option value="B RH (-)">B RH (-)</option>
            <option value="AB RH (+)">AB RH (+)</option>
            <option value="AB RH (-)">AB RH (-)</option>
            <option value="0 RH (+)">0 RH (+)</option>
            <option value="0 RH (-)">0 RH (-)</option>
            <option value="Kan Grubu Fark Etmeksizin">{t("regardlessOfBloodType")}</option>
          </select>
        </label>
        <label>
          {t("bloodType")}:
          <select
            name="bloodType"
            value={formData.bloodType.value}
            onChange={handleChange}
          >
            <option value="">{t("select")}</option>
            <option value="Kırmızı Kan">{t("redBlood")}</option>
            <option value="Trombosit">{t("platelet")}</option>
            <option value="Granülosit">{t("granulocyte")}</option>
            <option value="Plazma">{t("plasma")}</option>
            <option value="Kök Hücre">{t("stemCell")}</option>
          </select>
        </label>
        <label>
          {t("patientName")}:
          <input
            type="text"
            name="fullName"
            autoComplete="off"
            maxLength={39}
            value={formData.fullName.value}
            onChange={handleChange}
          />
        </label>
        <label>
          {t("phone")}:
          <input
            type="text"
            name="phone"
            autoComplete="off"
            value={formData.phone.value}
            onChange={handlePhoneChange}
            placeholder="0XXX XXX XX XX"
            maxLength={14}
          />
        </label>
        <label>
          {t("date")}:
          <input
            type="date"
            name="date"
            value={formData.date.value}
            onChange={handleChange}
          />
        </label>
        <label>
          {t("hospitalName")}:
          <textarea
            name="hospital"
            value={formData.hospital.value}
            onChange={handleChange}
            rows={2}
          />
        </label>
        <label>
          {t("location")}:
          <textarea
            name="location"
            maxLength={330}
            value={formData.location.value}
            onChange={handleChange}
            rows={5}
          />
        </label>

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
            top: `${resolveCoord(formData.fullName).top}px`,
            left: `${resolveCoord(formData.fullName).left}px`,
            fontSize: `${resolveFontSize(formData.fullName)}px`,
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
          {formatDateToTurkish(formData.date.value)}
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
            width: "340px",
            top: `${resolveCoord(formData.location).top}px`,
            left: `${resolveCoord(formData.location).left}px`,
            fontSize: `${resolveFontSize(formData.location)}px`,
          }}
        >
          {formData.location.value}
        </div>
      </div>
    </div>
  );
}
