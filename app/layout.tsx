import "./globals.css";
import localFont from "next/font/local";

const vazirmatn = localFont({
  src: "../public/fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata = {
  title: "Bidrano Studio",
  description: "Bidrano AI Content Production Studio",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.variable}>{children}</body>
    </html>
  );
}
