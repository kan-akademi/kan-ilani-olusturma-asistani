import { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { trTR } from "@mui/material/locale";
import { useTranslation } from "react-i18next";
import "./i18n";

import TopBar from "./components/TopBar";
import PageHeader from "./components/PageHeader";
import BloodDonationForm from "./components/BloodDonationFormContainer";
import LegalNotice from "./components/LegalNotice";
import Copyright from "./components/Copyright";

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
        changeLanguage={(lang) => i18n.changeLanguage(lang)}
      />
      <PageHeader />
      <BloodDonationForm />
      <LegalNotice />
      <Copyright />
    </ThemeProvider>
  );
}

export default App;
