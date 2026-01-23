import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";

/**
 * Template 5 - Sarı/Altın tema
 */
export function Template5Component(props: TemplateProps) {
  return <BaseTemplateComponent {...props} config={config} />;
}
