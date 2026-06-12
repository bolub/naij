import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Provider } from "@/components/ui/provider";

const monaSans = localFont({
  src: "../../public/fonts/MonaSans.woff2",
  variable: "--font-mona-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nigerian Restaurants in Kent",
  description:
    "A mobile-friendly guide to Nigerian and West African restaurants across Kent.",
  appleWebApp: {
    capable: true,
    title: "Kent Naija",
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
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
