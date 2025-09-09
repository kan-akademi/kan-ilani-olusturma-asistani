import { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Logo from "./components/Logo";
import PageHeader from "./components/PageHeader";
import BloodDonationForm from "./components/BloodDonationForm";
import LegalNotice from "./components/LegalNotice";
import Copyright from "./components/Copyright";
import { useTranslation } from "react-i18next";
import "./i18n";

function App() {
  const { i18n } = useTranslation();
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
  });

  return (
    <>
      <ThemeProvider theme={muiTheme} defaultMode="system">
        <button onClick={() => i18n.changeLanguage("en")}>EN</button>
        <button onClick={() => i18n.changeLanguage("tr")}>TR</button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <Logo />
        <PageHeader />
        <BloodDonationForm />
        <LegalNotice />
        <Copyright />
      </ThemeProvider>
    </>
  );
}

export default App;
