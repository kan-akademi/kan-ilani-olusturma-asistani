import type { TemplateModule } from "../types";
import { Template4Component } from "./Template4Component";
import { config } from "./config";

export const Template4: TemplateModule = {
  Component: Template4Component,
  config,
};

export { config } from "./config";
export { Template4Component } from "./Template4Component";
