import { useRef, useState } from "react";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import { QueryClient, useMutation } from "@tanstack/react-query";
import "./BloodDonationFormContainer.css";
import { formatPhoneNumber, hashData } from "../utils/formUtils";
import { COUNTER_QUERY_KEY } from "../common/constants";
import type { BloodDonationFormEntity } from "../entities/BloodDonationFormEntity";
import { type SelectChangeEvent } from "@mui/material";
import BloodDonationFormInputs from "./BloodDonationFormInputs";
import BloodDonationForm from "./BloodDonationForm";

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

export default function BloodDonationFormContainer() {
  const queryClient = new QueryClient();
  const { t } = useTranslation();
  const imageRef = useRef(null);

  const [formData, setFormData] = useState<BloodDonationFormEntity>({
    bloodGroup: { value: "", coord: defaultCoords.bloodGroup },
    bloodType: { value: "", coord: defaultCoords.bloodType },
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

  const handleChangeBloodType = (e: SelectChangeEvent) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: { ...prev[name as keyof BloodDonationFormEntity], value },
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const postCounterMutation = useMutation({
    mutationFn: async (hash: string) => {
      const res = await fetch(import.meta.env.VITE_COUNTER_API, {
        body: JSON.stringify({ hash }),
        method: "POST",
      });
      return res.json();
    },
    onSuccess: (data) => {
      //console.log(data);
      queryClient.setQueryData([COUNTER_QUERY_KEY], data);
    },
  });

  const updateCounter = async () => {
    const hash = hashData(formData);
    await postCounterMutation.mutateAsync(hash);
  };

  const downloadImageAndUpdateCounter = () => {
    downloadImage();
    //await updateCounter();
  };

  return (
    <div className="container">
      <BloodDonationFormInputs
        formData={formData}
        handleChange={handleChange}
        handleChangeBloodGroup={handleChangeBloodGroup}
        handleChangeBloodType={handleChangeBloodType}
        handlePhoneChange={handlePhoneChange}
        downloadImageAndUpdateCounter={downloadImageAndUpdateCounter}
      />

      <BloodDonationForm imageRef={imageRef} formData={formData} />
    </div>
  );
}
