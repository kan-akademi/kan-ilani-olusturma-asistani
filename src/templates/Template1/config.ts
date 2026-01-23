import type { TemplateConfig } from "../types";

const ASSET_VERSION = "20251020";

export const config: TemplateConfig = {
    id: "1",
    selectorColor: "#534e58",
    templatePath: `kan-akademi-ilan-template-1.png?v=${ASSET_VERSION}`,
    styles: {
        bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#e3240d" } },
        regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#e3240d" } },
        bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#fff" } },
        fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#fff" } },
        phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#fff" } },
        date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#fff" } },
        hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#fff" } },
        location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#fff" } },
    },
};
