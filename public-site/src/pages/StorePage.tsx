import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// Sample products data (in real app, this would come from an API)
const products = [
  { id: "1", name: "PLA Filament - Red", brand: "FundedYouth", category: "PLA Filament", description: "High-quality PLA filament for 3D printing", in_stock: true, featured: false },
  { id: "2", name: "PLA Filament - Blue", brand: "FundedYouth", category: "PLA Filament", description: "High-quality PLA filament for 3D printing", in_stock: true, featured: true },
  { id: "3", name: "PLA Filament - Green", brand: "FundedYouth", category: "PLA Filament", description: "High-quality PLA filament for 3D printing", in_stock: true, featured: false },
  { id: "4", name: "PETG Filament - Clear", brand: "FundedYouth", category: "PETG Filament", description: "Durable PETG filament for functional prints", in_stock: true, featured: false },
  { id: "5", name: "TPU Filament - Black", brand: "FundedYouth", category: "TPU Filament", description: "Flexible TPU filament for elastic prints", in_stock: false, featured: false },
  { id: "6", name: "ABS Filament - White", brand: "FundedYouth", category: "ABS Filament", description: "Strong ABS filament for durable parts", in_stock: true, featured: false },
];

const categories = ["PLA Filament", "PETG Filament", "TPU Filament", "ABS Filament"];
const brands = ["FundedYouth"];

export function StorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const matchesBrand = activeBrand === "all" || product.brand === activeBrand;
      const matchesSearch = searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [activeCategory, activeBrand, searchTerm]);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/ecommerce-products.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Emerald Overlay */}
        <div className="absolute inset-0 bg-emerald-600/85"></div>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            In-Store at Parkway Plaza
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
            Maker Supplies &<br />
            <span className="text-emerald-300">STEAM Essentials</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6">
            Browse our selection of 3D printing supplies, electronics kits, and educational
            tools. All items available for purchase in-store.
          </p>

          {/* In-Store Notice */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-bold text-lg">In-Store Pricing = Better Deals</span>
            </div>
            <p className="text-emerald-100 text-sm">
              Stop by our location for special in-store pricing. Ask our team about current deals
              and bulk discounts!
            </p>
          </div>
        </div>
      </section>

      {/* Store Notice Banner */}
      <section className="bg-amber-50 border-y border-amber-200 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 text-amber-700">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">This is a product preview only.</span>
            </div>
            <span className="text-amber-600">
              Visit us in-store to purchase. Prices available upon request.
            </span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Filter Controls */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Showing <span>{filteredProducts.length}</span> items
                </p>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}

              {/* Brand Filter Dropdown */}
              <div className="ml-auto">
                <select
                  value={activeBrand}
                  onChange={(e) => setActiveBrand(e.target.value)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.featured && (
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        Featured
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                        Out of Stock
                      </div>
                    )}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">Brand: {product.brand}</p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                      {product.description}
                    </p>

                    {/* Price CTA */}
                    <div className="border-t border-gray-100 pt-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Ask for Pricing</span>
                        {product.in_stock ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Visit Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Visit Our Store
              </h2>
              <p className="text-gray-600 mb-6">
                Stop by FundedYouth at Parkway Plaza to see our full product selection, get
                hands-on with demos, and take advantage of exclusive in-store pricing.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="text-gray-600 text-sm">Parkway Plaza, El Cajon, CA</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <a href="tel:+16197285002" className="text-emerald-600 hover:text-emerald-700 text-sm">
                      (619) 728-5002
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">In-Store Discounts</p>
                    <p className="text-gray-600 text-sm">Ask about bulk pricing and member discounts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Why Buy In-Store?</h3>
              <ul className="space-y-3 text-emerald-100 text-sm">
                {[
                  "Lower prices than online retailers",
                  "No shipping costs or wait times",
                  "Expert advice from our team",
                  "Support a local nonprofit",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="inline-block mt-6 bg-white text-emerald-700 font-semibold py-2 px-6 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Get Directions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-slate-900 to-emerald-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Need Something Specific?
          </h2>
          <p className="text-slate-300 mb-6">
            Don't see what you're looking for? We can special order items for you. Contact us to
            discuss your project needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Contact Us
            </Link>
            <a
              href="tel:+16197285002"
              className="inline-block border-2 border-white/30 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Call (619) 728-5002
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
