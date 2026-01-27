import type { TemplateConfig } from "../types";

const ASSET_VERSION = "20251020";

export const config: TemplateConfig = {
  id: "3",
  selectorColor: "#89e8e0",
  templatePath: `kan-akademi-ilan-template-3.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 70, left: 80 }, font: { size: 70, color: "#89e8e0" } },
    regardlessBloodGroup: { coord: { top: 75, left: 70 }, font: { size: 37, color: "#89e8e0" } },
    bloodType: { coord: { top: 171, left: 150 }, font: { size: 17, color: "#000000" } },
    fullName: { coord: { top: 348, left: 102 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 222, left: 70 }, font: { size: 17, color: "#000000" } },
    hospital: { coord: { top: 418, left: 31 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 470, left: 31 }, font: { size: 16, color: "#000000" } },
  },
};
