// components/home/PartnersSection.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  Star, 
  Briefcase, 
  Users, 
  Award,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
};

interface Partner {
  id: string;
  businessName: string;
  logoUrl: string | null;
  description: string | null;
  rating: number;
  totalCourses: number;
  topServices: string[];
}

interface PartnersSectionProps {
  featuredPartners?: Partner[];
}

export default function PartnersSection({ featuredPartners: initialPartners }: PartnersSectionProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners || []);
  const [loading, setLoading] = useState(!initialPartners);

  useEffect(() => {
    if (!initialPartners) {
      fetchPartners();
    }
  }, [initialPartners]);

  const fetchPartners = async () => {
    try {
      const response = await fetch("/api/partners?limit=6");
      const data = await response.json();
      if (data.success) {
        setPartners(data.featured || []);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {partner.logoUrl ? (
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={partner.logoUrl}
                  alt={partner.businessName}
                  fill
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
                <Building2 className="h-8 w-8" style={{ color: colors.primary }} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{partner.businessName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.floor(partner.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({partner.rating.toFixed(1)})</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{partner.totalCourses} courses</span>
            </div>
            {partner.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{partner.description}</p>
            )}
            {partner.topServices.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {partner.topServices.map((service, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {service}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t px-6 py-3 bg-gray-50">
        <Link
          href={`/partners/${partner.id}`}
          className="flex items-center justify-between text-sm font-medium hover:opacity-80"
          style={{ color: colors.primary }}
        >
          View Profile
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Trusted Training Partners</h2>
        <p className="text-gray-600 mt-2">Connect with certified training providers across Nigeria</p>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No partners available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link
          href="/partners"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
          style={{ borderColor: colors.primary, color: colors.primary }}
        >
          View All Partners
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}