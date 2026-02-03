import { ASSET_VERSION } from "../assetVersion";
import type { TemplateConfig } from "../types";
import PixIcon from '@mui/icons-material/Pix';

export const config: TemplateConfig = {
  id: "4",
  selectorColor: "#f74e47",
  selectorIcon: PixIcon,
  templatePath: `kan-akademi-ilan-template-4.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 44 }, font: { size: 78, color: "#f74e47" } },
    regardlessBloodGroup: { coord: { top: 80, left: 50 }, font: { size: 40, color: "#f74e47" } },
    bloodType: { coord: { top: 217, left: 104 }, font: { size: 17, color: "#000000" } },
    fullName: { coord: { top: 325, left: 96 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 290, left: 82 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 254, left: 65 }, font: { size: 17, color: "#000000" } },
    hospital: { coord: { top: 385, left: 25 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 475, left: 25 }, font: { size: 16, color: "#000000" } },
  },
};
