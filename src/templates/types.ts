import type { RefObject } from "react";
import type { DonationInfo } from "../entities/DonationInfo";

// Koordinat ve font bilgileri
export interface CoordinateEntity {
    top: number;
    left: number;
}

export interface FontEntity {
    size: number;
    color: string;
}

export interface FieldStyle {
    width?: number;
    coord: CoordinateEntity;
    font: FontEntity;
}

// Template konfigürasyonu - her template'in sahip olması gereken temel bilgiler
export interface TemplateConfig {
    id: string;
    templatePath: string;
    selectorColor: string;
    styles: {
        bloodGroup: FieldStyle;
        regardlessBloodGroup: FieldStyle;
        bloodType: FieldStyle;
        fullName: FieldStyle;
        phone: FieldStyle;
        date: FieldStyle;
        hospital: FieldStyle;
        location: FieldStyle;
    };
}

// Template component'inin alacağı props
export interface TemplateProps {
    donationInfo: DonationInfo;
    imageRef: RefObject<HTMLDivElement | null>;
}

// Registry'de tutulacak template yapısı
export interface TemplateModule {
    Component: React.FC<TemplateProps>;
    config: TemplateConfig;
}

// Template'lerin listesini döndürmek için (selector için)
export interface TemplateListItem {
    id: string;
    selectorColor: string;
}
