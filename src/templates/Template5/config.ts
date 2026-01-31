import type { TemplateConfig } from "../types";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ASSET_VERSION = "20251020";

export const config: TemplateConfig = {
  id: "5",
  selectorColor: "#ffc24a",
  selectorIcon: AutoAwesomeIcon,
  templatePath: `kan-akademi-ilan-template-5.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#ffffff" } },
    regardlessBloodGroup: { coord: { top: 70, left: 35 }, font: { size: 45, color: "#ffffff" } },
    bloodType: { coord: { top: 188, left: 165 }, font: { size: 17, color: "#000000" } },
    fullName: { width: 165, coord: { top: 275, left: 10 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 347, left: 188 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 244, left: 229 }, font: { size: 17, color: "#000000" } },
    hospital: { coord: { top: 435, left: 10 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 508, left: 10 }, font: { size: 16, color: "#000000" } },
  },
};
