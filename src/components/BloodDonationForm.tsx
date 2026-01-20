import { type RefObject } from "react";
import { formatDateToTurkish } from "../utils/formUtils";
import type { BloodDonationFormEntity } from "../entities/BloodDonationFormEntity";

interface FormProps {
  imageRef: RefObject<null>;
  formData: BloodDonationFormEntity;
}

export default function BloodDonationForm(props: FormProps) {
  return (
    <>
      {/* GÖRSEL + YAZILAR */}
      <div className="image-wrapper" ref={props.imageRef}>
        <img
          alt="Template"
          className="background-image"
          src={props.formData.templateInfo.path}
        />

        {/* KAN GRUBU */}
        {props.formData.bloodGroup.value !== "Kan Grubu Fark Etmeksizin" ? (
          <div
            className="text-item blood-group"
            style={{
              top: `${props.formData.bloodGroup.coord.top}px`,
              left: `${props.formData.bloodGroup.coord.left}px`,
            }}
          >
            {props.formData.bloodGroup.value}
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
            top: `${props.formData.bloodType.coord.top}px`,
            left: `${props.formData.bloodType.coord.left}px`,
            fontSize: `${props.formData.bloodType.fontSize}px`,
          }}
        >
          {Array.isArray(props.formData.bloodType.value)
            ? props.formData.bloodType.value.join(", ")
            : String(props.formData.bloodType.value)}
        </div>

        {/* AD SOYAD */}
        <div
          className="text-item"
          style={{
            top: `${props.formData.fullName.coord.top}px`,
            left: `${props.formData.fullName.coord.left}px`,
            fontSize: `${props.formData.fullName.fontSize}px`,
          }}
        >
          {props.formData.fullName.value}
        </div>

        {/* TELEFON */}
        <div
          className="text-item"
          style={{
            top: `${props.formData.phone.coord.top}px`,
            left: `${props.formData.phone.coord.left}px`,
          }}
        >
          {props.formData.phone.value}
        </div>

        {/* TARİH */}
        <div
          className="text-item"
          style={{
            top: `${props.formData.date.coord.top}px`,
            left: `${props.formData.date.coord.left}px`,
          }}
        >
          {formatDateToTurkish(props.formData.date.value.toString())}
        </div>

        {/* HASTANE */}
        <div
          className="text-item multiline"
          style={{
            top: `${props.formData.hospital.coord.top}px`,
            left: `${props.formData.hospital.coord.left}px`,
            width: "305px",
          }}
        >
          {props.formData.hospital.value}
        </div>

        {/* YER */}
        <div
          className="text-item multiline"
          style={{
            top: `${props.formData.location.coord.top}px`,
            left: `${props.formData.location.coord.left}px`,
            fontSize: `${props.formData.location.fontSize}px`,
            width: "340px",
          }}
        >
          {props.formData.location.value}
        </div>
      </div>
    </>
  );
}
