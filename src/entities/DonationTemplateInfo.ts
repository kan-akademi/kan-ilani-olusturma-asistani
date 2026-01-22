import type { CoordinateEntity } from "./CoordinateEntity";
import type { FontEntity } from "./FontEntity";

export interface DonationTemplateInfo {
  templateId: string;
  templatePath: string;
  templateSelectorColor: string;
  bloodGroup: {
    coord: CoordinateEntity;
    font: FontEntity;
    leftForAB: number;
  };
  regardlessBloodGroup: { coord: CoordinateEntity; font: FontEntity; };
  bloodType: { coord: CoordinateEntity; font: FontEntity; };
  fullName: { coord: CoordinateEntity; font: FontEntity; };
  phone: { coord: CoordinateEntity; font: FontEntity; };
  date: { coord: CoordinateEntity; font: FontEntity; };
  hospital: { coord: CoordinateEntity; font: FontEntity; };
  location: { coord: CoordinateEntity; font: FontEntity; };
}

const ASSET_VERSION = "20251020";

export const initialDonationTemplateInfo: DonationTemplateInfo[] = [
  {
    templateId: "1",
    templateSelectorColor: "#534e58",
    templatePath: `kan-akademi-ilan-template-1.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#e3240d" }, leftForAB: 20 },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#e3240d" } },
    bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#fff" } },
    fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#fff" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#fff" } },
    date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#fff" } },
    hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#fff" } },
    location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#fff" } },
  },
  {
    templateId: "2",
    templateSelectorColor: "#ff454f",
    templatePath: `kan-akademi-ilan-template-2.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#ff4550" }, leftForAB: 20, },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#ff4550" } },
    bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#fff" } },
    fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#fff" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#fff" } },
    date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#fff" } },
    hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#fff" } },
    location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#fff" } },
  },
  {
    templateId: "3",
    templateSelectorColor: "#89e8e0",
    templatePath: `kan-akademi-ilan-template-3.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#89e8e0" }, leftForAB: 20 },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#89e8e0" } },
    bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#fff" } },
    fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#fff" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#fff" } },
    date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#fff" } },
    hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#fff" } },
    location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#fff" } },
  },
  {
    templateId: "4",
    templateSelectorColor: "#f74e47",
    templatePath: `kan-akademi-ilan-template-4.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#f74e47" }, leftForAB: 20 },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#f74e47" } },
    bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#fff" } },
    fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#fff" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#fff" } },
    date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#fff" } },
    hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#fff" } },
    location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#fff" } },
  },
  {
    templateId: "5",
    templateSelectorColor: "#ffc24a",
    templatePath: `kan-akademi-ilan-template-5.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#ffc24a" }, leftForAB: 20 },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#ffc24a" } },
    bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#fff" } },
    fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#fff" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#fff" } },
    date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#fff" } },
    hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#fff" } },
    location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#fff" } },
  },
  {
    templateId: "6",
    templateSelectorColor: "#da2f47",
    templatePath: `kan-akademi-ilan-template-6.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#da2f47" }, leftForAB: 20 },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#da2f47" } },
    bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#fff" } },
    fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#fff" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#fff" } },
    date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#fff" } },
    hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#fff" } },
    location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#fff" } },
  },
];