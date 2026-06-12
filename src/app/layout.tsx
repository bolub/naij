import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { CSSProperties } from "react";
import { Provider } from "@/components/ui/provider";

const monaSans = localFont({
  src: "../../public/fonts/MonaSans.woff2",
  variable: "--font-mona-sans",
  display: "swap",
});

const fontVariables = {
  "--chakra-fonts-body": "var(--font-mona-sans)",
  "--chakra-fonts-heading": "var(--font-mona-sans)",
  fontFamily: "var(--font-mona-sans)",
} as CSSProperties;

export const metadata: Metadata = {
  title: "Nigerian Restaurants in England",
  description:
    "A mobile-friendly guide to Nigerian and West African restaurants across Kent and London.",
  appleWebApp: {
    capable: true,
    title: "Naija Food",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f2a24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${monaSans.variable} ${monaSans.className}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://images.squarespace-cdn.com" />
        <link rel="preconnect" href="https://tobisrestaurant.co.uk" />
        <link rel="preconnect" href="https://enishglobal.com" />
      </head>
      <body style={fontVariables}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
