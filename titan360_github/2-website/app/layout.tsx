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

const getBackendUrl = () => process.env.API_URL || "https://titan-api-gcuw.onrender.com";

export async function generateMetadata(): Promise<Metadata> {
  const backendUrl = getBackendUrl();
  let seoTitle = "TiTAN 360 | Profesyonel Temizlik Hizmetleri - Antalya";
  let seoDesc = "Antalya'nın en güvenilir temizlik şirketi. Ev, ofis, cam temizliği, koltuk yıkama ve daha fazlası.";
  let seoKeywords = "temizlik, ev temizliği, ofis temizliği, antalya temizlik şirketi, profesyonel temizlik, koltuk yıkama, cam temizliği";

  try {
    const res = await fetch(`${backendUrl}/api/website-content`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.seo_title) seoTitle = data.seo_title;
      if (data.seo_description) seoDesc = data.seo_description;
      if (data.seo_keywords || data.negative_keywords) {
        seoKeywords = data.seo_keywords || data.negative_keywords || seoKeywords;
      }
    }
  } catch (e) {}

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const backendUrl = getBackendUrl();
  let content: any = {};
  
  try {
    const res = await fetch(`${backendUrl}/api/website-content`, { next: { revalidate: 60 } });
    if (res.ok) {
      content = await res.json();
    }
  } catch (e) {}

  const primaryColor = content.primary_color || "#059669";
  const secondaryColor = content.secondary_color || "#0284c7";

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
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary-color: ${primaryColor};
            --primary-hover-color: color-mix(in srgb, ${primaryColor} 85%, black);
            --secondary-color: ${secondaryColor};
            --secondary-hover-color: color-mix(in srgb, ${secondaryColor} 85%, black);
          }
        `}} />
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
