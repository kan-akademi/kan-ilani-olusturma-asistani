import { useTranslation } from "react-i18next";

export default function PageHeader() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: "center" }}>
      <h2>{t("headerTitle")}</h2>
      <p>{t("headerDesc")}</p>
    </div>
  );
}
