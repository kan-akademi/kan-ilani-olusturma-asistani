import { useRef } from "react";
import type { TemplateProps } from "../types";
import { BaseTemplateComponent } from "../BaseTemplateComponent";
import { config } from "./config";
import { REGARDLESS_BLOOD_GROUP } from "../../entities/DonationInfo";

/**
 * Template 6 - Koyu Kırmızı tema
 */
export function Template6Component(props: TemplateProps) {
    const { donationInfo } = props;

    const localConfig = {
        ...config,
        styles: {
            ...config.styles,
            bloodGroup: {
                ...config.styles.bloodGroup,
                coord: { ...config.styles.bloodGroup.coord },
                font: { ...config.styles.bloodGroup.font },
            },
            regardlessBloodGroup: {
                ...config.styles.regardlessBloodGroup,
                coord: { ...config.styles.regardlessBloodGroup.coord },
                font: { ...config.styles.regardlessBloodGroup.font },
            },
            bloodType: {
                ...config.styles.bloodType,
                coord: { ...config.styles.bloodType.coord },
                font: { ...config.styles.bloodType.font },
            },
            fullName: {
                ...config.styles.fullName,
                coord: { ...config.styles.fullName.coord },
                font: { ...config.styles.fullName.font },
            },
            location: {
                ...config.styles.location,
                coord: { ...config.styles.location.coord },
                font: { ...config.styles.location.font },
            },
        },
    };

    // Dinamik olarak kan grubu konumunu ayarla
    const originalBloodGroupLeft = useRef(localConfig.styles.bloodGroup.coord.left);

    const hasRegardless = donationInfo.bloodGroup.includes(REGARDLESS_BLOOD_GROUP);
    const regularGroupCount = donationInfo.bloodGroup.filter(g => g !== REGARDLESS_BLOOD_GROUP).length;

    if (hasRegardless == false) {
        if (regularGroupCount == 1) {
            if (donationInfo.bloodGroup.at(0)?.startsWith("AB")) {
                localConfig.styles.bloodGroup.coord.left = 20;
            } else {
                localConfig.styles.bloodGroup.coord.left = originalBloodGroupLeft.current;
            }
        } else if (regularGroupCount == 2) {
            localConfig.styles.bloodGroup.coord.top = 110;
            localConfig.styles.bloodGroup.coord.left = 10;
            localConfig.styles.bloodGroup.font.size = 39;
        } else if (regularGroupCount == 3) {
            localConfig.styles.bloodGroup.coord.top = 73;
            localConfig.styles.bloodGroup.coord.left = 10;
            localConfig.styles.bloodGroup.font.size = 41;
        } else if (regularGroupCount == 4) {
            localConfig.styles.bloodGroup.coord.top = 73;
            localConfig.styles.bloodGroup.coord.left = 10;
            localConfig.styles.bloodGroup.font.size = 37;
        }
    }

    if (hasRegardless == true) {
        if (regularGroupCount == 0) {
            localConfig.styles.bloodGroup.coord.left = localConfig.styles.regardlessBloodGroup.coord.left;
            localConfig.styles.bloodGroup.font.size = localConfig.styles.regardlessBloodGroup.font.size;
        } else if (regularGroupCount == 1) {
            localConfig.styles.bloodGroup.coord.top = 80;
            localConfig.styles.bloodGroup.coord.left = 10;
            localConfig.styles.bloodGroup.font.size = 34;
        } else if (regularGroupCount == 2) {
            localConfig.styles.bloodGroup.coord.top = 85;
            localConfig.styles.bloodGroup.coord.left = 10;
            localConfig.styles.bloodGroup.font.size = 29;
        } else if (regularGroupCount == 3) {
            localConfig.styles.bloodGroup.coord.top = 90;
            localConfig.styles.bloodGroup.coord.left = 10;
            localConfig.styles.bloodGroup.font.size = 27;
        }
    }

    // Dinamik olarak kan tipi font boyutunu ve konumunu ayarla
    const originalBloodTypeTop = useRef(localConfig.styles.bloodType.coord.top);
    const originalBloodTypeFontSize = useRef(localConfig.styles.bloodType.font.size);

    if (donationInfo.bloodType.length > 3) {
        localConfig.styles.bloodType.coord.top = 197;
        localConfig.styles.bloodType.font.size = 15;
    } else {
        localConfig.styles.bloodType.coord.top = originalBloodTypeTop.current;
        localConfig.styles.bloodType.font.size = originalBloodTypeFontSize.current;
    }

    // Dinamik olarak isim font boyutunu ve konumunu ayarla
    const originalFullNameTop = useRef(localConfig.styles.fullName.coord.top);
    const originalFullNameFontSize = useRef(localConfig.styles.fullName.font.size);

    if (donationInfo.fullName.length >= 35) {
        localConfig.styles.fullName.coord.top = 328;
        localConfig.styles.fullName.font.size = 13;
    } else if (donationInfo.fullName.length >= 25) {
        localConfig.styles.fullName.coord.top = 327;
        localConfig.styles.fullName.font.size = 15;
    } else {
        localConfig.styles.fullName.coord.top = originalFullNameTop.current;
        localConfig.styles.fullName.font.size = originalFullNameFontSize.current;
    }

    // Dinamik olarak lokasyon konumunu ayarla
    const originalLocationTop = useRef(localConfig.styles.location.coord.top);
    const originalLocationFontSize = useRef(localConfig.styles.location.font.size);

    if (donationInfo.location.length >= 260) {
        localConfig.styles.location.coord.top = 450;
        localConfig.styles.location.font.size = 14;
    } else {
        localConfig.styles.location.coord.top = originalLocationTop.current;
        localConfig.styles.location.font.size = originalLocationFontSize.current;
    }

    return <BaseTemplateComponent {...props} config={localConfig} />;
}
