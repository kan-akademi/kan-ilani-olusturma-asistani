import type { CoordinateEntity } from "./CoordinateEntity";

export interface DonationTemplateInfo {
  templateId: string;
  templatePath: string;
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
    templatePath: `kan-akademi-ilan-template-1.jpg?v=${ASSET_VERSION}`,
    bloodGroup: { coord: { top: 83, left: 47 }, leftForAB: 20, fontSize: 0 },
    bloodType: { coord: { top: 212, left: 85 }, fontSize: 17 },
    fullName: { coord: { top: 256, left: 80 }, fontSize: 17 },
    phone: { coord: { top: 302, left: 65 } },
    date: { coord: { top: 346, left: 50 } },
    hospital: { coord: { top: 408, left: 10 } },
    location: { coord: { top: 475, left: 10 }, fontSize: 16 },
  },
];