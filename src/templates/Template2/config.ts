import { ASSET_VERSION } from "../assetVersion";
import type { TemplateConfig } from "../types";
import FavoriteIcon from '@mui/icons-material/Favorite';

export const config: TemplateConfig = {
    id: "2",
    selectorColor: "#ff454f",
    selectorIcon: FavoriteIcon,
    templatePath: `kan-akademi-ilan-template-2.png?v=${ASSET_VERSION}`,
    styles: {
        bloodGroup: { coord: { top: 60, left: 47 }, font: { size: 78, color: "#ff4550" } },
        regardlessBloodGroup: { coord: { top: 68, left: 60 }, font: { size: 35, color: "#ff4550" } },
        bloodType: { coord: { top: 176, left: 85 }, font: { size: 17, color: "#000000" } },
        fullName: { coord: { top: 281, left: 78 }, font: { size: 17, color: "#000000" } },
        phone: { coord: { top: 245, left: 65 }, font: { size: 17, color: "#000000" } },
        date: { coord: { top: 211, left: 48 }, font: { size: 17, color: "#000000" } },
        hospital: { coord: { top: 340, left: 6 }, font: { size: 16, color: "#000000" } },
        location: { width: 220, coord: { top: 428, left: 126 }, font: { size: 16, color: "#000000" } },
    },
};
