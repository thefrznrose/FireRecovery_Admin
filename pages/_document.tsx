import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Google Identity Services (GIS) script */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        {/* Google Picker API script */}
        <script
          src="https://apis.google.com/js/api.js"
          async
          defer
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
