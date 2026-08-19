import "./globals.css";

export const metadata = {
  title: "RanMet",
  description: "Connect · Create · Inspire",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
