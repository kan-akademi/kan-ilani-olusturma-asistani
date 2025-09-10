import { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Logo from "./components/Logo";
import PageHeader from "./components/PageHeader";
import BloodDonationForm from "./components/BloodDonationForm";
import LegalNotice from "./components/LegalNotice";
import Copyright from "./components/Copyright";
import { useTranslation } from "react-i18next";
import "./i18n";
import { trTR } from '@mui/material/locale';
import { trTR as datePickerTr } from '@mui/x-date-pickers/locales';
import { Button, ButtonGroup } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';

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

  const muiTheme = createTheme({
    palette: {
      mode: theme,
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
    },
  }, datePickerTr, trTR);

  return (
    <>
      <ThemeProvider theme={muiTheme} defaultMode="system">
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
          <ButtonGroup size="small" color="inherit" variant="text" aria-label={t("langButtonGroup")}>
            <Button aria-label="Türkçe dilini seç" onClick={() => i18n.changeLanguage("tr")}>TR</Button>
            <Button aria-label="Select English language" onClick={() => i18n.changeLanguage("en")}>EN</Button>
          </ButtonGroup>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Logo />
          <PageHeader />
          <BloodDonationForm />
          <LegalNotice />
          <Copyright />
        </LocalizationProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
