import { ASSET_VERSION } from "../assetVersion";
import type { TemplateConfig } from "../types";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const config: TemplateConfig = {
  id: "5",
  selectorColor: "#ff9900",
  selectorIcon: AutoAwesomeIcon,
  templatePath: `./assets/templates/kan-akademi-ilan-template-5.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#000000" } },
    regardlessBloodGroup: { coord: { top: 70, left: 35 }, font: { size: 45, color: "#000000" } },
    bloodType: { coord: { top: 218, left: 112 }, font: { size: 17, color: "#000000" } },
    fullName: { width: 165, coord: { top: 350, left: 14 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 289, left: 94 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 255, left: 78 }, font: { size: 17, color: "#000000" } },
    hospital: { coord: { top: 415, left: 14 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 483, left: 14 }, font: { size: 16, color: "#000000" } },
  },
};
