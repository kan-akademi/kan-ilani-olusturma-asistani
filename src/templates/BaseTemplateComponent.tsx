import type { TemplateProps, TemplateConfig } from "./types";

interface BaseTemplateProps extends TemplateProps {
    config: TemplateConfig;
}

/**
 * Temel template component'i - Tüm template'ler için ortak render mantığı
 * Eğer bir template'in kendine özel render mantığı gerekirse,
 * bu component'i kullanmak yerine kendi component'ini yazabilir.
 */
export function BaseTemplateComponent({ donationInfo, imageRef, config }: BaseTemplateProps) {
    const { styles, templatePath } = config;

    return (
        <div className="image-wrapper" ref={imageRef}>
            <img
                alt="Template"
                className="background-image"
                src={templatePath}
            />

            {/* KAN GRUBU 1. SATIR*/}
            <div
                className="text-item blood-group"
                style={{
                    top: `${styles.bloodGroup.coord.top}px`,
                    left: `${styles.bloodGroup.coord.left}px`,
                    fontSize: `${styles.bloodGroup.font.size}px`,
                    color: styles.bloodGroup.font.color,
                }}
            >
                {donationInfo.bloodGroup1.join(", ")}
            </div>
            {/* KAN GRUBU 2. SATIR*/}
            {donationInfo.bloodGroup2.length > 0 && (
                <div
                    className="text-item blood-group"
                    style={{
                        top: `${styles.bloodGroup2.coord.top}px`,
                        left: `${styles.bloodGroup2.coord.left}px`,
                        fontSize: `${styles.bloodGroup2.font.size}px`,
                        color: styles.bloodGroup2.font.color,
                }}
                >
                    {donationInfo.bloodGroup2.join(", ")}
                </div>
            )}
            {/* KAN TÜRÜ */}
            <div
                className="text-item"
                style={{
                    top: `${styles.bloodType.coord.top}px`,
                    left: `${styles.bloodType.coord.left}px`,
                    fontSize: `${styles.bloodType.font.size}px`,
                    color: styles.bloodType.font.color,
                    width: `${styles.bloodType.width ?? null}px`,
                }}
            >
                {Array.isArray(donationInfo.bloodType)
                    ? donationInfo.bloodType.join(", ")
                    : String(donationInfo.bloodType)}
            </div>

            {/* AD SOYAD */}
            <div
                className="text-item"
                style={{
                    top: `${styles.fullName.coord.top}px`,
                    left: `${styles.fullName.coord.left}px`,
                    fontSize: `${styles.fullName.font.size}px`,
                    ...(styles.fullName.width && { width: `${styles.fullName.width}px` }),
                    color: styles.fullName.font.color,
                }}
            >
                {donationInfo.fullName}
            </div>

            {/* TELEFON */}
            <div
                className="text-item"
                style={{
                    top: `${styles.phone.coord.top}px`,
                    left: `${styles.phone.coord.left}px`,
                    fontSize: `${styles.phone.font.size}px`,
                    color: styles.phone.font.color,
                }}
            >
                {donationInfo.phone}
            </div>

            {/* TARİH */}
            <div
                className="text-item"
                style={{
                    top: `${styles.date.coord.top}px`,
                    left: `${styles.date.coord.left}px`,
                    fontSize: `${styles.date.font.size}px`,
                    color: styles.date.font.color,
                }}
            >
                {donationInfo.dateFormatted}
            </div>

            {/* HASTANE */}
            <div
                className="text-item multiline"
                style={{
                    top: `${styles.hospital.coord.top}px`,
                    left: `${styles.hospital.coord.left}px`,
                    fontSize: `${styles.hospital.font.size}px`,
                    color: styles.hospital.font.color,
                    width: `${styles.hospital.width ?? 305}px`,
                }}
            >
                {donationInfo.hospital}
            </div>

            {/* YER */}
            <div
                className="text-item multiline"
                style={{
                    top: `${styles.location.coord.top}px`,
                    left: `${styles.location.coord.left}px`,
                    fontSize: `${styles.location.font.size}px`,
                    color: styles.location.font.color,
                    width: `${styles.location.width ?? 340}px`,
                }}
            >
                {donationInfo.location}
            </div>
        </div>
    );
}
