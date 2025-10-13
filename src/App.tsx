import { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { trTR } from "@mui/material/locale";
import Swal from "sweetalert2";
import "./i18n";

import TopBar from "./components/TopBar";
import PageHeader from "./components/PageHeader";
import BloodDonationForm from "./components/BloodDonationFormContainer";
import LegalNotice from "./components/LegalNotice";
import Copyright from "./components/Copyright";

function App() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const userLanguage = navigator.language;
    i18n.changeLanguage(userLanguage.split("-")[0]);
  }, [i18n]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

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

  const handleSpeakClick = () => {
    const audioFile =
      navigator.language === "tr-TR"
        ? "page-content-audio-tr.mp3"
        : "page-content-audio-en.mp3";
    const audio = new Audio(audioFile);
    audio.play();
  };

  const muiTheme = createTheme(
    {
      palette: {
        mode: theme,
      },
      typography: {
        fontFamily: "Roboto, sans-serif",
      },
    },
    trTR
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <TopBar
        theme={theme}
        toggleTheme={toggleTheme}
        handleInfoClick={handleInfoClick}
        changeLanguage={(lang) => i18n.changeLanguage(lang)}
        handleSpeakClick={handleSpeakClick}
      />
      <PageHeader />
      <BloodDonationForm />
      <LegalNotice />
      <Copyright />
    </ThemeProvider>
  );
}

export default App;
