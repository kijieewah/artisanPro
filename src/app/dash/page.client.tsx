"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Users,
  Building2,
  Package,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  X,
  Info,
  Lock,
  Layers,
  Briefcase,
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  FolderTree,
  Tag,
  ListChecks,
  XCircle,
} from "lucide-react";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Badge } from "~/ui/primitives/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "~/ui/primitives/dialog";
import { Label } from "~/ui/primitives/label";
import { Textarea } from "~/ui/primitives/textarea";
import { Switch } from "~/ui/primitives/switch";

// ============================================
// TYPES
// ============================================

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  artisanProfile?: ArtisanProfile;
  partnerProfile?: PartnerProfile;
}

interface ArtisanProfile {
  id: string;
  userId: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  yearsOfExperience?: number;
  bio?: string;
  skills?: any;
  verificationStatus: string;
  permitStatus: string;
  approvalStatus: string;
  completionScore?: number;
  isProfileComplete: boolean;
  sanaaId?: number;
  onDuty: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    isActive: boolean;
  };
}

interface PartnerProfile {
  id: string;
  userId: string;
  businessName: string;
  registrationNumber: string;
  taxId?: string;
  businessEmail: string;
  businessPhone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  status: string;
  commissionRate?: number;
  createdAt: string;
}

interface PartnerWithDetails extends PartnerProfile {
  industries?: Array<{ id: number; name: string; description?: string }>;
  services?: Array<{ id: number; name: string; description?: string; industryId: number; industry?: { id: number; name: string } }>;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  logoUrl?: string;
  accreditationDocUrl?: string;
  description?: string;
  rejectionReason?: string;
  partnerType?: string;
}

interface Industry {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  services?: Service[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    services: number;
  };
}

interface Service {
  id: number;
  industryId: number;
  name: string;
  image?: string;
  description?: string;
  status: boolean;
  requirements?: Requirement[];
  createdAt: string;
  updatedAt: string;
  industry?: Industry;
  _count?: {
    requirements: number;
  };
}

interface Requirement {
  id: number;
  serviceId: number;
  name: string;
  type: "MANDATORY" | "OPTIONAL";
  status: boolean;
  service?: Service;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalArtisans: number;
  totalPartners: number;
  totalBusinesses: number;
  totalProducts: number;
  pendingVerifications: number;
  totalIndustries: number;
  totalServices: number;
  totalRequirements: number;
}

type TabType = "users" | "artisans" | "partners" | "industries" | "services" | "requirements";

interface IndustryFormData {
  name: string;
  description: string;
  status: boolean;
}

interface ServiceFormData {
  industryId: number;
  name: string;
  description: string;
  image?: string;
  status: boolean;
}

interface RequirementFormData {
  serviceId: number;
  name: string;
  type: "MANDATORY" | "OPTIONAL";
  status: boolean;
}

// ============================================
// Phone Authentication Component
// ============================================

function PhoneAuthModal({ isOpen, onSuccess }: { isOpen: boolean; onSuccess: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const AUTHORIZED_NUMBERS = [
    "08064875435",
    "+61451717667",
    "08123699909",
    "08166090066",
  ];

  const cleanPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = '234' + cleaned.substring(1);
    }
    if (cleaned.length === 10 && !cleaned.startsWith('234')) {
      cleaned = '234' + cleaned;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const cleanedInput = cleanPhoneNumber(phoneNumber);
      const isAuthorized = AUTHORIZED_NUMBERS.some(authorized => 
        cleanPhoneNumber(authorized) === cleanedInput
      );

      if (isAuthorized) {
        toast.success("Access granted! Welcome to Admin Dashboard.");
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_auth_time", Date.now().toString());
        onSuccess();
      } else {
        setError("Access denied. Please check your phone number.");
        toast.error("Invalid phone number. Access denied.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-xl shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Access Required
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Enter your authorized phone number to continue
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="admin-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </Label>
                <Input
                  id="admin-phone"
                  type="tel"
                  placeholder="e.g., 08123699909 or +2348123699909"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full h-12 text-lg text-center font-medium border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-semibold" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    <Lock className="mr-3 h-5 w-5" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Delete Confirmation Modal
// ============================================

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Add/Edit Industry Modal
// ============================================

function IndustryModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingIndustry 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  editingIndustry?: Industry | null;
}) {
  const [formData, setFormData] = useState<IndustryFormData>({
    name: "",
    description: "",
    status: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingIndustry;

  useEffect(() => {
    if (editingIndustry) {
      setFormData({
        name: editingIndustry.name,
        description: editingIndustry.description || "",
        status: editingIndustry.status,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: true,
      });
    }
  }, [editingIndustry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/admin/industries?id=${editingIndustry.id}` : "/api/admin/industries";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json() as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${isEditing ? "update" : "create"} industry`);
      }

      toast.success(isEditing ? "Industry updated successfully!" : "Industry created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} industry:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? "update" : "create"} industry`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Industry" : "Add New Industry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="industry-name">Industry Name *</Label>
            <Input
              id="industry-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Technology, Agriculture, Healthcare"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry-description">Description</Label>
            <Textarea
              id="industry-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this industry..."
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="industry-status">Active</Label>
            <Switch
              id="industry-status"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
              {isEditing ? "Update Industry" : "Create Industry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Add/Edit Service Modal
// ============================================

function ServiceModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  industries, 
  editingService 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  industries: Industry[];
  editingService?: Service | null;
}) {
  const [formData, setFormData] = useState<ServiceFormData>({
    industryId: 0,
    name: "",
    description: "",
    image: "",
    status: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingService;

  useEffect(() => {
    if (editingService) {
      setFormData({
        industryId: editingService.industryId,
        name: editingService.name,
        description: editingService.description || "",
        image: editingService.image || "",
        status: editingService.status,
      });
    } else {
      setFormData({
        industryId: 0,
        name: "",
        description: "",
        image: "",
        status: true,
      });
    }
  }, [editingService, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.industryId) {
      toast.error("Please select an industry");
      return;
    }
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/admin/services?id=${editingService.id}` : "/api/admin/services";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json() as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${isEditing ? "update" : "create"} service`);
      }

      toast.success(isEditing ? "Service updated successfully!" : "Service created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} service:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? "update" : "create"} service`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Service" : "Add New Service"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-industry">Industry *</Label>
            <select
              id="service-industry"
              value={formData.industryId}
              onChange={(e) => setFormData({ ...formData, industryId: parseInt(e.target.value) })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value={0}>Select an industry</option>
              {industries.filter(i => i.status).map((industry) => (
                <option key={industry.id} value={industry.id}>{industry.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-name">Service Name *</Label>
            <Input
              id="service-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Web Development, Plumbing, Tutoring"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this service..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-image">Image URL (Optional)</Label>
            <Input
              id="service-image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="service-status">Active</Label>
            <Switch
              id="service-status"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
              {isEditing ? "Update Service" : "Create Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Add/Edit Requirement Modal
// ============================================

function RequirementModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  services, 
  editingRequirement 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  services: Service[];
  editingRequirement?: Requirement | null;
}) {
  const [formData, setFormData] = useState<RequirementFormData>({
    serviceId: 0,
    name: "",
    type: "MANDATORY",
    status: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingRequirement;

  useEffect(() => {
    if (editingRequirement) {
      setFormData({
        serviceId: editingRequirement.serviceId,
        name: editingRequirement.name,
        type: editingRequirement.type,
        status: editingRequirement.status,
      });
    } else {
      setFormData({
        serviceId: 0,
        name: "",
        type: "MANDATORY",
        status: true,
      });
    }
  }, [editingRequirement, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId) {
      toast.error("Please select a service");
      return;
    }
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/admin/requirements?id=${editingRequirement.id}` : "/api/admin/requirements";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json() as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${isEditing ? "update" : "create"} requirement`);
      }

      toast.success(isEditing ? "Requirement updated successfully!" : "Requirement created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} requirement:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? "update" : "create"} requirement`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeServices = services.filter(s => s.status === true);
  
  let displayServices = activeServices;
  if (isEditing && editingRequirement) {
    const currentService = services.find(s => s.id === editingRequirement.serviceId);
    if (currentService && !activeServices.find(s => s.id === currentService.id)) {
      displayServices = [currentService, ...activeServices];
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Requirement" : "Add New Requirement"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirement-service">
              Service *
              {displayServices.length === 0 && (
                <span className="text-red-500 ml-2 text-xs">(No services available. Please create a service first.)</span>
              )}
            </Label>
            <select
              id="requirement-service"
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: parseInt(e.target.value) })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
              disabled={displayServices.length === 0}
            >
              <option value={0}>Select a service</option>
              {displayServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} {!service.status && "(Inactive)"}
                </option>
              ))}
            </select>
            {displayServices.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No services found. Please go to the Services tab and add services first.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirement-name">Requirement Name *</Label>
            <Input
              id="requirement-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Certification, License, Experience Letter"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirement-type">Requirement Type</Label>
            <select
              id="requirement-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "MANDATORY" | "OPTIONAL" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="MANDATORY">Mandatory</option>
              <option value="OPTIONAL">Optional</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="requirement-status">Active</Label>
            <Switch
              id="requirement-status"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || displayServices.length === 0}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
              {isEditing ? "Update Requirement" : "Create Requirement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Partner Detail Modal
// ============================================

function PartnerDetailModal({ partner, isOpen, onClose, onStatusChange }: { partner: PartnerWithDetails | null; isOpen: boolean; onClose: () => void; onStatusChange: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!partner) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      SUSPENDED: "bg-red-100 text-red-800",
      PENDING_VERIFICATION: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return variants[status] || variants.INACTIVE;
  };

  const handleApprove = async () => {
    if (!confirm(`Approve ${partner.businessName}?`)) return;
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/admin/partners?id=${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      
      const data = await response.json() as { success?: boolean; error?: string };
      if (data.success) {
        toast.success(`${partner.businessName} approved successfully!`);
        onStatusChange();
        onClose();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error approving partner:", error);
      toast.error("Failed to approve partner");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt(`Enter rejection reason for ${partner.businessName}:`);
    if (reason === null) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/partners?id=${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", rejectionReason: reason }),
      });
      
      const data = await response.json() as { success?: boolean; error?: string };
      if (data.success) {
        toast.success(`${partner.businessName} rejected.`);
        onStatusChange();
        onClose();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error rejecting partner:", error);
      toast.error("Failed to reject partner");
    } finally {
      setIsProcessing(false);
    }
  };

  const typeLabels: Record<string, string> = {
    TRAINING_PROVIDER: "Training Provider",
    CERTIFICATION_BODY: "Certification Body",
    GOVERNMENT_AGENCY: "Government Agency",
    TRADE_SCHOOL: "Trade School",
    INDUSTRY_ASSOCIATION: "Industry Association",
    OTHER: "Other",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Partner Details - {partner.businessName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Business Name</Label>
                <p className="font-medium">{partner.businessName}</p>
              </div>
              <div>
                <Label className="text-gray-500">Registration Number</Label>
                <p className="font-medium">{partner.registrationNumber}</p>
              </div>
              <div>
                <Label className="text-gray-500">Tax ID</Label>
                <p className="font-medium">{partner.taxId || "N/A"}</p>
              </div>
              <div>
                <Label className="text-gray-500">Partner Type</Label>
                <p className="font-medium">{typeLabels[partner.partnerType || ""] || partner.partnerType || "N/A"}</p>
              </div>
              <div>
                <Label className="text-gray-500">Status</Label>
                <Badge className={getStatusBadge(partner.status)}>
                  {partner.status?.replace(/_/g, " ")}
                </Badge>
              </div>
              <div>
                <Label className="text-gray-500">Applied Date</Label>
                <p className="font-medium">{new Date(partner.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Email</Label>
                <p className="font-medium">{partner.businessEmail}</p>
              </div>
              <div>
                <Label className="text-gray-500">Phone</Label>
                <p className="font-medium">{partner.businessPhone}</p>
              </div>
              <div>
                <Label className="text-gray-500">Website</Label>
                <p className="font-medium">{partner.website || "N/A"}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Address</h3>
            <p>{partner.address}, {partner.city}, {partner.state}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Industries & Services</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Industries</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {partner.industries?.map((ind) => (
                    <span key={ind.id} className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                      {ind.name}
                    </span>
                  ))}
                  {(!partner.industries || partner.industries.length === 0) && (
                    <span className="text-gray-400 text-sm">No industries selected</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Services</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {partner.services?.map((svc) => (
                    <span key={svc.id} className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      {svc.name}
                    </span>
                  ))}
                  {(!partner.services || partner.services.length === 0) && (
                    <span className="text-gray-400 text-sm">No services selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {partner.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Description</h3>
              <p className="text-gray-700">{partner.description}</p>
            </div>
          )}
          
          {(partner.accreditationDocUrl || partner.logoUrl) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Documents</h3>
              <div className="space-y-2">
                {partner.accreditationDocUrl && (
                  <div>
                    <Label className="text-gray-500">Accreditation Document</Label>
                    <div>
                      <a href={partner.accreditationDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Document →
                      </a>
                    </div>
                  </div>
                )}
                {partner.logoUrl && (
                  <div>
                    <Label className="text-gray-500">Logo</Label>
                    <div className="mt-1">
                      <img src={partner.logoUrl} alt="Logo" className="h-16 w-16 object-cover rounded border" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {partner.rejectionReason && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">Rejection Reason</h3>
              <p className="text-red-700">{partner.rejectionReason}</p>
            </div>
          )}
          
          {partner.status === "PENDING_VERIFICATION" && (
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Partner
              </Button>
              <Button onClick={handleReject} disabled={isProcessing} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4 mr-2" />
                Reject Partner
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DataTable Component with Pagination
// ============================================

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
}

function DataTable<T>({
  data,
  columns,
  loading = false,
  onRowClick,
  emptyMessage = "No data available",
  searchable = false,
  onSearch,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onEdit,
  onDelete,
  editDisabled = false,
  deleteDisabled = false,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchValue);

  const filteredData = React.useMemo(() => {
    if (!localSearchQuery) return data;
    const query = localSearchQuery.toLowerCase();
    return data.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
  }, [data, localSearchQuery]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;
      if (bValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === "asc" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    onSearchChange?.(query);
    if (onPageChange) onPageChange(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${column.width || ""}`}>
                  <button
                    onClick={() => handleSort(column.key)}
                    className={`flex items-center gap-1 w-full text-left ${column.sortable ? "cursor-pointer hover:text-gray-700" : "cursor-default"}`}
                  >
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-24">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedData.map((item, index) => (
              <tr key={index} className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`} onClick={() => onRowClick?.(item)}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">{column.cell(item, index)}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {onEdit && !editDisabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && !deleteDisabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && !loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{localSearchQuery ? "No results found" : emptyMessage}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Admin Dashboard Component
// ============================================

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabType>("users");
  
  const [users, setUsers] = useState<User[]>([]);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [partners, setPartners] = useState<PartnerWithDetails[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [artisansPage, setArtisansPage] = useState(1);
  const [artisansTotal, setArtisansTotal] = useState(0);
  const [partnersPage, setPartnersPage] = useState(1);
  const [partnersTotal, setPartnersTotal] = useState(0);
  const [industriesPage, setIndustriesPage] = useState(1);
  const [industriesTotal, setIndustriesTotal] = useState(0);
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [requirementsPage, setRequirementsPage] = useState(1);
  const [requirementsTotal, setRequirementsTotal] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddIndustryModal, setShowAddIndustryModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithDetails | null>(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: number | string; name: string; type: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalArtisans: 0,
    totalPartners: 0,
    totalBusinesses: 0,
    totalProducts: 0,
    pendingVerifications: 0,
    totalIndustries: 0,
    totalServices: 0,
    totalRequirements: 0,
  });

  const PAGE_SIZE = 10;

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const authenticated = localStorage.getItem("admin_authenticated");
        const authTime = localStorage.getItem("admin_auth_time");
        
        if (authenticated === "true" && authTime) {
          const timeDiff = Date.now() - parseInt(authTime);
          if (timeDiff < 24 * 60 * 60 * 1000) {
            setIsAuthenticated(true);
            setShowAuthModal(false);
            fetchInitialData();
          } else {
            localStorage.removeItem("admin_authenticated");
            localStorage.removeItem("admin_auth_time");
            setIsAuthenticated(false);
            setShowAuthModal(true);
          }
        } else {
          setIsAuthenticated(false);
          setShowAuthModal(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setShowAuthModal(true);
      }
    };
    checkAuthentication();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    fetchInitialData();
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      await Promise.all([
        fetchUsers(1, ""),
        fetchArtisans(1, ""),
        fetchPartners(1, ""),
        fetchIndustries(1, ""),
        fetchServices(1, ""),
        fetchRequirements(1, ""),
        fetchStats(),
        fetchAllServices(),
      ]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json() as AdminStats;
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async (page: number = 1, search: string = "") => {
    try {
      setIsSearching(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
      const data = await response.json() as { users: User[]; total: number };
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchArtisans = async (page: number = 1, search: string = "") => {
    try {
      const response = await fetch(`/api/admin/artisans?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
      const data = await response.json() as { artisans: ArtisanProfile[]; total: number };
      setArtisans(data.artisans || []);
      setArtisansTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch artisans:", error);
      toast.error("Failed to load artisans");
    }
  };

  const fetchPartners = async (page: number = 1, search: string = "") => {
    try {
      const response = await fetch(`/api/admin/partners?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
      const data = await response.json() as { success: boolean; partners: PartnerWithDetails[]; total: number; error?: string };
      if (data.success) {
        setPartners(data.partners || []);
        setPartnersTotal(data.total || 0);
      } else {
        console.error("Failed to fetch partners:", data.error);
        setPartners([]);
      }
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      toast.error("Failed to load partners");
      setPartners([]);
    }
  };

  const fetchIndustries = async (page: number = 1, search: string = "") => {
    try {
      const response = await fetch(`/api/admin/industries?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
      const data = await response.json() as { industries: Industry[]; total: number };
      setIndustries(data.industries || []);
      setIndustriesTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch industries:", error);
    }
  };

  const fetchServices = async (page: number = 1, search: string = "") => {
    try {
      const response = await fetch(`/api/admin/services?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
      const data = await response.json() as { services: Service[]; total: number };
      setServices(data.services || []);
      setServicesTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const fetchRequirements = async (page: number = 1, search: string = "") => {
    try {
      const response = await fetch(`/api/admin/requirements?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
      const data = await response.json() as { requirements: Requirement[]; total: number };
      setRequirements(data.requirements || []);
      setRequirementsTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch requirements:", error);
    }
  };

  const fetchAllServices = async () => {
    try {
      const response = await fetch(`/api/admin/services?limit=1000`);
      const data = await response.json() as { services: Service[] };
      setAllServices(data.services || []);
    } catch (error) {
      console.error("Failed to fetch all services:", error);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    switch (activeTab) {
      case "users":
        fetchUsers(1, query);
        setUsersPage(1);
        break;
      case "artisans":
        fetchArtisans(1, query);
        setArtisansPage(1);
        break;
      case "partners":
        fetchPartners(1, query);
        setPartnersPage(1);
        break;
      case "industries":
        fetchIndustries(1, query);
        setIndustriesPage(1);
        break;
      case "services":
        fetchServices(1, query);
        setServicesPage(1);
        break;
      case "requirements":
        fetchRequirements(1, query);
        setRequirementsPage(1);
        break;
    }
  }, [activeTab]);

  const handlePageChange = (page: number) => {
    switch (activeTab) {
      case "users":
        setUsersPage(page);
        fetchUsers(page, searchQuery);
        break;
      case "artisans":
        setArtisansPage(page);
        fetchArtisans(page, searchQuery);
        break;
      case "partners":
        setPartnersPage(page);
        fetchPartners(page, searchQuery);
        break;
      case "industries":
        setIndustriesPage(page);
        fetchIndustries(page, searchQuery);
        break;
      case "services":
        setServicesPage(page);
        fetchServices(page, searchQuery);
        break;
      case "requirements":
        setRequirementsPage(page);
        fetchRequirements(page, searchQuery);
        break;
    }
  };

  const refreshData = () => {
    switch (activeTab) {
      case "users":
        fetchUsers(usersPage, searchQuery);
        break;
      case "artisans":
        fetchArtisans(artisansPage, searchQuery);
        break;
      case "partners":
        fetchPartners(partnersPage, searchQuery);
        break;
      case "industries":
        fetchIndustries(industriesPage, searchQuery);
        break;
      case "services":
        fetchServices(servicesPage, searchQuery);
        break;
      case "requirements":
        fetchRequirements(requirementsPage, searchQuery);
        break;
    }
    fetchStats();
    fetchAllServices();
  };

  const handleViewPartner = (partner: PartnerWithDetails) => {
    setSelectedPartner(partner);
    setShowPartnerModal(true);
  };

  const handleEditIndustry = (industry: Industry) => {
    setEditingIndustry(industry);
    setShowAddIndustryModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowAddServiceModal(true);
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setShowAddRequirementModal(true);
  };

  const handleAddRequirement = () => {
    setEditingRequirement(null);
    fetchAllServices();
    setShowAddRequirementModal(true);
  };

  const handleDeleteClick = (item: { id: number | string; name: string; type: string }) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    
    setIsDeleting(true);
    try {
      let response;
      switch (deletingItem.type) {
        case "industry":
          response = await fetch(`/api/admin/industries?id=${deletingItem.id}`, { method: "DELETE" });
          break;
        case "service":
          response = await fetch(`/api/admin/services?id=${deletingItem.id}`, { method: "DELETE" });
          break;
        case "requirement":
          response = await fetch(`/api/admin/requirements?id=${deletingItem.id}`, { method: "DELETE" });
          break;
        case "artisan":
          response = await fetch(`/api/admin/artisans?id=${deletingItem.id}`, { method: "DELETE" });
          break;
        default:
          throw new Error("Invalid item type");
      }
      
      const data = await response.json() as { error?: string; success?: boolean };
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${deletingItem.type}`);
      }
      
      toast.success(`${deletingItem.name} deleted successfully!`);
      refreshData();
      setDeleteModalOpen(false);
      setDeletingItem(null);
    } catch (error) {
      console.error(`Error deleting ${deletingItem.type}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to delete ${deletingItem.type}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseIndustryModal = () => {
    setShowAddIndustryModal(false);
    setEditingIndustry(null);
  };

  const handleCloseServiceModal = () => {
    setShowAddServiceModal(false);
    setEditingService(null);
  };

  const handleCloseRequirementModal = () => {
    setShowAddRequirementModal(false);
    setEditingRequirement(null);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: "bg-purple-100 text-purple-800",
      ADMIN: "bg-blue-100 text-blue-800",
      PARTNER: "bg-green-100 text-green-800",
      ARTISAN: "bg-orange-100 text-orange-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: string | boolean) => {
    if (typeof status === "boolean") {
      return status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
    }
    const variants: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      SUSPENDED: "bg-red-100 text-red-800",
      PENDING_VERIFICATION: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };
    return variants[status] || variants.INACTIVE;
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "Invalid Date";
    }
  };

  const userColumns: Column<User>[] = [
    { key: "name", header: "Name", sortable: true, cell: (user) => `${user.firstName} ${user.lastName}` },
    { key: "email", header: "Email", sortable: true, cell: (user) => user.email },
    { key: "phone", header: "Phone", sortable: true, cell: (user) => user.phone },
    { key: "role", header: "Role", sortable: true, cell: (user) => <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge> },
    { key: "status", header: "Status", sortable: true, cell: (user) => <Badge className={getStatusBadge(user.isActive ? "ACTIVE" : "INACTIVE")}>{user.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "createdAt", header: "Joined", sortable: true, cell: (user) => formatDate(user.createdAt) },
  ];

  const artisanColumns: Column<ArtisanProfile>[] = [
    { key: "sanaaId", header: "Sanaa ID", sortable: true, cell: (artisan) => artisan.sanaaId || "N/A", width: "w-24" },
    { key: "name", header: "Name", sortable: true, cell: (artisan) => artisan.user ? `${artisan.user.firstName} ${artisan.user.lastName}` : "N/A" },
    { key: "email", header: "Email", sortable: true, cell: (artisan) => artisan.user?.email || "N/A" },
    { key: "phone", header: "Phone", sortable: true, cell: (artisan) => artisan.user?.phone || "N/A" },
    { key: "yearsOfExperience", header: "Experience", sortable: true, cell: (artisan) => artisan.yearsOfExperience || 0, width: "w-24" },
    { key: "verificationStatus", header: "Verification", sortable: true, cell: (artisan) => <Badge className={getStatusBadge(artisan.verificationStatus)}>{artisan.verificationStatus}</Badge>, width: "w-32" },
    { key: "onDuty", header: "On Duty", sortable: true, cell: (artisan) => <Badge className={artisan.onDuty ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{artisan.onDuty ? "Yes" : "No"}</Badge>, width: "w-24" },
    { key: "createdAt", header: "Joined", sortable: true, cell: (artisan) => formatDate(artisan.createdAt), width: "w-32" },
  ];

  const partnerColumns: Column<PartnerWithDetails>[] = [
    { key: "businessName", header: "Business Name", sortable: true, cell: (partner) => partner.businessName },
    { key: "businessEmail", header: "Email", sortable: true, cell: (partner) => partner.businessEmail },
    { key: "businessPhone", header: "Phone", sortable: true, cell: (partner) => partner.businessPhone },
    { key: "status", header: "Status", sortable: true, cell: (partner) => <Badge className={getStatusBadge(partner.status)}>{partner.status?.replace(/_/g, " ")}</Badge> },
    { key: "createdAt", header: "Applied", sortable: true, cell: (partner) => formatDate(partner.createdAt) },
  ];

  const industryColumns: Column<Industry>[] = [
    { key: "id", header: "ID", sortable: true, cell: (industry) => industry.id, width: "w-16" },
    { key: "name", header: "Name", sortable: true, cell: (industry) => industry.name },
    { key: "description", header: "Description", sortable: false, cell: (industry) => industry.description?.substring(0, 50) || "-" },
    { key: "services", header: "Services", sortable: true, cell: (industry) => industry._count?.services || industry.services?.length || 0, width: "w-24" },
    { key: "status", header: "Status", sortable: true, cell: (industry) => <Badge className={getStatusBadge(industry.status)}>{industry.status ? "Active" : "Inactive"}</Badge>, width: "w-24" },
    { key: "createdAt", header: "Created", sortable: true, cell: (industry) => formatDate(industry.createdAt), width: "w-32" },
  ];

  const serviceColumns: Column<Service>[] = [
    { key: "id", header: "ID", sortable: true, cell: (service) => service.id, width: "w-16" },
    { key: "name", header: "Name", sortable: true, cell: (service) => service.name },
    { key: "industry", header: "Industry", sortable: true, cell: (service) => service.industry?.name || "-" },
    { key: "description", header: "Description", sortable: false, cell: (service) => service.description?.substring(0, 50) || "-" },
    { key: "requirements", header: "Requirements", sortable: true, cell: (service) => service._count?.requirements || service.requirements?.length || 0, width: "w-24" },
    { key: "status", header: "Status", sortable: true, cell: (service) => <Badge className={getStatusBadge(service.status)}>{service.status ? "Active" : "Inactive"}</Badge>, width: "w-24" },
    { key: "createdAt", header: "Created", sortable: true, cell: (service) => formatDate(service.createdAt), width: "w-32" },
  ];

  const requirementColumns: Column<Requirement>[] = [
    { key: "id", header: "ID", sortable: true, cell: (req) => req.id, width: "w-16" },
    { key: "name", header: "Name", sortable: true, cell: (req) => req.name },
    { key: "service", header: "Service", sortable: true, cell: (req) => req.service?.name || "-" },
    { key: "type", header: "Type", sortable: true, cell: (req) => <Badge className={req.type === "MANDATORY" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>{req.type}</Badge>, width: "w-24" },
    { key: "status", header: "Status", sortable: true, cell: (req) => <Badge className={getStatusBadge(req.status)}>{req.status ? "Active" : "Inactive"}</Badge>, width: "w-24" },
    { key: "createdAt", header: "Created", sortable: true, cell: (req) => formatDate(req.createdAt), width: "w-32" },
  ];

  const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ComponentType<any> }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PhoneAuthModal isOpen={showAuthModal} onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  if (isLoading && users.length === 0 && industries.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, industries, services, and requirements</p>
        </div>
        <Button variant="outline" onClick={() => {
          localStorage.removeItem("admin_authenticated");
          localStorage.removeItem("admin_auth_time");
          setIsAuthenticated(false);
          setShowAuthModal(true);
        }}>Logout</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Artisans" value={stats.totalArtisans} icon={Users} />
        <StatCard title="Partners" value={stats.totalPartners} icon={Building2} />
        <StatCard title="Businesses" value={stats.totalBusinesses} icon={Building2} />
        <StatCard title="Products" value={stats.totalProducts} icon={Package} />
        <StatCard title="Pending Verifications" value={stats.pendingVerifications} icon={Clock} />
        <StatCard title="Industries" value={stats.totalIndustries} icon={FolderTree} />
        <StatCard title="Services" value={stats.totalServices} icon={Tag} />
        <StatCard title="Requirements" value={stats.totalRequirements} icon={ListChecks} />
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-8 overflow-x-auto">
          {["users", "artisans", "partners", "industries", "services", "requirements"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as TabType);
                setSearchQuery("");
              }}
              className={`py-2 px-1 capitalize whitespace-nowrap ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mb-6 flex gap-3 flex-wrap">
        {activeTab === "industries" && (
          <Button onClick={() => {
            setEditingIndustry(null);
            setShowAddIndustryModal(true);
          }} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Industry
          </Button>
        )}
        {activeTab === "services" && (
          <Button onClick={() => {
            setEditingService(null);
            setShowAddServiceModal(true);
          }} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Service
          </Button>
        )}
        {activeTab === "requirements" && (
          <Button onClick={handleAddRequirement} className="bg-purple-600 hover:bg-purple-700">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Requirement
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === "users" && (
            <DataTable
              data={users}
              columns={userColumns}
              loading={isLoading || isSearching}
              searchable={true}
              onSearch={handleSearch}
              searchValue={searchQuery}
              searchPlaceholder="Search users..."
              emptyMessage="No users found"
              totalItems={usersTotal}
              currentPage={usersPage}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          )}
          {activeTab === "artisans" && (
            <DataTable
              data={artisans}
              columns={artisanColumns}
              loading={isLoading}
              searchable={true}
              onSearch={handleSearch}
              searchValue={searchQuery}
              searchPlaceholder="Search artisans by name, email, phone, or Sanaa ID..."
              emptyMessage="No artisans found"
              totalItems={artisansTotal}
              currentPage={artisansPage}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
              onDelete={(artisan) => handleDeleteClick({ id: artisan.id, name: artisan.user ? `${artisan.user.firstName} ${artisan.user.lastName}` : "Artisan", type: "artisan" })}
            />
          )}
          {activeTab === "partners" && (
            <DataTable
              data={partners}
              columns={partnerColumns}
              loading={isLoading}
              searchable={true}
              onSearch={handleSearch}
              searchValue={searchQuery}
              searchPlaceholder="Search partners..."
              emptyMessage="No partners found"
              onRowClick={handleViewPartner}
              totalItems={partnersTotal}
              currentPage={partnersPage}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          )}
          {activeTab === "industries" && (
            <DataTable
              data={industries}
              columns={industryColumns}
              loading={isLoading}
              searchable={true}
              onSearch={handleSearch}
              searchValue={searchQuery}
              searchPlaceholder="Search industries..."
              emptyMessage="No industries found"
              onEdit={handleEditIndustry}
              onDelete={(industry) => handleDeleteClick({ id: industry.id, name: industry.name, type: "industry" })}
              totalItems={industriesTotal}
              currentPage={industriesPage}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          )}
          {activeTab === "services" && (
            <DataTable
              data={services}
              columns={serviceColumns}
              loading={isLoading}
              searchable={true}
              onSearch={handleSearch}
              searchValue={searchQuery}
              searchPlaceholder="Search services..."
              emptyMessage="No services found"
              onEdit={handleEditService}
              onDelete={(service) => handleDeleteClick({ id: service.id, name: service.name, type: "service" })}
              totalItems={servicesTotal}
              currentPage={servicesPage}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          )}
          {activeTab === "requirements" && (
            <DataTable
              data={requirements}
              columns={requirementColumns}
              loading={isLoading}
              searchable={true}
              onSearch={handleSearch}
              searchValue={searchQuery}
              searchPlaceholder="Search requirements..."
              emptyMessage="No requirements found"
              onEdit={handleEditRequirement}
              onDelete={(requirement) => handleDeleteClick({ id: requirement.id, name: requirement.name, type: "requirement" })}
              totalItems={requirementsTotal}
              currentPage={requirementsPage}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          )}
        </CardContent>
      </Card>

      <IndustryModal
        isOpen={showAddIndustryModal}
        onClose={handleCloseIndustryModal}
        onSuccess={refreshData}
        editingIndustry={editingIndustry}
      />
      <ServiceModal
        isOpen={showAddServiceModal}
        onClose={handleCloseServiceModal}
        onSuccess={refreshData}
        industries={industries}
        editingService={editingService}
      />
      <RequirementModal
        isOpen={showAddRequirementModal}
        onClose={handleCloseRequirementModal}
        onSuccess={refreshData}
        services={allServices}
        editingRequirement={editingRequirement}
      />
      <PartnerDetailModal
        partner={selectedPartner}
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
        onStatusChange={refreshData}
      />
      
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deletingItem?.type || "Item"}`}
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.${deletingItem?.type === "industry" ? " All services under this industry will also be affected." : ""}${deletingItem?.type === "service" ? " All requirements under this service will also be affected." : ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}