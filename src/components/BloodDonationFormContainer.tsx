import { useRef, useState } from "react";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import "./BloodDonationFormContainer.css";
import { formatPhoneNumber, hashData } from "../utils/formUtils";
import type { BloodDonationFormEntity } from "../entities/BloodDonationFormEntity";
import { type SelectChangeEvent } from "@mui/material";
import BloodDonationFormInputs from "./BloodDonationFormInputs";
import BloodDonationForm from "./BloodDonationForm";

const BLOOD_GROUP_LEFT_AB = 20;
const BLOOD_GROUP_LEFT_DEFAULT = 47;
const TEXT_ITEM_DEFAULT_FONT_SIZE = 17;

const defaultCoords = {
  bloodGroup: { top: 83, left: BLOOD_GROUP_LEFT_DEFAULT },
  bloodType: { top: 212, left: 85 },
  fullName: { top: 256, left: 80 },
  phone: { top: 302, left: 65 },
  date: { top: 346, left: 50 },
  hospital: { top: 408, left: 10 },
  location: { top: 475, left: 10 },
};

export default function BloodDonationFormContainer() {
  const { t } = useTranslation();
  const imageRef = useRef(null);

  const [formData, setFormData] = useState<BloodDonationFormEntity>({
    bloodGroup: { value: "", coord: defaultCoords.bloodGroup },
    bloodType: { value: [], coord: defaultCoords.bloodType, fontSize: TEXT_ITEM_DEFAULT_FONT_SIZE },
    fullName: { value: "", coord: defaultCoords.fullName },
    phone: { value: "", coord: defaultCoords.phone },
    date: {
      value: new Date().toLocaleDateString("en-CA"),
      coord: defaultCoords.date,
    },
    hospital: { value: "", coord: defaultCoords.hospital },
    location: { value: "", coord: defaultCoords.location },
  });

  function getBloodGroupLeft(value: string) {
    return value.startsWith("AB")
      ? BLOOD_GROUP_LEFT_AB
      : BLOOD_GROUP_LEFT_DEFAULT;
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

  const handleChangeBloodType = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    const fontSize = value.length > 3 ? 15 : TEXT_ITEM_DEFAULT_FONT_SIZE;
    const coordTop = value.length > 3 ? 203 : defaultCoords.bloodType.top;

    setFormData((prev) => ({
      ...prev,
      [name]: { ...prev[name as keyof BloodDonationFormEntity], value, fontSize, coord: { ...prev[name as keyof BloodDonationFormEntity].coord, top: coordTop } },
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

    const allFieldsFilled = Object.values(formData).every((field: any) => {
      const val = field.value;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === "string") return val.trim() !== "";
      return val != null;
    });

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

      updateCounter();
    });
  };

  const updateCounter = () => {
    const href = typeof window !== "undefined" ? window.location.href : "";
    const path = typeof window !== "undefined" ? window.location.pathname : "";

    // Eğer URL "localhost" veya "/test" içeriyorsa isteği gönderme
    if (href.includes("localhost") || href.includes("/test") || path.includes("/test")) {
      return;
    }
    
    const hash = hashData(formData);
    fetch(import.meta.env.VITE_COUNTER_API, {
      body: JSON.stringify({ hash }),
      method: "POST",
    });
  };

  return (
    <div className="container">
      <BloodDonationFormInputs
        formData={formData}
        handleChange={handleChange}
        handleChangeBloodGroup={handleChangeBloodGroup}
        handleChangeBloodType={handleChangeBloodType}
        handlePhoneChange={handlePhoneChange}
        downloadImageAndUpdateCounter={downloadImage}
      />

      <BloodDonationForm imageRef={imageRef} formData={formData} />
    </div>
  );
}
