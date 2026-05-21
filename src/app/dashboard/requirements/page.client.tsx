"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  File,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  X,
  Loader2,
  ChevronRight,
  ChevronDown,
  Award,
  Shield,
  FileCheck,
  MapPin,
  User,
  Mail,
  Phone,
  Briefcase,
  Star,
  Building2,
  Info,
  Sparkles,
  GraduationCap,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";

// Brand Colors
const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

// Types
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

interface Service {
  id: number;
  name: string;
  description?: string;
  industry: {
    id: number;
    name: string;
  };
}

interface Progress {
  total: number;
  uploaded: number;
  requiredTotal: number;
  requiredCompleted: number;
  optionalTotal: number;
  optionalCompleted: number;
  percentage: number;
  requiredPercentage: number;
}

interface Application {
  id: number;
  status: string;
  submittedAt?: Date;
  applicationNumber?: string;
}

interface ArtisanProfile {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  yearsOfExperience?: number;
  bio?: string;
  state?: { name: string };
  localGovernment?: { name: string };
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface RequirementsClientProps {
  user: User;
  artisanProfile: ArtisanProfile;
  service: Service;
  requirements: Requirement[];
  progress: Progress;
  application: Application | null;
}

export default function RequirementsClient({
  user,
  artisanProfile,
  service,
  requirements,
  progress,
  application,
}: RequirementsClientProps) {
  const router = useRouter();
  const [uploadingReq, setUploadingReq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const requiredRequirements = requirements.filter(r => r.type === "MANDATORY");
  const optionalRequirements = requirements.filter(r => r.type === "OPTIONAL");

  // Handle file upload
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
        formData.append('artisanId', artisanProfile.id.toString());
        formData.append('serviceId', service.id.toString());
        formData.append('requirementId', reqId.toString());
        
        const response = await fetch('/api/artisan/upload-requirement', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          toast.success(`${requirements.find(r => r.id === reqId)?.name} uploaded successfully!`);
          router.refresh();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload document. Please try again.');
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

  // Submit application - opens payment modal first
  const handleSubmitApplication = () => {
    if (progress.requiredCompleted < progress.requiredTotal) {
      toast.error(`Please upload all required documents before applying. Missing ${progress.requiredTotal - progress.requiredCompleted} document(s).`);
      return;
    }
    setShowPaymentModal(true);
  };

  // Confirm payment and redirect to payment page
  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      // First, create/update the application with DRAFT status
      const response = await fetch("/api/artisan/apply-certification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId: artisanProfile.id,
          serviceId: service.id,
          status: "DRAFT", // Create as draft first
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create application");
      }

      // Redirect to payment page with application ID
      const paymentUrl = `/payment?applicationId=${data.application.id}&amount=5000&serviceName=${encodeURIComponent(service.name)}`;
      router.push(paymentUrl);
      
    } catch (error: any) {
      console.error("Application creation error:", error);
      toast.error(error.message || "Failed to create application. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Resubmit application
  const handleResubmitApplication = async () => {
    if (progress.requiredCompleted < progress.requiredTotal) {
      toast.error(`Please upload all required documents before resubmitting.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/artisan/apply-certification/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application?.id,
          serviceId: service.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Application resubmitted for review");
        router.refresh();
      } else {
        throw new Error(data.error || "Resubmission failed");
      }
    } catch (error: any) {
      console.error("Resubmission error:", error);
      toast.error(error.message || "Failed to resubmit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = progress.requiredCompleted === progress.requiredTotal;
  const isSubmitted = application?.status === "SUBMITTED";
  const isUnderReview = application?.status === "UNDER_REVIEW";
  const isApproved = application?.status === "APPROVED";
  const isRejected = application?.status === "REJECTED";
  const isPendingInfo = application?.status === "PENDING_INFORMATION";

  const getApplicationStatusBadge = () => {
    if (!application) return null;
    switch (application.status) {
      case "DRAFT":
        return { text: "Not Started", color: "bg-gray-100 text-gray-700", icon: FileText };
      case "SUBMITTED":
        return { text: "Submitted for Review", color: "bg-blue-100 text-blue-700", icon: Clock };
      case "UNDER_REVIEW":
        return { text: "Under Review", color: "bg-yellow-100 text-yellow-700", icon: RefreshCw };
      case "APPROVED":
        return { text: "Approved!", color: "bg-green-100 text-green-700", icon: CheckCircle };
      case "REJECTED":
        return { text: "Needs Revision", color: "bg-red-100 text-red-700", icon: XCircle };
      case "PENDING_INFORMATION":
        return { text: "Additional Info Required", color: "bg-orange-100 text-orange-700", icon: AlertCircle };
      default:
        return { text: application.status, color: "bg-gray-100 text-gray-700", icon: FileText };
    }
  };

  const statusBadge = getApplicationStatusBadge();

  // Requirement Card Component
  const RequirementCard = ({ req }: { req: Requirement }) => {
    const isUploading = uploadingReq === req.id;
    
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <div className="flex items-center gap-3 flex-1">
          {req.isUploaded ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <FileText className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium">{req.name}</p>
            {req.type === "MANDATORY" && (
              <span className="text-xs text-red-500">Mandatory</span>
            )}
            {req.isUploaded && req.upload && (
              <button
                onClick={() => handleViewDocument(req)}
                className="text-xs text-blue-500 hover:underline mt-1"
              >
                View uploaded file
              </button>
            )}
          </div>
        </div>
        {!req.isUploaded ? (
          <button
            onClick={() => handleUploadRequirement(req.id)}
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Requirements</h1>
          <p className="text-sm text-gray-600 mt-1">
            {service.name} - {service.industry?.name}
          </p>
        </div>
        {statusBadge && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.color}`}>
            <statusBadge.icon className="h-4 w-4" />
            {statusBadge.text}
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Application Progress</h2>
            <p className="text-sm text-gray-500">
              {progress.uploaded} of {progress.total} documents uploaded
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{progress.percentage}%</div>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-700">Required Documents</span>
            <span className="font-semibold text-green-800">
              {progress.requiredCompleted}/{progress.requiredTotal}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700">Optional Documents</span>
            <span className="font-semibold text-blue-800">
              {progress.optionalCompleted}/{progress.optionalTotal}
            </span>
          </div>
        </div>

        {isRejected && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Application Needs Revision</h4>
                <p className="text-sm text-red-700 mt-1">
                  Please review and update the documents marked as rejected below, then resubmit your application.
                </p>
              </div>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Congratulations! Your application is approved.</h4>
                <p className="text-sm text-green-700 mt-1">
                  You can now proceed to get your certificate.
                </p>
                <Link
                  href="/dashboard/certificate"
                  className="inline-flex items-center gap-2 mt-3 text-green-700 font-medium hover:text-green-800"
                >
                  Get Your Certificate <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requirements Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Required Documents for {service.name}</h2>
            <p className="text-sm text-gray-600">Upload the following documents to complete your certification</p>
          </div>
          <FileCheck className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {requiredRequirements.map((req) => (
            <RequirementCard key={req.id} req={req} />
          ))}
        </div>

        {optionalRequirements.length > 0 && (
          <>
            <div className="mt-6 mb-4">
              <h3 className="text-md font-semibold text-gray-700">Optional Documents</h3>
              <p className="text-sm text-gray-500">These documents can help strengthen your application</p>
            </div>
            <div className="space-y-3">
              {optionalRequirements.map((req) => (
                <RequirementCard key={req.id} req={req} />
              ))}
            </div>
          </>
        )}

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

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isApproved && (
          <>
            {(isRejected || isPendingInfo) ? (
              <button
                onClick={handleResubmitApplication}
                disabled={isSubmitting || !canSubmit}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Resubmitting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Resubmit Application
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmitApplication}
                disabled={!canSubmit || isSubmitted || isUnderReview}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitted || isUnderReview ? (
                  <>
                    <Clock className="h-5 w-5" />
                    Application Submitted
                  </>
                ) : (
                  <>
                    <FileCheck className="h-5 w-5" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </>
        )}

        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Need Help?</h4>
            <p className="text-sm text-blue-700 mt-1">
              All documents are securely stored and verified by our team. 
              Uploaded documents are used solely for certification purposes.
            </p>
            <Link href="/support" className="inline-flex items-center gap-1 text-sm text-blue-700 font-medium mt-2 hover:text-blue-800">
              Contact Support <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPaymentModal(false)}>
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