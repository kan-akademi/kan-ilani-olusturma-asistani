import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";

/**
 * Template 3 - Turkuaz tema
 */
export function Template3Component(props: TemplateProps) {
  return <BaseTemplateComponent {...props} config={config} />;
}
