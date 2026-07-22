import "./globals.css";

export const metadata = {
  title: "ui-flex-site",
  description: "A small, polish-focused showcase site.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
