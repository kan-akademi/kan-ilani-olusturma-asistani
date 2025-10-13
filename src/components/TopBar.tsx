import { Button, ButtonGroup, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Info } from "@mui/icons-material";
import Logo from "./Logo";

interface TopBarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  handleInfoClick: () => void;
  changeLanguage: (lang: string) => void;
  handleSpeakClick: () => void;
}

export default function TopBar(props: TopBarProps) {
  const { t } = useTranslation();

  return (
    <>
      <ButtonGroup
        size="small"
        color="inherit"
        variant="text"
        aria-label={t("topBarButtonGroup")}
      >
        <Button
          title={t("topBarTrButton")}
          aria-label={t("topBarTrButton")}
          onClick={() => props.changeLanguage("tr")}
        >
          TR
        </Button>
        <Button
          title={t("topBarEnButton")}
          aria-label={t("topBarEnButton")}
          onClick={() => props.changeLanguage("en")}
        >
          EN
        </Button>
        <Button
          title={t("topBarThemeButton")}
          aria-label={t("topBarThemeButton")}
          onClick={() => props.toggleTheme()}
        >
          {props.theme === "light" ? "🌙" : "☀️"}
        </Button>
        <Button
          title={t("topBarSoundButton")}
          aria-label={t("topBarSoundButton")}
          onClick={() => props.handleSpeakClick()}
        >
          🔊
        </Button>
      </ButtonGroup>
      <div style={{ position: "fixed", top: "3px", right: "6px" }}>
        <Tooltip title="Bilgi">
          <IconButton
            onClick={props.handleInfoClick}
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
