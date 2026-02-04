import type { TemplateModule } from "../types";
import { Template2Component } from "./Template2Component";
import { config } from "./config";

export const Template2: TemplateModule = {
  Component: Template2Component,
  config,
};

export { config } from "./config";
export { Template2Component } from "./Template2Component";
