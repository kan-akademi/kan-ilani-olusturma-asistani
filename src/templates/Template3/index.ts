import type { TemplateModule } from "../types";
import { Template3Component } from "./Template3Component";
import { config } from "./config";

export const Template3: TemplateModule = {
  Component: Template3Component,
  config,
};

export { config } from "./config";
export { Template3Component } from "./Template3Component";
