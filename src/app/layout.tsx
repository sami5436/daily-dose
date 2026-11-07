import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const description = "A few tiny games a day. New puzzles every morning.";

// Icons come from the file conventions src/app/icon.png and src/app/apple-icon.png.
// Do not set metadata.icons here: it overrides them and drops the tab favicon.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Daily Dose", template: "%s · Daily Dose" },
  description,
  applicationName: "Daily Dose",
  appleWebApp: { capable: true, title: "Daily Dose", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "Daily Dose",
    title: "Daily Dose",
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Daily Dose", description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4EFE6" },
    { media: "(prefers-color-scheme: dark)", color: "#16140F" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
