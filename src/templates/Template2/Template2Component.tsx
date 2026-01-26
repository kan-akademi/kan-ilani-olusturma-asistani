import { useRef } from "react";
import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";

/**
 * Template 2 - Kırmızı tema
 * BaseTemplateComponent kullanıyor, özel logic eklenebilir
 */
export function Template2Component(props: TemplateProps) {
    const { donationInfo } = props;

    // Dinamik olarak kan grubu konumunu ayarla
    const originalBloodGroupLeft = useRef(config.styles.bloodGroup.coord.left);

    if (donationInfo.bloodGroup.startsWith("AB")) {
        config.styles.bloodGroup.coord.left = 20;
    } else {
        config.styles.bloodGroup.coord.left = originalBloodGroupLeft.current;
    }

    // Dinamik olarak kan tipi font boyutunu ve konumunu ayarla
    const originalBloodTypeTop = useRef(config.styles.bloodType.coord.top);
    const originalBloodTypeFontSize = useRef(config.styles.bloodType.font.size);

    if (donationInfo.bloodType.length > 3) {
        config.styles.bloodType.coord.top = 203;
        config.styles.bloodType.font.size = 15;
    } else {
        config.styles.bloodType.coord.top = originalBloodTypeTop.current;
        config.styles.bloodType.font.size = originalBloodTypeFontSize.current;
    }

    // Dinamik olarak isim font boyutunu ve konumunu ayarla
    const originalFullNameTop = useRef(config.styles.fullName.coord.top);
    const originalFullNameFontSize = useRef(config.styles.fullName.font.size);

    if (donationInfo.fullName.length >= 35) {
        config.styles.fullName.coord.top = 260;
        config.styles.fullName.font.size = 13;
    } else if (donationInfo.fullName.length >= 25) {
        config.styles.fullName.coord.top = 258;
        config.styles.fullName.font.size = 15;
    } else {
        config.styles.fullName.coord.top = originalFullNameTop.current;
        config.styles.fullName.font.size = originalFullNameFontSize.current;
    }

    // Dinamik olarak lokasyon konumunu ayarla
    const originalLocationTop = useRef(config.styles.location.coord.top);
    const originalLocationFontSize = useRef(config.styles.location.font.size);

    if (donationInfo.location.length >= 260) {
        config.styles.location.coord.top = 471;
        config.styles.location.font.size = 14;
    } else {
        config.styles.location.coord.top = originalLocationTop.current;
        config.styles.location.font.size = originalLocationFontSize.current;
    }

    return <BaseTemplateComponent {...props} config={config} />;
}
