import { useState } from "react";
import { PuzzleCaptcha } from "../components/PuzzleCaptcha";

interface FormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  industry: string;
  sponsorshipLevel: string;
  interests: string[];
  message: string;
}

const initialFormData: FormData = {
  companyName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  industry: "",
  sponsorshipLevel: "",
  interests: [],
  message: "",
};

const industries = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & Consumer Goods" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "real-estate", label: "Real Estate" },
  { value: "professional-services", label: "Professional Services" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const sponsorshipLevels = [
  { value: "bronze", label: "Bronze Partner ($500 - $2,499/year)" },
  { value: "silver", label: "Silver Partner ($2,500 - $9,999/year)" },
  { value: "gold", label: "Gold Partner ($10,000 - $24,999/year)" },
  { value: "platinum", label: "Platinum Partner ($25,000 - $49,999/year)" },
  { value: "diamond", label: "Diamond Partner ($50,000+/year)" },
  { value: "custom", label: "Custom Partnership" },
];

const interestOptions = [
  { value: "stem-programs", label: "STEM Programs" },
  { value: "mentorship", label: "Mentorship Programs" },
  { value: "scholarships", label: "Scholarships" },
  { value: "events", label: "Event Sponsorship" },
  { value: "equipment", label: "Equipment Donation" },
  { value: "volunteer", label: "Corporate Volunteering" },
];

export function SponsorPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [captchaToken, setCaptchaToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [honeypot, setHoneypot] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
  };

  const handleCaptchaVerified = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaReset = () => {
    setCaptchaToken("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check honeypot (anti-spam)
    if (honeypot) {
      return;
    }

    // Verify captcha
    if (!captchaToken) {
      setSubmitStatus({
        type: "error",
        message: "Please complete the puzzle verification.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/sponsor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message:
            result.message ||
            "Thank you! Your application has been submitted. Our team will contact you soon.",
        });
        setFormData(initialFormData);
        setCaptchaToken("");
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "There was an error submitting your application. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.companyName &&
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.jobTitle &&
    formData.industry &&
    formData.sponsorshipLevel &&
    captchaToken;

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-100 to-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-3">
            PARTNER WITH US
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Become a Corporate Sponsor
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Join leading organizations in empowering the next generation through STEAM education.
            Your partnership makes a lasting impact on youth in our community.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="border border-gray-200 rounded-xl p-8">
            {/* Icon Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Corporate Sponsorship Application
              </h2>
              <p className="text-gray-500 text-sm">
                Complete the form below and our team will contact you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm text-gray-600 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  placeholder="Acme Corporation"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Contact Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm text-gray-600 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm text-gray-600 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm text-gray-600 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  required
                  placeholder="Director of Community Relations"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm text-gray-600 mb-1">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  id="industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                >
                  <option value="">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sponsorship Level */}
              <div>
                <label htmlFor="sponsorshipLevel" className="block text-sm text-gray-600 mb-1">
                  Interested Sponsorship Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="sponsorshipLevel"
                  name="sponsorshipLevel"
                  required
                  value={formData.sponsorshipLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                >
                  <option value="">Select a level</option>
                  {sponsorshipLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Areas of Interest <span className="text-gray-400">(select all that apply)</span>
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {interestOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(option.value)}
                        onChange={() => handleInterestChange(option.value)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm text-gray-600 mb-1">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your company's mission, why you're interested in partnering, or any specific ideas you have..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Puzzle Captcha */}
              <PuzzleCaptcha onVerified={handleCaptchaVerified} onReset={handleCaptchaReset} />

              {/* Honeypot (anti-spam) */}
              <div aria-hidden="true" className="absolute left-[-5000px]">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Response Messages */}
              {submitStatus.type && (
                <div
                  className={`text-sm p-4 rounded-lg ${
                    submitStatus.type === "success"
                      ? "text-green-600 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-10 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
                <p className="text-xs text-gray-400 mt-3">
                  By submitting, you agree to our privacy policy and terms of service.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Why Partner With FundedYouth?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-sm text-gray-600">
                Directly support underserved youth in accessing quality STEAM education and
                resources.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Brand Recognition</h3>
              <p className="text-sm text-gray-600">
                Gain visibility through our events, programs, and marketing materials as a valued
                partner.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Tax Benefits</h3>
              <p className="text-sm text-gray-600">
                As a 501(c)(3) nonprofit, your contributions are tax-deductible to the fullest
                extent.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
