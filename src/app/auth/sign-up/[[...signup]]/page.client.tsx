// app/auth/sign-up/page.client.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  HardHat,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  Lock,
  Calendar,
  Home,
  Briefcase,
  Award,
  AlertCircle,
  Plus,
  X,
  Info,
  FileText,
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
interface State {
  id: number;
  name: string;
}

interface LocalGovernment {
  id: number;
  name: string;
  stateId: number;
}

interface Industry {
  id: number;
  name: string;
}

interface Requirement {
  id: number;
  name: string;
  type: "MANDATORY" | "OPTIONAL";
}

interface Service {
  id: number;
  name: string;
  description: string;
  requirements: Requirement[];
}

export function SignUpClient() {
  const router = useRouter();
  const [step, setStep] = useState<"location" | "personal" | "professional">("location");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Data from API
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<LocalGovernment[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceRequirements, setServiceRequirements] = useState<Requirement[]>([]);
  
  // Selected values
  const [selectedState, setSelectedState] = useState("");
  const [selectedLGA, setSelectedLGA] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
    yearsOfExperience: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    bio: "",
    skills: [] as string[],
    newSkill: "",
  });

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/states");
        const data = await response.json();
        if (data.success) {
          setStates(data.data);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    
    const fetchIndustries = async () => {
      try {
        const response = await fetch("/api/industries");
        const data = await response.json();
        if (data.success) {
          setIndustries(data.data);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
      }
    };
    
    fetchStates();
    fetchIndustries();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    const fetchLGAs = async () => {
      if (selectedState) {
        try {
          const response = await fetch(`/api/states/${selectedState}/lgas`);
          const data = await response.json();
          if (data.success) {
            setLgas(data.data);
          }
        } catch (error) {
          console.error("Error fetching LGAs:", error);
        }
      } else {
        setLgas([]);
      }
    };
    
    fetchLGAs();
  }, [selectedState]);

  // Fetch services when industry changes
  useEffect(() => {
    const fetchServices = async () => {
      if (selectedIndustry) {
        try {
          const response = await fetch(`/api/industries/${selectedIndustry}/services`);
          const data = await response.json();
          if (data.success) {
            setServices(data.data);
          }
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      } else {
        setServices([]);
      }
    };
    
    fetchServices();
  }, [selectedIndustry]);

  // Update requirements when service changes
  useEffect(() => {
    if (selectedService) {
      const service = services.find(s => s.id.toString() === selectedService);
      setServiceRequirements(service?.requirements || []);
    } else {
      setServiceRequirements([]);
    }
  }, [selectedService, services]);

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    const selectedStateObj = states.find(s => s.id.toString() === stateId);
    setFormData(prev => ({ ...prev, state: selectedStateObj?.name || "" }));
    setSelectedLGA("");
  };

  const handleIndustryChange = (industryId: string) => {
    setSelectedIndustry(industryId);
    setSelectedService("");
    setServiceRequirements([]);
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: "",
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const validateLocationStep = () => {
    if (!selectedState || !selectedLGA) {
      setError("Please select your state and local government area");
      return false;
    }
    setError("");
    return true;
  };

  const validatePersonalStep = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email) {
      setError("Please enter your email address");
      return false;
    }
    if (!formData.phone) {
      setError("Please enter your phone number");
      return false;
    }
    if (!formData.password) {
      setError("Please enter a password");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!formData.gender) {
      setError("Please select your gender");
      return false;
    }
    setError("");
    return true;
  };

  const validateProfessionalStep = () => {
    if (!selectedIndustry) {
      setError("Please select your industry");
      return false;
    }
    if (!selectedService) {
      setError("Please select your profession/trade");
      return false;
    }
    if (!formData.yearsOfExperience) {
      setError("Please enter your years of experience");
      return false;
    }
    if (!formData.address) {
      setError("Please enter your working address");
      return false;
    }
    setError("");
    return true;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "location" && validateLocationStep()) {
      setStep("personal");
    } else if (step === "personal" && validatePersonalStep()) {
      setStep("professional");
    } else if (step === "professional" && validateProfessionalStep()) {
      handleSubmit(e);
    }
  };

  const handleBack = () => {
    if (step === "personal") setStep("location");
    if (step === "professional") setStep("personal");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("password", formData.password);
      submitData.append("gender", formData.gender);
      submitData.append("dateOfBirth", formData.dateOfBirth);
      submitData.append("stateId", selectedState);
      submitData.append("lgaId", selectedLGA);
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      submitData.append("postalCode", formData.postalCode);
      submitData.append("serviceId", selectedService);
      submitData.append("yearsOfExperience", formData.yearsOfExperience);
      submitData.append("bio", formData.bio);
      submitData.append("skills", JSON.stringify(formData.skills));
      submitData.append("role", "ARTISAN");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but login failed. Please sign in manually.");
        router.push("/auth/signin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    if (step === "location") return 1;
    if (step === "personal") return 2;
    return 3;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.light }}>
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center">
              <div className="relative h-14 w-auto">
                <Image
                  src="/uploads/artisanPro.png"
                  alt="ArtisanPro Logo"
                  width={140}
                  height={56}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <h2 className="text-2xl font-bold mt-4" style={{ color: colors.primary }}>
              {step === "location" && "Where do you work?"}
              {step === "personal" && "Create Your Account"}
              {step === "professional" && "Professional Details"}
            </h2>
            <p className="text-gray-500 mt-1">
              {step === "location" && "Select your state and local government area"}
              {step === "personal" && "Tell us about yourself"}
              {step === "professional" && "Tell us about your expertise"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: colors.primary }}>
                  {getStepNumber() > 1 ? <CheckCircle className="h-5 w-5" /> : 1}
                </div>
                <span className="ml-2 text-sm text-gray-600">Location</span>
              </div>
              <div className="flex-1 h-0.5 mx-4" style={{ backgroundColor: getStepNumber() > 1 ? colors.primary : "#e5e7eb" }} />
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getStepNumber() >= 2 ? "text-white" : "bg-gray-200 text-gray-500"}`} style={{ backgroundColor: getStepNumber() >= 2 ? colors.primary : undefined }}>
                  {getStepNumber() > 2 ? <CheckCircle className="h-5 w-5" /> : 2}
                </div>
                <span className="ml-2 text-sm text-gray-600">Personal</span>
              </div>
              <div className="flex-1 h-0.5 mx-4" style={{ backgroundColor: getStepNumber() > 2 ? colors.primary : "#e5e7eb" }} />
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getStepNumber() >= 3 ? "text-white" : "bg-gray-200 text-gray-500"}`} style={{ backgroundColor: getStepNumber() >= 3 ? colors.primary : undefined }}>
                  3
                </div>
                <span className="ml-2 text-sm text-gray-600">Professional</span>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleContinue}>
              {/* Step 1: Location Selection */}
              {step === "location" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <MapPin className="h-16 w-16 mx-auto mb-3" style={{ color: colors.primary }} />
                    <p className="text-gray-600">Select your location to get started with your artisan certification</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Select State *
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                      required
                    >
                      <option value="">Select your state</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedState && lgas.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                        Select Local Government Area *
                      </label>
                      <select
                        value={selectedLGA}
                        onChange={(e) => setSelectedLGA(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      >
                        <option value="">Select LGA</option>
                        {lgas.map((lga) => (
                          <option key={lga.id} value={lga.id}>{lga.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                      Already have an account?{" "}
                      <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: colors.primary }}>
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {step === "personal" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234 XXX XXX XXXX"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Gender *
                    </label>
                    <div className="flex gap-4">
                      {["Male", "Female", "Other"].map((g) => (
                        <label key={g} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={formData.gender === g}
                            onChange={handleChange}
                            className="w-4 h-4"
                            style={{ accentColor: colors.primary }}
                          />
                          <span className="text-sm">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Professional Information */}
              {step === "professional" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Select Sector*
                    </label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => handleIndustryChange(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                      required
                    >
                      <option value="">Select Sector</option>
                      {industries.map((industry) => (
                        <option key={industry.id} value={industry.id}>{industry.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedIndustry && services.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                        Select Skill /Trade *
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      >
                        <option value="">Select Skill /Trade</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Working Address *
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Your business address or workshop location"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="Postal code"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Bio / About Your Work
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell us about your experience, specialties, and what makes you unique..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                      Skills & Certifications
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formData.newSkill}
                        onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                        placeholder="e.g., Certified Electrician, OSHA Certified"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 rounded-lg text-white transition-all"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
                        >
                          <Award className="h-3 w-3" />
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:opacity-70 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Press Enter or click Add to add multiple skills</p>
                  </div>

                  {/* Requirements Section - Display Only */}
                  {selectedService && serviceRequirements.length > 0 && (
                    <div className="border-t pt-6 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5" style={{ color: colors.primary }} />
                        <h3 className="text-lg font-semibold" style={{ color: colors.primary }}>
                          Certification Requirements
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        The following documents are required for your certification. You can upload them later from your dashboard.
                      </p>
                      <div className="space-y-3">
                        {serviceRequirements.map((req) => (
                          <div
                            key={req.id}
                            className="border rounded-lg p-4 flex items-start gap-3"
                            style={{ borderColor: `${colors.primary}20` }}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: req.type === "MANDATORY" ? "#fee2e2" : "#e5e7eb" }}>
                                <span className="text-xs" style={{ color: req.type === "MANDATORY" ? "#dc2626" : "#6b7280" }}>!</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold" style={{ color: colors.primary }}>
                                  {req.name}
                                </span>
                                {req.type === "MANDATORY" ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Mandatory</span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Optional</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${colors.accent}10` }}>
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-0.5" style={{ color: colors.accent }} />
                          <p className="text-xs text-gray-600">
                            You will be able to upload these documents from your dashboard after registration.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 rounded-lg text-sm flex items-center gap-2" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {step !== "location" && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-6 py-2 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : step === "professional" ? (
                    "Complete Registration"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}