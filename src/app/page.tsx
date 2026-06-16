// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  FileCheck,
  GraduationCap,
  HardHat,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  QrCode,
  Shield,
  Star,
  Twitter,
  Users,
  X,
  Zap,
  Sparkles,
  TrendingUp,
  Briefcase,
  BarChart3,
  ChevronDown,
  ArrowUp,
  Facebook,
  MessageCircle,
} from "lucide-react";

// ============================================
// BRAND COLORS (exact from Bootstrap version)
// ============================================
const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

// ============================================
// MOCK DATA
// ============================================

const features = [
  {
    icon: FileCheck,
    title: "Digital Certification",
    description: "Get verifiable digital certificates with unique QR codes that employers can validate instantly.",
  },
  {
    icon: GraduationCap,
    title: "Skill Gap Analysis",
    description: "AI-powered assessment identifies missing skills and recommends targeted training programs.",
  },
  {
    icon: Shield,
    title: "Government Licensed",
    description: "Certifications and licenses by government recognized trainers and sector skill councils and regulators.",
  },
  {
    icon: QrCode,
    title: "Blockchain Verified",
    description: "Tamper-proof credentials stored on blockchain for lifetime verification.",
  },
  {
    icon: Users,
    title: "Artisan Marketplace",
    description: "Connect with employers seeking verified professionals in your trade.",
  },
  {
    icon: BarChart3,
    title: "Career Analytics",
    description: "Track your career growth, earnings potential, and skill development.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Choose Your Trade",
    description: "Select from 15+ professional trades including electrical, plumbing, carpentry, and more.",
    icon: HardHat,
  },
  {
    step: "02",
    title: "Submit Data",
    description: "Upload your existing certificates, work experience, and identification.",
    icon: FileCheck,
  },
  {
    step: "03",
    title: "Gap Analysis",
    description: "Our system identifies missing requirements and suggests training.",
    icon: BarChart3,
  },
  {
    step: "04",
    title: "Get Certified and Licensed ",
    description: "Complete training, pass assessments, and receive your digital license.",
    icon: Award,
  },
];

const trades = [
  { name: "Electrical Installation", icon: Zap, demand: "High" },
  { name: "Plumbing", icon: HardHat, demand: "Very High" },
  { name: "Carpentry & Joinery", icon: HardHat, demand: "High" },
  { name: "Welding & Fabrication", icon: Shield, demand: "Medium" },
  { name: "HVAC Technology", icon: TrendingUp, demand: "High" },
  { name: "Solar Energy Tech", icon: Sparkles, demand: "Very High" },
];

const testimonials = [
  {
    name: "Emeka Okafor",
    role: "Certified Electrician",
    quote: "The certification from this platform helped me secure a government contract. My income has tripled!",
    rating: 5,
    initials: "EO",
  },
  {
    name: "Fatima Bello",
    role: "Solar Technician",
    quote: "The training was thorough and practical. I now run my own solar installation business.",
    rating: 5,
    initials: "FB",
  },
  {
    name: "Chidi Nwosu",
    role: "HVAC Specialist",
    quote: "Employers trust my credentials because they're government-approved and verifiable online.",
    rating: 5,
    initials: "CN",
  },
];

const faqs = [
  {
    q: "How long does certification take?",
    a: "Depending on your existing experience and chosen trade, certification can take 2-8 weeks including training and assessments.",
  },
  {
    q: "Is the certificate recognized by employers?",
    a: "Yes, our certifications are recognized by major construction companies, government agencies, and industry bodies across Nigeria.",
  },
  {
    q: "Can I upgrade my certification later?",
    a: "Absolutely! You can pursue advanced certifications as you gain more experience and skills.",
  },
  {
    q: "What is the cost of certification?",
    a: "Costs vary by trade and certification level. Basic certification starts at ₦50,000 with payment plans available.",
  },
  {
    q: "Do I need prior experience?",
    a: "We offer pathways for both beginners and experienced artisans. Our gap analysis helps determine your starting point.",
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const getDemandColor = (demand: string) => {
    if (demand === "Very High") return { bg: "#e8f5e9", text: "#2e7d32" };
    if (demand === "High") return { bg: "#e3f2fd", text: colors.primary };
    return { bg: "#fff3e0", text: "#ed6c02" };
  };

  return (
    <>
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%) translateX(-50%); }
          50% { transform: translateY(0) translateX(-50%); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Header */}
     <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-3" : "bg-white py-4"}`}>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <div className="relative h-12 w-auto flex-shrink-0">
          <Image
            src="/uploads/artisanPro.png"
            alt="ArtisanPro Logo"
            width={120}
            height={48}
            className="object-contain"
            priority
          />
        </div>
      </Link>

      <nav className="hidden md:flex items-center space-x-6">
        <Link href="#features" className="text-gray-600 hover:text-[#16507b] transition-colors">Features</Link>
        <Link href="#how-it-works" className="text-gray-600 hover:text-[#16507b] transition-colors">How It Works</Link>
        <Link href="#trades" className="text-gray-600 hover:text-[#16507b] transition-colors">Trades</Link>
        <Link href="partners" className="text-gray-600 hover:text-[#16507b] transition-colors">Partners</Link>
        <Link href="#testimonials" className="text-gray-600 hover:text-[#16507b] transition-colors">Success Stories</Link>
      </nav>

      <div className="hidden md:flex items-center space-x-3">
        <Link href="/auth/sign-in" className="px-4 py-2 rounded-full font-semibold transition-all" style={{ border: `2px solid ${colors.primary}`, color: colors.primary }}>Sign In</Link>
        <Link href="/auth/sign-up" className="px-5 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg text-white" style={{ backgroundColor: colors.primary }}>Get Started</Link>
      </div>

      <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>

    {mobileMenuOpen && (
      <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-4 px-4">
        <div className="flex flex-col space-y-3">
          <Link href="#features" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link href="#how-it-works" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
          <Link href="#trades" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Trades</Link>
          <Link href="#partners" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Partners</Link>
          <Link href="#testimonials" className="py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Success Stories</Link>
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
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden" style={{ backgroundColor: colors.light }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ backgroundColor: colors.primary }} />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" style={{ backgroundColor: colors.secondary }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-in-up" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Government Approved Certification</span>
              </div> */}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up animation-delay-200" style={{ color: colors.primary }}>
                Transform Your Craft Into
                <span style={{ color: colors.secondary }}> a Certified and licensed Career</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              Nigeria’s premier platform for compliance with National Skill Qualifications
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-600">
                <Link href="/auth/sign-up" className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5" style={{ backgroundColor: colors.primary }}>
                  Start Your Journey <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="#how-it-works" className="inline-flex items-center justify-center gap-2 border-2 px-8 py-4 rounded-full text-lg font-semibold transition-all" style={{ borderColor: colors.primary, color: colors.primary }}>
                  <Play className="h-5 w-5" /> Watch Demo
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6" style={{ color: colors.primary }} />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.primary }}>Why Choose ArtisanPro?</h2>
              <p className="text-lg text-gray-600">We provide a seamless end-to-end process in collaboration with NATEB and ITF recognized trainers and NBTE approved licensing and regulatory bodies.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100" style={{ animation: `fadeInUp 0.6s ease-out forwards`, animationDelay: `${index * 100}ms`, opacity: 0 }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${colors.primary}15` }}>
                    <feature.icon className="h-7 w-7" style={{ color: colors.primary }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20" style={{ backgroundColor: colors.light }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.primary }}>Your Path to Professional Certification</h2>
              <p className="text-lg text-gray-600">Get certified in 4 simple steps and unlock new career opportunities.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: colors.primary }}>
                      <step.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full font-bold flex items-center justify-center text-lg shadow-md text-white" style={{ backgroundColor: colors.accent }}>
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: colors.primary }}>{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trades Section */}
        <section id="trades" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.primary }}>Professional Trades We Certify</h2>
              <p className="text-lg text-gray-600">Choose from a wide range of in-demand trades and start your certification journey today.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trades.map((trade, index) => {
                const demandColor = getDemandColor(trade.demand);
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 transition-all duration-300 border hover:shadow-lg" style={{ borderColor: `${colors.primary}20` }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
                        <trade.icon className="h-6 w-6" style={{ color: colors.primary }} />
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: demandColor.bg, color: demandColor.text }}>
                        {trade.demand} Demand
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>{trade.name}</h3>
                    <div className="flex items-center text-sm text-gray-500"><Clock className="h-4 w-4 mr-1" />4-8 weeks certification</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20" style={{ backgroundColor: colors.light }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.primary }}>Success Stories From Certified Artisans</h2>
              <p className="text-lg text-gray-600">Join thousands of artisans who have transformed their careers through our certification program.</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-1 mb-4" style={{ color: colors.accent }}>
                          {Array.from({ length: testimonial.rating }).map((_, i) => (<Star key={i} className="h-5 w-5 fill-current" />))}
                        </div>
                        <p className="text-lg text-gray-700 mb-6">"{testimonial.quote}"</p>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: colors.primary }}>{testimonial.initials}</div>
                          <div><p className="font-semibold text-gray-900">{testimonial.name}</p><p className="text-sm text-gray-500">{testimonial.role}</p></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button key={index} className={`h-2 rounded-full transition-all duration-300 ${index === activeTestimonial ? "w-8" : "w-2"}`} style={{ backgroundColor: index === activeTestimonial ? colors.primary : "#d1d5db" }} onClick={() => setActiveTestimonial(index)} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.primary }}>Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Find answers about ArtisanPro.ng</p>
            </div>
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="mb-4 border rounded-xl overflow-hidden" style={{ borderColor: `${colors.primary}20` }}>
                  <button className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}>
                    <span className="font-semibold" style={{ color: colors.primary }}>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaqIndex === index ? "transform rotate-180" : ""}`} style={{ color: colors.primary }} />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 py-4 border-t" style={{ borderTopColor: `${colors.primary}20` }}>
                      <p className="text-gray-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="#contact" className="px-6 py-3 rounded-full font-semibold inline-block" style={{ border: `2px solid ${colors.primary}`, color: colors.primary }}>Contact Support</Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20" style={{ background: `linear-gradient(105deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to elevate your craft?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of certified artisans earning more with ArtisanPro.ng</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 bg-white px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all" style={{ color: colors.primary }}>Get Certified Now →</Link>
              <Link href="#contact" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all">Contact Sales</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="pt-12 pb-8" style={{ backgroundColor: colors.light }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="relative h-10 w-10 mb-3">
                <Image
                  src="/uploads/artisanPro.png"
                  alt="ArtisanPro Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h4 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>ArtisanPro.ng</h4>
              <p className="text-sm text-gray-600">Empowering Nigerian artisans through certification, training, and marketplace connections since 2023.</p>
            </div>
            <div>
              <h5 className="font-bold mb-3" style={{ color: colors.primary }}>Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#hero">Home</Link></li>
                <li><Link href="#about">About</Link></li>
                <li><Link href="#services">Services</Link></li>
                <li><Link href="#faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3" style={{ color: colors.primary }}>Services</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#">Marketplace</Link></li>
                <li><Link href="#">Certification</Link></li>
                <li><Link href="#">Permits</Link></li>
                <li><Link href="#">Training</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3" style={{ color: colors.primary }}>Contact</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />16A Dr Muktari Musa Road, Life Camp, Abuja</li>
                <li><Phone className="inline h-4 w-4 mr-2" />+234 906 000 8771</li>
                <li><Mail className="inline h-4 w-4 mr-2" />support@artisanpro.ng</li>
              </ul>
              <div className="flex gap-4 mt-4">
                <Link href="#" className="hover:opacity-70 transition-opacity" style={{ color: colors.secondary }}><Facebook className="h-5 w-5" /></Link>
                <Link href="#" className="hover:opacity-70 transition-opacity" style={{ color: colors.secondary }}><Twitter className="h-5 w-5" /></Link>
                <Link href="#" className="hover:opacity-70 transition-opacity" style={{ color: colors.secondary }}><Instagram className="h-5 w-5" /></Link>
                <Link href="#" className="hover:opacity-70 transition-opacity" style={{ color: colors.secondary }}><Linkedin className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
          <hr className="my-6" style={{ borderColor: `${colors.primary}20` }} />
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ArtisanPro.ng. All rights reserved. | <Link href="/privacy" className="hover:underline">Privacy Policy</Link> | <Link href="/terms" className="hover:underline">Terms</Link></p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button onClick={scrollToTop} className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`} style={{ backgroundColor: colors.primary }}>
        <ArrowUp className="h-4 w-4" />
      </button>
    </>
  );
}