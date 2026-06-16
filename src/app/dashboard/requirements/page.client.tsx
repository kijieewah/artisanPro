// app/dashboard/requirements/page.client.tsx (UPDATED - Add to Cart instead of Direct Payment)
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
  Trash2,
  Eye,
  Download,
  RefreshCw,
  X,
  Loader2,
  ChevronRight,
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
  ShoppingCart,
} from "lucide-react";

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
  image?: string;
  status: boolean;
  industryId: number;
  industry: {
    id: number;
    name: string;
    description?: string;
    status: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
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
  id: string;
  status: string;
  submittedAt?: Date;
  applicationNumber?: string;
}

interface User {
  name: string;
  email: string;
  phone?: string;
}

interface ArtisanProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  yearsOfExperience?: number;
  bio?: string;
  state?: { name: string };
  localGovernment?: { name: string };
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
        formData.append('artisanId', artisanProfile.id);
        formData.append('serviceId', service.id.toString());
        formData.append('requirementId', reqId.toString());
        
        const response = await fetch('/api/artisan/upload-requirement', {
          method: 'POST',
          body: formData,
        });
        
        const responseData = await response.json() as { error?: string; success?: boolean };
        
        if (response.ok) {
          toast.success(`${requirements.find(r => r.id === reqId)?.name} uploaded successfully!`);
          router.refresh();
        } else {
          throw new Error(responseData.error || 'Upload failed');
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

  // Add to Cart instead of direct payment
  const handleAddToCart = async () => {
    if (progress.requiredCompleted < progress.requiredTotal) {
      toast.error(`Please upload all required documents before adding to cart. Missing ${progress.requiredTotal - progress.requiredCompleted} document(s).`);
      return;
    }

    setIsAddingToCart(true);
    try {
      // First, create/update the application with DRAFT status
      const applyResponse = await fetch("/api/artisan/apply-certification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId: artisanProfile.id,
          serviceId: service.id,
        }),
      });

      const applyData = await applyResponse.json() as { 
        error?: string; 
        success?: boolean; 
        application?: { id: string };
      };

      if (!applyResponse.ok) {
        throw new Error(applyData.error || "Failed to create application");
      }

      const applicationId = applyData.application?.id;

      // Add to cart
      const cartResponse = await fetch("/api/artisan/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "CERTIFICATION_APPLICATION",
          itemId: applicationId,
          quantity: 1,
        }),
      });

      const cartData = await cartResponse.json();

      if (cartResponse.ok) {
        toast.success(`${service.name} certification added to cart!`);
        // Trigger cart update event
        window.dispatchEvent(new Event("cartUpdated"));
        // Redirect to dashboard or stay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        throw new Error(cartData.error || "Failed to add to cart");
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Resubmit application (for rejected applications)
  const handleResubmitApplication = async () => {
    if (progress.requiredCompleted < progress.requiredTotal) {
      toast.error(`Please upload all required documents before resubmitting.`);
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/artisan/apply-certification/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application?.id,
          serviceId: service.id,
        }),
      });

      const data = await response.json() as { error?: string; success?: boolean };

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
      setIsAddingToCart(false);
    }
  };

  const canAddToCart = progress.requiredCompleted === progress.requiredTotal;
  const isSubmitted = application?.status === "SUBMITTED";
  const isUnderReview = application?.status === "UNDER_REVIEW";
  const isApproved = application?.status === "APPROVED";
  const isRejected = application?.status === "REJECTED";
  const isPendingInfo = application?.status === "PENDING_INFORMATION";

  const getApplicationStatusBadge = () => {
    if (!application) return null;
    switch (application.status) {
      case "DRAFT":
        return { text: "Ready to Add to Cart", color: "bg-green-100 text-green-700", icon: ShoppingCart };
      case "SUBMITTED":
        return { text: "Under Review", color: "bg-blue-100 text-blue-700", icon: Clock };
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
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r p-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Document Requirements</h1>
            <p className="mt-1 opacity-90">
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
      </div>

      {/* Profile Summary */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{artisanProfile.firstName} {artisanProfile.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{user.phone}</span>
            </div>
          )}
          {artisanProfile.yearsOfExperience && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span>{artisanProfile.yearsOfExperience} years experience</span>
            </div>
          )}
          {(artisanProfile.state || artisanProfile.localGovernment) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>
                {artisanProfile.localGovernment?.name}, {artisanProfile.state?.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Document Upload Progress</h2>
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
              All mandatory documents must be uploaded before you can add this certification to cart.
              Once added to cart, you can proceed to checkout and pay for all items at once.
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
                disabled={isAddingToCart || !canAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingToCart ? (
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
                onClick={handleAddToCart}
                disabled={!canAddToCart || isSubmitted || isUnderReview || isAddingToCart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: colors.primary }}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Adding to Cart...
                  </>
                ) : isSubmitted || isUnderReview ? (
                  <>
                    <Clock className="h-5 w-5" />
                    Application Under Review
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
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

      {/* Cart Info Banner */}
      {canAddToCart && !isSubmitted && !isUnderReview && !isApproved && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <ShoppingCart className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Ready to Get Certified!</h4>
              <p className="text-sm text-blue-700 mt-1">
                All mandatory documents are uploaded. Click "Add to Cart" to add this certification to your shopping cart.
                You can add multiple certifications and courses before checking out.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-800">Need Help?</h4>
            <p className="text-sm text-gray-600 mt-1">
              All documents are securely stored and verified by our team. 
              Uploaded documents are used solely for certification purposes.
            </p>
            <Link href="/support" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-2 hover:text-blue-700">
              Contact Support <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}