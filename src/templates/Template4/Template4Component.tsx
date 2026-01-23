import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";

/**
 * Template 4 - Turuncu-Kırmızı tema
 */
export function Template4Component(props: TemplateProps) {
  return <BaseTemplateComponent {...props} config={config} />;
}
