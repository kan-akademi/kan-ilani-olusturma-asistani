import type { TemplateModule } from "../types";
import { Template5Component } from "./Template5Component";
import { config } from "./config";

export const Template5: TemplateModule = {
  Component: Template5Component,
  config,
};

export { config } from "./config";
export { Template5Component } from "./Template5Component";
