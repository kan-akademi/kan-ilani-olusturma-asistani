import type { TemplateConfig } from "../types";

const ASSET_VERSION = "20251020";

export const config: TemplateConfig = {
  id: "4",
  selectorColor: "#f74e47",
  templatePath: `kan-akademi-ilan-template-4.png?v=${ASSET_VERSION}`,
  styles: {
    bloodGroup: { coord: { top: 83, left: 47 }, font: { size: 78, color: "#f74e47" } },
    regardlessBloodGroup: { coord: { top: 68, left: 25 }, font: { size: 47, color: "#f74e47" } },
    bloodType: { coord: { top: 212, left: 85 }, font: { size: 17, color: "#000000" } },
    fullName: { coord: { top: 256, left: 80 }, font: { size: 17, color: "#000000" } },
    phone: { coord: { top: 302, left: 65 }, font: { size: 17, color: "#000000" } },
    date: { coord: { top: 346, left: 50 }, font: { size: 17, color: "#000000" } },
    hospital: { coord: { top: 408, left: 10 }, font: { size: 16, color: "#000000" } },
    location: { coord: { top: 475, left: 10 }, font: { size: 16, color: "#000000" } },
  },
};
