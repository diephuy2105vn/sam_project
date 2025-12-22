import "./App.css";
import "@mantine/core/styles.css";

import MainPage from "./pages/MainPage";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5C5F66",
      "#373A40",
      "#2C2E33",
      "#25262B",
      "#1A1B1E",
      "#141517",
      "#0F1014",
    ],
    brand: [
      "#EEF2FF",
      "#E0E7FF",
      "#C7D2FE",
      "#A5B4FC",
      "#818CF8",
      "#6366F1",
      "#4F46E5",
      "#4338CA",
      "#3730A3",
      "#312E81",
    ],
  },
  primaryColor: "brand",
  defaultRadius: "md",
  fontFamily: "system-ui, -apple-system, sans-serif",
});

function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <MainPage />
    </MantineProvider>
  );
}

export default App;
