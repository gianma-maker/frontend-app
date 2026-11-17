import "./globals.css";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-display",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Ping&Pong Tournament HQ",
  description: "Table tennis tournament manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html
  lang="en"
  suppressHydrationWarning
  className={`${display.variable} ${mono.variable}`}
>
  <head>
    <script
      dangerouslySetInnerHTML={{
        __html: `try{var t=localStorage.getItem("tt-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`,
      }}
    />
  </head>
  <body>{children}</body>
</html>
  );
}