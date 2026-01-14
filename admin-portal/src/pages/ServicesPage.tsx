import { useState, useEffect } from "react";
import { Service, ServiceAcknowledgment } from "types/service";
import { supabase } from "lib/supabaseClient";

type ModalTab = "basic" | "display" | "agreement" | "acknowledgments";

interface FormData {
  name: string;
  display_name: string;
  description: string;
  display_description: string;
  version: string;
  enabled: boolean;
  requires_agreement: boolean;
  terms_content: string;
  features: string[];
  pricing_type: string;
  pricing_amount: string;
  pricing_percentage: string;
  pricing_period: string;
  max_instances_per_user: number;
  acknowledgments: ServiceAcknowledgment[];
}

const defaultFormData: FormData = {
  name: "",
  display_name: "",
  description: "",
  display_description: "",
  version: "1.0",
  enabled: true,
  requires_agreement: true,
  terms_content: "",
  features: [],
  pricing_type: "fixed",
  pricing_amount: "",
  pricing_percentage: "",
  pricing_period: "monthly",
  max_instances_per_user: 1,
  acknowledgments: [],
};

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>("basic");
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // New feature/acknowledgment input
  const [newFeature, setNewFeature] = useState("");
  const [newAcknowledgment, setNewAcknowledgment] = useState({
    id: "",
    text: "",
    required: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (service: Service) => {
    try {
      const { error: updateError } = await supabase
        .from("services")
        .update({ enabled: !service.enabled })
        .eq("id", service.id);

      if (updateError) throw updateError;

      setServices(
        services.map((s) =>
          s.id === service.id ? { ...s, enabled: !s.enabled } : s,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update service");
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData(defaultFormData);
    setActiveTab("basic");
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      display_name: service.display_name,
      description: service.description || "",
      display_description: service.display_description || "",
      version: service.version,
      enabled: service.enabled,
      requires_agreement: service.requires_agreement,
      terms_content: service.terms_content || "",
      features: service.features || [],
      pricing_type: service.pricing_type || "fixed",
      pricing_amount: service.pricing_amount?.toString() || "",
      pricing_percentage: service.pricing_percentage?.toString() || "",
      pricing_period: service.pricing_period || "monthly",
      max_instances_per_user: service.max_instances_per_user ?? 1,
      acknowledgments: service.acknowledgments || [],
    });
    setActiveTab("basic");
    setModalError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setModalError(null);
    setNewFeature("");
    setNewAcknowledgment({ id: "", text: "", required: true });
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({
      ...formData,
      features: [...formData.features, newFeature.trim()],
    });
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleAddAcknowledgment = () => {
    if (!newAcknowledgment.id.trim() || !newAcknowledgment.text.trim()) return;
    setFormData({
      ...formData,
      acknowledgments: [
        ...formData.acknowledgments,
        {
          id: newAcknowledgment.id.toLowerCase().replace(/\s+/g, "_"),
          text: newAcknowledgment.text,
          required: newAcknowledgment.required,
        },
      ],
    });
    setNewAcknowledgment({ id: "", text: "", required: true });
  };

  const handleRemoveAcknowledgment = (index: number) => {
    setFormData({
      ...formData,
      acknowledgments: formData.acknowledgments.filter((_, i) => i !== index),
    });
  };

  const handleUpdateAcknowledgment = (
    index: number,
    field: keyof ServiceAcknowledgment,
    value: string | boolean,
  ) => {
    const updated = [...formData.acknowledgments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, acknowledgments: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    setModalError(null);

    try {
      const updateData = {
        display_name: formData.display_name,
        description: formData.description || null,
        display_description: formData.display_description || null,
        version: formData.version,
        enabled: formData.enabled,
        requires_agreement: formData.requires_agreement,
        terms_content: formData.terms_content || null,
        terms_updated_at: formData.terms_content
          ? new Date().toISOString()
          : null,
        features: formData.features,
        pricing_type: formData.pricing_type || null,
        pricing_amount: formData.pricing_amount
          ? parseFloat(formData.pricing_amount)
          : null,
        pricing_percentage: formData.pricing_percentage
          ? parseFloat(formData.pricing_percentage)
          : null,
        pricing_period: formData.pricing_period || null,
        max_instances_per_user: formData.max_instances_per_user,
        acknowledgments: formData.acknowledgments,
      };

      if (editingService) {
        const { error: updateError } = await supabase
          .from("services")
          .update(updateData)
          .eq("id", editingService.id);

        if (updateError) throw updateError;
      } else {
        if (!formData.name.trim()) {
          throw new Error("Service name is required");
        }

        const { error: insertError } = await supabase.from("services").insert({
          name: formData.name.toLowerCase().replace(/\s+/g, "_"),
          ...updateData,
          required_fields: [],
        });

        if (insertError) throw insertError;
      }

      await fetchServices();
      closeModal();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to save service",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500">
            Manage service definitions and availability
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Create Service
        </button>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <p className="text-gray-500">No services defined yet.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {service.display_name}
                    </h2>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        service.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <span className="text-xs text-gray-500">
                      v{service.version}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {service.display_description ||
                      service.description ||
                      "No description"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>
                      <strong>Name:</strong> {service.name}
                    </span>
                    <span>
                      <strong>Agreement:</strong>{" "}
                      {service.requires_agreement ? "Required" : "Not required"}
                    </span>
                    <span>
                      <strong>Acknowledgments:</strong>{" "}
                      {service.acknowledgments?.length || 0}
                    </span>
                    {service.pricing_type === "percentage" &&
                      service.pricing_percentage && (
                        <span>
                          <strong>Pricing:</strong>{" "}
                          {service.pricing_percentage}% {service.pricing_period}
                        </span>
                      )}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleEnabled(service)}
                    className={`rounded px-3 py-1.5 text-sm font-medium ${
                      service.enabled
                        ? "border border-red-300 text-red-600 hover:bg-red-50"
                        : "border border-green-300 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {service.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => openEditModal(service)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {service.terms_content && (
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Terms & Conditions
                      </span>
                      {service.terms_updated_at && (
                        <span className="text-xs text-gray-500">
                          Updated:{" "}
                          {new Date(
                            service.terms_updated_at,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-600">
                      {service.terms_content}
                    </p>
                  </div>
                )}
                {service.acknowledgments && service.acknowledgments.length > 0 && (
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <span className="text-xs font-medium text-gray-700">
                      Acknowledgments ({service.acknowledgments.length})
                    </span>
                    <ul className="mt-1 space-y-1">
                      {service.acknowledgments.slice(0, 2).map((ack) => (
                        <li
                          key={ack.id}
                          className="line-clamp-1 text-xs text-gray-600"
                        >
                          • {ack.text}
                        </li>
                      ))}
                      {service.acknowledgments.length > 2 && (
                        <li className="text-xs text-gray-400">
                          +{service.acknowledgments.length - 2} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingService ? "Edit Service" : "Create New Service"}
              </h3>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-4 px-6">
                {(
                  [
                    { id: "basic", label: "Basic Info" },
                    { id: "display", label: "Display Settings" },
                    { id: "agreement", label: "Agreement" },
                    { id: "acknowledgments", label: "Acknowledgments" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalError && (
                <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  {!editingService && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Service Name (identifier) *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        placeholder="e.g., mt5_service"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Lowercase, underscores only. Used as unique identifier.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_name: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="e.g., MT5 Auto-Trader (Windows VPS)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Internal Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={2}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="Internal notes about this service"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Version
                      </label>
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) =>
                          setFormData({ ...formData, version: e.target.value })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        placeholder="1.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Max Instances per User
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.max_instances_per_user}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_instances_per_user:
                              parseInt(e.target.value) || 1,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        How many times a user can enroll in this service
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            enabled: e.target.checked,
                          })
                        }
                        className="size-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Enabled</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.requires_agreement}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requires_agreement: e.target.checked,
                          })
                        }
                        className="size-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        Requires Agreement
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Display Settings Tab */}
              {activeTab === "display" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Display Description (shown on service card)
                    </label>
                    <textarea
                      value={formData.display_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_description: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="Description shown to users on the service card..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Features
                    </label>
                    <div className="mt-2 space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                            {feature}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              className="size-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddFeature()
                          }
                          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                          placeholder="Add a feature..."
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pricing Type
                      </label>
                      <select
                        value={formData.pricing_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pricing_type: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                        <option value="subscription">Subscription</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pricing Period
                      </label>
                      <select
                        value={formData.pricing_period}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pricing_period: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      >
                        <option value="one-time">One-time</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {formData.pricing_type === "percentage" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={formData.pricing_percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricing_percentage: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                          placeholder="e.g., 45"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Amount ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.pricing_amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricing_amount: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                          placeholder="e.g., 99.99"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agreement Tab */}
              {activeTab === "agreement" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Terms & Conditions
                    </label>
                    <p className="mb-2 text-xs text-gray-500">
                      The full legal agreement text that users must read and
                      accept during enrollment.
                    </p>
                    <textarea
                      value={formData.terms_content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terms_content: e.target.value,
                        })
                      }
                      rows={20}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="Enter the terms and conditions for this service..."
                    />
                  </div>
                </div>
              )}

              {/* Acknowledgments Tab */}
              {activeTab === "acknowledgments" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Acknowledgments are checkboxes that users must check during
                    enrollment to confirm they understand specific conditions.
                  </p>

                  {/* Existing Acknowledgments */}
                  {formData.acknowledgments.length > 0 && (
                    <div className="space-y-3">
                      {formData.acknowledgments.map((ack, index) => (
                        <div
                          key={index}
                          className="rounded border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-mono text-xs text-gray-500">
                              ID: {ack.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAcknowledgment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                className="size-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                          <textarea
                            value={ack.text}
                            onChange={(e) =>
                              handleUpdateAcknowledgment(
                                index,
                                "text",
                                e.target.value,
                              )
                            }
                            rows={2}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                          />
                          <label className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={ack.required}
                              onChange={(e) =>
                                handleUpdateAcknowledgment(
                                  index,
                                  "required",
                                  e.target.checked,
                                )
                              }
                              className="size-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">
                              Required
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Acknowledgment */}
                  <div className="rounded border border-dashed border-gray-300 p-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Add New Acknowledgment
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600">
                          ID (unique identifier)
                        </label>
                        <input
                          type="text"
                          value={newAcknowledgment.id}
                          onChange={(e) =>
                            setNewAcknowledgment({
                              ...newAcknowledgment,
                              id: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                          placeholder="e.g., risk_acknowledgment"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">
                          Checkbox Text
                        </label>
                        <textarea
                          value={newAcknowledgment.text}
                          onChange={(e) =>
                            setNewAcknowledgment({
                              ...newAcknowledgment,
                              text: e.target.value,
                            })
                          }
                          rows={2}
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                          placeholder="I understand and agree that..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newAcknowledgment.required}
                            onChange={(e) =>
                              setNewAcknowledgment({
                                ...newAcknowledgment,
                                required: e.target.checked,
                              })
                            }
                            className="size-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddAcknowledgment}
                          disabled={
                            !newAcknowledgment.id || !newAcknowledgment.text
                          }
                          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Add Acknowledgment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.display_name}
                  className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      Saving...
                    </span>
                  ) : editingService ? (
                    "Save Changes"
                  ) : (
                    "Create Service"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
