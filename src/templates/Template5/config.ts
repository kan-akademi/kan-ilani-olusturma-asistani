import { ASSET_VERSION } from "../assetVersion";
import type { TemplateConfig } from "../types";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const config: TemplateConfig = {
  id: "5",
  selectorColor: "#ffc24a",
  selectorIcon: AutoAwesomeIcon,
  templatePath: `kan-akademi-ilan-template-5.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#000000" } },
    regardlessBloodGroup: { coord: { top: 65, left: 35 }, font: { size: 45, color: "#000000" } },
    bloodType: { coord: { top: 187, left: 80 }, font: { size: 17, color: "#000000" } },
    fullName: { width: 165, coord: { top: 365, left: 5 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 298, left: 60 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 252, left: 45 }, font: { size: 17, color: "#000000" } },
    hospital: { coord: { top: 435, left: 5 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 508, left: 5 }, font: { size: 16, color: "#000000" } },
  },
};
