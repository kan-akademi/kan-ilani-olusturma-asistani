import { useEffect, useRef, useState } from "react";
import i18n from "../i18n";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import "./BloodDonationFormContainer.css";
import { formatDateToTurkish, formatPhoneNumber, hashData } from "../utils/formUtils";
import { type DonationInfo, initialDonationInfo } from "../entities/DonationInfo";
import { type SelectChangeEvent } from "@mui/material";
import BloodDonationFormInputs from "./BloodDonationFormInputs";
import { getTemplateByIndex } from "../templates";

export default function BloodDonationFormContainer() {
  const { t } = useTranslation();
  const imageRef = useRef<HTMLDivElement | null>(null);

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [donationInfo, setDonationInfo] = useState<DonationInfo>(initialDonationInfo);

  const selectedTemplate = getTemplateByIndex(selectedTemplateIndex);
  const TemplateComponent = selectedTemplate?.Component;

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

  useEffect(() => {
    if (donationInfo.isRegularNeed) {
      setDonationInfo((prev) => ({
        ...prev,
        dateRegularNeed: buildRegularNeedDateString(prev.date),
      }));
    }
  }, [i18n.language]);

  const handleDonationRegularNeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    setDonationInfo((prev) => ({
      ...prev,
      isRegularNeed: checked,
      dateRegularNeed: buildRegularNeedDateString(prev.date),
    }));
  };

  const buildRegularNeedDateString = (dateValue: string) => {
    const formattedDate = formatDateToTurkish(dateValue);
    const splitedFormattedDate = formattedDate.split(" ");
    return `${splitedFormattedDate[1]} ${splitedFormattedDate[2]} (${t("regularNeedDate")})`;
  };

  const handleTemplateChange = (index: number) => {
    setSelectedTemplateIndex(index);
  };

  const downloadImage = () => {
    if (!imageRef.current) return;

    const fieldLabels: Record<keyof Omit<DonationInfo, "isRegularNeed" | "dateRegularNeed">, string> = {
      bloodGroup: t("bloodGroup"),
      bloodType: t("bloodType"),
      fullName: t("fullName"),
      phone: t("phone"),
      date: t("date"),
      hospital: t("hospitalName"),
      location: t("location"),
    };

    const missingFields: string[] = [];

    (Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>).forEach((key) => {
      const val = donationInfo[key];
      const filled = Array.isArray(val)
        ? val.length > 0
        : typeof val === "string"
          ? val.trim() !== ""
          : val != null;
      if (!filled) missingFields.push(fieldLabels[key]);
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

    if (donationInfo.phone.length < 11) {
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

    const hash = hashData(donationInfo);
    fetch(import.meta.env.VITE_COUNTER_API, {
      body: JSON.stringify({ hash }),
      method: "POST",
    });
  };

  return (
    <div className="container">
      <BloodDonationFormInputs
        donationInfo={donationInfo}
        selectedTemplate={selectedTemplateIndex}
        handleDonationInfoChange={handleDonationInfoChange}
        handleDonationInfoPhoneChange={handleDonationInfoPhoneChange}
        handleDonationRegularNeedChange={handleDonationRegularNeedChange}
        downloadImageAndUpdateCounter={downloadImage}
        handleTemplateChange={handleTemplateChange}
      />

      {TemplateComponent && (
        <TemplateComponent
          imageRef={imageRef}
          donationInfo={donationInfo}
        />
      )}
    </div>
  );
}
