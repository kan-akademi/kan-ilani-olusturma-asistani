import { useQuery } from "@tanstack/react-query";
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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["counter"],
    queryFn: async () => {
      const res = await fetch(import.meta.env.VITE_COUNTER_API);
      return res.json();
    },
  });

  const handleInfoClick = async () => {
    const result = await refetch();
    console.log(result.data);//TODO: show in modal
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
