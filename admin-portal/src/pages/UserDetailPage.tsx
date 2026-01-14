import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getUserById,
  getUserInvoices,
  getUserMetadata,
} from "services/userService";
import {
  fetchUserNotifications,
  markAsRead,
} from "services/notificationService";
import {
  UserWithBilling,
  BrokerAccount,
  ServiceAgreement,
  StripeInvoice,
} from "types/user";
import { VpsInstance } from "types/vps";
import { SuspensionReason } from "types/service";
import { AdminNotification } from "types/notification";
import { useStepUpAuth } from "contexts/StepUpAuthContext";
import { useAuth } from "contexts/AuthContext";
import { supabase } from "lib/supabaseClient";

interface UserMetadata {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  created_at: string | null;
}

/**
 * Format phone number as +1 (XXX) XXX - XXXX
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle 10-digit US numbers
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(
      6,
    )}`;
  }

  // Handle 11-digit numbers starting with 1
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)} - ${digits.slice(
      7,
    )}`;
  }

  // Return original if format doesn't match
  return phone;
}

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { requestStepUp, hasValidSession } = useStepUpAuth();
  const { user: adminUser } = useAuth();

  const [user, setUser] = useState<UserWithBilling | null>(null);
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>([]);
  const [serviceAgreements, setServiceAgreements] = useState<
    ServiceAgreement[]
  >([]);
  const [vpsInstances, setVpsInstances] = useState<VpsInstance[]>([]);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  // Reset password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmailConfirm, setResetEmailConfirm] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Change email modal state
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [changeEmailStep, setChangeEmailStep] = useState<"validate" | "change">(
    "validate",
  );
  const [changeEmailForm, setChangeEmailForm] = useState({
    currentEmail: "",
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
    newEmail: "",
  });
  const [changeEmailLoading, setChangeEmailLoading] = useState(false);
  const [changeEmailMessage, setChangeEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Suspend service modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] =
    useState<ServiceAgreement | null>(null);
  const [suspensionReasons, setSuspensionReasons] = useState<SuspensionReason[]>(
    [],
  );
  const [suspendForm, setSuspendForm] = useState({
    reasonCode: "",
    notes: "",
  });
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendMessage, setSuspendMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getUserById(userId);
        setUser(result.user);
        setBrokerAccounts(result.brokerAccounts);
        setServiceAgreements(result.serviceAgreements);
        setVpsInstances(result.vpsInstances);

        // Fetch user metadata (firstName, lastName, phone)
        const metadata = await getUserMetadata(userId);
        setUserMetadata(metadata);

        // Fetch invoices if user has Stripe customer ID
        if (result.user?.billing?.stripe_customer_id) {
          setInvoicesLoading(true);
          try {
            const invoiceData = await getUserInvoices(
              result.user.billing.stripe_customer_id,
            );
            setInvoices(invoiceData);
          } catch (err) {
            console.error("Error fetching invoices:", err);
          } finally {
            setInvoicesLoading(false);
          }
        }

        // Fetch user notifications
        try {
          const userNotifications = await fetchUserNotifications(userId);
          setNotifications(userNotifications);
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleRevealPassword = (broker: BrokerAccount) => {
    if (hasValidSession("view_broker_password", broker.id)) {
      return;
    }

    requestStepUp({
      purpose: "view_broker_password",
      resourceId: broker.id,
      description: `View password for ${broker.broker_name} account ${broker.broker_account_number}`,
      auditMetadata: user
        ? {
            customerId: user.id,
            customerEmail: user.email,
          }
        : undefined,
    });
  };

  const getRevealedPassword = (broker: BrokerAccount): string | null => {
    if (hasValidSession("view_broker_password", broker.id)) {
      return broker.broker_account_password;
    }
    return null;
  };

  const handleRevealApiKey = (broker: BrokerAccount) => {
    if (hasValidSession("view_broker_api_key", broker.id)) {
      return;
    }

    requestStepUp({
      purpose: "view_broker_api_key",
      resourceId: broker.id,
      description: `View API key for ${broker.broker_name} account ${broker.broker_account_number}`,
      auditMetadata: user
        ? {
            customerId: user.id,
            customerEmail: user.email,
          }
        : undefined,
    });
  };

  const getRevealedApiKey = (broker: BrokerAccount): string | null => {
    if (hasValidSession("view_broker_api_key", broker.id)) {
      return broker.api_key;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "running":
      case "paid":
        return "bg-green-100 text-green-800";
      case "inactive":
      case "stopped":
      case "disabled":
      case "cancelled":
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "suspended":
      case "overdue":
        return "bg-red-100 text-red-800";
      case "pending":
      case "paused":
      case "open":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleResetPassword = async () => {
    if (!user || resetEmailConfirm !== user.email) {
      return;
    }

    setResettingPassword(true);
    setResetMessage(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-reset-password",
        {
          body: { email: user.email },
        },
      );

      if (invokeError) {
        throw invokeError;
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setResetMessage({
        type: "success",
        text: `Password reset email sent to ${user.email}`,
      });

      // Close modal after a short delay
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmailConfirm("");
        setResetMessage(null);
      }, 2000);
    } catch (err) {
      setResetMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to send reset email",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const openResetModal = () => {
    setShowResetModal(true);
    setResetEmailConfirm("");
    setResetMessage(null);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmailConfirm("");
    setResetMessage(null);
  };

  const openChangeEmailModal = () => {
    setShowChangeEmailModal(true);
    setChangeEmailStep("validate");
    setChangeEmailForm({
      currentEmail: "",
      firstName: "",
      lastName: "",
      phone: "",
      addressLine1: "",
      city: "",
      state: "",
      zip: "",
      newEmail: "",
    });
    setChangeEmailMessage(null);
  };

  const closeChangeEmailModal = () => {
    setShowChangeEmailModal(false);
    setChangeEmailStep("validate");
    setChangeEmailForm({
      currentEmail: "",
      firstName: "",
      lastName: "",
      phone: "",
      addressLine1: "",
      city: "",
      state: "",
      zip: "",
      newEmail: "",
    });
    setChangeEmailMessage(null);
  };

  const handleValidateIdentity = async () => {
    if (!user) return;

    setChangeEmailLoading(true);
    setChangeEmailMessage(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-change-user-email",
        {
          body: {
            action: "validate",
            userId: user.id,
            currentEmail: changeEmailForm.currentEmail,
            firstName: changeEmailForm.firstName,
            lastName: changeEmailForm.lastName,
            phone: changeEmailForm.phone,
            address: {
              line1: changeEmailForm.addressLine1,
              city: changeEmailForm.city,
              state: changeEmailForm.state,
              zip: changeEmailForm.zip,
            },
          },
        },
      );

      if (invokeError) {
        throw invokeError;
      }

      if (!data.success || !data.validated) {
        throw new Error(data.error || "Validation failed");
      }

      setChangeEmailMessage({
        type: "success",
        text: "Identity verified. You can now enter the new email address.",
      });
      setChangeEmailStep("change");
    } catch (err) {
      setChangeEmailMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Validation failed",
      });
    } finally {
      setChangeEmailLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!user) return;

    setChangeEmailLoading(true);
    setChangeEmailMessage(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-change-user-email",
        {
          body: {
            action: "change",
            userId: user.id,
            newEmail: changeEmailForm.newEmail,
          },
        },
      );

      if (invokeError) {
        throw invokeError;
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to change email");
      }

      setChangeEmailMessage({
        type: "success",
        text: `Email changed successfully to ${changeEmailForm.newEmail}`,
      });

      // Close modal and refresh after a short delay
      setTimeout(() => {
        closeChangeEmailModal();
        window.location.reload();
      }, 2000);
    } catch (err) {
      setChangeEmailMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change email",
      });
    } finally {
      setChangeEmailLoading(false);
    }
  };

  const fetchSuspensionReasons = async () => {
    const { data } = await supabase
      .from("suspension_reasons")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (data) {
      setSuspensionReasons(data);
    }
  };

  const openSuspendModal = async (agreement: ServiceAgreement) => {
    setSelectedAgreement(agreement);
    setSuspendForm({ reasonCode: "", notes: "" });
    setSuspendMessage(null);
    setShowSuspendModal(true);

    // Fetch suspension reasons if not already loaded
    if (suspensionReasons.length === 0) {
      await fetchSuspensionReasons();
    }
  };

  const closeSuspendModal = () => {
    setShowSuspendModal(false);
    setSelectedAgreement(null);
    setSuspendForm({ reasonCode: "", notes: "" });
    setSuspendMessage(null);
  };

  const handleSuspendService = async () => {
    if (!selectedAgreement) return;

    setSuspendLoading(true);
    setSuspendMessage(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-suspend-service",
        {
          body: {
            action: "suspend",
            agreementId: selectedAgreement.id,
            reasonCode: suspendForm.reasonCode,
            notes: suspendForm.notes || undefined,
          },
        },
      );

      if (invokeError) {
        // Try to extract the actual error message from the response
        const errorData = data as { error?: string } | null;
        const errorMessage = errorData?.error || invokeError.message;
        throw new Error(errorMessage);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to suspend service");
      }

      setSuspendMessage({
        type: "success",
        text: "Service suspended successfully",
      });

      // Update local state
      setServiceAgreements(
        serviceAgreements.map((a) =>
          a.id === selectedAgreement.id
            ? {
                ...a,
                status: "suspended" as const,
                suspended_at: new Date().toISOString(),
                suspension_reason: suspendForm.reasonCode,
              }
            : a,
        ),
      );

      setTimeout(() => {
        closeSuspendModal();
      }, 1500);
    } catch (err) {
      setSuspendMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to suspend service",
      });
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspendService = async (agreement: ServiceAgreement) => {
    if (!confirm("Are you sure you want to unsuspend this service?")) return;

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-suspend-service",
        {
          body: {
            action: "unsuspend",
            agreementId: agreement.id,
          },
        },
      );

      if (invokeError) {
        // Try to extract the actual error message from the response
        const errorData = data as { error?: string } | null;
        const errorMessage = errorData?.error || invokeError.message;
        throw new Error(errorMessage);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to unsuspend service");
      }

      // Update local state
      setServiceAgreements(
        serviceAgreements.map((a) =>
          a.id === agreement.id
            ? {
                ...a,
                status: "active" as const,
                suspended_at: null,
                suspension_reason: null,
                suspended_by: null,
                suspension_notes: null,
              }
            : a,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unsuspend service");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          User Not Found
        </h1>
        <p className="mb-4 text-gray-600">
          {error || "The user you are looking for does not exist."}
        </p>
        <Link to="/users" className="text-blue-600 hover:text-blue-800">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/users"
          className="mb-2 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Users
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{user.email}</h1>
            {userMetadata?.firstName && userMetadata?.lastName && userMetadata?.phone ? (
              <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                Approved
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                Pending
              </span>
            )}
            {user.billing?.stripe_customer_id && (
              <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                Stripe Connected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={openChangeEmailModal}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Email
            </button>
            <button
              onClick={openResetModal}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Account Info */}
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Account Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="font-mono text-sm text-gray-900">{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Member Since
              </dt>
              <dd className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
            {user.billing?.stripe_customer_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Stripe Customer ID
                </dt>
                <dd className="font-mono text-sm text-gray-900">
                  {user.billing.stripe_customer_id}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Billing Details */}
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Billing Details
          </h2>
          <dl className="space-y-3">
            {(userMetadata?.firstName || userMetadata?.lastName) && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-gray-900">
                  {[userMetadata.firstName, userMetadata.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </dd>
              </div>
            )}
            {userMetadata?.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-gray-900">
                  {formatPhoneNumber(userMetadata.phone)}
                </dd>
              </div>
            )}
            {user.billing?.billing_address_line1 ? (
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-gray-900">
                  {user.billing.billing_address_line1}
                  {user.billing.billing_address_line2 && (
                    <>
                      <br />
                      {user.billing.billing_address_line2}
                    </>
                  )}
                  <br />
                  {user.billing.billing_city}, {user.billing.billing_state}{" "}
                  {user.billing.billing_zip}
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-gray-500">No billing address on file.</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Activity Notifications - Full Width Row */}
        {notifications.length > 0 && (
          <section className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Activity Notifications
                </h2>
                <span className="rounded bg-teal-100 px-2 py-1 text-xs text-teal-700">
                  {notifications.filter((n) => !n.read_at).length} unread
                </span>
              </div>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg
                  className={`size-4 transition-transform ${showNotifications ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                {showNotifications ? "Hide" : "Show"}
              </button>
            </div>
            {showNotifications && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      notification.read_at
                        ? "border-gray-200 bg-white"
                        : "border-teal-200 bg-teal-50"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        notification.type === "service_enrollment"
                          ? "bg-teal-100"
                          : "bg-green-100"
                      }`}
                    >
                      {notification.type === "service_enrollment" ? (
                        <svg
                          className="size-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="size-4 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={`text-sm ${
                              notification.read_at
                                ? "text-gray-700"
                                : "font-medium text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read_at && adminUser && (
                          <button
                            onClick={async () => {
                              try {
                                await markAsRead(notification.id, adminUser.id);
                                setNotifications((prev) =>
                                  prev.map((n) =>
                                    n.id === notification.id
                                      ? {
                                          ...n,
                                          read_at: new Date().toISOString(),
                                          read_by: adminUser.id,
                                        }
                                      : n
                                  )
                                );
                              } catch (err) {
                                console.error("Failed to mark as read:", err);
                              }
                            }}
                            className="shrink-0 text-xs text-teal-600 hover:text-teal-700"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Broker Accounts */}
        <section className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Broker Accounts
            </h2>
            <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">
              Sensitive Data
            </span>
          </div>
          {brokerAccounts.length === 0 ? (
            <p className="text-gray-500">No broker accounts linked.</p>
          ) : (
            <div className="space-y-4">
              {brokerAccounts.map((broker) => {
                const revealedPassword = getRevealedPassword(broker);
                const isRevealed = revealedPassword !== null;
                const revealedApiKey = getRevealedApiKey(broker);
                const isApiKeyRevealed = revealedApiKey !== null;

                return (
                  <div
                    key={broker.id}
                    className="rounded border border-gray-200 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{broker.broker_name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${getStatusBadge(
                          broker.is_active ? "active" : "inactive",
                        )}`}
                      >
                        {broker.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Account: {broker.broker_account_number}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span>Password:</span>
                        {isRevealed ? (
                          <span className="font-mono text-green-700">
                            {revealedPassword}
                          </span>
                        ) : (
                          <>
                            <span className="font-mono">{"•".repeat(12)}</span>
                            <button
                              onClick={() => handleRevealPassword(broker)}
                              className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200"
                            >
                              Reveal (2FA)
                            </button>
                          </>
                        )}
                      </div>
                      {isRevealed && (
                        <p className="mt-2 text-xs text-amber-600">
                          Password visible for 5 minutes or until you navigate
                          away.
                        </p>
                      )}
                      {broker.api_key && (
                        <div className="mt-1 flex items-center gap-2">
                          <span>API Key:</span>
                          {isApiKeyRevealed ? (
                            <span className="break-all font-mono text-xs text-green-700">
                              {revealedApiKey}
                            </span>
                          ) : (
                            <>
                              <span className="font-mono">{"•".repeat(12)}</span>
                              <button
                                onClick={() => handleRevealApiKey(broker)}
                                className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200"
                              >
                                Reveal (2FA)
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      {isApiKeyRevealed && (
                        <p className="mt-2 text-xs text-amber-600">
                          API key visible for 5 minutes or until you navigate
                          away.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* VPS Instances */}
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Assigned VPS
          </h2>
          {vpsInstances.length === 0 ? (
            <p className="text-gray-500">No VPS assigned to this user.</p>
          ) : (
            <div className="space-y-4">
              {vpsInstances.map((vps) => (
                <div
                  key={vps.id}
                  className="rounded border border-gray-200 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{vps.provider_vps_name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs capitalize ${getStatusBadge(
                        vps.status,
                      )}`}
                    >
                      {vps.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Provider: {vps.host_provider}</div>
                    <div>IP: {vps.ip_address || "Not assigned"}</div>
                    <div>Region: {vps.region}</div>
                    <div>OS: {vps.operating_system}</div>
                    <div>
                      Specs: {vps.vcpu} vCPU / {vps.vram_gb} GB RAM
                    </div>
                  </div>
                  <Link
                    to={`/vps/${vps.id}`}
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                  >
                    View VPS Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Service Agreements */}
        <section className="rounded-lg bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Service Agreements
          </h2>
          {serviceAgreements.length === 0 ? (
            <p className="text-gray-500">No service agreements.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Service
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Version
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Agreed At
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {serviceAgreements.map((agreement) => (
                    <tr key={agreement.id}>
                      <td className="whitespace-nowrap px-4 py-2 font-medium">
                        {agreement.service_name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                        {agreement.service_version}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                              agreement.status,
                            )}`}
                          >
                            {agreement.status}
                          </span>
                          {agreement.status === "suspended" &&
                            agreement.suspension_reason && (
                              <span className="text-xs text-red-600">
                                Reason: {agreement.suspension_reason}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                        {new Date(agreement.agreed_at).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        {agreement.status === "suspended" ? (
                          <button
                            onClick={() => handleUnsuspendService(agreement)}
                            className="rounded border border-green-300 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            Unsuspend
                          </button>
                        ) : agreement.status === "active" ? (
                          <button
                            onClick={() => openSuspendModal(agreement)}
                            className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Suspend
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Invoices */}
        <section className="rounded-lg bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Invoices</h2>
          {!user.billing?.stripe_customer_id ? (
            <p className="text-gray-500">
              No Stripe account connected - no invoices available.
            </p>
          ) : invoicesLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-gray-500">No invoices found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Invoice #
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="whitespace-nowrap px-4 py-2 font-mono text-sm">
                        {invoice.number || invoice.id.substring(0, 12)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium">
                        ${(invoice.amount_due / 100).toFixed(2)}{" "}
                        {invoice.currency.toUpperCase()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                            invoice.status,
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                        {new Date(invoice.created * 1000).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm">
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </a>
                        )}
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-blue-600 hover:text-blue-800"
                          >
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Reset Password
            </h3>

            {resetMessage && (
              <div
                className={`mb-4 rounded-lg p-3 text-sm ${
                  resetMessage.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {resetMessage.text}
              </div>
            )}

            <p className="mb-4 text-sm text-gray-600">
              You are about to send a password reset email to:
            </p>
            <p className="mb-4 rounded bg-gray-100 p-3 font-medium text-gray-900">
              {user.email}
            </p>
            <p className="mb-2 text-sm text-gray-600">
              To confirm, please type the email address below:
            </p>
            <input
              type="email"
              value={resetEmailConfirm}
              onChange={(e) => setResetEmailConfirm(e.target.value)}
              placeholder="Type email to confirm"
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeResetModal}
                disabled={resettingPassword}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resettingPassword || resetEmailConfirm !== user.email}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resettingPassword ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Email"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showChangeEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Change Email Address
            </h3>

            {changeEmailMessage && (
              <div
                className={`mb-4 rounded-lg p-3 text-sm ${
                  changeEmailMessage.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {changeEmailMessage.text}
              </div>
            )}

            {changeEmailStep === "validate" ? (
              <>
                <p className="mb-4 text-sm text-gray-600">
                  To change this user's email, first verify their identity by
                  entering their current information:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Email
                    </label>
                    <input
                      type="email"
                      value={changeEmailForm.currentEmail}
                      onChange={(e) =>
                        setChangeEmailForm({
                          ...changeEmailForm,
                          currentEmail: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="current@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={changeEmailForm.firstName}
                        onChange={(e) =>
                          setChangeEmailForm({
                            ...changeEmailForm,
                            firstName: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={changeEmailForm.lastName}
                        onChange={(e) =>
                          setChangeEmailForm({
                            ...changeEmailForm,
                            lastName: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={changeEmailForm.phone}
                      onChange={(e) =>
                        setChangeEmailForm({
                          ...changeEmailForm,
                          phone: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={changeEmailForm.addressLine1}
                      onChange={(e) =>
                        setChangeEmailForm({
                          ...changeEmailForm,
                          addressLine1: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        value={changeEmailForm.city}
                        onChange={(e) =>
                          setChangeEmailForm({
                            ...changeEmailForm,
                            city: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        value={changeEmailForm.state}
                        onChange={(e) =>
                          setChangeEmailForm({
                            ...changeEmailForm,
                            state: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        placeholder="TX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        ZIP
                      </label>
                      <input
                        type="text"
                        value={changeEmailForm.zip}
                        onChange={(e) =>
                          setChangeEmailForm({
                            ...changeEmailForm,
                            zip: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeChangeEmailModal}
                    disabled={changeEmailLoading}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleValidateIdentity}
                    disabled={
                      changeEmailLoading ||
                      !changeEmailForm.currentEmail ||
                      !changeEmailForm.firstName ||
                      !changeEmailForm.lastName
                    }
                    className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changeEmailLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        Validating...
                      </span>
                    ) : (
                      "Validate Identity"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-600">
                  Identity verified. Enter the new email address for this user:
                </p>

                <div className="mb-4 rounded bg-gray-100 p-3">
                  <p className="text-sm text-gray-600">
                    Current email:{" "}
                    <span className="font-medium text-gray-900">
                      {user.email}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={changeEmailForm.newEmail}
                    onChange={(e) =>
                      setChangeEmailForm({
                        ...changeEmailForm,
                        newEmail: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    placeholder="new@email.com"
                    autoFocus
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  This will update the email in authentication, billing, and
                  Stripe. A confirmation email will be sent to the new address.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeChangeEmailModal}
                    disabled={changeEmailLoading}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangeEmail}
                    disabled={
                      changeEmailLoading ||
                      !changeEmailForm.newEmail ||
                      changeEmailForm.newEmail === user.email
                    }
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changeEmailLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        Changing...
                      </span>
                    ) : (
                      "Change Email"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Suspend Service Modal */}
      {showSuspendModal && selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Suspend Service
            </h3>

            {suspendMessage && (
              <div
                className={`mb-4 rounded-lg p-3 text-sm ${
                  suspendMessage.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {suspendMessage.text}
              </div>
            )}

            <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                You are about to suspend the{" "}
                <strong>{selectedAgreement.service_name}</strong> service for
                this user. The user will see their service as "Under Review" in
                the frontend.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Suspension Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={suspendForm.reasonCode}
                  onChange={(e) =>
                    setSuspendForm({ ...suspendForm, reasonCode: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  <option value="">Select a reason...</option>
                  {suspensionReasons.map((reason) => (
                    <option key={reason.code} value={reason.code}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  value={suspendForm.notes}
                  onChange={(e) =>
                    setSuspendForm({ ...suspendForm, notes: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="Additional details about the suspension..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeSuspendModal}
                disabled={suspendLoading}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendService}
                disabled={suspendLoading || !suspendForm.reasonCode}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suspendLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Suspending...
                  </span>
                ) : (
                  "Suspend Service"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
