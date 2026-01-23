import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";

/**
 * Template 6 - Koyu Kırmızı tema
 */
export function Template6Component(props: TemplateProps) {
  return <BaseTemplateComponent {...props} config={config} />;
}
