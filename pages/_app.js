import "../styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Fonts } from "../public/Fonts";

const theme = extendTheme({
  fonts: {
    heading: "Archivo",
    body: "Archivo",
  },
  styles: {
    global: (props) => ({
      a: {
        color: props.colorMode === "dark" ? "teal.300" : "teal.500",
      },
    }),
    body: {
      userSelect: "none",
    },
  },
});

// help me make a global style that prevents the user from highliting text. So basically a prop that is passed to
// the component that will prevent highlight on most web browsers. thanks

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Fonts />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
