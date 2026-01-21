import { useRef, useState } from "react";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import "./BloodDonationFormContainer.css";
import { formatPhoneNumber, hashData } from "../utils/formUtils";
import { type DonationInfo, initialDonationInfo } from "../entities/DonationInfo";
import { type DonationTemplateInfo, initialDonationTemplateInfo } from "../entities/DonationTemplateInfo";
import { type SelectChangeEvent } from "@mui/material";
import BloodDonationFormInputs from "./BloodDonationFormInputs";
import BloodDonationForm from "./BloodDonationForm";

export default function BloodDonationFormContainer() {
  const { t } = useTranslation();
  const imageRef = useRef(null);

  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [donationInfo, setDonationInfo] = useState<DonationInfo>(initialDonationInfo);
  const [donationTemplateInfo, setDonationTemplateInfo] = useState<DonationTemplateInfo[]>(initialDonationTemplateInfo);

  const handleDonationInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent | SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;

    setDonationInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDonationInfoPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setDonationInfo((prev) => ({
      ...prev,
      phone: formatted,
    }));
  };

  const handleTemplateChange = (index: number) => {
    setSelectedTemplate(index);
  };

  const downloadImage = () => {
    if (!imageRef.current) return;

    const fieldLabels: Record<keyof DonationInfo, string> = {
      bloodGroup: t("bloodGroup"),
      bloodType: t("bloodType"),
      fullName: t("fullName"),
      phone: t("phone"),
      date: t("date"),
      hospital: t("hospitalName"),
      location: t("location"),
    };

    const missingFields: string[] = [];

    Object.entries(donationInfo ?? {}).forEach(([key, field]) => {
      const val = (field as { value: string | string[] }).value;
      const filled = Array.isArray(val)
        ? val.length > 0
        : typeof val === "string"
          ? val.trim() !== ""
          : val != null;
      if (!filled)
        missingFields.push(fieldLabels[key as keyof DonationInfo] ?? key);
    });

    if (missingFields.length > 0) {
      const nounKey = missingFields.length === 1 ? "fillAllFieldsSingleNoun" : "fillAllFieldsMultipleNoun";
      const noun = t(nounKey);

      Swal.fire({
        icon: "warning",
        confirmButtonText: t("close"),
        html: `${t("fillAllFields")
          .replace(/\n/g, "<br /><br />")
          .replace("{{missingFields}}", missingFields.join(", "))
          .replace("{{noun}}", noun)}`,
      });
      return;
    }

    if (donationInfo!!.phone!!.length < 11) {
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
    if (
      href.includes("localhost") ||
      href.includes("/test") ||
      path.includes("/test")
    ) {
      return;
    }

    const hash = hashData(donationInfo!!);
    fetch(import.meta.env.VITE_COUNTER_API, {
      body: JSON.stringify({ hash }),
      method: "POST",
    });
  };

  return (
    <div className="container">
      <BloodDonationFormInputs
        donationInfo={donationInfo!!}
        selectedTemplate={selectedTemplate}
        handleDonationInfoChange={handleDonationInfoChange}
        handleDonationInfoPhoneChange={handleDonationInfoPhoneChange}
        downloadImageAndUpdateCounter={downloadImage}
        handleTemplateChange={handleTemplateChange}
      />

      <BloodDonationForm
        imageRef={imageRef}
        donationInfo={donationInfo}
        donationTemplateInfo={donationTemplateInfo[0]} />
    </div>
  );
}
