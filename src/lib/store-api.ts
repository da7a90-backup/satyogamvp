/**
 * Store & Products API Client
 * Handles products, cart, checkout operations
 */

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export interface Product {
  id: string;
  slug: string;
  title: string;
  type: string;
  price: number;
  description: string;
  short_description: string;
  regular_price: number;
  sale_price: number | null;
  member_discount: number | null;
  digital_content_url: string | null;
  thumbnail_url: string | null;
  featured_image: string | null;
  images: string[];
  sku: string;
  woo_type: string[];
  downloads: any[];
  categories: string[];
  tags: string[];
  portal_media: {
    youtube: string[];
    vimeo: string[];
    cloudflare: string[];
    mp4: string[];
    mp3: string[];
  } | null;
  has_video_category: boolean;
  has_audio_category: boolean;
  product_slug: string | null;
  store_slug: string | null;
  portal_url: string | null;
  is_available: boolean;
  in_stock: boolean;
  stock_quantity: number | null;
  published: boolean;
  featured: boolean;
  weight: string | null;
  allow_reviews: boolean;
  external_url: string | null;
  retreat_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  item_count: number;
}

export interface CheckoutData {
  billing_email?: string;
  billing_name?: string;
  billing_address?: string;
  billing_city?: string;
  billing_country?: string;
  billing_postal_code?: string;
}

export interface CheckoutResponse {
  order_id: string;
  payment_id: string;
  payment_data: any;
  tilopay_order_id: string;
  total: number;
  currency: string;
}

export interface ProductFilters {
  skip?: number;
  limit?: number;
  category?: string;
  product_type?: string;
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: 'name' | 'price' | 'created_at' | 'featured';
  sort_order?: 'asc' | 'desc';
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Products API
 */
export const productsApi = {
  /**
   * Get all products with filters
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const url = `${API_URL}/api/products?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get a single product by slug
   */
  async getProduct(slug: string): Promise<Product> {
    const response = await fetch(`${API_URL}/api/products/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/api/products/categories`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/products/featured?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch featured products: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get retreat packages
   */
  async getRetreatPackages(skip: number = 0, limit: number = 20): Promise<Product[]> {
    const response = await fetch(
      `${API_URL}/api/products/retreat-packages?skip=${skip}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch retreat packages: ${response.statusText}`);
    }

    return response.json();
  },
};

/**
 * Cart API
 */
export const cartApi = {
  /**
   * Get current user's cart
   */
  async getCart(): Promise<Cart> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get cart item count
   */
  async getCartCount(): Promise<number> {
    const token = getAuthToken();
    if (!token) return 0;

    try {
      const response = await fetch(`${API_URL}/api/cart/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return 0;

      const data = await response.json();
      return data.count || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Add item to cart
   */
  async addItem(productId: string, quantity: number = 1): Promise<CartItem> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add item to cart');
    }

    return response.json();
  },

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, quantity: number): Promise<CartItem> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update cart item');
    }

    return response.json();
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove item from cart');
    }
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to clear cart');
    }
  },
};

/**
 * Checkout API
 */
export const checkoutApi = {
  /**
   * Create order and initiate payment
   */
  async checkout(data: CheckoutData): Promise<CheckoutResponse> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Checkout failed');
    }

    return response.json();
  },
};
