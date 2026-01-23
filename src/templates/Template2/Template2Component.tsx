import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";

/**
 * Template 2 - Kırmızı tema
 * BaseTemplateComponent kullanıyor, özel logic eklenebilir
 */
export function Template2Component(props: TemplateProps) {
  // Burada template'e özel logic eklenebilir
  // Örn: QR kod, ek alanlar, farklı formatlama vs.
  
  return <BaseTemplateComponent {...props} config={config} />;
}
