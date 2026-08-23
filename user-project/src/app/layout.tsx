import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banco do Clã - Day R Survival",
  description:
    "Terminal de Comércio Sobrevivente - Sistema de gestão do banco do clã",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        {/* Google Translate uses googtrans cookie set by TranslationPopup */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'pt',
                  autoDisplay: false,
                  includedLanguages: 'en,es,fr,de,ru,it,zh-CN,zh-TW,ko,ja,id,tr'
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground select-none`}
      >
        <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} />
        {children}
      </body>
    </html>
  );
}
