// app/dashboard/training/page.client.tsx (FIXED - Partners are the items, not courses)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Clock,
  Calendar,
  Star,
  Users,
  GraduationCap,
  BookOpen,
  ChevronRight,
  X,
  Loader2,
  Globe,
  Building2,
  Sparkles,
  Zap,
  ShoppingCart,
  Award,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface Partner {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  description?: string;
  logoUrl?: string;
  rating: number;
  totalCourses: number;
  services: Array<{
    id: number;
    name: string;
    industryName?: string;
  }>;
  industries: Array<{
    id: number;
    name: string;
  }>;
  courses: Array<{
    id: string;
    name: string;
    cost: number;
    rating: number;
    durationHours: number;
  }>;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  industryId: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  industry: {
    id: number;
    name: string;
    description?: string;
    status: boolean;
  };
}

interface Industry {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  services: Service[];
}

interface TrainingClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    name: string;
  };
  artisanProfile: any;
  userServices: Service[];
  courses: any[];
  recommendedCourses: any[];
  popularCourses: any[];
  recommendedPartners: Partner[];
  allServices: Service[];
  industries: Industry[];
}

// Define response type
interface CartResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export default function TrainingClient({
  user,
  artisanProfile,
  userServices,
  courses,
  recommendedCourses,
  popularCourses,
  recommendedPartners,
  allServices,
  industries,
}: TrainingClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case "ONLINE":
        return <Globe className="h-4 w-4" />;
      case "OFFLINE":
        return <Building2 className="h-4 w-4" />;
      case "HYBRID":
        return <Zap className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getDeliveryModeLabel = (mode: string) => {
    switch (mode) {
      case "ONLINE":
        return "Online";
      case "OFFLINE":
        return "In-Person";
      case "HYBRID":
        return "Hybrid";
      default:
        return mode;
    }
  };

  // Add partner to cart (not course)
  const handleAddToCart = async (partner: Partner) => {
    setAddingToCart(partner.id);
    try {
      const response = await fetch("/api/artisan/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "COURSE_ENROLLMENT", // Reusing this type for partner training
          itemId: partner.id,
          quantity: 1,
        }),
      });
      const data = (await response.json()) as CartResponse;
      
      if (data.success) {
        toast.success(`${partner.businessName} training added to cart!`);
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

  const PartnerCard = ({ partner }: { partner: Partner }) => {
    const isAdding = addingToCart === partner.id;

    return (
      <div
        className="bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer"
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
                <Building2 className="h-7 w-7" style={{ color: colors.primary }} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{partner.businessName}</h4>
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
              <span className="text-xs text-gray-500">{partner.totalCourses} programs</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {partner.services.slice(0, 2).map((service) => (
                <span
                  key={service.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                >
                  {service.name}
                </span>
              ))}
              {partner.services.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  +{partner.services.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Add to Cart Button for Partner Training */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(partner);
          }}
          disabled={isAdding}
          className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: colors.primary }}
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding to Cart...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Get Training - ₦5,000
            </>
          )}
        </button>
      </div>
    );
  };

  // Filter courses (for display only, not for cart)
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesService =
      selectedService === "all" ||
      course.primaryService?.id.toString() === selectedService;
    const matchesIndustry =
      selectedIndustry === "all" || course.primaryService?.industryName === selectedIndustry;
    const matchesDeliveryMode =
      selectedDeliveryMode === "all" || course.deliveryMode === selectedDeliveryMode;
    return matchesSearch && matchesService && matchesIndustry && matchesDeliveryMode;
  });

  const CourseCard = ({ course }: { course: any }) => (
    <div className="rounded-xl border bg-white overflow-hidden hover:shadow-lg transition-all">
      {course.thumbnailUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={course.thumbnailUrl}
            alt={course.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{course.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{course.partner?.businessName || "Training Provider"}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{course.description}</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{course.durationHours} hours</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Starts {formatDate(course.startDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {getDeliveryModeIcon(course.deliveryMode)}
            <span>{getDeliveryModeLabel(course.deliveryMode)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold" style={{ color: colors.primary }}>
              {formatCurrency(course.cost, course.currency)}
            </span>
            <span className="text-xs text-gray-500">Contact partner directly</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Training</h1>
        <p className="text-sm text-gray-600 mt-1">
          Connect with training partners and enroll in programs
        </p>
      </div>

      {/* User Services Section */}
      {userServices.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Recommended for You</h3>
          </div>
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search training partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Services</option>
                {allServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.name}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Mode</label>
              <select
                value={selectedDeliveryMode}
                onChange={(e) => setSelectedDeliveryMode(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">In-Person</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Training Partners Section - These are the items to add to cart */}
      {recommendedPartners.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recommended Training Partners</h2>
              <p className="text-sm text-gray-500">Select a partner to add training to your cart</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      )}

      {/* Available Courses Section - Display only, not for cart */}
      {filteredCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Programs</h2>
            <p className="text-sm text-gray-500">Contact partners directly for enrollment</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Partner Details Modal */}
      {showPartnerModal && selectedPartner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPartnerModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPartner.businessName}</h2>
                <p className="text-sm text-gray-500 mt-1">Training Partner</p>
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
                      <Building2 className="h-10 w-10" style={{ color: colors.primary }} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(selectedPartner.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{selectedPartner.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{selectedPartner.totalCourses} programs</span>
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
                <h3 className="font-semibold mb-3">Training Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.services.map((service) => (
                    <span
                      key={service.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPartner.courses.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Available Programs</h3>
                  <div className="space-y-3">
                    {selectedPartner.courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{course.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < Math.floor(course.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{course.durationHours} hours</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" style={{ color: colors.primary }}>
                            {formatCurrency(course.cost, "NGN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Training Package</h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Partner Training Access</p>
                      <p className="text-xs text-green-600 mt-1">Get access to {selectedPartner.businessName}'s training programs</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(selectedPartner)}
                      disabled={addingToCart === selectedPartner.id}
                      className="px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      style={{ backgroundColor: colors.primary, color: "white" }}
                    >
                      {addingToCart === selectedPartner.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart - ₦5,000
                        </>
                      )}
                    </button>
                  </div>
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
              <button
                onClick={() => handleAddToCart(selectedPartner)}
                disabled={addingToCart === selectedPartner.id}
                className="flex-1 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                {addingToCart === selectedPartner.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart - ₦5,000
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}