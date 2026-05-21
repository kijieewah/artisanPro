"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardHat,
  CheckCircle,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Sparkles,
  AlertCircle,
  Loader2,
  Building2,
  Briefcase,
  FileText,
  Info,
  Plus,
  Trash2,
} from "lucide-react";

// Brand Colors
const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

// Nigerian States (Fallback)
const FALLBACK_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "FCT Abuja"
];

// Partner Types
const PARTNER_TYPES = [
  { value: "TRAINING_PROVIDER", label: "Training Provider" },
  { value: "CERTIFICATION_BODY", label: "Certification Body" },
  { value: "GOVERNMENT_AGENCY", label: "Government Agency" },
  { value: "TRADE_SCHOOL", label: "Trade School" },
  { value: "INDUSTRY_ASSOCIATION", label: "Industry Association" },
  { value: "OTHER", label: "Other" }
];

// --- Type Definitions ---
interface Industry {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

interface Service {
  id: number;
  name: string;
  description: string;
  industryId: number;
  status: boolean;
  requirements?: Requirement[];
}

interface Requirement {
  id: number;
  name: string;
  type: "MANDATORY" | "OPTIONAL";
}

interface SelectedIndustryService {
  industryId: number;
  industryName: string;
  serviceIds: number[];
  services: Service[];
}

interface State {
  id: number;
  name: string;
}

// API Response Types
interface IndustriesApiResponse {
  success?: boolean;
  data?: Industry[];
  industries?: Industry[];
}

interface ServicesApiResponse {
  success?: boolean;
  data?: Service[];
  services?: Service[];
}

interface SingleIndustryServicesApiResponse {
  success?: boolean;
  data?: Service[];
}

interface StatesApiResponse {
  success?: boolean;
  data?: State[];
}

export function PartnersPageClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"organization" | "contact" | "services">("organization");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Data from API
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingStates, setLoadingStates] = useState(true);
  
  // Multi-selection states
  const [selectedIndustriesServices, setSelectedIndustriesServices] = useState<SelectedIndustryService[]>([]);
  const [currentIndustryId, setCurrentIndustryId] = useState("");
  const [currentIndustryServices, setCurrentIndustryServices] = useState<Service[]>([]);
  const [selectedServiceIdsForCurrent, setSelectedServiceIdsForCurrent] = useState<number[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    registrationNumber: "",
    taxId: "",
    businessEmail: "",
    businessPhone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    description: "",
    partnerType: "TRAINING_PROVIDER",
    contactName: "",
    contactPosition: "",
    contactEmail: "",
    contactPhone: "",
  });
  
  // File states
  const [accreditationDoc, setAccreditationDoc] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);

  // --- Data Fetching with Type Assertions ---
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoadingIndustries(true);
        const response = await fetch("/api/industries");
        const result = (await response.json()) as IndustriesApiResponse;
        
        if (result.success && result.data) {
          setIndustries(result.data);
        } else if (Array.isArray(result)) {
          setIndustries(result as Industry[]);
        } else if (result.industries) {
          setIndustries(result.industries);
        } else {
          setIndustries([]);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
        setIndustries([]);
      } finally {
        setLoadingIndustries(false);
      }
    };
    
    fetchIndustries();
  }, []);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const response = await fetch("/api/services");
        const result = (await response.json()) as ServicesApiResponse;
        
        if (result.success && result.data) {
          setAllServices(result.data);
        } else if (Array.isArray(result)) {
          setAllServices(result as Service[]);
        } else if (result.services) {
          setAllServices(result.services);
        }
      } catch (error) {
        console.error("Error fetching all services:", error);
      }
    };
    
    fetchAllServices();
  }, []);

  useEffect(() => {
    const fetchServicesForIndustry = async () => {
      if (!currentIndustryId) {
        setCurrentIndustryServices([]);
        return;
      }
      
      try {
        setLoadingServices(true);
        const response = await fetch(`/api/industries/${currentIndustryId}/services`);
        const result = (await response.json()) as SingleIndustryServicesApiResponse;
        
        if (result.success && result.data) {
          setCurrentIndustryServices(result.data);
        } else if (Array.isArray(result)) {
          setCurrentIndustryServices(result as Service[]);
        } else {
          setCurrentIndustryServices([]);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setCurrentIndustryServices([]);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchServicesForIndustry();
  }, [currentIndustryId]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const response = await fetch("/api/states");
        const result = (await response.json()) as StatesApiResponse;
        
        if (result.success && result.data) {
          setStates(result.data);
        } else if (Array.isArray(result)) {
          setStates(result as State[]);
        } else {
          setStates([]);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };
    
    fetchStates();
  }, []);

  // --- Scroll Handling & UI Effects ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // --- Modal Control Functions ---
  const openModal = () => {
    setFormData({
      businessName: "",
      registrationNumber: "",
      taxId: "",
      businessEmail: "",
      businessPhone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      description: "",
      partnerType: "TRAINING_PROVIDER",
      contactName: "",
      contactPosition: "",
      contactEmail: "",
      contactPhone: "",
    });
    setSelectedIndustriesServices([]);
    setCurrentIndustryId("");
    setSelectedServiceIdsForCurrent([]);
    setAccreditationDoc(null);
    setLogo(null);
    setError("");
    setSubmitMessage("");
    setStep("organization");
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setSubmitMessage("");
    setStep("organization");
    document.body.style.overflow = "unset";
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSubmitMessage("");
  };

  // --- Form Input Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'accreditation' | 'logo') => {
    const file = e.target.files?.[0] || null;
    if (type === 'accreditation') {
      setAccreditationDoc(file);
    } else {
      setLogo(file);
    }
  };

  // --- Industry/Service Selection Logic ---
  const addIndustryService = () => {
    if (!currentIndustryId) {
      setError("Please select an industry");
      return;
    }
    
    const industry = industries.find(i => i.id.toString() === currentIndustryId);
    if (!industry) return;
    
    if (selectedIndustriesServices.some(item => item.industryId.toString() === currentIndustryId)) {
      setError("This industry has already been added");
      return;
    }
    
    const selectedServices = currentIndustryServices.filter(s => selectedServiceIdsForCurrent.includes(s.id));
    
    setSelectedIndustriesServices(prev => [
      ...prev,
      {
        industryId: industry.id,
        industryName: industry.name,
        serviceIds: selectedServiceIdsForCurrent,
        services: selectedServices,
      }
    ]);
    
    setCurrentIndustryId("");
    setSelectedServiceIdsForCurrent([]);
    setError("");
  };

  const removeIndustryService = (industryId: number) => {
    setSelectedIndustriesServices(prev => prev.filter(item => item.industryId !== industryId));
  };

  const toggleServiceForCurrent = (serviceId: number) => {
    setSelectedServiceIdsForCurrent(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // --- Step Validation ---
  const validateOrganizationStep = () => {
    if (!formData.businessName || !formData.registrationNumber || !formData.businessEmail || 
        !formData.businessPhone || !formData.address || !formData.city || !formData.state) {
      setError("Please fill all required fields in Organization Details");
      return false;
    }
    if (!accreditationDoc) {
      setError("Please upload your accreditation document");
      return false;
    }
    setError("");
    return true;
  };

  const validateContactStep = () => {
    if (!formData.contactName || !formData.contactPosition || !formData.contactEmail || !formData.contactPhone) {
      setError("Please fill all contact person details");
      return false;
    }
    setError("");
    return true;
  };

  const validateServicesStep = () => {
    if (selectedIndustriesServices.length === 0) {
      setError("Please add at least one industry and service");
      return false;
    }
    setError("");
    return true;
  };

  // --- Form Submission ---
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "organization" && validateOrganizationStep()) {
      setStep("contact");
    } else if (step === "contact" && validateContactStep()) {
      setStep("services");
    } else if (step === "services" && validateServicesStep()) {
      handleSubmit(e);
    }
  };

  const handleBack = () => {
    if (step === "contact") setStep("organization");
    if (step === "services") setStep("contact");
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");
  setSubmitMessage("");

  const industriesData = selectedIndustriesServices.map(item => ({
    industryId: item.industryId,
    serviceIds: item.serviceIds,
  }));

  try {
    const submitData = new FormData();
    submitData.append("businessName", formData.businessName);
    submitData.append("registrationNumber", formData.registrationNumber);
    submitData.append("taxId", formData.taxId || "");
    submitData.append("businessEmail", formData.businessEmail);
    submitData.append("businessPhone", formData.businessPhone);
    submitData.append("website", formData.website || "");
    submitData.append("address", formData.address);
    submitData.append("city", formData.city);
    submitData.append("state", formData.state);
    submitData.append("description", formData.description || "");
    submitData.append("partnerType", formData.partnerType);
    submitData.append("contactName", formData.contactName);
    submitData.append("contactPosition", formData.contactPosition);
    submitData.append("contactEmail", formData.contactEmail);
    submitData.append("contactPhone", formData.contactPhone);
    submitData.append("industries", JSON.stringify(industriesData));
    
    // Only append files if they exist (not null)
    if (accreditationDoc) {
      submitData.append("accreditationDoc", accreditationDoc);
    }
    
    if (logo) {
      submitData.append("logo", logo);
    }

    const response = await fetch("/api/partners/register", {
      method: "POST",
      body: submitData,
    });

    const data = await response.json() as { error?: string };

    if (!response.ok) {
      throw new Error(data.error || "Application failed");
    }

    setSubmitMessage("✓ Application received! Our partnership team will contact you within 3-5 business days.");
    setShowModal(false);
    setShowSuccessModal(true);
    
    // Reset form
    setFormData({
      businessName: "", registrationNumber: "", taxId: "", businessEmail: "", businessPhone: "",
      website: "", address: "", city: "", state: "", description: "", partnerType: "TRAINING_PROVIDER",
      contactName: "", contactPosition: "", contactEmail: "", contactPhone: "",
    });
    setSelectedIndustriesServices([]);
    setAccreditationDoc(null);
    setLogo(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Application failed");
  } finally {
    setSubmitting(false);
  }
};

  // --- Render Data ---
  const partnerTypes = [
    {
      id: "training",
      icon: "🎓",
      title: "Training Partners",
      description: "Technical colleges, vocational institutes, private academies, NGOs, industry training centers.",
      benefits: [
        "Access to artisans seeking skills upgrades",
        "Promote training programs on ArtisanPro",
        "Pipeline of students seeking certification",
      ],
    },
    {
      id: "certification",
      icon: "📜",
      title: "Certification Partners",
      description: "Professional bodies, sector skills councils, trade boards, industry associations.",
      benefits: [
        "Direct access to certification seekers",
        "Increased certification uptake",
        "Digital verification integration",
      ],
    },
    {
      id: "licensing",
      icon: "🪪",
      title: "Licensing Partners",
      description: "Professional licensing boards, trade authorities, government permit offices.",
      benefits: [
        "Verify licensed artisans on platform",
        "Increased compliance among artisans",
        "Digital license verification",
      ],
    },
    {
      id: "regulatory",
      icon: "🏛️",
      title: "Regulatory Partners",
      description: "Government agencies, standards organizations, skills development bodies.",
      benefits: [
        "Access to industry data",
        "Improved regulatory oversight",
        "National workforce initiatives",
      ],
    },
  ];

  const availableIndustries = industries.filter(
    i => i.status && !selectedIndustriesServices.some(s => s.industryId === i.id)
  );

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white ${scrolled ? "shadow-md py-3" : "py-4"}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: colors.primary }}>
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold" style={{ color: colors.primary }}>ArtisanPro</span>
                <span className="text-xs text-gray-500 block -mt-1">NG</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-[#16507b] transition-colors">Home</Link>
              <Link href="/partners" className="text-[#16507b] font-semibold transition-colors">Partners</Link>
              <Link href="/#services" className="text-gray-600 hover:text-[#16507b] transition-colors">Services</Link>
              <Link href="/#faq" className="text-gray-600 hover:text-[#16507b] transition-colors">FAQ</Link>
              <Link href="/#contact" className="text-gray-600 hover:text-[#16507b] transition-colors">Contact</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/auth/signin" className="px-4 py-2 rounded-full font-semibold transition-all" style={{ border: `2px solid ${colors.primary}`, color: colors.primary }}>
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-5 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg text-white" style={{ backgroundColor: colors.primary }}>
                Get Started
              </Link>
            </div>
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-4 px-4">
              <div className="flex flex-col space-y-3">
                <Link href="/" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/partners" className="py-2 text-[#16507b] font-semibold" onClick={() => setMobileMenuOpen(false)}>Partners</Link>
                <Link href="/#services" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                <Link href="/#faq" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <Link href="/#contact" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2">
                  <Link href="/auth/signin" className="text-center py-2 rounded-full border-2" style={{ borderColor: colors.primary, color: colors.primary }} onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Link href="/auth/signup" className="text-center text-white py-2 rounded-full" style={{ backgroundColor: colors.primary }} onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 text-center" style={{ backgroundColor: colors.light }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Partner With Us</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.primary }}>Partner with ArtisanPro</h1>
              <p className="text-lg text-gray-600 mb-4">Building Nigeria's most trusted ecosystem for skilled artisans.</p>
              <p className="text-gray-500">ArtisanPro works with training institutions, certification organizations, licensing bodies, and regulatory authorities to build a trusted marketplace for skilled artisans.</p>
            </div>
          </div>
        </section>

        {/* Why Partner Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border-l-4" style={{ borderLeftColor: colors.accent }}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                <span style={{ color: colors.accent }}>🤝</span> Why Partner with ArtisanPro?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Access to a growing artisan workforce</strong> – Connect with thousands of skilled professionals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Visibility on a national digital platform</strong> – Showcase your services to a nationwide audience.</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Data insights on skills demand</strong> – Make data-driven decisions with real-time industry trends.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Collaboration on workforce development programs</strong> – Joint initiatives that shape the future.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Cards Section - Now with one Apply Now button */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.primary }}>Who Should Partner?</h2>
              <p className="text-gray-600">Join the ecosystem that's elevating skilled trades across Nigeria</p>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: colors.accent }}></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {partnerTypes.map((partner) => (
                <div key={partner.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 text-center flex flex-col h-full">
                  <div className="text-5xl mb-4">{partner.icon}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>{partner.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{partner.description}</p>
                  <ul className="text-left text-sm space-y-2 mb-4 flex-grow">
                    {partner.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {/* Single Apply Now Button */}
            <div className="text-center mt-10">
              <button
                onClick={openModal}
                className="px-8 py-3 rounded-full text-white font-semibold text-lg transition-all hover:opacity-90 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: colors.primary }}
              >
                Apply Now
              </button>
              <p className="text-sm text-gray-500 mt-3">All partner types use the same application form</p>
            </div>
          </div>
        </section>

        {/* Partner Approval Process */}
        <section className="py-12" style={{ backgroundColor: colors.light }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>Partner Approval Process</h3>
                  <ol className="space-y-2 list-decimal list-inside text-gray-700">
                    <li>Application submission</li>
                    <li>Document verification</li>
                    <li>Internal review by ArtisanPro Partnership Committee</li>
                    <li>Due diligence</li>
                    <li>Partner approval and onboarding</li>
                  </ol>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-7xl mb-3">🤝</div>
                  <p className="italic text-gray-500">"Building a trusted ecosystem for skilled artisans"</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-12 pb-8" style={{ backgroundColor: colors.light }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <HardHat className="h-8 w-8 mb-3" style={{ color: colors.accent }} />
              <h4 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>ArtisanPro.ng</h4>
              <p className="text-sm text-gray-600">Empowering Nigerian artisans through certification, training, and marketplace connections.</p>
            </div>
            <div>
              <h5 className="font-bold mb-3" style={{ color: colors.primary }}>Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/partners">Partners</Link></li>
                <li><Link href="/#services">Services</Link></li>
                <li><Link href="/#faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3" style={{ color: colors.primary }}>Resources</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/partners">Become a Partner</Link></li>
                <li><Link href="#">Certification Info</Link></li>
                <li><Link href="#">For Enterprises</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3" style={{ color: colors.primary }}>Contact</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  16A Dr Muktari Musa Road, Life Camp, Abuja
                </li>
                <li><Phone className="inline h-4 w-4 mr-2" />+234 906 000 8771</li>
                <li><Mail className="inline h-4 w-4 mr-2" />partners@artisanpro.ng</li>
              </ul>
              <div className="flex gap-4 mt-4">
                <Link href="#" className="hover:opacity-70" style={{ color: colors.secondary }}><Facebook className="h-5 w-5" /></Link>
                <Link href="#" className="hover:opacity-70" style={{ color: colors.secondary }}><Twitter className="h-5 w-5" /></Link>
                <Link href="#" className="hover:opacity-70" style={{ color: colors.secondary }}><Instagram className="h-5 w-5" /></Link>
                <Link href="#" className="hover:opacity-70" style={{ color: colors.secondary }}><Linkedin className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
          <hr className="my-6" style={{ borderColor: `${colors.primary}20` }} />
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ArtisanPro.ng. All rights reserved. | <Link href="/privacy" className="hover:underline">Privacy Policy</Link></p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        style={{ backgroundColor: colors.primary }}
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeSuccessModal}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>Application Submitted!</h3>
            <p className="text-gray-600 mb-4">{submitMessage}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>What happens next?</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Our partnership team will review your application</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>You'll receive an email within 3-5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>We may contact you for additional information</span>
                </li>
              </ul>
            </div>
            <button
              onClick={closeSuccessModal}
              className="w-full py-2 rounded-full text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex justify-between items-center p-4 border-b" style={{ backgroundColor: colors.light, borderBottomColor: colors.accent }}>
              <h3 className="text-xl font-bold" style={{ color: colors.primary }}>
                Partner Application
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white`} style={{ backgroundColor: colors.primary }}>
                      1
                    </div>
                    <span className="ml-2 text-xs text-gray-600">Organization</span>
                  </div>
                  <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: step === "contact" || step === "services" ? colors.primary : "#e5e7eb" }} />
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${step === "contact" || step === "services" ? "text-white" : "bg-gray-200 text-gray-500"}`} style={{ backgroundColor: step === "contact" || step === "services" ? colors.primary : undefined }}>
                      2
                    </div>
                    <span className="ml-2 text-xs text-gray-600">Contact</span>
                  </div>
                  <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: step === "services" ? colors.primary : "#e5e7eb" }} />
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${step === "services" ? "text-white" : "bg-gray-200 text-gray-500"}`} style={{ backgroundColor: step === "services" ? colors.primary : undefined }}>
                      3
                    </div>
                    <span className="ml-2 text-xs text-gray-600">Services</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <form onSubmit={handleContinue}>
                {/* Step 1: Organization Details */}
                {step === "organization" && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <Building2 className="h-12 w-12 mx-auto mb-2" style={{ color: colors.primary }} />
                      <p className="text-sm text-gray-600">Tell us about your organization</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Organization Name *</label>
                        <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Registration Number *</label>
                        <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Tax ID</label>
                        <input type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Business Email *</label>
                        <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Business Phone *</label>
                        <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Website</label>
                        <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Street Address *</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>State *</label>
                        <select name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required>
                          <option value="">Select State</option>
                          {loadingStates ? (
                            <option disabled>Loading states...</option>
                          ) : (
                            (states.length > 0 ? states : FALLBACK_STATES.map((s, i) => ({ id: i + 1, name: s }))).map((state) => (
                              <option key={state.id} value={state.name}>{state.name}</option>
                            ))
                          )}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Organization Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" placeholder="Tell us about your organization, mission, and how you'd like to partner with ArtisanPro" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Partner Type *</label>
                        <select name="partnerType" value={formData.partnerType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required>
                          {PARTNER_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Accreditation Document *</label>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'accreditation')} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold" required />
                        <p className="text-xs text-gray-500 mt-1">Upload PDF, JPG, or PNG (max 5MB)</p>
                        {accreditationDoc && <p className="text-xs text-green-600 mt-1">✓ {accreditationDoc.name}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Organization Logo</label>
                        <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'logo')} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold" />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 500x500px, PNG or JPG (max 2MB)</p>
                        {logo && <p className="text-xs text-green-600 mt-1">✓ {logo.name}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Person */}
                {step === "contact" && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <Phone className="h-12 w-12 mx-auto mb-2" style={{ color: colors.primary }} />
                      <p className="text-sm text-gray-600">Tell us who to contact</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Full Name *</label>
                        <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Position *</label>
                        <input type="text" name="contactPosition" value={formData.contactPosition} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Email *</label>
                        <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Phone *</label>
                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]" required />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Multiple Industries & Services Selection */}
                {step === "services" && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <Briefcase className="h-12 w-12 mx-auto mb-2" style={{ color: colors.primary }} />
                      <p className="text-sm text-gray-600">Select industries and services your organization offers</p>
                      <p className="text-xs text-gray-500 mt-1">You can add multiple industries and services</p>
                    </div>

                    {/* Add New Industry & Services Section */}
                    <div className="border rounded-lg p-4" style={{ borderColor: `${colors.primary}20` }}>
                      <h4 className="font-medium mb-3 text-sm" style={{ color: colors.primary }}>Add Industry & Services</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>Select Industry *</label>
                          <select
                            value={currentIndustryId}
                            onChange={(e) => setCurrentIndustryId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16507b]"
                          >
                            <option value="">Select industry</option>
                            {availableIndustries.map((industry) => (
                              <option key={industry.id} value={industry.id.toString()}>{industry.name}</option>
                            ))}
                          </select>
                        </div>

                        {currentIndustryId && (
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: colors.primary }}>
                              Select Services (Optional - leave empty to select all services later)
                            </label>
                            {loadingServices ? (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading services...
                              </div>
                            ) : currentIndustryServices.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                                {currentIndustryServices.map((service) => (
                                  <label key={service.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedServiceIdsForCurrent.includes(service.id)}
                                      onChange={() => toggleServiceForCurrent(service.id)}
                                      className="rounded"
                                      style={{ accentColor: colors.primary }}
                                    />
                                    <span className="text-sm">{service.name}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No services available for this industry</p>
                            )}
                            {selectedServiceIdsForCurrent.length > 0 && (
                              <p className="text-xs text-green-600 mt-1">{selectedServiceIdsForCurrent.length} service(s) selected</p>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={addIndustryService}
                          className="w-full py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Plus className="h-4 w-4" />
                          Add Industry
                        </button>
                      </div>
                    </div>

                    {/* Selected Industries & Services List */}
                    {selectedIndustriesServices.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-sm" style={{ color: colors.primary }}>Selected Industries & Services</h4>
                        <div className="space-y-3">
                          {selectedIndustriesServices.map((item) => (
                            <div key={item.industryId} className="border rounded-lg p-3" style={{ borderColor: `${colors.primary}20`, backgroundColor: `${colors.primary}05` }}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="h-4 w-4" style={{ color: colors.primary }} />
                                    <h5 className="font-semibold" style={{ color: colors.primary }}>{item.industryName}</h5>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.accent}20`, color: "#b45309" }}>
                                      {item.serviceIds.length} service(s)
                                    </span>
                                  </div>
                                  {item.services.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 ml-6">
                                      {item.services.map((service) => (
                                        <span key={service.id} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
                                          {service.name}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500 ml-6">No specific services selected (will offer all services in this industry)</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeIndustryService(item.industryId)}
                                  className="p-1 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedIndustriesServices.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg" style={{ borderColor: `${colors.primary}30` }}>
                        <Building2 className="h-12 w-12 mx-auto mb-2" style={{ color: `${colors.primary}50` }} />
                        <p className="text-sm text-gray-500">No industries added yet</p>
                        <p className="text-xs text-gray-400">Use the form above to add industries and services</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                  {step !== "organization" && (
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
                    disabled={submitting}
                    className="flex-1 px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : step === "services" ? (
                      "Submit Application"
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}