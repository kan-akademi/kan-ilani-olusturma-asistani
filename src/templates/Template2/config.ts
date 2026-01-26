import type { TemplateConfig } from "../types";

const ASSET_VERSION = "20251020";

export const config: TemplateConfig = {
    id: "2",
    selectorColor: "#ff454f",
    templatePath: `kan-akademi-ilan-template-2.png?v=${ASSET_VERSION}`,
    styles: {
        bloodGroup: { coord: { top: 60, left: 47 }, font: { size: 78, color: "#ff4550" } },
        regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#ff4550" } },
        bloodType: { coord: { top: 159, left: 113 }, font: { size: 17, color: "#000000" } },
        fullName: { coord: { top: 281, left: 80 }, font: { size: 17, color: "#000000" } },
        phone: { coord: { top: 246, left: 65 }, font: { size: 17, color: "#000000" } },
        date: { coord: { top: 211, left: 50 }, font: { size: 17, color: "#000000" } },
        hospital: { coord: { top: 340, left: 6 }, font: { size: 16, color: "#000000" } },
        location: { width: 220, coord: { top: 428, left: 126 }, font: { size: 16, color: "#000000" } },
    },
};
