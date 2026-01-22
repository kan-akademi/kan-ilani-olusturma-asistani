import { type RefObject } from "react";
import { formatDateToTurkish } from "../utils/formUtils";
import type { DonationInfo } from "../entities/DonationInfo";
import type { DonationTemplateInfo } from "../entities/DonationTemplateInfo";

interface IProps {
  imageRef: RefObject<null>;
  donationInfo: DonationInfo;
  donationTemplateInfo: DonationTemplateInfo;
}

export default function BloodDonationForm(props: IProps) {
  return (
    <>
      {/* GÖRSEL + YAZILAR */}
      <div className="image-wrapper" ref={props.imageRef}>
        <img
          alt="Template"
          className="background-image"
          src={props.donationTemplateInfo.templatePath}
        />

        {/* KAN GRUBU */}
        {props.donationInfo.bloodGroup !== "Kan Grubu Fark Etmeksizin" ? (
          <div
            className="text-item blood-group"
            style={{
              top: `${props.donationTemplateInfo.bloodGroup.coord.top}px`,
              left: `${props.donationTemplateInfo.bloodGroup.coord.left}px`,
              fontSize: `${props.donationTemplateInfo.bloodGroup.font.size}px`,
              color: props.donationTemplateInfo.bloodGroup.font.color,
            }}
          >
            {props.donationInfo.bloodGroup}
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
            top: `${props.donationTemplateInfo.bloodType.coord.top}px`,
            left: `${props.donationTemplateInfo.bloodType.coord.left}px`,
            fontSize: `${props.donationTemplateInfo.bloodType.font.size}px`,
            color: props.donationTemplateInfo.bloodType.font.color,
          }}
        >
          {Array.isArray(props.donationInfo.bloodType)
            ? props.donationInfo.bloodType.join(", ")
            : String(props.donationInfo.bloodType)}
        </div>

        {/* AD SOYAD */}
        <div
          className="text-item"
          style={{
            top: `${props.donationTemplateInfo.fullName.coord.top}px`,
            left: `${props.donationTemplateInfo.fullName.coord.left}px`,
            fontSize: `${props.donationTemplateInfo.fullName.font.size}px`,
            color: props.donationTemplateInfo.fullName.font.color,
          }}
        >
          {props.donationInfo.fullName}
        </div>

        {/* TELEFON */}
        <div
          className="text-item"
          style={{
            top: `${props.donationTemplateInfo.phone.coord.top}px`,
            left: `${props.donationTemplateInfo.phone.coord.left}px`,
            fontSize: `${props.donationTemplateInfo.phone.font.size}px`,
            color: props.donationTemplateInfo.phone.font.color,
          }}
        >
          {props.donationInfo.phone}
        </div>

        {/* TARİH */}
        <div
          className="text-item"
          style={{
            top: `${props.donationTemplateInfo.date.coord.top}px`,
            left: `${props.donationTemplateInfo.date.coord.left}px`,
            fontSize: `${props.donationTemplateInfo.date.font.size}px`,
            color: props.donationTemplateInfo.date.font.color,
          }}
        >
          {formatDateToTurkish(props.donationInfo.date.toString())}
        </div>

        {/* HASTANE */}
        <div
          className="text-item multiline"
          style={{
            top: `${props.donationTemplateInfo.hospital.coord.top}px`,
            left: `${props.donationTemplateInfo.hospital.coord.left}px`,
            fontSize: `${props.donationTemplateInfo.hospital.font.size}px`,
            color: props.donationTemplateInfo.hospital.font.color,
            width: "305px",
          }}
        >
          {props.donationInfo.hospital}
        </div>

        {/* YER */}
        <div
          className="text-item multiline"
          style={{
            top: `${props.donationTemplateInfo.location.coord.top}px`,
            left: `${props.donationTemplateInfo.location.coord.left}px`,
            fontSize: `${props.donationTemplateInfo.location.font.size}px`,
            color: props.donationTemplateInfo.location.font.color,
            width: "340px",
          }}
        >
          {props.donationInfo.location}
        </div>
      </div>
    </>
  );
}
