import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Both fonts include Vietnamese glyphs (D-41).
const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext", "vietnamese"],
});

// Applies the saved theme before first paint (no flash). Key: SETTINGS_KEY in store/settings.ts.
const themeScript = `try{var s=JSON.parse(localStorage.getItem("ig-layout:settings")||"{}");if(s.theme==="light"||s.theme==="dark")document.documentElement.dataset.theme=s.theme;if(s.locale==="vi")document.documentElement.lang="vi"}catch(e){}`;

export const metadata: Metadata = {
  title: "IG Layout",
  description: "Edit photos, build carousel layouts and export them for Instagram.",
  appleWebApp: {
    capable: true,
    title: "IG Layout",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
