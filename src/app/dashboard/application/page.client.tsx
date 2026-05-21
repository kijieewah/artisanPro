"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  User,
  Building2,
  CreditCard,
  ChevronRight,
  Award,
  Shield,
  FileCheck,
  Loader2,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface ApplicationRequirement {
  id: string;
  requirementId: number;
  name: string;
  type: string;
  isMet: boolean;
  uploadUrl?: string;
  uploadStatus?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
}

interface Certificate {
  id: string;
  certificateNumber: string;
  issuedAt: Date;
}

interface PaymentTransaction {
  id: string;
  transactionRef: string;
  amount: number;
  status: string;
  paidAt?: Date;
}

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  completionScore: number;
  paymentStatus: string;
  paymentAmount?: number;
  paymentDate?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  service: {
    id: number;
    name: string;
    industryName?: string;
  };
  certificate?: Certificate;
  requirements: ApplicationRequirement[];
  paymentTransaction?: PaymentTransaction;
}

interface Stats {
  total: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  pendingInfo: number;
}

interface ApplicationClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  artisanProfile: any;
  applications: Application[];
  stats: Stats;
}

export default function ApplicationClient({
  user,
  artisanProfile,
  applications,
  stats,
}: ApplicationClientProps) {
  const router = useRouter();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast.success("Applications refreshed");
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleDownloadCertificate = (certificateId: string) => {
    window.open(`/api/artisan/certificate/${certificateId}/download`, "_blank");
    toast.success("Download started");
  };

  const handleContinuePayment = (applicationId: string) => {
    router.push(`/payment?applicationId=${applicationId}&amount=5000`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return { icon: Clock, text: "Submitted", color: "bg-blue-100 text-blue-700", borderColor: "border-blue-200" };
      case "UNDER_REVIEW":
        return { icon: RefreshCw, text: "Under Review", color: "bg-yellow-100 text-yellow-700", borderColor: "border-yellow-200" };
      case "APPROVED":
        return { icon: CheckCircle, text: "Approved", color: "bg-green-100 text-green-700", borderColor: "border-green-200" };
      case "REJECTED":
        return { icon: XCircle, text: "Rejected", color: "bg-red-100 text-red-700", borderColor: "border-red-200" };
      case "PENDING_INFORMATION":
        return { icon: AlertCircle, text: "Pending Info", color: "bg-orange-100 text-orange-700", borderColor: "border-orange-200" };
      default:
        return { icon: FileText, text: "Draft", color: "bg-gray-100 text-gray-700", borderColor: "border-gray-200" };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { icon: CheckCircle, text: "Paid", color: "bg-green-100 text-green-700" };
      case "PENDING":
        return { icon: Clock, text: "Pending", color: "bg-yellow-100 text-yellow-700" };
      case "FAILED":
        return { icon: XCircle, text: "Failed", color: "bg-red-100 text-red-700" };
      default:
        return { icon: AlertCircle, text: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    { title: "Total Applications", value: stats.total, icon: FileText, color: "blue" },
    { title: "Submitted", value: stats.submitted, icon: Clock, color: "yellow" },
    { title: "Under Review", value: stats.underReview, icon: RefreshCw, color: "orange" },
    { title: "Approved", value: stats.approved, icon: CheckCircle, color: "green" },
    { title: "Rejected", value: stats.rejected, icon: XCircle, color: "red" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage your certification applications
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
              </div>
              <div className={`rounded-full p-2 bg-${stat.color}-100`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by application number or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PENDING_INFORMATION">Pending Information</option>
        </select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "You haven't submitted any certification applications yet."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Link
              href="/dashboard/requirements"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Start Your First Application
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const statusInfo = getStatusBadge(application.status);
            const paymentInfo = getPaymentStatusBadge(application.paymentStatus);
            const StatusIcon = statusInfo.icon;
            const PaymentIcon = paymentInfo.icon;

            return (
              <div
                key={application.id}
                className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{application.applicationNumber}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.text}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentInfo.color}`}
                      >
                        <PaymentIcon className="h-3 w-3" />
                        {paymentInfo.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {application.service.name} • {application.service.industryName || "Artisan Service"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    {application.status === "APPROVED" && application.certificate && (
                      <button
                        onClick={() => handleDownloadCertificate(application.certificate!.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Certificate
                      </button>
                    )}
                    {application.paymentStatus === "PENDING" && (
                      <button
                        onClick={() => handleContinuePayment(application.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CreditCard className="h-4 w-4" />
                        Complete Payment
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Completion Score</span>
                    <span className="font-medium">{application.completionScore}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${application.completionScore}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium">
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString()
                        : "Not submitted"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {application.reviewedAt
                        ? new Date(application.reviewedAt).toLocaleDateString()
                        : application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Amount</p>
                    <p className="font-medium">
                      {application.paymentAmount
                        ? `₦${application.paymentAmount.toLocaleString()}`
                        : "₦5,000"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Requirements Met</p>
                    <p className="font-medium">
                      {application.requirements.filter((r) => r.isMet).length}/
                      {application.requirements.length}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {application.status === "REJECTED" && application.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Reason:</span> {application.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Application Details
                </h2>
                <p className="text-sm text-gray-500">{selectedApplication.applicationNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Service Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Service Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Service Name</p>
                    <p className="font-medium">{selectedApplication.service.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Industry</p>
                    <p className="font-medium">{selectedApplication.service.industryName || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Application Status Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Application Timeline</h3>
                <div className="space-y-3">
                  {selectedApplication.submittedAt && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedApplication.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.paymentTransaction?.paidAt && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Payment Completed</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedApplication.paymentTransaction.paidAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.reviewedAt && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Application Reviewed</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedApplication.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.approvedAt && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedApplication.approvedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements Status */}
              <div>
                <h3 className="font-semibold mb-3">Document Requirements</h3>
                <div className="space-y-2">
                  {selectedApplication.requirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {req.isMet ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">{req.name}</p>
                          <p className="text-xs text-gray-500">{req.type}</p>
                        </div>
                      </div>
                      {req.uploadUrl && (
                        <a
                          href={req.uploadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              {selectedApplication.paymentTransaction && (
                <div>
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Transaction Reference</p>
                        <p className="font-mono text-sm">
                          {selectedApplication.paymentTransaction.transactionRef}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount Paid</p>
                        <p className="font-medium">
                          ₦{selectedApplication.paymentTransaction.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment Status</p>
                        <p className="font-medium">{selectedApplication.paymentTransaction.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment Date</p>
                        <p className="font-medium">
                          {selectedApplication.paymentTransaction.paidAt
                            ? new Date(selectedApplication.paymentTransaction.paidAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedApplication.status === "REJECTED" && selectedApplication.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">Rejection Reason</h3>
                  <p className="text-sm text-red-700">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-white">
              {selectedApplication.status === "APPROVED" && selectedApplication.certificate && (
                <button
                  onClick={() => handleDownloadCertificate(selectedApplication.certificate!.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </button>
              )}
              {selectedApplication.paymentStatus === "PENDING" && (
                <button
                  onClick={() => handleContinuePayment(selectedApplication.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4" />
                  Complete Payment
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
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