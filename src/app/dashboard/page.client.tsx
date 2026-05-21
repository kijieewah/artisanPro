"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Upload,
  Award,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  Download,
  MapPin,
  Phone,
  Building2,
  Mail,
  User,
  Briefcase,
  Star,
  Info,
  FileCheck,
  Shield,
  Sparkles,
  Loader2,
  X,
  CreditCard,
} from "lucide-react";

// Brand Colors
const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface UserData {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
}

// In the ArtisanProfile interface, make sure city is optional
interface ArtisanProfile {
  id: string;
  userId: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  city?: string; // Make optional
  state: { name: string };
  localGovernment: { name: string };
  workingAddress: string;
  yearsOfExperience: number;
  bio: string;
  skills: string[];
  verificationStatus: string;
  permitStatus: string;
  approvalStatus: string;
  completionScore: number;
  artisanServices: Array<{
    service: {
      id: number;
      name: string;
      industry: { name: string };
    };
  }>;
}

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  completionScore: number;
  service: {
    id: number;
    name: string;
    industry: { name: string };
  };
  certificate?: {
    id: string;
    certificateNumber: string;
    issuedAt: string;
  };
  rejectionReason?: string;
}

interface Requirement {
  id: number;
  name: string;
  type: string;
  description: string;
  isUploaded: boolean;
  upload?: {
    id: number;
    documentUrl: string;
    status: string;
  };
}

interface Partner {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
  logoUrl?: string;
  partnerType?: string;
  status: string;
  partnerServices: Array<{
    service: {
      id: number;
      name: string;
      description?: string;
    };
  }>;
  partnerIndustries: Array<{
    industry: {
      id: number;
      name: string;
    };
  }>;
}

interface DashboardClientProps {
  user: UserData;
  artisanProfile: ArtisanProfile;
  applications: Application[];
  availableCourses: any[];
  requirementsStatus: Requirement[];
  certificationProgress: number;
  totalRequirements: number;
  completedRequirements: number;
  hasTraining: boolean;
  hasActiveApplication: boolean;
  hasPendingApplication: boolean;
  hasApprovedApplication: boolean;
  hasRejectedApplication: boolean;
  needsDocuments: boolean;
  currentApplication: Application;
  currentService: any;
  hasCertificate: boolean;
  needsTraining: boolean;
  canApplyForCertification: boolean;
  needsToUploadDocuments: boolean;
}

// ============================================
// Training & Certification Partners Modal
// ============================================
// ============================================
// Training & Certification Partners Modal
// ============================================

function TrainingPartnersModal({ 
  isOpen, 
  onClose, 
  serviceId, 
  serviceName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  serviceId: number; 
  serviceName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [trainingPartners, setTrainingPartners] = useState<Partner[]>([]);
  const [certificationPartners, setCertificationPartners] = useState<Partner[]>([]);
  const [activeTab, setActiveTab] = useState<"training" | "certification">("training");

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchPartners();
    }
  }, [isOpen, serviceId]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/artisan/partners?serviceId=${serviceId}`);
      const data = await response.json() as {
        success: boolean;
        trainingPartners?: Partner[];
        certificationPartners?: Partner[];
        error?: string;
      };
      
      if (data.success) {
        setTrainingPartners(data.trainingPartners || []);
        setCertificationPartners(data.certificationPartners || []);
      } else {
        console.error("Failed to fetch partners:", data.error);
        toast.error(data.error || "Failed to load partners");
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  const handleContactPartner = (partner: Partner, type: "training" | "certification") => {
    const subject = encodeURIComponent(
      `Inquiry about ${type === "training" ? "Training" : "Certification"} Services - ${serviceName}`
    );
    const body = encodeURIComponent(
      `Dear ${partner.businessName},\n\n` +
      `I am an artisan specializing in ${serviceName} and I am interested in learning more about your ${type === "training" ? "training programs" : "certification services"}.\n\n` +
      `Could you please provide more information about:\n` +
      `- Available ${type === "training" ? "courses" : "certification options"}\n` +
      `- Requirements and process\n` +
      `- Fees and duration\n\n` +
      `Thank you,\n` +
      `ArtisanPro User`
    );
    
    window.location.href = `mailto:${partner.businessEmail}?subject=${subject}&body=${body}`;
  };

  const handleCallPartner = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleVisitWebsite = (website: string) => {
    window.open(website, '_blank');
  };

  // Add missing Globe icon if not already imported
  const Globe = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );

  const PartnerCard = ({ partner, type }: { partner: Partner; type: "training" | "certification" }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-all bg-white">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {partner.logoUrl ? (
            <img src={partner.logoUrl} alt={partner.businessName} className="h-16 w-16 object-contain rounded-lg border" />
          ) : (
            <div className="h-16 w-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
              {type === "training" ? (
                <GraduationCap className="h-8 w-8" style={{ color: colors.primary }} />
              ) : (
                <Award className="h-8 w-8" style={{ color: colors.primary }} />
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-lg" style={{ color: colors.primary }}>
            {partner.businessName}
          </h4>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {partner.partnerServices?.slice(0, 3).map((ps) => (
              <span key={ps.service.id} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
                {ps.service.name}
              </span>
            ))}
            {partner.partnerServices && partner.partnerServices.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                +{partner.partnerServices.length - 3}
              </span>
            )}
          </div>
          
          {partner.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{partner.description}</p>
          )}
          
          {(partner.city || partner.state) && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{[partner.city, partner.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => handleContactPartner(partner, type)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 flex items-center gap-1"
              style={{ backgroundColor: colors.primary, color: "white" }}
            >
              <Mail className="h-3 w-3" />
              Email
            </button>
            {partner.businessPhone && (
              <button
                onClick={() => handleCallPartner(partner.businessPhone)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border hover:bg-gray-50 flex items-center gap-1"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                <Phone className="h-3 w-3" />
                Call
              </button>
            )}
            {partner.website && (
              <button
                onClick={() => handleVisitWebsite(partner.website!)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border hover:bg-gray-50 flex items-center gap-1"
                style={{ borderColor: colors.secondary, color: colors.secondary }}
              >
                <Globe className="h-3 w-3" />
                Website
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex justify-between items-center p-4 border-b" style={{ backgroundColor: colors.light, borderBottomColor: colors.accent }}>
          <div>
            <h3 className="text-xl font-bold" style={{ color: colors.primary }}>
              {serviceName} - Partners
            </h3>
            <p className="text-sm text-gray-500 mt-1">Connect with trusted training and certification partners</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 border-b mb-6">
            <button
              onClick={() => setActiveTab("training")}
              className={`pb-2 px-1 font-medium transition-all ${
                activeTab === "training" 
                  ? "border-b-2" 
                  : "text-gray-500"
              }`}
              style={activeTab === "training" ? { borderBottomColor: colors.primary, color: colors.primary } : {}}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Training Partners
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {trainingPartners.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("certification")}
              className={`pb-2 px-1 font-medium transition-all ${
                activeTab === "certification" 
                  ? "border-b-2" 
                  : "text-gray-500"
              }`}
              style={activeTab === "certification" ? { borderBottomColor: colors.primary, color: colors.primary } : {}}
            >
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certification Partners
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {certificationPartners.length}
                </span>
              </div>
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.primary }} />
            </div>
          )}

          {!loading && activeTab === "training" && (
            <>
              {trainingPartners.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No training partners found</h4>
                  <p className="text-gray-500 text-sm">
                    No training partners are currently available for {serviceName}. Check back later!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Connect directly with these training partners to learn about courses, schedules, and enrollment.
                  </p>
                  {trainingPartners.map((partner) => (
                    <PartnerCard key={partner.id} partner={partner} type="training" />
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && activeTab === "certification" && (
            <>
              {certificationPartners.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No certification partners found</h4>
                  <p className="text-gray-500 text-sm">
                    No certification partners are currently available for {serviceName}. Check back later!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Connect directly with these certification bodies to learn about certification requirements and processes.
                  </p>
                  {certificationPartners.map((partner) => (
                    <PartnerCard key={partner.id} partner={partner} type="certification" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Application & Verification Component
// ============================================
// ============================================
// Application & Verification Component
// ============================================

function ApplicationVerificationSection({ 
  application, 
  artisanProfile,
  currentService,
  requirementsStatus,
  onRefresh
}: { 
  application?: Application;
  artisanProfile: ArtisanProfile;
  currentService: any;
  requirementsStatus: Requirement[];
  onRefresh: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const allRequirementsMet = requirementsStatus.length > 0 && 
    requirementsStatus.filter(r => r.type === "MANDATORY").every(r => r.isUploaded);
  
  const pendingRequirements = requirementsStatus.filter(r => r.type === "MANDATORY" && !r.isUploaded);
  const optionalRequirements = requirementsStatus.filter(r => r.type === "OPTIONAL" && !r.isUploaded);
  const uploadedCount = requirementsStatus.filter(r => r.isUploaded).length;
  const totalCount = requirementsStatus.length;

  const handleSubmitApplication = () => {
    if (!allRequirementsMet) {
      toast.error("Please upload all mandatory documents before applying");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/artisan/apply-certification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId: artisanProfile.id,
          serviceId: currentService?.id,
        }),
      });
      
      const data = await response.json() as {
        success?: boolean;
        error?: string;
        application?: Application;
      };
      
      if (response.ok) {
        toast.success("Application submitted successfully! Our team will review your documents.");
        setShowPaymentModal(false);
        setTimeout(() => {
          onRefresh();
        }, 1500);
      } else {
        throw new Error(data.error || "Application failed");
      }
    } catch (error) {
      console.error("Application error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already has active application, show status
  if (application && application.status !== "DRAFT") {
    const statusInfo: Record<string, { icon: any; title: string; message: string; color: string; bgColor: string; borderColor: string }> = {
      SUBMITTED: { 
        icon: Clock, 
        title: "Application Submitted", 
        message: "Your application has been submitted and is waiting for review.",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      },
      UNDER_REVIEW: { 
        icon: Loader2, 
        title: "Under Review", 
        message: "Our team is reviewing your application and documents.",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      },
      PENDING_INFORMATION: { 
        icon: AlertCircle, 
        title: "Additional Information Required", 
        message: application.rejectionReason || "Please provide additional information requested by our team.",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      },
      APPROVED: { 
        icon: CheckCircle, 
        title: "Application Approved!", 
        message: "Congratulations! Your application has been approved.",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      },
      REJECTED: { 
        icon: XCircle, 
        title: "Application Rejected", 
        message: application.rejectionReason || "Your application was not approved at this time.",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      },
    };

    const info = statusInfo[application.status] || statusInfo.SUBMITTED;
    const IconComponent = info.icon;

    return (
      <div className={`rounded-lg border p-6 ${info.bgColor} ${info.borderColor} mb-6`}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${info.color}`}>
            {application.status === "UNDER_REVIEW" ? (
              <IconComponent className="h-8 w-8 animate-spin" />
            ) : (
              <IconComponent className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${info.color}`}>{info.title}</h3>
            <p className="text-gray-600 mt-1">{info.message}</p>
            <p className="text-sm text-gray-500 mt-2">
              Application Number: <span className="font-mono">{application.applicationNumber}</span>
            </p>
            {application.status === "APPROVED" && application.certificate && (
              <button
                onClick={() => {
                  const certLink = `/api/artisan/certificate/${application.certificate?.id}/download`;
                  window.open(certLink, '_blank');
                }}
                className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                Download Certificate
              </button>
            )}
            {application.status === "PENDING_INFORMATION" && (
              <button
                onClick={() => document.getElementById("requirements")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                Upload Missing Documents
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full p-2" style={{ backgroundColor: `${colors.primary}15` }}>
          <FileCheck className="h-5 w-5" style={{ color: colors.primary }} />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
          Application & Verification
        </h2>
      </div>

      {/* Requirement Check Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Document Readiness</span>
          <span className={`text-sm font-semibold ${allRequirementsMet ? "text-green-600" : "text-orange-600"}`}>
            {allRequirementsMet ? "All Mandatory Documents Ready" : `${pendingRequirements.length} Mandatory Document(s) Pending`}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${(uploadedCount / totalCount) * 100}%`,
              backgroundColor: colors.primary 
            }}
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2">{uploadedCount} of {totalCount} documents uploaded</p>
        
        {/* Pending Requirements List */}
        {pendingRequirements.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-medium text-orange-800 mb-2">Pending Mandatory Documents:</p>
            <ul className="space-y-1">
              {pendingRequirements.map(req => (
                <li key={req.id} className="text-sm text-orange-700 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  {req.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Optional Requirements Note */}
        {optionalRequirements.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Optional documents can be uploaded later: {optionalRequirements.map(r => r.name).join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Application Fee Info */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Application Fee</span>
          <span className="text-lg font-bold" style={{ color: colors.primary }}>₦5,000</span>
        </div>
        <p className="text-xs text-gray-500">
          The application fee covers document verification and certification processing.
        </p>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleSubmitApplication}
        disabled={!allRequirementsMet || isSubmitting}
        className={`w-full py-3 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 ${
          !allRequirementsMet ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
        }`}
        style={{ backgroundColor: colors.primary }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            Submit Application for Verification
          </>
        )}
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.accent}20` }}>
                <CreditCard className="h-8 w-8" style={{ color: colors.accent }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.primary }}>Application Fee</h3>
              <p className="text-3xl font-bold mt-2" style={{ color: colors.primary }}>₦5,000</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Document verification</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Certification processing</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Digital certificate issuance</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "APPROVED":
        return { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Approved" };
      case "SUBMITTED":
        return { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Submitted" };
      case "UNDER_REVIEW":
        return { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Under Review" };
      case "REJECTED":
        return { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" };
      case "PENDING_INFORMATION":
        return { color: "bg-orange-100 text-orange-700", icon: AlertCircle, label: "Pending Info" };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: FileText, label: "Draft" };
    }
  };
  
  const config = getStatusConfig();
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

// Progress Card Component
const ProgressCard = ({ 
  title, 
  value, 
  total, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  total: number; 
  icon: any; 
  color: string;
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`rounded-full p-2 ${color} bg-opacity-10`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">/ {total}</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: colors.primary }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">{Math.round(percentage)}% Complete</p>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ 
  title, 
  description, 
  buttonText, 
  icon: Icon, 
  onClick,
  disabled,
  variant = "primary"
}: { 
  title: string; 
  description: string; 
  buttonText: string; 
  icon: any; 
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "success" | "warning" | "info";
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case "success":
        return { bg: "#dcfce7", color: "#166534" };
      case "warning":
        return { bg: "#fef3c7", color: "#92400e" };
      case "info":
        return { bg: "#dbeafe", color: "#1e40af" };
      default:
        return { bg: `${colors.primary}15`, color: colors.primary };
    }
  };
  
  const variantColors = getVariantColors();
  
  return (
    <div className={`rounded-lg border bg-white p-6 shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900 ${!disabled ? "hover:shadow-md" : "opacity-60"}`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: variantColors.bg }}>
        <Icon className="h-6 w-6" style={{ color: variantColors.color }} />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <button
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 text-sm font-medium transition-all hover:gap-3 disabled:opacity-50"
        style={{ color: variantColors.color }}
      >
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// Requirement Card Component
const RequirementCard = ({ 
  requirement, 
  onUpload,
  onView,
  uploading 
}: { 
  requirement: Requirement; 
  onUpload: (reqId: number) => void;
  onView: (requirement: Requirement) => void;
  uploading: number | null;
}) => {
  const isUploading = uploading === requirement.id;
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center gap-3 flex-1">
        {requirement.isUploaded ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <FileText className="h-5 w-5 text-gray-400" />
        )}
        <div>
          <p className="text-sm font-medium">{requirement.name}</p>
          {requirement.type === "MANDATORY" && (
            <span className="text-xs text-red-500">Mandatory</span>
          )}
          {requirement.isUploaded && requirement.upload && (
            <button
              onClick={() => onView(requirement)}
              className="text-xs text-blue-500 hover:underline mt-1"
            >
              View uploaded file
            </button>
          )}
        </div>
      </div>
      {!requirement.isUploaded ? (
        <button
          onClick={() => onUpload(requirement.id)}
          disabled={isUploading}
          className="rounded-lg px-3 py-1 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: colors.primary }}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </button>
      ) : (
        <span className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Uploaded
        </span>
      )}
    </div>
  );
};

export default function DashboardClient({
  user,
  artisanProfile,
  applications,
  requirementsStatus,
  totalRequirements,
  completedRequirements,
  hasTraining,
  hasActiveApplication,
  hasPendingApplication,
  hasApprovedApplication,
  currentApplication,
  currentService,
  hasCertificate,
  needsTraining,
  canApplyForCertification,
  needsToUploadDocuments,
}: DashboardClientProps) {
  const router = useRouter();
  const [uploadingReq, setUploadingReq] = useState<number | null>(null);
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    requirementsStatus.forEach(req => {
      initial[req.id] = req.isUploaded;
    });
    return initial;
  });

  // Update uploadedDocs when requirementsStatus changes
  useEffect(() => {
    const newUploadedDocs: Record<number, boolean> = {};
    requirementsStatus.forEach(req => {
      newUploadedDocs[req.id] = req.isUploaded;
    });
    setUploadedDocs(newUploadedDocs);
  }, [requirementsStatus]);

const handleUploadRequirement = async (reqId: number) => {
  setUploadingReq(reqId);
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,application/pdf,.doc,.docx';
  
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      setUploadingReq(null);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      setUploadingReq(null);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('artisanId', artisanProfile.id);
      formData.append('serviceId', currentService?.id.toString() || '');
      formData.append('requirementId', reqId.toString());
      
      const response = await fetch('/api/artisan/upload-requirement', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast.success(`${requirementsStatus.find(r => r.id === reqId)?.name} uploaded successfully!`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload document. Please try again.');
    } finally {
      setUploadingReq(null);
    }
  };
  
  input.click();
};

  const handleViewDocument = (requirement: Requirement) => {
    if (requirement.upload?.documentUrl) {
      window.open(requirement.upload.documentUrl, '_blank');
    }
  };

  const handleFindTraining = () => {
    if (currentService) {
      setShowPartnersModal(true);
    } else {
      toast.info("Please complete your profile first");
      router.push("/dashboard/profile");
    }
  };

  const mainService = currentService;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r p-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
            <p className="mt-1 opacity-90">
              {mainService ? `${mainService.name} - ${mainService.industry?.name || "Artisan"}` : "Complete your profile to get started"}
            </p>
          </div>
          <Sparkles className="h-8 w-8 opacity-75" />
        </div>
      </div>

      {/* Artisan Profile Details */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{artisanProfile.state?.name}, {artisanProfile.localGovernment?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Years of Experience</p>
              <p className="font-medium">{artisanProfile.yearsOfExperience} years</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Skills</p>
              <p className="font-medium">{artisanProfile.skills?.length || 0} skills</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressCard
          title="Certification Progress"
          value={completedRequirements}
          total={totalRequirements}
          icon={Award}
          color="text-blue-500"
        />
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Application Status</h3>
            <FileCheck className="h-4 w-4 text-gray-400" />
          </div>
          <StatusBadge status={currentApplication?.status || "DRAFT"} />
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Verification Status</h3>
            <Shield className="h-4 w-4 text-gray-400" />
          </div>
          <StatusBadge status={artisanProfile.verificationStatus || "PENDING"} />
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Permit Status</h3>
            <Building2 className="h-4 w-4 text-gray-400" />
          </div>
          <StatusBadge status={artisanProfile.permitStatus || "PENDING"} />
        </div>
      </div>

      {/* Application & Verification Section */}
      {requirementsStatus.length > 0 && (
        <ApplicationVerificationSection
          application={currentApplication}
          artisanProfile={artisanProfile}
          currentService={currentService}
          requirementsStatus={requirementsStatus}
          onRefresh={() => window.location.reload()}
        />
      )}

      {/* Three Main Action Options */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ActionCard
          title="Get Training"
          description="Connect with training partners to find programs that match your skill development needs."
          buttonText={needsTraining ? "Find Training Partners" : "Browse Training"}
          icon={GraduationCap}
          onClick={handleFindTraining}
          variant={needsTraining ? "warning" : "info"}
        />

        <ActionCard
          title="Upload Documents"
          description="Submit required documents including certificates, identification, and proof of experience."
          buttonText={needsToUploadDocuments ? "Upload Now" : "Manage Documents"}
          icon={Upload}
          onClick={() => {
            if (needsToUploadDocuments) {
              document.getElementById("requirements")?.scrollIntoView({ behavior: "smooth" });
            } else {
              router.push("/dashboard/documents");
            }
          }}
          variant={needsToUploadDocuments ? "warning" : "info"}
        />

        <ActionCard
          title="Get Certified"
          description="Connect with certification bodies to get officially certified in your trade."
          buttonText={
            hasCertificate ? "Download Certificate" :
            canApplyForCertification ? "Find Certification Partners" :
            hasPendingApplication ? "Application Pending" :
            "Start Application"
          }
          icon={Award}
          onClick={() => {
            if (hasCertificate) {
              const certLink = `/api/artisan/certificate/${currentApplication?.certificate?.id}/download`;
              window.open(certLink, '_blank');
            } else if (canApplyForCertification) {
              handleFindTraining();
            } else if (!hasActiveApplication) {
              router.push("/dashboard/apply");
            }
          }}
          disabled={hasPendingApplication}
          variant={hasCertificate ? "success" : canApplyForCertification ? "primary" : "info"}
        />
      </div>

      {/* Requirements Section */}
      {requirementsStatus.length > 0 && (
        <div id="requirements" className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Required Documents for {mainService?.name || "Certification"}</h2>
              <p className="text-sm text-gray-600">Upload the following documents to complete your certification</p>
            </div>
            <FileCheck className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {requirementsStatus.map((req) => (
              <RequirementCard
                key={req.id}
                requirement={req}
                onUpload={handleUploadRequirement}
                onView={handleViewDocument}
                uploading={uploadingReq}
              />
            ))}
          </div>
          <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: `${colors.accent}10` }}>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" style={{ color: colors.accent }} />
              <p className="text-xs text-gray-600">
                All mandatory documents must be uploaded before your certification can be approved.
                You can upload documents one at a time, and they will be verified by our team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application History */}
      {applications.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Application History</h2>
              <p className="text-sm text-gray-600">Track your certification applications</p>
            </div>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{app.service.name}</p>
                  <p className="text-xs text-gray-500">Application #{app.applicationNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <span className="text-sm text-gray-500">{Math.round(app.completionScore)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training & Certification Partners Modal */}
      {currentService && (
        <TrainingPartnersModal
          isOpen={showPartnersModal}
          onClose={() => setShowPartnersModal(false)}
          serviceId={currentService.id}
          serviceName={currentService.name}
        />
      )}
    </div>
  );
}