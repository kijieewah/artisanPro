// src/app/dashboard/wallet/activate/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Wallet,
  Upload,
  Lock,
  Shield,
  ArrowRight,
  Menu,
  Bell,
  X,
  ArrowDown,
  ChevronDown,
} from "lucide-react";
import Sidebar from "~/ui/components/sidebar/sidebar";
import Header from "~/ui/components/header";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  fname: string;
  lname: string;
  raddr: string;
  caddr: string;
  state: string;
  lga: string;
  dob: string;
  occupation: string;
  identity_type: string;
  identity_number: string;
  gender: string;
}

interface WalletActivationData {
  fname: string;
  lname: string;
  email: string;
  number: string;
  raddr: string;
  caddr: string;
  state: string;
  lga: string;
  dob: string;
  occupation: string;
  identity_type: string;
  identity_number: string;
  gender: string;
  terms_accepted: boolean;
}

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

const WalletActivationPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<WalletActivationData>({
    fname: "",
    lname: "",
    email: "",
    number: "",
    raddr: "",
    caddr: "",
    state: "",
    lga: "",
    dob: "",
    occupation: "",
    identity_type: "bvn",
    identity_number: "",
    gender: "male",
    terms_accepted: false,
  });
  const [fileUploads, setFileUploads] = useState({
    id_front: null as File | null,
    id_back: null as File | null,
    selfie: null as File | null,
  });

  // Header and sidebar states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications: Notification[] = [
    { id: "1", text: "New order received", time: "2 min ago", read: false },
    { id: "2", text: "Payment processed", time: "1 hour ago", read: true },
    {
      id: "3",
      text: "New customer registered",
      time: "3 hours ago",
      read: true,
    },
  ];

// Update the fetchUserData function
useEffect(() => {
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const phone = localStorage.getItem("userPhone") || "";
      
      if (!phone) {
        toast.error("User not authenticated");
        router.push("/login");
        return;
      }

      // Fetch user profile data
      const response = await fetch(`/api/user/profile?phone=${encodeURIComponent(phone)}`);
      if (response.ok) {
        // Type the response
        const data = await response.json() as UserData;
        setUserData(data);
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          fname: data.fname || data.name?.split(" ")[0] || "",
          lname: data.lname || data.name?.split(" ").slice(1).join(" ") || "",
          email: data.email || "",
          number: data.phone || phone,
          raddr: data.raddr || "",
          caddr: data.caddr || "",
          state: data.state || "",
          lga: data.lga || "",
          dob: data.dob || "",
          occupation: data.occupation || "",
          identity_type: data.identity_type || "bvn",
          identity_number: data.identity_number || "",
          gender: data.gender || "male",
        }));
      } else {
        // For demo, use the provided JSON data
        const demoData: UserData = {
          id: "1",
          name: "Muhammad Abubakar",
          email: "test@email.com",
          phone: "08067676443",
          fname: "Muhammad",
          lname: "Abubakar",
          raddr: "My address",
          caddr: "My address",
          state: "Abuja",
          lga: "lugbe",
          dob: "2000-01-01",
          occupation: "Student",
          identity_type: "bvn",
          identity_number: "12345678909",
          gender: "male",
        };
        setUserData(demoData);
        setFormData(prev => ({ 
          ...prev, 
          ...demoData, 
          number: demoData.phone,
          terms_accepted: prev.terms_accepted // Preserve terms_accepted
        }));
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  fetchUserData();
}, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof fileUploads) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, PNG) or PDF file");
        return;
      }

      setFileUploads(prev => ({ ...prev, [field]: file }));
      toast.success(`${field.replace('_', ' ')} uploaded successfully`);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Validate required files
    if (!fileUploads.id_front) {
      toast.error("Please upload the front of your ID document");
      setIsSubmitting(false);
      return;
    }

    if (!fileUploads.selfie) {
      toast.error("Please upload a selfie photo");
      setIsSubmitting(false);
      return;
    }

    if (!formData.terms_accepted) {
      toast.error("Please accept the terms and conditions");
      setIsSubmitting(false);
      return;
    }

    // Prepare form data for submission
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'terms_accepted') {
        formDataToSend.append(key, value.toString());
      }
    });
    
    // Append user ID
    if (userData?.id) {
      formDataToSend.append('userId', userData.id);
    }
    
    // Append files
    Object.entries(fileUploads).forEach(([key, file]) => {
      if (file) {
        formDataToSend.append(key, file);
      }
    });

    // Submit to API
    const response = await fetch("/api/wallet/activate", {
      method: "POST",
      body: formDataToSend,
    });

    if (response.ok) {
      const result = await response.json() as { success?: boolean; message?: string };
      toast.success("Wallet activation submitted successfully!");
      
      // Show success message and redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      // Type the error response
      const error = await response.json() as ErrorResponse;
      toast.error(error.message || "Activation failed. Please try again.");
    }
  } catch (error) {
    console.error("Activation error:", error);
    
    // Handle fetch errors
    if (error instanceof Error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } else {
      toast.error("An error occurred. Please try again.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      {/* Header */}
      <Header
        userData={userData}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 pb-24 transition-all duration-300 md:pb-6 md:p-6">
          <div className="mb-6">
            {/* Back button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Activate Business Wallet
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete your profile to activate payment processing for your business
                  </p>
                </div>
              </div>

              {/* Progress steps */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                    1
                  </div>
                  <span className="mt-2 text-xs font-medium">Personal Info</span>
                </div>
                <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    2
                  </div>
                  <span className="mt-2 text-xs font-medium">ID Verification</span>
                </div>
                <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    3
                  </div>
                  <span className="mt-2 text-xs font-medium">Review & Submit</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Form */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <form onSubmit={handleSubmit}>
                    {/* Personal Information Section */}
                    <div className="border-b p-6 dark:border-gray-700">
                      <h2 className="mb-4 flex items-center text-lg font-semibold">
                        <User className="mr-2 h-5 w-5 text-primary" />
                        Personal Information
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="fname"
                            value={formData.fname}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lname"
                            value={formData.lname}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              type="tel"
                              name="number"
                              value={formData.number}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Date of Birth
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Occupation
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              name="occupation"
                              value={formData.occupation}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-b p-6 dark:border-gray-700">
                      <h2 className="mb-4 flex items-center text-lg font-semibold">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        Address Information
                      </h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Residential Address
                          </label>
                          <textarea
                            name="raddr"
                            value={formData.raddr}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              LGA
                            </label>
                            <input
                              type="text"
                              name="lga"
                              value={formData.lga}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Identity Verification */}
                    <div className="border-b p-6 dark:border-gray-700">
                      <h2 className="mb-4 flex items-center text-lg font-semibold">
                        <CreditCard className="mr-2 h-5 w-5 text-primary" />
                        Identity Verification
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Identity Type
                          </label>
                          <select
                            name="identity_type"
                            value={formData.identity_type}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                          >
                            <option value="bvn">BVN</option>
                            <option value="nin">NIN</option>
                            <option value="passport">International Passport</option>
                            <option value="driver_license">Driver's License</option>
                            <option value="voter_id">Voter's Card</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Identity Number
                          </label>
                          <input
                            type="text"
                            name="identity_number"
                            value={formData.identity_number}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Gender
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={formData.gender === "male"}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Male</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              checked={formData.gender === "female"}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Female</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="border-b p-6 dark:border-gray-700">
                      <h2 className="mb-4 flex items-center text-lg font-semibold">
                        <Upload className="mr-2 h-5 w-5 text-primary" />
                        Document Upload
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm font-medium">Front of ID Document</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Upload JPEG, PNG or PDF (Max 5MB)</p>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, 'id_front')}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="mt-4 hidden"
                            id="id_front"
                          />
                          <label
                            htmlFor="id_front"
                            className="mt-4 inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                          >
                            {fileUploads.id_front ? 'Change File' : 'Upload File'}
                          </label>
                          {fileUploads.id_front && (
                            <p className="mt-2 text-sm text-green-600">
                              ✓ {fileUploads.id_front.name}
                            </p>
                          )}
                        </div>
                        
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm font-medium">Back of ID Document (Optional)</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Upload JPEG, PNG or PDF (Max 5MB)</p>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, 'id_back')}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="mt-4 hidden"
                            id="id_back"
                          />
                          <label
                            htmlFor="id_back"
                            className="mt-4 inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                          >
                            {fileUploads.id_back ? 'Change File' : 'Upload File'}
                          </label>
                          {fileUploads.id_back && (
                            <p className="mt-2 text-sm text-green-600">
                              ✓ {fileUploads.id_back.name}
                            </p>
                          )}
                        </div>
                        
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm font-medium">Selfie with ID</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Take a clear selfie holding your ID</p>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, 'selfie')}
                            accept=".jpg,.jpeg,.png"
                            className="mt-4 hidden"
                            id="selfie"
                          />
                          <label
                            htmlFor="selfie"
                            className="mt-4 inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                          >
                            {fileUploads.selfie ? 'Change File' : 'Upload File'}
                          </label>
                          {fileUploads.selfie && (
                            <p className="mt-2 text-sm text-green-600">
                              ✓ {fileUploads.selfie.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="p-6">
                      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <div className="flex items-start">
                          <Shield className="mr-3 h-5 w-5 text-blue-500" />
                          <div>
                            <h3 className="font-medium text-blue-900 dark:text-blue-300">
                              Security & Privacy Notice
                            </h3>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                              Your information is encrypted and secure. We use bank-level security to protect your data.
                              Identity verification is required for regulatory compliance and to prevent fraud.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            name="terms_accepted"
                            checked={formData.terms_accepted}
                            onChange={handleInputChange}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-3 text-sm">
                            I agree to the{" "}
                            <a href="/terms" className="text-primary hover:underline">
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </a>
                            . I confirm that all information provided is accurate and complete.
                          </span>
                        </label>
                      </div>
                      
                      <div className="mt-8 flex gap-4">
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard")}
                          className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              Submit for Verification
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right column - Information */}
              <div className="space-y-6">
                {/* Requirements Card */}
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 flex items-center text-lg font-semibold">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Requirements
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600">
                        ✓
                      </div>
                      <span className="text-sm">Valid government-issued ID</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600">
                        ✓
                      </div>
                      <span className="text-sm">Clear selfie photo with ID</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600">
                        ✓
                      </div>
                      <span className="text-sm">Complete personal information</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600">
                        ✓
                      </div>
                      <span className="text-sm">Valid residential address</span>
                    </li>
                  </ul>
                </div>

                {/* Processing Time Card */}
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 flex items-center text-lg font-semibold">
                    <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                    Processing Time
                  </h3>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        ⏱️ Verification usually takes 24-48 hours
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You'll receive an email notification once your wallet is activated and ready for use.
                    </p>
                  </div>
                </div>

                {/* Benefits Card */}
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 flex items-center text-lg font-semibold">
                    <Lock className="mr-2 h-5 w-5 text-blue-500" />
                    Wallet Benefits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        💳
                      </div>
                      <div>
                        <p className="text-sm font-medium">Accept Payments</p>
                        <p className="text-xs text-gray-500">Receive customer payments securely</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        📊
                      </div>
                      <div>
                        <p className="text-sm font-medium">Track Earnings</p>
                        <p className="text-xs text-gray-500">Monitor your business revenue</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        🏦
                      </div>
                      <div>
                        <p className="text-sm font-medium">Withdraw Funds</p>
                        <p className="text-xs text-gray-500">Transfer to your bank account</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Card */}
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold">Need Help?</h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Contact our support team for assistance with verification.
                  </p>
                  <button
                    onClick={() => router.push("/support")}
                    className="w-full rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 dark:border-primary dark:bg-gray-700 dark:text-primary dark:hover:bg-primary/10"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WalletActivationPage;