import type { CoordinateEntity } from "./CoordinateEntity";

export interface DonationTemplateInfo {
  templateId: string;
  templatePath: string;
  templateSelectorColor: string;
  bloodGroup: {
    coord: CoordinateEntity;
    fontSize: number;
    leftForAB: number;
  };
  bloodType: { coord: CoordinateEntity; fontSize: number };
  fullName: { coord: CoordinateEntity; fontSize: number };
  phone: { coord: CoordinateEntity };
  date: { coord: CoordinateEntity };
  hospital: { coord: CoordinateEntity };
  location: { coord: CoordinateEntity; fontSize: number };
}

const ASSET_VERSION = "20251020";

export const initialDonationTemplateInfo: DonationTemplateInfo[] = [
  {
    templateId: "1",
    templateSelectorColor: "#534e58",
    templatePath: `kan-akademi-ilan-template-1.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, leftForAB: 20, fontSize: 0 },
    bloodType: { coord: { top: 212, left: 85 }, fontSize: 17 },
    fullName: { coord: { top: 256, left: 80 }, fontSize: 17 },
    phone: { coord: { top: 302, left: 65 } },
    date: { coord: { top: 346, left: 50 } },
    hospital: { coord: { top: 408, left: 10 } },
    location: { coord: { top: 475, left: 10 }, fontSize: 16 },
  },
  {
    templateId: "2",
    templateSelectorColor: "#ff454f",
    templatePath: `kan-akademi-ilan-template-2.png?v=${ASSET_VERSION}`, //https://fonts.google.com/specimen/League+Spartan
    bloodGroup: { coord: { top: 83, left: 47 }, leftForAB: 20, fontSize: 0 },//#ff4550
    bloodType: { coord: { top: 212, left: 85 }, fontSize: 17 },
    fullName: { coord: { top: 256, left: 80 }, fontSize: 17 },
    phone: { coord: { top: 302, left: 65 } },
    date: { coord: { top: 346, left: 50 } },
    hospital: { coord: { top: 408, left: 10 } },
    location: { coord: { top: 475, left: 10 }, fontSize: 16 },
  },
  {
    templateId: "3",
    templateSelectorColor: "#89e8e0",
    templatePath: `kan-akademi-ilan-template-3.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, leftForAB: 20, fontSize: 0 },
    bloodType: { coord: { top: 212, left: 85 }, fontSize: 17 },
    fullName: { coord: { top: 256, left: 80 }, fontSize: 17 },
    phone: { coord: { top: 302, left: 65 } },
    date: { coord: { top: 346, left: 50 } },
    hospital: { coord: { top: 408, left: 10 } },
    location: { coord: { top: 475, left: 10 }, fontSize: 16 },
  },
  {
    templateId: "4",
    templateSelectorColor: "#f74e47",
    templatePath: `kan-akademi-ilan-template-4.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, leftForAB: 20, fontSize: 0 },
    bloodType: { coord: { top: 212, left: 85 }, fontSize: 17 },
    fullName: { coord: { top: 256, left: 80 }, fontSize: 17 },
    phone: { coord: { top: 302, left: 65 } },
    date: { coord: { top: 346, left: 50 } },
    hospital: { coord: { top: 408, left: 10 } },
    location: { coord: { top: 475, left: 10 }, fontSize: 16 },
  },
  {
    templateId: "5",
    templateSelectorColor: "#ffc24a",
    templatePath: `kan-akademi-ilan-template-5.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, leftForAB: 20, fontSize: 0 },
    bloodType: { coord: { top: 212, left: 85 }, fontSize: 17 },
    fullName: { coord: { top: 256, left: 80 }, fontSize: 17 },
    phone: { coord: { top: 302, left: 65 } },
    date: { coord: { top: 346, left: 50 } },
    hospital: { coord: { top: 408, left: 10 } },
    location: { coord: { top: 475, left: 10 }, fontSize: 16 },
  },
  {
    templateId: "6",
    templateSelectorColor: "#da2f47",
    templatePath: `kan-akademi-ilan-template-6.png?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, leftForAB: 20, fontSize: 0 },
    bloodType: { coord: { top: 212, left: 85 }, fontSize: 17 },
    fullName: { coord: { top: 256, left: 80 }, fontSize: 17 },
    phone: { coord: { top: 302, left: 65 } },
    date: { coord: { top: 346, left: 50 } },
    hospital: { coord: { top: 408, left: 10 } },
    location: { coord: { top: 475, left: 10 }, fontSize: 16 },
  },
];