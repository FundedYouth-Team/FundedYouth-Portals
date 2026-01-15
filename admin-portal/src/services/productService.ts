import {
  Product,
  ProductType,
  ProductCategory,
  ProductSortField,
  SortDirection,
} from "types/product";

/**
 * Mock product data for development.
 * Replace with Supabase queries when products table is created.
 */
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Windows Server 2022 License",
    sku: "WIN-SRV-2022",
    type: "digital",
    category: "software",
    quantity: 50,
    image_url: "https://picsum.photos/seed/windows/100/100",
    description: "Windows Server 2022 Standard License",
    price: 499.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Office 365 Business",
    sku: "O365-BUS-001",
    type: "subscription",
    category: "software",
    quantity: 200,
    image_url: "https://picsum.photos/seed/office365/100/100",
    description: "Microsoft Office 365 Business subscription",
    price: 12.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-10T08:30:00Z",
    updated_at: "2024-01-10T08:30:00Z",
  },
  {
    id: "3",
    name: "Dell PowerEdge R740",
    sku: "DELL-PE-R740",
    type: "physical",
    category: "hardware",
    quantity: 5,
    image_url: "https://picsum.photos/seed/dell/100/100",
    description: "Dell PowerEdge R740 Server",
    price: 4999.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-05T14:20:00Z",
    updated_at: "2024-01-05T14:20:00Z",
  },
  {
    id: "4",
    name: "VPS Setup Service",
    sku: "SVC-VPS-SETUP",
    type: "service",
    category: "services",
    quantity: 999,
    image_url: "https://picsum.photos/seed/vpsservice/100/100",
    description: "Professional VPS setup and configuration service",
    price: 149.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-08T09:15:00Z",
    updated_at: "2024-01-08T09:15:00Z",
  },
  {
    id: "5",
    name: "USB-C Docking Station",
    sku: "ACC-DOCK-USB",
    type: "physical",
    category: "accessories",
    quantity: 25,
    image_url: "https://picsum.photos/seed/dock/100/100",
    description: "Universal USB-C Docking Station",
    price: 199.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-12T11:45:00Z",
    updated_at: "2024-01-12T11:45:00Z",
  },
  {
    id: "6",
    name: "Starter Business Bundle",
    sku: "BND-START-001",
    type: "digital",
    category: "bundles",
    quantity: 100,
    image_url: "https://picsum.photos/seed/bundle/100/100",
    description: "Office 365 + Windows license bundle",
    price: 599.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-03T16:00:00Z",
    updated_at: "2024-01-03T16:00:00Z",
  },
  {
    id: "7",
    name: "Adobe Creative Cloud",
    sku: "ADOBE-CC-001",
    type: "subscription",
    category: "software",
    quantity: 75,
    image_url: "https://picsum.photos/seed/adobe/100/100",
    description: "Adobe Creative Cloud full suite subscription",
    price: 54.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-20T13:30:00Z",
    updated_at: "2024-01-20T13:30:00Z",
  },
  {
    id: "8",
    name: "Network Cable Cat6 (100ft)",
    sku: "ACC-CAT6-100",
    type: "physical",
    category: "accessories",
    quantity: 150,
    image_url: "https://picsum.photos/seed/cable/100/100",
    description: "Cat6 Ethernet cable, 100 feet",
    price: 29.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-18T10:00:00Z",
    updated_at: "2024-01-18T10:00:00Z",
  },
  {
    id: "9",
    name: "Managed Backup Service",
    sku: "SVC-BACKUP-MNG",
    type: "service",
    category: "services",
    quantity: 999,
    image_url: "https://picsum.photos/seed/backup/100/100",
    description: "Monthly managed backup service",
    price: 79.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-22T08:00:00Z",
    updated_at: "2024-01-22T08:00:00Z",
  },
  {
    id: "10",
    name: "HP ProLiant DL380",
    sku: "HP-PL-DL380",
    type: "physical",
    category: "hardware",
    quantity: 3,
    image_url: "https://picsum.photos/seed/hpserver/100/100",
    description: "HP ProLiant DL380 Gen10 Server",
    price: 5499.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-25T15:45:00Z",
    updated_at: "2024-01-25T15:45:00Z",
  },
  {
    id: "11",
    name: "SQL Server 2022 Standard",
    sku: "SQL-STD-2022",
    type: "digital",
    category: "software",
    quantity: 30,
    image_url: "https://picsum.photos/seed/sqlserver/100/100",
    description: "Microsoft SQL Server 2022 Standard Edition",
    price: 899.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-28T09:30:00Z",
    updated_at: "2024-01-28T09:30:00Z",
  },
  {
    id: "12",
    name: "Enterprise Support Plan",
    sku: "SVC-ENT-SUPP",
    type: "subscription",
    category: "services",
    quantity: 999,
    image_url: "https://picsum.photos/seed/support/100/100",
    description: "24/7 enterprise support plan",
    price: 299.99,
    is_active: true,
    custom_fields: null,
    created_at: "2024-01-30T12:00:00Z",
    updated_at: "2024-01-30T12:00:00Z",
  },
];

/**
 * Get unique types from products
 */
export function getUniqueProductTypes(): string[] {
  return [...new Set(MOCK_PRODUCTS.map((p) => p.type))];
}

/**
 * Get unique categories from products
 */
export function getProductCategories(): string[] {
  return [...new Set(MOCK_PRODUCTS.map((p) => p.category))];
}

/**
 * Fetch paginated list of products with filtering and sorting.
 */
export async function getProducts(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    type?: ProductType;
    category?: ProductCategory;
    search?: string;
  },
  sort?: {
    field: ProductSortField;
    direction: SortDirection;
  },
): Promise<{
  products: Product[];
  totalCount: number;
  totalPages: number;
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredProducts = [...MOCK_PRODUCTS];

  // Apply filters
  if (filters?.type) {
    filteredProducts = filteredProducts.filter((p) => p.type === filters.type);
  }

  if (filters?.category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === filters.category,
    );
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower),
    );
  }

  // Apply sorting
  if (sort) {
    filteredProducts.sort((a, b) => {
      let aVal: string | number = a[sort.field];
      let bVal: string | number = b[sort.field];

      // Handle string comparison
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalCount = filteredProducts.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const products = filteredProducts.slice(from, to);

  return { products, totalCount, totalPages };
}

/**
 * Fetch a single product by ID.
 */
export async function getProductById(id: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_PRODUCTS.find((p) => p.id === id) || null;
}

/**
 * Update a product by ID.
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("Product not found");
  }

  // Update the product in mock data
  MOCK_PRODUCTS[index] = {
    ...MOCK_PRODUCTS[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return MOCK_PRODUCTS[index];
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("Product not found");
  }

  // Remove the product from mock data
  MOCK_PRODUCTS.splice(index, 1);
}
