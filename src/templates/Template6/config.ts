import type { TemplateConfig } from "../types";
import WaterDropIcon from '@mui/icons-material/WaterDrop';

const ASSET_VERSION = "20251020";

export const config: TemplateConfig = {
  id: "6",
  selectorColor: "#da2f47",
  selectorIcon: WaterDropIcon,
  templatePath: `kan-akademi-ilan-template-6.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#da2f47" } },
    regardlessBloodGroup: { coord: { top: 55, left: 25 }, font: { size: 47, color: "#da2f47" } },
    bloodType: { coord: { top: 180, left: 135 }, font: { size: 17, color: "#000000" } },
    fullName: { coord: { top: 325, left: 80 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 284, left: 65 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 247, left: 50 }, font: { size: 17, color: "#000000" } },
    hospital: { width: 340, coord: { top: 390, left: 10 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 450, left: 10 }, font: { size: 16, color: "#000000" } },
  },
};
