import { Button, ButtonGroup, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Info } from "@mui/icons-material";
import Swal from "sweetalert2";
import Logo from "./Logo";

interface TopBarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  changeLanguage: (lang: string) => void;
}

export default function TopBar(props: TopBarProps) {
  const { t } = useTranslation();

  const handleInfoClick = async () => {
    const res = await fetch(import.meta.env.VITE_COUNTER_API);
    const json = await res.json();
    const data = json.counter?.toLocaleString("tr-TR") || 0;
    Swal.fire({
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <style>                
                .logo { width: 80px; margin-bottom: 20px; }
                .containerr { background-color: #eeebe3; text-align: center; }
                .main-title { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
            </style>
        </head>
        <body>
          <div class="containerr">
            <img class="logo" src="kan-akademi-logo.png" alt="Kan Akademi Logo" />
            <div>Bu site aracılığıyla bugüne kadar toplam</div>
            <div class="main-title">${data} kan ilanı</div>
            <div>hazırlanarak ${data} kişinin yaşama tutunmasına katkı sağlandı.</div>
          </div>
        </body>
        </html>
      `,
      showConfirmButton: true,
      confirmButtonText: t("close"),
      background: "#eeebe3",
    });
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
            onClick={() => props.changeLanguage("tr")}
          >
            TR
          </Button>
          <Button
            title="Select English language"
            aria-label="Select English language"
            onClick={() => props.changeLanguage("en")}
          >
            EN
          </Button>
        </ButtonGroup>
        <button className="theme-toggle-button" onClick={props.toggleTheme}>
          {props.theme === "light" ? "🌙" : "☀️"}
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
