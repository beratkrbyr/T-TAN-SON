import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import FloatingActionBar from "./components/FloatingActionBar";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TiTAN 360 | Profesyonel Temizlik Hizmetleri - Antalya",
  description: "Antalya'nın en güvenilir temizlik şirketi. Ev, ofis, cam temizliği, koltuk yıkama ve daha fazlası.",
  keywords: "temizlik, ev temizliği, ofis temizliği, antalya temizlik şirketi, profesyonel temizlik, koltuk yıkama, cam temizliği",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="">
      <head>
        <Script id="gtm-script" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5KQWHZVC');`}
        </Script>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-white text-slate-800 min-h-screen flex flex-col`}>
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5KQWHZVC"
            height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe>
        </noscript>
        {children}
        <FloatingActionBar />
      </body>
    </html>
  );
}
