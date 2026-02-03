import { ASSET_VERSION } from "../assetVersion";
import type { TemplateConfig } from "../types";
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

export const config: TemplateConfig = {
  id: "3",
  selectorColor: "#89e8e0",
  selectorIcon: LocalFloristIcon,
  templatePath: `kan-akademi-ilan-template-3.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 70, left: 40 }, font: { size: 78, color: "#ff4550" } },
    regardlessBloodGroup: { coord: { top: 75, left: 55 }, font: { size: 37, color: "#ff4550" } },
    bloodType: { coord: { top: 181, left: 88 }, font: { size: 17, color: "#000000" } },
    fullName: { coord: { top: 365, left: 31 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 272, left: 70 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 226, left: 50 }, font: { size: 17, color: "#000000" } },
    hospital: { coord: { top: 418, left: 31 }, font: { size: 16, color: "#000000" } },
    location: { width: 329, coord: { top: 470, left: 31 }, font: { size: 16, color: "#000000" } },
  },
};
