// app/dashboard/certification-partners/page.client.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  Star,
  Search,
  Filter,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Award,
  Clock,
  DollarSign,
  CheckCircle,
  X,
  Loader2,
  ShoppingCart,
  ChevronRight,
  Sparkles,
  Briefcase,
  TrendingUp,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
};

interface CertificationService {
  id: number;
  serviceId: number;
  serviceName: string;
  industryName: string;
  fee: number;
  description: string | null;
}

interface Partner {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  website: string | null;
  address: string;
  city: string;
  state: string;
  description: string | null;
  logoUrl: string | null;
  rating: number;
  isRecommended: boolean;
  matchType: string;
  certificationServices: CertificationService[];
  industries: Array<{
    id: number;
    name: string;
  }>;
}

interface Service {
  id: number;
  name: string;
  industryId: number;
  industry: {
    id: number;
    name: string;
  };
}

interface Industry {
  id: number;
  name: string;
  description: string | null;
  services: Array<{
    id: number;
    name: string;
  }>;
}

interface CertificationPartnersClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    name: string;
  };
  partners: Partner[];
  recommendedPartners: Partner[];
  userServices: Service[];
  userIndustries: Industry[];
  industries: Industry[];
  allServices: Service[];
}

// Define response type
interface AddToCartResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export default function CertificationPartnersClient({
  user,
  partners,
  recommendedPartners,
  userServices,
  userIndustries,
  industries,
  allServices,
}: CertificationPartnersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const handleAddToCart = async (certificationService: CertificationService, partner: Partner) => {
    setAddingToCart(`${certificationService.id}`);
    try {
      const response = await fetch("/api/artisan/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "CERTIFICATION_SERVICE",
          itemId: certificationService.id.toString(),
          quantity: 1,
        }),
      });

      const data = (await response.json()) as AddToCartResponse;

      if (data.success) {
        toast.success(`${certificationService.serviceName} certification added to cart!`);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const allPartners = [...partners, ...recommendedPartners];
  
  const filteredPartners = allPartners.filter((partner) => {
    const matchesSearch =
      searchQuery === "" ||
      partner.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.certificationServices.some(s => 
        s.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesIndustry =
      selectedIndustry === "all" ||
      partner.industries.some(i => i.id.toString() === selectedIndustry) ||
      partner.certificationServices.some(s => s.industryName === selectedIndustry);

    const matchesService =
      selectedService === "all" ||
      partner.certificationServices.some(s => s.serviceId.toString() === selectedService);

    return matchesSearch && matchesIndustry && matchesService;
  });

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <div
      className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer ${
        partner.isRecommended ? "border-blue-200 bg-blue-50/30" : ""
      }`}
      onClick={() => {
        setSelectedPartner(partner);
        setShowPartnerModal(true);
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {partner.logoUrl ? (
            <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={partner.logoUrl}
                alt={partner.businessName}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="h-14 w-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
              <Award className="h-7 w-7" style={{ color: colors.primary }} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900">{partner.businessName}</h4>
            {partner.matchType === "service" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Matches your service
              </span>
            )}
            {partner.matchType === "industry" && !partner.isRecommended && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Matches your industry
              </span>
            )}
            {partner.isRecommended && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Recommended
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(partner.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">{partner.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{partner.certificationServices.length} services</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {partner.certificationServices.slice(0, 2).map((service) => (
              <span
                key={service.id}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                {service.serviceName}
              </span>
            ))}
            {partner.certificationServices.length > 2 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                +{partner.certificationServices.length - 2}
              </span>
            )}
          </div>
          {(partner.city || partner.state) && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>{[partner.city, partner.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certification Partners</h1>
        <p className="text-sm text-gray-600 mt-1">
          Get certified by trusted certification bodies that match your trade and industry
        </p>
      </div>

      {/* User Services & Industries Section */}
      {(userServices.length > 0 || userIndustries.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Personalized Matches Based on Your Profile</h3>
          </div>
          
          {userServices.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-blue-700 mb-2">Your Services:</p>
              <div className="flex flex-wrap gap-2">
                {userServices.map((service) => (
                  <span
                    key={service.id}
                    className="px-3 py-1.5 bg-white rounded-full text-sm text-blue-700 border border-blue-200"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {userIndustries.length > 0 && (
            <div>
              <p className="text-xs text-blue-700 mb-2">Your Industries:</p>
              <div className="flex flex-wrap gap-2">
                {userIndustries.map((industry) => (
                  <span
                    key={industry.id}
                    className="px-3 py-1.5 bg-white rounded-full text-sm text-indigo-700 border border-indigo-200"
                  >
                    {industry.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search certification partners or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters ? "text-white" : "bg-white border-gray-300 hover:bg-gray-50"
          }`}
          style={showFilters ? { backgroundColor: colors.primary, borderColor: colors.primary } : {}}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  setSelectedService("all");
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={selectedIndustry === "all"}
              >
                <option value="all">All Services</option>
                {selectedIndustry !== "all" &&
                  industries
                    .find((i) => i.id.toString() === selectedIndustry)
                    ?.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certification Partners Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery || selectedIndustry !== "all" || selectedService !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No certification partners match your services yet. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}

      {/* Partner Details Modal - Same as before */}
      {showPartnerModal && selectedPartner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPartnerModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPartner.businessName}</h2>
                <p className="text-sm text-gray-500 mt-1">Certification Body</p>
              </div>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {selectedPartner.logoUrl ? (
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={selectedPartner.logoUrl}
                        alt={selectedPartner.businessName}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
                      <Award className="h-10 w-10" style={{ color: colors.primary }} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(selectedPartner.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{selectedPartner.rating.toFixed(1)}</span>
                    {selectedPartner.matchType === "service" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Matches your service
                      </span>
                    )}
                  </div>
                  {selectedPartner.description && (
                    <p className="text-gray-600 mt-3">{selectedPartner.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedPartner.city}, {selectedPartner.state}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Certification Services</h3>
                <div className="space-y-4">
                  {selectedPartner.certificationServices.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                          <p className="text-sm text-gray-500">{service.industryName}</p>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatCurrency(service.fee)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(service, selectedPartner)}
                          disabled={addingToCart === `${service.id}`}
                          className="ml-4 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                          style={{ backgroundColor: colors.primary }}
                        >
                          {addingToCart === `${service.id}` ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${selectedPartner.businessEmail}`} className="text-blue-600 hover:underline">
                      {selectedPartner.businessEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${selectedPartner.businessPhone}`} className="text-blue-600 hover:underline">
                      {selectedPartner.businessPhone}
                    </a>
                  </div>
                  {selectedPartner.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-white">
              <button
                onClick={() => setShowPartnerModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}