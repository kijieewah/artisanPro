// app/dashboard/profile/page.client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  Star,
  Shield,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  GraduationCap,
  HardHat,
  Tool,
  Wrench,
  Zap,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface State {
  id: number;
  name: string;
  localGovts: Array<{ id: number; name: string }>;
}

interface Service {
  id: number;
  name: string;
  industry: { id: number; name: string };
}

interface UserData {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ArtisanService {
  id: number;
  serviceId: number;
  serviceName: string;
  industryName: string;
  experience?: number;
}

interface ProfileData {
  id: string;
  gender: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  city: string | null;
  stateId: number | null;
  stateName?: string;
  localGovernmentId: number | null;
  localGovernmentName?: string;
  workingAddress: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
  skills: string[];
  verificationStatus: string;
  permitStatus: string;
  approvalStatus: string;
  artisanServices: ArtisanService[];
}

interface ProfileClientProps {
  user: UserData;
  profile: ProfileData | null;
  states: State[];
  services: Service[];
}

export default function ProfileClient({
  user,
  profile,
  states,
  services,
}: ProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    gender: profile?.gender || "",
    dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
    address: profile?.address || "",
    city: profile?.city || "",
    stateId: profile?.stateId?.toString() || "",
    localGovernmentId: profile?.localGovernmentId?.toString() || "",
    workingAddress: profile?.workingAddress || "",
    yearsOfExperience: profile?.yearsOfExperience?.toString() || "",
    bio: profile?.bio || "",
    skills: profile?.skills?.join(", ") || "",
  });

  const [selectedServices, setSelectedServices] = useState<ArtisanService[]>(
    profile?.artisanServices || []
  );
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    serviceId: "",
    experience: "",
  });

  const [localGovts, setLocalGovts] = useState<{ id: number; name: string }[]>(
    []
  );

  // Update local governments when state changes
  useEffect(() => {
    if (formData.stateId) {
      const selectedState = states.find((s) => s.id.toString() === formData.stateId);
      if (selectedState) {
        setLocalGovts(selectedState.localGovts);
      }
    }
  }, [formData.stateId, states]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        address: formData.address || null,
        city: formData.city || null,
        stateId: formData.stateId ? parseInt(formData.stateId) : null,
        localGovernmentId: formData.localGovernmentId
          ? parseInt(formData.localGovernmentId)
          : null,
        workingAddress: formData.workingAddress || null,
        yearsOfExperience: formData.yearsOfExperience
          ? parseInt(formData.yearsOfExperience)
          : null,
        bio: formData.bio || null,
        skills: formData.skills
          ? formData.skills.split(",").map((s) => s.trim())
          : [],
        artisanServices: selectedServices.map((s) => ({
          serviceId: s.serviceId,
          experience: s.experience || null,
        })),
      };

      const response = await fetch("/api/artisan/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.serviceId) {
      toast.error("Please select a service");
      return;
    }

    const service = services.find((s) => s.id.toString() === newService.serviceId);
    if (!service) return;

    if (selectedServices.some((s) => s.serviceId.toString() === newService.serviceId)) {
      toast.error("Service already added");
      return;
    }

    setSelectedServices([
      ...selectedServices,
      {
        id: Date.now(),
        serviceId: service.id,
        serviceName: service.name,
        industryName: service.industry.name,
        experience: newService.experience ? parseInt(newService.experience) : undefined,
      },
    ]);

    setNewService({ serviceId: "", experience: "" });
    setShowServiceModal(false);
    toast.success("Service added successfully");
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
    toast.success("Service removed");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return { icon: CheckCircle, text: "Verified", color: "bg-green-100 text-green-700" };
      case "PENDING":
        return { icon: Clock, text: "Pending", color: "bg-yellow-100 text-yellow-700" };
      case "REJECTED":
        return { icon: XCircle, text: "Rejected", color: "bg-red-100 text-red-700" };
      default:
        return { icon: Clock, text: "Not Started", color: "bg-gray-100 text-gray-700" };
    }
  };

  const verificationBadge = getStatusBadge(profile?.verificationStatus || "PENDING");
  const permitBadge = getStatusBadge(profile?.permitStatus || "PENDING");
  const approvalBadge = getStatusBadge(profile?.approvalStatus || "PENDING");
  const VerificationIcon = verificationBadge.icon;
  const PermitIcon = permitBadge.icon;
  const ApprovalIcon = approvalBadge.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your personal information and professional details
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Verification Status</h3>
            <Shield className="h-4 w-4 text-gray-400" />
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${verificationBadge.color}`}>
            <VerificationIcon className="h-3 w-3" />
            {verificationBadge.text}
          </span>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Permit Status</h3>
            <Award className="h-4 w-4 text-gray-400" />
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${permitBadge.color}`}>
            <PermitIcon className="h-3 w-3" />
            {permitBadge.text}
          </span>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Approval Status</h3>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${approvalBadge.color}`}>
            <ApprovalIcon className="h-3 w-3" />
            {approvalBadge.text}
          </span>
        </div>
      </div>

      {/* Profile Information */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            ) : (
              <p className="text-gray-900">{formData.gender || "Not specified"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">
                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : "Not specified"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Location Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.address || "Not specified"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.city || "Not specified"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            {isEditing ? (
              <select
                name="stateId"
                value={formData.stateId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{profile?.stateName || "Not specified"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local Government</label>
            {isEditing ? (
              <select
                name="localGovernmentId"
                value={formData.localGovernmentId}
                onChange={handleInputChange}
                disabled={!formData.stateId}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select local government</option>
                {localGovts.map((lg) => (
                  <option key={lg.id} value={lg.id}>
                    {lg.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{profile?.localGovernmentName || "Not specified"}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Working Address</label>
            {isEditing ? (
              <textarea
                name="workingAddress"
                value={formData.workingAddress}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.workingAddress || "Not specified"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Professional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            {isEditing ? (
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.yearsOfExperience || "Not specified"} years</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{formData.bio || "No bio provided"}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            {isEditing ? (
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., Welding, Carpentry, Plumbing"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.skills ? (
                  formData.skills.split(",").map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">My Services</h2>
            <p className="text-sm text-gray-600">Services you offer as an artisan</p>
          </div>
          {isEditing && (
            <button
              onClick={() => setShowServiceModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus className="h-4 w-4" />
              Add Service
            </button>
          )}
        </div>

        {selectedServices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HardHat className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No services added yet</p>
            {isEditing && (
              <button
                onClick={() => setShowServiceModal(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Add your first service
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{service.serviceName}</p>
                  <p className="text-xs text-gray-500">{service.industryName}</p>
                  {service.experience && (
                    <p className="text-xs text-gray-500">{service.experience} years experience</p>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveService(service.serviceId)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Service</h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Service</label>
                <select
                  value={newService.serviceId}
                  onChange={(e) => setNewService({ ...newService, serviceId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.industry.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience (optional)</label>
                <input
                  type="number"
                  value={newService.experience}
                  onChange={(e) => setNewService({ ...newService, experience: e.target.value })}
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., 5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddService}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Service
                </button>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}