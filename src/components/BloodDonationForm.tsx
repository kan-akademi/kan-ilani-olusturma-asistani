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
            fontSize: `${props.donationTemplateInfo.bloodType.fontSize}px`,
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
            fontSize: `${props.donationTemplateInfo.fullName.fontSize}px`,
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
            fontSize: `${props.donationTemplateInfo.location.fontSize}px`,
            width: "340px",
          }}
        >
          {props.donationInfo.location}
        </div>
      </div>
    </>
  );
}
