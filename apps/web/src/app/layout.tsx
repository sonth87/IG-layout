import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

// Applies the saved theme before first paint (no flash). Key: SETTINGS_KEY in store/settings.ts.
// Also blocks Safari's page pinch-zoom gesture, which ignores user-scalable=no (D-67).
const themeScript = `try{var s=JSON.parse(localStorage.getItem("ig-layout:settings")||"{}");if(s.theme==="light"||s.theme==="dark"){document.documentElement.dataset.theme=s.theme;document.documentElement.style.colorScheme=s.theme;document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=s.theme==="dark"?"#111214":"#f6f5f2"})})}if(s.locale==="vi")document.documentElement.lang="vi"}catch(e){}document.addEventListener("gesturestart",function(e){e.preventDefault()});`;

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
  // App feel (D-67): no page zoom. The canvas has its own zoom.
  maximumScale: 1,
  userScalable: false,
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
      className={`${fontVariables} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
