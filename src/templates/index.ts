import type { TemplateModule, TemplateListItem } from "./types";
import { Template1 } from "./Template1";
import { Template2 } from "./Template2";
import { Template3 } from "./Template3";
import { Template4 } from "./Template4";
import { Template5 } from "./Template5";
import { Template6 } from "./Template6";

/**
 * Template Registry - Tüm template'leri merkezi olarak yönetir
 * Yeni bir template eklemek için:
 * 1. TemplateX klasörü oluştur (config.ts, TemplateXComponent.tsx, index.ts)
 * 2. Bu registry'ye import et ve templates array'ine ekle
 */

// Tüm template'ler sıralı array olarak (index bazlı erişim için)
export const templates: TemplateModule[] = [
    Template1,
    Template2,
    Template3,
    Template4,
    Template5,
    Template6,
];

// ID bazlı erişim için Map
const templateMap = new Map<string, TemplateModule>(
    templates.map((t) => [t.config.id, t])
);

/**
 * Index ile template al (0-based)
 */
export function getTemplateByIndex(index: number): TemplateModule | undefined {
    return templates[index];
}

/**
 * ID ile template al
 */
export function getTemplateById(id: string): TemplateModule | undefined {
    return templateMap.get(id);
}

/**
 * Template selector için liste döndür
 */
export function getTemplateList(): TemplateListItem[] {
    return templates.map((t) => ({
        id: t.config.id,
        selectorColor: t.config.selectorColor,
        selectorIcon: t.config.selectorIcon,
    }));
}

/**
 * Toplam template sayısı
 */
export function getTemplateCount(): number {
    return templates.length;
}
