import { Button, ButtonGroup, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Info } from "@mui/icons-material";
import Logo from "./Logo";

interface TopBarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  changeLanguage: (lang: string) => void;
}

export default function TopBar({
  theme,
  toggleTheme,
  changeLanguage,
}: TopBarProps) {
  const { t } = useTranslation();

  const handleInfoClick = () => {
    // Information butonu için gerekli işlevsellik buraya eklenebilir
    console.log("Information clicked");
  };

  return (
    <>
      <div style={{ marginTop: "12px" }}>
        <ButtonGroup
          size="small"
          color="inherit"
          variant="text"
          aria-label={t("langButtonGroup")}
        >
          <Button
            title="Türkçe dilini seç"
            aria-label="Türkçe dilini seç"
            onClick={() => changeLanguage("tr")}
          >
            TR
          </Button>
          <Button
            title="Select English language"
            aria-label="Select English language"
            onClick={() => changeLanguage("en")}
          >
            EN
          </Button>
        </ButtonGroup>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
      <div style={{ position: "fixed", top: "7px", right: "6px" }}>
        <Tooltip title="Bilgi">
          <IconButton
            onClick={handleInfoClick}
            color="default"
            aria-label="Uygulama hakkında bilgi"
          >
            <Info />
          </IconButton>
        </Tooltip>
      </div>
      <Logo />
    </>
  );
}
