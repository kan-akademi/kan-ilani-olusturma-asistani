import { Button, ButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Info } from "@mui/icons-material";
import Logo from "./Logo";

interface TopBarProps {
  theme: "light" | "dark";
  isPlaying: boolean;
  toggleTheme: () => void;
  handleInfoClick: () => void;
  changeLanguage: (lang: string) => void;
  handleSpeakClick: () => void;
}

export default function TopBar(props: TopBarProps) {
  const { t } = useTranslation();

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ButtonGroup
          size="small"
          color="inherit"
          variant="text"
          aria-label={t("topBarLeftButtonGroup")}
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
            {props.isPlaying ? "⏸️" : "🔊"}
          </Button>
        </ButtonGroup>

        <ButtonGroup
          size="small"
          color="inherit"
          variant="text"
          aria-label={t("topBarRightButtonGroup")}
        >
          <Button
            title={t("topBarInfoButton")}
            aria-label={t("topBarInfoButton")}
            onClick={props.handleInfoClick}
          >
            <Info />
          </Button>
        </ButtonGroup>
      </div>
      <Logo />
    </>
  );
}
