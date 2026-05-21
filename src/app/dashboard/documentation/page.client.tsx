"use client";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Search,
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ShoppingBag,
  X,
  Zap,
  ArrowRight,
  Code,
  MessageSquare,
  Calendar,
  Settings,
  LayoutDashboard,
  ShoppingCart,
  Users,
  LineChart,
  BarChart3,
  Package,
  ListOrdered,
} from "lucide-react";
import { Button } from "~/ui/primitives/button";
import Header from "~/ui/components/header";
import Sidebar from "~/ui/components/sidebar/sidebar";
interface Notification {
  id: string; // Ensure id is a string
  text: string;
  time: string;
  read: boolean;
}

export default function DocumentationPage({ user }: { user: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");

  const notifications: Notification[] = [
    // { id: "1", text: "New order received", time: "2 min ago", read: false },
    // { id: "2", text: "Payment processed", time: "1 hour ago", read: true },
    // {
    //   id: "3",
    //   text: "New customer registered",
    //   time: "3 hours ago",
    //   read: true,
    // },
  ];

  const userData = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    avatar: user.avatar,
  };

  const documentationSections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: BookOpen,
      content: `
    <h2>Introduction to Qreta</h2>
    <p>Welcome to the official documentation for <strong>Qreta</strong>, the platform designed to simplify and enhance the way businesses connect with their customers. In today's digital landscape, providing seamless access to products and services is crucial. Qreta addresses this by empowering businesses to create <strong>direct storefront access</strong> for their customers through a simple link and a scannable QR code.</p>
    <p>This platform eliminates the traditional barriers of complex e-commerce setups and third-party marketplaces. By leveraging the power of QR codes, Qreta enables instant, direct-to-consumer engagement, allowing customers to browse products, place orders, and communicate directly with businesses with a single scan.</p>
    <p>This documentation will guide you through every aspect of the Qreta platform, from initial setup to advanced features. Whether you're a business owner looking to create your first storefront or a developer integrating with our APIs, you'll find the information you need to get the most out of Qreta.</p>
  `,
    },
    {
      id: "dashboard",
      title: "Dashboard Overview",
      icon: LayoutDashboard,
      content: `
        <h2>Dashboard Features</h2>
        <p>The dashboard is your central hub for managing your business. Here's what you can do:</p>
        
        <h3>Key Components</h3>
        <ul>
          <li><strong>Statistics Cards:</strong> View important metrics about your business performance</li>
          <li><strong>Sales Overview:</strong> Visualize your sales data with interactive charts</li>
          <li><strong>Recent Orders:</strong> Monitor and manage your most recent orders</li>
          <li><strong>Quick Actions:</strong> Access frequently used features quickly</li>
        </ul>
        
       
      `,
    },
    {
      id: "business-management",
      title: "Manage Business",
      icon: ShoppingBag,
      content: `
    <h2>Managing Your Business</h2>
    <p>The **Manage Business** section is your central hub for creating, editing, and overseeing your storefronts on the Qreta platform. From here, you can add new businesses, manage existing ones, and handle all associated digital assets.</p>
    
    <h3>Creating a New Business</h3>
    <p>To get started, simply navigate to the sidebar and click on **Business**. You will see a list of your existing businesses and an option to create a new one. Once you create a new business, Qreta automatically generates a set of essential digital assets for you:</p>
    <ul>
      <li><strong>Store Link:</strong> A unique, shareable URL for your online storefront.</li>
      <li><strong>Manage Store Link:</strong> A direct link to your store's management dashboard.</li>
      <li><strong>Storefront QR Code:</strong> A scannable QR code that takes customers directly to your storefront.</li>
      <li><strong>Business Card QR Code:</strong> A QR code for your business card that links to your digital store.</li>
    </ul>
    
    <h3>Adding and Managing Products</h3>
    <p>For each business you create, you can easily add, edit, or remove products. Use the product management tools to upload images, set prices, and provide descriptions to create a complete and engaging storefront for your customers.</p>
  `,
    },
    {
      id: "products",
      title: "Product Management",
      icon: Package,
      content: `
        <h2>Adding and Managing Products</h2>
        <p>The Product Management section allows you to build out your storefront catalog. You can add new products, update existing ones, and organize them to create a great shopping experience for your customers.</p>
        
        <h3>Product Details</h3>
        <p>When creating or editing a product, you can set the following details:</p>
        <ul>
          <li><strong>Product Name:</strong> A clear, descriptive name for your item.</li>
          <li><strong>Description:</strong> A detailed description of the product's features and benefits.</li>
          <li><strong>Images:</strong> Add high-quality images to showcase your product.</li>
          <li><strong>Price & Variants:</strong> Set the base price and add different variants (e.g., sizes, colors) with their own prices.</li>
          <li><strong>Stock:</strong> Track the number of items you have in stock to prevent overselling.</li>
        </ul>
        
        <h3>Organizing Your Catalog</h3>
        <p>You can organize your products using categories and tags to make them easier for customers to find. This also helps with internal management and reporting.</p>
      `,
    },
    {
      id: "orders",
      title: "Order Management",
      icon: ListOrdered,
      content: `
        <h2>Processing Customer Orders</h2>
        <p>The Order Management section is where you handle all incoming customer requests. Each order is automatically logged, allowing you to track its status from initial placement to final delivery.</p>
        
        <h3>Order Lifecycle</h3>
        <p>Orders move through different statuses:</p>
        <ul>
          <li><strong>Processing:</strong> The order has been received and is being prepared.</li>
          <li><strong>In Transit:</strong> The order has been dispatched and is on its way to the customer.</li>
          <li><strong>Delivered:</strong> The order has been successfully completed.</li>
          <li><strong>Cancelled:</strong> The order has been canceled by you or the customer.</li>
        </ul>
        
        <h3>Order Details</h3>
        <p>Each order page provides a summary of all relevant details, including customer information, a list of purchased items, total amount, and a timeline of all status updates.</p>
      `,
    },
    {
      id: "customers",
      title: "Customer Management",
      icon: Users,
      content: `
        <h2>Managing Customers</h2>
        <p>Your customer database helps you track interactions and build relationships.</p>
        
        <h3>Customer Profiles</h3>
        <p>Each customer profile contains:</p>
        <ul>
          <li>Contact information</li>
          <li>Order history</li>
          <li>Communication logs</li>
          <li>Preferences and notes</li>
        </ul>
        
        <h3>Segmenting Customers</h3>
        <p>You can segment customers based on:</p>
        <ul>
          <li>Purchase history</li>
          <li>Location</li>
          <li>Engagement level</li>
          <li>Custom tags</li>
        </ul>
      `,
    },
    {
      id: "analytics",
      title: "Analytics & Reports",
      icon: BarChart3,
      content: `
        <h2>Understanding Your Analytics</h2>
        <p>Our analytics tools help you make data-driven decisions for your business.</p>
        
        <h3>Key Metrics</h3>
        <p>Track these important metrics:</p>
        <ul>
          <li><strong>Conversion Rate:</strong> Percentage of visitors who make a purchase</li>
          <li><strong>Average Order Value:</strong> Average amount spent per order</li>
          <li><strong>Customer Lifetime Value:</strong> Total value of a customer over time</li>
          <li><strong>Retention Rate:</strong> Percentage of customers who return</li>
        </ul>
        
        <h3>Generating Reports</h3>
        <p>To generate a report:</p>
        <ol>
          <li>Go to the Analytics section</li>
          <li>Select the report type</li>
          <li>Choose your date range and filters</li>
          <li>Click "Generate Report"</li>
          <li>Export or save the report as needed</li>
        </ol>
      `,
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      content: `
        <h2>Storefront Settings</h2>
        <p>The Settings page is where you configure your business details and manage account-level preferences.</p>
        
        <h3>Business Profile</h3>
        <p>Manage your business's core information, including your name, contact details, and a brief description. This information is displayed on your public storefront and customer receipts.</p>
        
        <h3>Shipping and Payments</h3>
        <p>Configure your shipping options and connect to payment gateways to enable secure transactions. You can set up shipping rates based on location or weight, and integrate with popular payment providers to accept payments directly.</p>
        
        <h3>Notifications</h3>
        <p>Customize your notification preferences to receive alerts for new orders, customer messages, or low-stock warnings, ensuring you never miss an important update.</p>
      `,
    },

    {
      id: "faq",
      title: "FAQ & Support",
      icon: HelpCircle,
      content: `
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions about our platform.</p>
        
        <h3>Common Issues</h3>
        <div class="faq-item">
          <h4>How do I reset my password?</h4>
          <p>Go to the login page and click "Forgot Password." Enter your email address, and we'll send you a link to reset your password.</p>
        </div>
        
        <div class="faq-item">
          <h4>How can I export my data?</h4>
          <p>Navigate to Settings > Data Management > Export Data. Select the data types you want to export and the format, then click "Export."</p>
        </div>
        
        <div class="faq-item">
          <h4>What browsers are supported?</h4>
          <p>Our platform works best with the latest versions of Chrome, Firefox, Safari, and Edge.</p>
        </div>
        
        <h3>Contact Support</h3>
        <p>If you can't find the answer to your question, our support team is available 24/7. Contact us at support@example.com or use the chat widget in the bottom right corner.</p>
      `,
    },
  ];

  const quickActions = [
    {
      icon: FileText,
      label: "Download PDF Guide",
      action: () => console.log("Download guide"),
    },
    {
      icon: MessageSquare,
      label: "Contact Support",
      action: () => console.log("Contact support"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      <Header
        userData={user}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex flex-1">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 pb-24 transition-all duration-300 md:pb-6 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold md:text-3xl">Documentation</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Comprehensive guides and references for using our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="space-y-6 lg:col-span-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div className="prose max-w-none dark:prose-invert">
                  {documentationSections
                    .filter((section) => section.id === activeSection)
                    .map((section) => (
                      <div
                        key={section.id}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Documentation</h3>
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-2">
                  {documentationSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex w-full items-center rounded-lg p-3 text-left transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <section.icon className="mr-3 h-4 w-4" />
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Need more help?</h3>
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                </div>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Can't find what you're looking for? Our support team is here
                  to help.
                </p>
                <a
                  href="https://wa.me/2348123699909"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full">
                    Contact Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .status-badge {
          display: inline-block;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-right: 0.5rem;
        }
        .status-badge.processing {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-badge.shipped {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .status-badge.delivered {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-badge.cancelled {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        .faq-item {
          margin-bottom: 1.5rem;
        }
        .faq-item h4 {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        code {
          font-family: monospace;
          font-size: 0.875rem;
        }
        .prose ol,
        .prose ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem;
        }
        .prose h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
        }
      `}</style>
    </div>
  );
}
