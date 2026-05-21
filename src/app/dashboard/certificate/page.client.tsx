// app/dashboard/certificate/page.client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Award,
  Download,
  Eye,
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Loader2,
  Calendar,
  User,
  Building2,
  FileCheck,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
};

interface Certificate {
  id: string;
  certificateNumber: string;
  uniqueCode: string;
  qrCodeUrl: string;
  issuedAt: Date;
  expiresAt: Date | null;
  serviceName: string;
  industryName: string;
  issuerName: string;
}

interface PendingCertificate {
  id: string;
  applicationNumber: string;
  serviceName: string;
  industryName: string;
  approvedAt: Date | null;
}

interface CertificateClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  artisanProfile: any;
  certificates: Certificate[];
  pendingCertificates: PendingCertificate[];
}

export default function CertificateClient({
  user,
  artisanProfile,
  certificates,
  pendingCertificates,
}: CertificateClientProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleGenerateCertificate = async (applicationId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/artisan/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Certificate generated successfully!");
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to generate certificate");
      }
    } catch (error: any) {
      console.error("Certificate generation error:", error);
      toast.error(error.message || "Failed to generate certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCertificate = (certificateId: string) => {
    window.open(`/api/artisan/certificate/${certificateId}/download`, "_blank");
    toast.success("Download started");
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowQRModal(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Certificate code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleVerifyCertificate = () => {
    if (selectedCertificate) {
      window.open(`/verify/${selectedCertificate.uniqueCode}`, "_blank");
    }
  };

  const handleShare = (platform: string, certificate: Certificate) => {
    const url = `${window.location.origin}/verify/${certificate.uniqueCode}`;
    const text = `I am a certified ${certificate.serviceName} professional! Check my verified certificate:`;
    
    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
    }
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and download your professional certificates
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-green-100">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-xs text-gray-500">Active Certificates</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-blue-100">
              <FileCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCertificates.length}</p>
              <p className="text-xs text-gray-500">Ready to Issue</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-purple-100">
              <QrCode className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-xs text-gray-500">Verifiable Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Certificates */}
      {pendingCertificates.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Ready to Generate</h2>
          <div className="space-y-3">
            {pendingCertificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{cert.serviceName}</h3>
                  <p className="text-sm text-gray-500">{cert.industryName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Application: {cert.applicationNumber}
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateCertificate(cert.id)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4" />
                      Generate Certificate
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates List */}
      {certificates.length === 0 && pendingCertificates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Complete your certification process to receive your professional certificate.
          </p>
          <Link
            href="/dashboard/requirements"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Start Certification Process
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Certificate Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-green-100">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.serviceName}</h3>
                    <p className="text-sm text-gray-500">{cert.industryName}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Verified
                </span>
              </div>

              {/* Certificate Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Certificate No:</span>
                  <span className="font-mono text-gray-900">{cert.certificateNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Issued To:</span>
                  <span className="font-medium text-gray-900">{fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Issue Date:</span>
                  <span className="text-gray-900">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
                {cert.expiresAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expiry Date:</span>
                    <span className="text-gray-900">{new Date(cert.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleDownloadCertificate(cert.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => handleViewCertificate(cert)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
              </div>

              {/* Share Buttons */}
              <div className="flex justify-center gap-3 mt-3 pt-3 border-t">
                <button
                  onClick={() => handleShare("facebook", cert)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare("twitter", cert)}
                  className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare("linkedin", cert)}
                  className="p-1.5 text-gray-500 hover:text-blue-700 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopyCode(cert.uniqueCode)}
                  className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                  title="Copy verification code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Certificate Details</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <QrCode className="h-5 w-5" />
              </button>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-lg border">
                <Image
                  src={selectedCertificate.qrCodeUrl}
                  alt="Certificate QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* Certificate Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Certificate Number:</span>
                <span className="font-mono">{selectedCertificate.certificateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unique Code:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono">{selectedCertificate.uniqueCode}</span>
                  <button
                    onClick={() => handleCopyCode(selectedCertificate.uniqueCode)}
                    className="p-0.5 hover:bg-gray-100 rounded"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Artisan:</span>
                <span className="font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span>{selectedCertificate.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Issued By:</span>
                <span>{selectedCertificate.issuerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Issue Date:</span>
                <span>{new Date(selectedCertificate.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Verification Link */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Verification URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-blue-600 truncate">
                  {`${window.location.origin}/verify/${selectedCertificate.uniqueCode}`}
                </code>
                <button
                  onClick={handleVerifyCertificate}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleDownloadCertificate(selectedCertificate.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                Download Certificate
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}