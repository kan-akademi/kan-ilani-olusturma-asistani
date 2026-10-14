import { ASSET_VERSION } from "../assetVersion";
import type { TemplateConfig } from "../types";
import StarIcon from '@mui/icons-material/Star';

export const config: TemplateConfig = {
  id: "7",
  selectorColor: "#4847ef",
  selectorIcon: StarIcon,
  templatePath: `./assets/templates/kan-akademi-ilan-template-7.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#000000" } },
    bloodGroup2: { coord: { top: 170, left: 47 }, font: { size: 78, color: "#000000" } },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#000000" } },
    bloodType: { width: 155, coord: { top: 232, left: 85 }, font: { size: 17, color: "#000000" } },
    fullName: { coord: { top: 362, left: 6 }, font: { size: 16, color: "#000000" } },
    phone: { coord: { top: 305, left: 65 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 270, left: 50 }, font: { size: 17, color: "#000000" } },
    hospital: { width: 280, coord: { top: 406, left: 6 }, font: { size: 16, color: "#000000" } },
    location: { width: 340, coord: { top: 480, left: 6 }, font: { size: 16, color: "#000000" } },
  },
};
