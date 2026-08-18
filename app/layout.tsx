import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "800"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: {
    default: "stasks",
    template: "%s · stasks",
  },
  description: "Plan tonight. Do it tomorrow. Be kind to misses.",
  applicationName: "stasks",
  appleWebApp: {
    capable: true,
    title: "stasks",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F7F7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
