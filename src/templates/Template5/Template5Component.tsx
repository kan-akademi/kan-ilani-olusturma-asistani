import { useRef } from "react";
import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";

/**
 * Template 5 - Sarı/Altın tema
 */
export function Template5Component(props: TemplateProps) {
    const { donationInfo } = props;

    // Dinamik olarak kan grubu konumunu ayarla
    const originalBloodGroupLeft = useRef(config.styles.bloodGroup.coord.left);
    const originalBloodGroupFontSize = useRef(config.styles.bloodGroup.font.size);
    const originalBloodGroupTop = useRef(config.styles.bloodGroup.coord.top);

    if (donationInfo.bloodGroup.startsWith("AB")) {
        config.styles.bloodGroup.font.size = 75;
        config.styles.bloodGroup.coord.left = 31;
    } else {
        config.styles.bloodGroup.coord.left = originalBloodGroupLeft.current;
        config.styles.bloodGroup.font.size = originalBloodGroupFontSize.current;
        config.styles.bloodGroup.coord.top = originalBloodGroupTop.current;
    }

    // Dinamik olarak kan tipi font boyutunu ve konumunu ayarla
    const originalBloodTypeTop = useRef(config.styles.bloodType.coord.top);
    const originalBloodTypeFontSize = useRef(config.styles.bloodType.font.size);

    if (donationInfo.bloodType.length > 3) {
        config.styles.bloodType.coord.top = 188;
        config.styles.bloodType.font.size = 15;
    } else {
        config.styles.bloodType.coord.top = originalBloodTypeTop.current;
        config.styles.bloodType.font.size = originalBloodTypeFontSize.current;
    }

    // Dinamik olarak isim font boyutunu ve konumunu ayarla
    const originalFullNameTop = useRef(config.styles.fullName.coord.top);
    const originalFullNameFontSize = useRef(config.styles.fullName.font.size);

    if (donationInfo.fullName.length >= 35) {
        config.styles.fullName.coord.top = 275;
        config.styles.fullName.font.size = 13;
    } else if (donationInfo.fullName.length >= 25) {
        config.styles.fullName.coord.top = 275;
        config.styles.fullName.font.size = 15;
    } else {
        config.styles.fullName.coord.top = originalFullNameTop.current;
        config.styles.fullName.font.size = originalFullNameFontSize.current;
    }

    // Dinamik olarak lokasyon konumunu ayarla
    const originalLocationTop = useRef(config.styles.location.coord.top);
    const originalLocationFontSize = useRef(config.styles.location.font.size);

    if (donationInfo.location.length >= 240) {
        config.styles.location.coord.top = 475;
        config.styles.location.font.size = 14;
    } else {
        config.styles.location.coord.top = originalLocationTop.current;
        config.styles.location.font.size = originalLocationFontSize.current;
    }

    return <BaseTemplateComponent {...props} config={config} />;
}
