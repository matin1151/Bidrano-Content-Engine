import "./globals.css";

export const metadata = {
  title: "Bidrano Studio",
  description: "Bidrano AI Content Production Studio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
