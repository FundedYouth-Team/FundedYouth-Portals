import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProductType } from "services/productTypeService";
import {
  ProductTypeField,
  FieldInputType,
  FIELD_INPUT_TYPES,
} from "types/productType";

interface FieldFormData {
  id: string;
  name: string;
  inputType: FieldInputType;
  placeholder: string;
  presetData: string;
  isRequired: boolean;
}

export function ProductTypeAddPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Product Type basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");

  // Dynamic fields
  const [fields, setFields] = useState<FieldFormData[]>([]);

  const generateFieldId = () => `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addField = () => {
    setFields([
      ...fields,
      {
        id: generateFieldId(),
        name: "",
        inputType: "text",
        placeholder: "",
        presetData: "",
        isRequired: false,
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<FieldFormData>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    );
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const moveField = (id: string, direction: "up" | "down") => {
    const index = fields.findIndex((f) => f.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[swapIndex]] = [
      newFields[swapIndex],
      newFields[index],
    ];
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Product type name is required");
      return;
    }

    if (!sku.trim()) {
      setError("SKU is required");
      return;
    }

    // Validate fields
    for (const field of fields) {
      if (!field.name.trim()) {
        setError("All fields must have a name");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      // Convert form fields to ProductTypeField format
      const productTypeFields: ProductTypeField[] = fields.map(
        (field, index) => ({
          id: field.id,
          name: field.name,
          inputType: field.inputType,
          placeholder: field.placeholder,
          presetData: field.presetData
            ? field.presetData.split(",").map((s) => s.trim()).filter(Boolean)
            : null,
          isRequired: field.isRequired,
          order: index + 1,
        }),
      );

      await createProductType({
        name: name.trim(),
        description: description.trim() || null,
        sku: sku.trim().toUpperCase(),
        fields: productTypeFields,
      });

      navigate("/products/types");
    } catch (err) {
      console.error("Error creating product type:", err);
      setError("Failed to create product type. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/products/types"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Product Type</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Basic Information
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Physical Product"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700"
              >
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g., TYPE-PHYS"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono uppercase shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this product type"
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Custom Fields
              </h2>
              <p className="text-sm text-gray-500">
                Define the fields that products of this type will have
              </p>
            </div>
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
              <svg
                className="mx-auto size-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                No custom fields added yet
              </p>
              <button
                type="button"
                onClick={addField}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Add your first field
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Field {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveField(field.id, "up")}
                        disabled={index === 0}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Move up"
                      >
                        <svg
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(field.id, "down")}
                        disabled={index === fields.length - 1}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Move down"
                      >
                        <svg
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
                        title="Remove field"
                      >
                        <svg
                          className="size-4"
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
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Field Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Field Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        placeholder="e.g., Weight"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                    </div>

                    {/* Input Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Input Type
                      </label>
                      <select
                        value={field.inputType}
                        onChange={(e) =>
                          updateField(field.id, {
                            inputType: e.target.value as FieldInputType,
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      >
                        {FIELD_INPUT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Placeholder */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        placeholder="e.g., Enter weight in lbs"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                    </div>

                    {/* Preset Data (only for select type) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Preset Data
                        {field.inputType === "select" && (
                          <span className="ml-1 text-xs text-gray-500">
                            (comma-separated options)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={field.presetData}
                        onChange={(e) =>
                          updateField(field.id, { presetData: e.target.value })
                        }
                        placeholder={
                          field.inputType === "select"
                            ? "Option 1, Option 2, Option 3"
                            : "Default value (optional)"
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      />
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center md:col-span-2">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) =>
                            updateField(field.id, {
                              isRequired: e.target.checked,
                            })
                          }
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Required field
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/products/types"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Product Type"}
          </button>
        </div>
      </form>
    </div>
  );
}
