import type { TemplateModule } from "../types";
import { Template1Component } from "./Template1Component";
import { config } from "./config";

export const Template1: TemplateModule = {
    Component: Template1Component,
    config,
};

export { config } from "./config";
export { Template1Component } from "./Template1Component";
