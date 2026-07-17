import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Police géométrique proche de celle de la maquette
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Contactez l'agence",
  description:
    "Formulaire de contact de l'agence — demande de visite, rappel ou photos supplémentaires.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${montserrat.className} antialiased`}>{children}</body>
    </html>
  );
}