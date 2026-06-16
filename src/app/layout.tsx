import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { SEO_CONFIG } from "~/app";
// import { CartProvider } from "~/lib/hooks/useCart";
import "~/css/globals.css";
// import { Header } from "~/ui/components/header/header";
// import { Header2 } from "~/ui/components/dash-header/page";

import { Footer } from "~/ui/components/footer";
// import { ThemeProvider } from "~/ui/components/theme-provider";
import { Toaster } from "~/ui/primitives/sonner";
import { authOptions } from "~/lib/auth";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description: `${SEO_CONFIG.description}`,
  title: `${SEO_CONFIG.fullName}`,
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          min-h-screen bg-gradient-to-br from-white to-slate-100
          text-neutral-900 antialiased
          selection:bg-primary/80
          dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-100
        `}
      >
       
          {/* {session ? "" : <Header showAuth={true} />} */}
          <main className={`flex min-h-screen flex-col`}>{children}</main>
          {/* <Footer /> */}
          <Toaster />
     

        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
