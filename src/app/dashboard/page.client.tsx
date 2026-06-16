// app/dashboard/page.client.tsx (COMPLETE FIXED VERSION with upload modal)
"use client";

import { useState, useRef,useEffect } from "react";
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
  ShoppingCart,
  Eye,
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

interface ArtisanProfile {
  id: string;
  userId: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  city?: string;
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

// Upload Modal Component
const UploadModal = ({ 
  isOpen, 
  onClose, 
  requirement, 
  artisanId, 
  serviceId,
  onUploadSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  requirement: Requirement | null;
  artisanId: string;
  serviceId: number;
  onUploadSuccess: () => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !requirement) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("artisanId", artisanId);
      formData.append("serviceId", serviceId.toString());
      formData.append("requirementId", requirement.id.toString());

      const response = await fetch("/api/artisan/upload-requirement", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${requirement.name} uploaded successfully!`);
        setSelectedFile(null);
        onUploadSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = () => {
    if (requirement.upload?.documentUrl) {
      window.open(requirement.upload.documentUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {requirement.isUploaded ? "View Document" : `Upload ${requirement.name}`}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">{requirement.description}</p>
            {requirement.type === "MANDATORY" && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                <AlertCircle className="h-3 w-3" />
                Mandatory
              </span>
            )}
          </div>

          {requirement.isUploaded && requirement.upload ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Document Uploaded</span>
              </div>
              <p className="text-xs text-green-600 mb-3">
                Status: {requirement.upload.status}
              </p>
              <button
                onClick={handleViewDocument}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 w-full justify-center"
              >
                <Eye className="h-4 w-4" />
                View Document
              </button>
            </div>
          ) : (
            <>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : "Click to select or drag and drop"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
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
  const [addingToCart, setAddingToCart] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [localRequirementsStatus, setLocalRequirementsStatus] = useState(requirementsStatus);

  // Sync with props
  useEffect(() => {
    setLocalRequirementsStatus(requirementsStatus);
  }, [requirementsStatus]);

  const handleOpenUploadModal = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = async () => {
    // Refresh the page to get updated requirements status
    router.refresh();
  };

  const handleAddCertificationToCart = async () => {
    if (!currentService) {
      toast.error("Please complete your profile first");
      router.push("/dashboard/profile");
      return;
    }

    // Check if all mandatory requirements are met
    const mandatoryRequirements = localRequirementsStatus.filter(r => r.type === "MANDATORY");
    const allMandatoryMet = mandatoryRequirements.every(r => r.isUploaded);
    
    if (!allMandatoryMet) {
      toast.error("Please upload all mandatory documents before adding to cart");
      return;
    }

    setAddingToCart(true);
    try {
      // Use the apply-certification API to create/update application
      const applyResponse = await fetch("/api/artisan/apply-certification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId: artisanProfile.id,
          serviceId: currentService.id,
        }),
      });
      
      const applyData = await applyResponse.json();
      
      if (!applyData.success) {
        throw new Error(applyData.error || "Failed to create application");
      }

      const applicationId = applyData.application.id;

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
      
      if (cartData.success) {
        toast.success(`${currentService.name} certification added to cart!`);
        window.dispatchEvent(new Event("cartUpdated"));
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        toast.error(cartData.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const mainService = currentService;
  const mandatoryRequirements = localRequirementsStatus.filter(r => r.type === "MANDATORY");
  const allMandatoryMet = mandatoryRequirements.every(r => r.isUploaded);

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

      {/* Three Main Action Options */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <ActionCard
          title="Get Training"
          description="Connect with training partners to find programs that match your skill development needs."
          buttonText={needsTraining ? "Find Training Partners" : "Browse Training"}
          icon={GraduationCap}
          onClick={() => router.push("/dashboard/training")}
          variant={needsTraining ? "warning" : "info"}
        />

        <ActionCard
          title="Upload Documents"
          description="Submit required documents including certificates, identification, and proof of experience."
          buttonText={needsToUploadDocuments ? "Upload Now" : "Manage Documents"}
          icon={Upload}
          onClick={() => {
            if (needsToUploadDocuments && localRequirementsStatus.length > 0) {
              // Open the first pending requirement modal
              const pendingReq = localRequirementsStatus.find(r => !r.isUploaded && r.type === "MANDATORY");
              if (pendingReq) {
                handleOpenUploadModal(pendingReq);
              } else {
                router.push("/dashboard/requirements");
              }
            } else {
              router.push("/dashboard/requirements");
            }
          }}
          variant={needsToUploadDocuments ? "warning" : "info"}
        />

        <ActionCard
          title="Get Certified"
          description="Get officially certified in your trade. Add certification to cart and checkout."
          buttonText={
            hasCertificate ? "Download Certificate" :
            canApplyForCertification ? "Add to Cart" :
            hasPendingApplication ? "Application Pending" :
            "Start Application"
          }
          icon={Award}
          onClick={() => {
            if (hasCertificate) {
              const certLink = `/api/artisan/certificate/${currentApplication?.certificate?.id}/download`;
              window.open(certLink, '_blank');
            } else if (canApplyForCertification) {
              handleAddCertificationToCart();
            } else if (!hasActiveApplication) {
              router.push("/dashboard/application");
            }
          }}
          disabled={hasPendingApplication || addingToCart}
          variant={hasCertificate ? "success" : canApplyForCertification ? "primary" : "info"}
        />

        <ActionCard
          title="View Cart"
          description="Review your items and proceed to checkout for certification and courses."
          buttonText="View Cart"
          icon={ShoppingCart}
          onClick={() => {
            window.dispatchEvent(new Event("openCart"));
          }}
          variant="info"
        />
      </div>

      {/* Requirements Section with Upload Buttons */}
      {localRequirementsStatus.length > 0 && (
        <div id="requirements" className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Required Documents for {mainService?.name || "Certification"}</h2>
              <p className="text-sm text-gray-600">Upload the following documents to complete your certification</p>
            </div>
            <FileCheck className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {localRequirementsStatus.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
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
                    {req.isUploaded && req.upload?.status && (
                      <span className={`text-xs ml-2 ${
                        req.upload.status === "VERIFIED" ? "text-green-600" : 
                        req.upload.status === "REJECTED" ? "text-red-600" : "text-yellow-600"
                      }`}>
                        {req.upload.status.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
                {!req.isUploaded ? (
                  <button
                    onClick={() => handleOpenUploadModal(req)}
                    className="rounded-lg px-3 py-1 text-sm font-medium text-white transition-all hover:opacity-90 flex items-center gap-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenUploadModal(req)}
                      className="rounded-lg px-3 py-1 text-sm font-medium text-gray-600 border hover:bg-gray-50 transition-all flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Uploaded
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Status Message */}
          {!allMandatoryMet && (
            <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: `${colors.accent}10` }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: colors.accent }} />
                <p className="text-xs text-gray-600">
                  Please upload all mandatory documents before adding certification to cart.
                </p>
              </div>
            </div>
          )}
          
          {allMandatoryMet && (
            <div className="mt-4 rounded-lg p-3 bg-green-50 border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <p className="text-xs text-green-700">
                  All mandatory documents uploaded! You can now add certification to cart.
                </p>
              </div>
            </div>
          )}
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

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedRequirement(null);
        }}
        requirement={selectedRequirement}
        artisanId={artisanProfile.id}
        serviceId={currentService?.id}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}