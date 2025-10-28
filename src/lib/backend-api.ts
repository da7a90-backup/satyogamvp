/**
 * Backend API Client for Sat Yoga FastAPI Backend
 *
 * This client handles all communication with the FastAPI backend,
 * including authentication, teachings, courses, payments, etc.
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Get the auth token from session storage or next-auth session
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try to get from localStorage (set during login)
  return localStorage.getItem('access_token');
}

/**
 * Base fetch wrapper with auth and error handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/api${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.detail || 'An error occurred',
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error', 0, error);
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  membership_tier: 'FREE' | 'PRAGYANI' | 'PRAGYANI_PLUS';
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export const authAPI = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    return apiFetch<User>('/auth/me');
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refresh_token')
      : null;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiFetch<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
    }

    return response;
  },
};

// ============================================================================
// TEACHINGS
// ============================================================================

export interface Teaching {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content_type: 'VIDEO' | 'AUDIO' | 'TEXT';
  access_level: 'FREE' | 'PREVIEW' | 'PRAGYANI' | 'PRAGYANI_PLUS';
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  text_content?: string;
  duration?: number;
  published_date: string;
  category?: string;
  tags?: string[];
  view_count: number;
  can_access: boolean;
  access_type: 'full' | 'preview' | 'none';
  preview_duration?: number;
}

export interface TeachingListResponse {
  teachings: Teaching[];
  total: number;
  skip: number;
  limit: number;
}

export const teachingsAPI = {
  /**
   * Get list of teachings with optional filters
   */
  async getTeachings(params?: {
    category?: string;
    content_type?: string;
    skip?: number;
    limit?: number;
  }): Promise<TeachingListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.content_type) queryParams.append('content_type', params.content_type);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiFetch<TeachingListResponse>(`/teachings${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single teaching by slug
   */
  async getTeachingBySlug(slug: string): Promise<Teaching> {
    return apiFetch<Teaching>(`/teachings/${slug}`);
  },

  /**
   * Toggle favorite on a teaching
   */
  async toggleFavorite(teachingId: string): Promise<{ message: string; is_favorite: boolean }> {
    return apiFetch(`/teachings/${teachingId}/favorite`, {
      method: 'POST',
    });
  },

  /**
   * Get user's favorite teachings
   */
  async getFavorites(): Promise<{ favorites: Teaching[] }> {
    return apiFetch('/teachings/favorites/list');
  },
};

// ============================================================================
// COURSES
// ============================================================================

export interface Course {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  thumbnail_url?: string;
  instructor_id: string;
  instructor_name?: string;
  is_published: boolean;
  duration?: number;
  enrollment_count: number;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
}

export const coursesAPI = {
  /**
   * Get list of courses
   */
  async getCourses(): Promise<{ courses: Course[] }> {
    return apiFetch('/courses');
  },

  /**
   * Get a single course by slug
   */
  async getCourseBySlug(slug: string): Promise<Course> {
    return apiFetch(`/courses/${slug}`);
  },

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<CourseEnrollment> {
    return apiFetch('/courses/enroll', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  /**
   * Get user's enrolled courses
   */
  async getMyEnrollments(): Promise<{ enrollments: CourseEnrollment[] }> {
    return apiFetch('/courses/my-enrollments');
  },

  /**
   * Update course progress
   */
  async updateProgress(courseId: string, progress: number): Promise<void> {
    return apiFetch(`/courses/${courseId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress_percentage: progress }),
    });
  },
};

// ============================================================================
// PAYMENTS
// ============================================================================

export interface PaymentIntent {
  payment_id: string;
  payment_data: {
    key: string;
    url: string;
    [key: string]: any;
  };
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  payment_type: 'COURSE' | 'RETREAT' | 'MEMBERSHIP' | 'PRODUCT' | 'DONATION';
  created_at: string;
}

export const paymentsAPI = {
  /**
   * Create payment intent for course
   */
  async createCoursePayment(courseId: string): Promise<PaymentIntent> {
    return apiFetch('/payments/course', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  /**
   * Create payment intent for membership
   */
  async createMembershipPayment(tier: string, frequency: string): Promise<PaymentIntent> {
    return apiFetch('/payments/membership', {
      method: 'POST',
      body: JSON.stringify({ tier, frequency }),
    });
  },

  /**
   * Create payment intent for retreat
   */
  async createRetreatPayment(retreatId: string, accessType: string): Promise<PaymentIntent> {
    return apiFetch('/payments/retreat', {
      method: 'POST',
      body: JSON.stringify({ retreat_id: retreatId, access_type: accessType }),
    });
  },

  /**
   * Create donation payment
   */
  async createDonation(amount: number, category?: string): Promise<PaymentIntent> {
    return apiFetch('/payments/donation', {
      method: 'POST',
      body: JSON.stringify({ amount, category }),
    });
  },

  /**
   * Get user's payment history
   */
  async getPaymentHistory(): Promise<{ payments: Payment[] }> {
    return apiFetch('/payments/history');
  },
};

// ============================================================================
// RETREATS
// ============================================================================

export interface Retreat {
  id: string;
  slug: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  price_onsite?: number;
  price_online?: number;
  is_published: boolean;
}

export interface RetreatRegistration {
  id: string;
  retreat_id: string;
  user_id: string;
  access_type: 'LIFETIME' | 'LIMITED_12DAY' | 'ONSITE';
  registered_at: string;
  expires_at?: string;
}

export const retreatsAPI = {
  /**
   * Get list of retreats
   */
  async getRetreats(): Promise<{ retreats: Retreat[] }> {
    return apiFetch('/retreats');
  },

  /**
   * Get a single retreat by slug
   */
  async getRetreatBySlug(slug: string): Promise<Retreat> {
    return apiFetch(`/retreats/${slug}`);
  },

  /**
   * Register for a retreat
   */
  async registerForRetreat(
    retreatId: string,
    accessType: 'LIFETIME' | 'LIMITED_12DAY' | 'ONSITE'
  ): Promise<RetreatRegistration> {
    return apiFetch('/retreats/register', {
      method: 'POST',
      body: JSON.stringify({ retreat_id: retreatId, access_type: accessType }),
    });
  },

  /**
   * Get user's retreat registrations
   */
  async getMyRegistrations(): Promise<{ registrations: RetreatRegistration[] }> {
    return apiFetch('/retreats/my-registrations');
  },
};

// ============================================================================
// PRODUCTS
// ============================================================================

export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  product_type: 'BOOK' | 'AUDIO' | 'VIDEO' | 'DIGITAL' | 'PHYSICAL';
  thumbnail_url?: string;
  is_published: boolean;
}

export const productsAPI = {
  /**
   * Get list of products
   */
  async getProducts(): Promise<{ products: Product[] }> {
    return apiFetch('/products');
  },

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    return apiFetch(`/products/${slug}`);
  },

  /**
   * Get user's digital library
   */
  async getMyLibrary(): Promise<{ products: Product[] }> {
    return apiFetch('/products/my-library');
  },
};

// ============================================================================
// USERS
// ============================================================================

export interface UserProfile {
  phone?: string;
  country?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
}

export const usersAPI = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiFetch('/users/profile');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update membership tier
   */
  async updateMembershipTier(tier: 'FREE' | 'PRAGYANI' | 'PRAGYANI_PLUS'): Promise<User> {
    return apiFetch('/users/membership', {
      method: 'PUT',
      body: JSON.stringify({ tier }),
    });
  },
};

// Export the complete API client
export const backendAPI = {
  auth: authAPI,
  teachings: teachingsAPI,
  courses: coursesAPI,
  payments: paymentsAPI,
  retreats: retreatsAPI,
  products: productsAPI,
  users: usersAPI,
};

export default backendAPI;
