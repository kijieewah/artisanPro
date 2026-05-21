// app/partners/page.tsx
import { PartnersPageClient } from "./page.client";

export const metadata = {
  title: "Partner With ArtisanPro | Build Nigeria's Artisan Ecosystem",
  description: "Partner with ArtisanPro to shape Nigeria's skilled workforce. Join training providers, certification bodies, licensing authorities, and regulators.",
  keywords: "artisan partnership, training partners, certification partners, licensing partners, regulatory partners",
  openGraph: {
    title: "ArtisanPro.ng | Partner with Nigeria's Artisan Ecosystem",
    description: "Collaborate to train, certify, and empower artisans across Nigeria.",
    type: "website",
  },
};

export default function PartnersPage() {
  return <PartnersPageClient />;
}