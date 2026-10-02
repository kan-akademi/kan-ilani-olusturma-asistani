import { useEffect, useRef, useState } from "react";
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
  const { t, i18n } = useTranslation();
  const imageRef = useRef<HTMLDivElement | null>(null);
  const bloodGroupSelectRef = useRef<HTMLSelectElement>(null);

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [donationInfo, setDonationInfo] = useState<DonationInfo>(initialDonationInfo);

  const selectedTemplate = getTemplateByIndex(selectedTemplateIndex);
  const TemplateComponent = selectedTemplate?.Component;

  useEffect(() => {
    if (donationInfo.isRegularNeed) {
      setDonationInfo((prev) => ({
        ...prev,
        dateFormatted: buildRegularNeedDateString(formatDateToTurkish(prev.date)),
      }));
    }
    else {
      setDonationInfo((prev) => ({
        ...prev,
        dateFormatted: formatDateToTurkish(prev.date),
      }));
    }
  }, [i18n.language]);

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

  const handleBloodGroupChange = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    let bloodGroup1: string[] = [], bloodGroup2: string[] = [];

    if (value.length > 4) {
      Swal.fire({
        icon: "warning",
        confirmButtonText: t("close"),
        html: t("maxBloodGroupSelection", "En fazla 4 kan grubu seçebilirsiniz."),
      });      
      return;
    }

    if (value.length === 1) {
      bloodGroup1.push(value[0]);
    } else if (value.length === 2) {
      bloodGroup1.push(value[0]);
      bloodGroup2.push(value[1]);
    } else {
      bloodGroup1.push(...(value as string[]).slice(0, 2));
      bloodGroup2.push(...(value as string[]).slice(2));
    }
console.log("handleBloodGroupChange", { value, bloodGroup1, bloodGroup2 });
    setDonationInfo((prev) => ({
      ...prev,
      [name]: value,
      bloodGroup1: bloodGroup1,
      bloodGroup2: bloodGroup2,
    }));
  };

  const handleDonationInfoDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setDonationInfo((prev) => ({
        ...prev,
        isRegularNeed: checked,
        dateFormatted: checked ? buildRegularNeedDateString(formatDateToTurkish(prev.date)) : formatDateToTurkish(prev.date),
      }));
    } else if (name === "date") {
      const formattedDate = formatDateToTurkish(value);
      setDonationInfo((prev) => ({
        ...prev,
        date: value,
        dateFormatted: prev.isRegularNeed ? buildRegularNeedDateString(formattedDate) : formattedDate,
      }));
    }
  };

  const buildRegularNeedDateString = (dateValue: string) => {
    const splitedFormattedDate = dateValue.split(" ");
    return `${splitedFormattedDate[1]} ${splitedFormattedDate[2]} (${t("regularNeedDate")})`;
  };

  const handleTemplateChange = (index: number) => {
    setSelectedTemplateIndex(index);
  };

  const downloadImage = async () => {
    if (!imageRef.current) return;

    const fieldLabels: Record<keyof Omit<DonationInfo, "bloodGroup1" | "bloodGroup2" | "isRegularNeed" | "dateFormatted">, string> = {
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

    try {
      const canvas = await html2canvas(imageRef.current, {
        //backgroundColor: "#ffffff",
        //scale: 2,
        useCORS: true,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/png");
      });

      if (!blob) {
        throw new Error("Canvas export failed");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "kan-bagis-ilani-formu.png";
      link.href = url;
      link.style.display = "none";
      link.target = "_blank";
      document.body.appendChild(link);

      const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);

      if (isMobile) {
        try {
          link.click();
        } catch {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      } else {
        link.click();
      }

      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 1500);

      updateCounter();
    } catch (error) {
      console.error("Image export failed", error);
      Swal.fire({
        icon: "error",
        confirmButtonText: t("close"),
        html: "İşlem sırasında bir hata oluştu.",
      });
    }
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
        bloodGroupSelectRef={bloodGroupSelectRef}
        handleDonationInfoChange={handleDonationInfoChange}
        handleDonationInfoPhoneChange={handleDonationInfoPhoneChange}
        handleDonationInfoDateChange={handleDonationInfoDateChange}
        handleBloodGroupChange={handleBloodGroupChange}
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
