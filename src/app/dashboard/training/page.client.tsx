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
  DollarSign,
  Star,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ChevronRight,
  X,
  Loader2,
  MapPin,
  Globe,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  TrendingUp,
  Zap,
  Sparkles,
  Heart,
  Share2,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  syllabus?: string;
  durationHours: number;
  durationDays?: number;
  cost: number;
  currency: string;
  deliveryMode: string;
  startDate?: Date;
  endDate?: Date;
  enrollmentDeadline?: Date;
  maxStudents?: number;
  currentEnrollment: number;
  thumbnailUrl?: string;
  rating?: number;
  reviewCount: number;
  partner: {
    id: string;
    businessName: string;
    logoUrl?: string;
    partnerType?: string;
  };
  primaryService: {
    id: number;
    name: string;
    industryName?: string;
  };
  otherServices: Array<{
    id: number;
    name: string;
    industryName?: string;
  }>;
  enrollmentCount: number;
}

interface Service {
  id: number;
  name: string;
  industry: {
    id: number;
    name: string;
  };
}

interface Industry {
  id: number;
  name: string;
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
  };
  artisanProfile: any;
  userServices: Service[];
  courses: Course[];
  recommendedCourses: Course[];
  popularCourses: Course[];
  allServices: Service[];
  industries: Industry[];
}

export default function TrainingClient({
  user,
  artisanProfile,
  userServices,
  courses,
  recommendedCourses,
  popularCourses,
  allServices,
  industries,
}: TrainingClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.partner.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService =
      selectedService === "all" ||
      course.primaryService.id.toString() === selectedService ||
      course.otherServices.some((s) => s.id.toString() === selectedService);
    const matchesIndustry =
      selectedIndustry === "all" || course.primaryService.industryName === selectedIndustry;
    const matchesDeliveryMode =
      selectedDeliveryMode === "all" || course.deliveryMode === selectedDeliveryMode;
    return matchesSearch && matchesService && matchesIndustry && matchesDeliveryMode;
  });

  const handleEnroll = async (courseId: string) => {
    setIsEnrolling(true);
    try {
      const response = await fetch("/api/artisan/enroll-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          artisanId: artisanProfile.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully enrolled in the course!");
        setShowCourseModal(false);
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to enroll");
      }
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Failed to enroll. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContactPartner = (partner: Course["partner"]) => {
    // In a real app, this would open a modal or redirect to partner page
    toast.info(`Contact ${partner.businessName} for more information`);
  };

  const CourseCard = ({ course, variant = "default" }: { course: Course; variant?: "default" | "compact" }) => {
    const isCompact = variant === "compact";
    const spotsLeft = course.maxStudents ? course.maxStudents - course.currentEnrollment : null;
    const isEnrollmentOpen = course.enrollmentDeadline ? new Date(course.enrollmentDeadline) > new Date() : true;

    return (
      <div
        className="rounded-xl border bg-white overflow-hidden hover:shadow-lg transition-all cursor-pointer"
        onClick={() => {
          setSelectedCourse(course);
          setShowCourseModal(true);
        }}
      >
        {course.thumbnailUrl && !isCompact && (
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
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">{course.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{course.partner.businessName}</p>
            </div>
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{course.rating}</span>
                <span className="text-xs text-gray-500">({course.reviewCount})</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mt-2">{course.description}</p>

          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{course.durationHours} hours</span>
              {course.durationDays && <span> • {course.durationDays} days</span>}
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

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div>
              <span className="text-xl font-bold" style={{ color: colors.primary }}>
                {formatCurrency(course.cost, course.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {spotsLeft !== null && spotsLeft > 0 && (
                <span className="text-xs text-green-600">{spotsLeft} spots left</span>
              )}
              {!isEnrollmentOpen && (
                <span className="text-xs text-red-500">Enrollment Closed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Training</h1>
        <p className="text-sm text-gray-600 mt-1">
          Discover courses and training programs to enhance your skills
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
            placeholder="Search courses by name, description, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 hover:bg-gray-50"
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

      {/* Recommended Courses Section */}
      {recommendedCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCourses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Popular Courses Section */}
      {popularCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Courses</h2>
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularCourses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* All Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {searchQuery || selectedService !== "all" || selectedIndustry !== "all" || selectedDeliveryMode !== "all"
              ? "Search Results"
              : "All Courses"}
          </h2>
          <p className="text-sm text-gray-500">{filteredCourses.length} courses found</p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find more courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowCourseModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedCourse.name}</h2>
                <p className="text-sm text-gray-500 mt-1">by {selectedCourse.partner.businessName}</p>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Course Image */}
              {selectedCourse.thumbnailUrl && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={selectedCourse.thumbnailUrl}
                    alt={selectedCourse.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm font-medium">{selectedCourse.durationHours} hours</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm font-medium">{formatDate(selectedCourse.startDate)}</p>
                  <p className="text-xs text-gray-500">Start Date</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  {getDeliveryModeIcon(selectedCourse.deliveryMode)}
                  <p className="text-sm font-medium">{getDeliveryModeLabel(selectedCourse.deliveryMode)}</p>
                  <p className="text-xs text-gray-500">Delivery</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm font-medium">{selectedCourse.enrollmentCount} enrolled</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">About this course</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedCourse.description}</p>
              </div>

              {/* Syllabus */}
              {selectedCourse.syllabus && (
                <div>
                  <h3 className="font-semibold mb-2">What you'll learn</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedCourse.syllabus}</p>
                  </div>
                </div>
              )}

              {/* Services Covered */}
              <div>
                <h3 className="font-semibold mb-2">Services Covered</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedCourse.primaryService.name}
                  </span>
                  {selectedCourse.otherServices.map((service) => (
                    <span key={service.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Course Fee</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(selectedCourse.cost, selectedCourse.currency)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEnroll(selectedCourse.id)}
                    disabled={isEnrolling}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </button>
                </div>
              </div>

              {/* Contact Partner */}
              <div>
                <h3 className="font-semibold mb-2">Course Provider</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedCourse.partner.logoUrl ? (
                      <div className="relative h-12 w-12">
                        <Image
                          src={selectedCourse.partner.logoUrl}
                          alt={selectedCourse.partner.businessName}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{selectedCourse.partner.businessName}</p>
                      <p className="text-xs text-gray-500">
                        {selectedCourse.partner.partnerType || "Training Provider"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleContactPartner(selectedCourse.partner)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                  >
                    Contact Provider
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-white">
              <button
                onClick={() => setShowCourseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleEnroll(selectedCourse.id)}
                disabled={isEnrolling}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Enrolling...
                  </>
                ) : (
                  "Enroll Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}