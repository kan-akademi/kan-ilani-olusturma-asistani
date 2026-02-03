import { ASSET_VERSION } from "../assetVersion";
import type { TemplateConfig } from "../types";
import WaterDropIcon from '@mui/icons-material/WaterDrop';

export const config: TemplateConfig = {
  id: "6",
  selectorColor: "#da2f47",
  selectorIcon: WaterDropIcon,
  templatePath: `kan-akademi-ilan-template-6.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#000000" } },
    regardlessBloodGroup: { coord: { top: 66, left: 25 }, font: { size: 47, color: "#000000" } },
    bloodType: { coord: { top: 208, left: 88 }, font: { size: 17, color: "#000000" } },
    fullName: { coord: { top: 325, left: 80 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 284, left: 65 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 246, left: 50 }, font: { size: 17, color: "#000000" } },
    hospital: { width: 340, coord: { top: 390, left: 10 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 452, left: 10 }, font: { size: 16, color: "#000000" } },
  },
};
