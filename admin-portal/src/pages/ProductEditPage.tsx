import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, updateProduct } from "services/productService";
import { getProductTypes } from "services/productTypeService";
import { getCategories } from "services/categoryService";
import { ProductCustomFields } from "types/product";
import { ProductTypeEntity, ProductTypeField } from "types/productType";
import { CategoryEntity } from "types/category";

export function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [productTypes, setProductTypes] = useState<ProductTypeEntity[]>([]);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [selectedTypeFields, setSelectedTypeFields] = useState<ProductTypeField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<ProductCustomFields>({});

  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    type: string;
    category: string;
    quantity: number;
    price: number;
    description: string;
    image_url: string;
    is_active: boolean;
  }>({
    name: "",
    sku: "",
    type: "",
    category: "",
    quantity: 0,
    price: 0,
    description: "",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    async function fetchData() {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch product types, categories, and product data in parallel
        const [typesResult, categoriesResult, product] = await Promise.all([
          getProductTypes(1, 100),
          getCategories(1, 100),
          getProductById(productId),
        ]);

        setProductTypes(typesResult.productTypes);
        setCategories(categoriesResult.categories);

        if (!product) {
          setError("Product not found");
          return;
        }

        setFormData({
          name: product.name,
          sku: product.sku,
          type: product.type,
          category: product.category,
          quantity: product.quantity,
          price: product.price,
          description: product.description || "",
          image_url: product.image_url || "",
          is_active: product.is_active,
        });

        // Load custom field values if they exist
        if (product.custom_fields) {
          setCustomFieldValues(product.custom_fields);
        }

        // Set the selected type's fields if product has a type
        if (product.type) {
          const selectedType = typesResult.productTypes.find(
            (t) => t.id === product.type
          );
          if (selectedType) {
            setSelectedTypeFields(selectedType.fields);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProduct(productId, {
        name: formData.name,
        sku: formData.sku,
        type: formData.type,
        category: formData.category,
        quantity: formData.quantity,
        price: formData.price,
        description: formData.description || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : null,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle type dropdown change - load the selected type's fields
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = e.target.value;
    setFormData((prev) => ({ ...prev, type: typeId }));

    if (typeId) {
      const selectedType = productTypes.find((t) => t.id === typeId);
      if (selectedType) {
        setSelectedTypeFields(selectedType.fields);
        // Initialize custom field values for the new type
        const initialValues: ProductCustomFields = {};
        selectedType.fields.forEach((field) => {
          // Preserve existing values if they exist, otherwise use defaults
          if (customFieldValues[field.id] !== undefined) {
            initialValues[field.id] = customFieldValues[field.id];
          } else {
            // Set default values based on input type
            if (field.inputType === "checkbox") {
              initialValues[field.id] = false;
            } else if (field.inputType === "number") {
              initialValues[field.id] = 0;
            } else {
              initialValues[field.id] = "";
            }
          }
        });
        setCustomFieldValues(initialValues);
      }
    } else {
      setSelectedTypeFields([]);
      setCustomFieldValues({});
    }
  };

  // Handle custom field value changes
  const handleCustomFieldChange = (
    fieldId: string,
    value: string | number | boolean | string[]
  ) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Render a dynamic field based on its type
  const renderDynamicField = (field: ProductTypeField) => {
    const value = customFieldValues[field.id];

    switch (field.inputType) {
      case "text":
      case "email":
      case "url":
        return (
          <input
            type={field.inputType}
            id={`custom-${field.id}`}
            value={(value as string) || ""}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        );

      case "number":
        return (
          <input
            type="number"
            id={`custom-${field.id}`}
            value={(value as number) || 0}
            onChange={(e) =>
              handleCustomFieldChange(field.id, parseFloat(e.target.value) || 0)
            }
            placeholder={field.placeholder}
            required={field.isRequired}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        );

      case "textarea":
        return (
          <textarea
            id={`custom-${field.id}`}
            value={(value as string) || ""}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        );

      case "select":
        return (
          <select
            id={`custom-${field.id}`}
            value={(value as string) || ""}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            required={field.isRequired}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.presetData?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id={`custom-${field.id}`}
              checked={(value as boolean) || false}
              onChange={(e) =>
                handleCustomFieldChange(field.id, e.target.checked)
              }
              className="size-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            <span className="text-sm text-gray-600">{field.placeholder}</span>
          </label>
        );

      case "date":
        return (
          <input
            type="date"
            id={`custom-${field.id}`}
            value={(value as string) || ""}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            required={field.isRequired}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
          Loading product...
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-600">{error}</div>
        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/products"
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          Product updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && formData.name && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Status */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Product Status
              </span>
              <p className="text-sm text-gray-500">
                {formData.is_active ? "This product is visible to customers" : "This product is hidden from customers"}
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {formData.is_active ? "Active" : "Inactive"}
              </span>
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* SKU */}
            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700"
              >
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label
                htmlFor="image_url"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL
              </label>
              <button
                type="button"
                disabled
                className="mt-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                Browse
              </button>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
              <div className="mt-3">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Product preview"
                    className="size-40 rounded-lg border border-gray-200 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex size-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
                    <svg
                      className="size-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No categories available. Please create one first.
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select a type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {productTypes.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No product types available. Please create one first.
                </p>
              )}
            </div>

          </div>

          {/* Dynamic Fields for Selected Product Type */}
          {selectedTypeFields.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                {productTypes.find((t) => t.id === formData.type)?.name} Fields
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {selectedTypeFields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <div
                      key={field.id}
                      className={
                        field.inputType === "textarea" ? "md:col-span-2" : ""
                      }
                    >
                      <label
                        htmlFor={`custom-${field.id}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {field.name}
                        {field.isRequired && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>
                      {renderDynamicField(field)}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <Link
              to="/products"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
