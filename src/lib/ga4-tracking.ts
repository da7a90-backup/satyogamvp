/**
 * Google Analytics 4 tracking implementation
 * Automatic event tracking throughout the application
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';

/**
 * Initialize GA4 with measurement ID
 */
export const initGA4 = (): void => {
  if (!GA4_MEASUREMENT_ID) {
    console.warn('GA4_MEASUREMENT_ID not configured');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  // Initialize gtag
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: false, // We'll handle page views manually
  });
};

/**
 * Track page view
 */
export const trackPageView = (url: string, title?: string): void => {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  if (!window.gtag) return;

  window.gtag('event', eventName, eventParams);
};

// ==================== E-COMMERCE EVENTS ====================

/**
 * Track product view
 */
export const trackProductView = (product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
}): void => {
  trackEvent('view_item', {
    currency: 'USD',
    value: product.price || 0,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category || 'Unknown',
      price: product.price || 0,
    }],
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}): void => {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: product.price * (product.quantity || 1),
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
    }],
  });
};

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (items: Array<{
  id: string;
  name: string;
  price: number;
  quantity?: number;
}>, totalValue: number): void => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: totalValue,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * Track purchase
 */
export const trackPurchase = (transaction: {
  transaction_id: string;
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }>;
}): void => {
  trackEvent('purchase', {
    transaction_id: transaction.transaction_id,
    value: transaction.value,
    currency: transaction.currency || 'USD',
    items: transaction.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * Track refund
 */
export const trackRefund = (transaction_id: string, value: number): void => {
  trackEvent('refund', {
    transaction_id,
    value,
    currency: 'USD',
  });
};

// ==================== USER ENGAGEMENT EVENTS ====================

/**
 * Track user login
 */
export const trackLogin = (method?: string): void => {
  trackEvent('login', {
    method: method || 'email',
  });
};

/**
 * Track user signup
 */
export const trackSignup = (method?: string): void => {
  trackEvent('sign_up', {
    method: method || 'email',
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string): void => {
  trackEvent('search', {
    search_term: searchTerm,
  });
};

/**
 * Track scroll depth
 */
export const trackScroll = (percentage: number): void => {
  trackEvent('scroll', {
    percent_scrolled: percentage,
  });
};

// ==================== TEACHING & CONTENT EVENTS ====================

/**
 * Track teaching view
 */
export const trackTeachingView = (teaching: {
  id: string;
  title: string;
  category?: string;
}): void => {
  trackEvent('teaching_viewed', {
    teaching_id: teaching.id,
    teaching_title: teaching.title,
    teaching_category: teaching.category,
  });
};

/**
 * Track video start
 */
export const trackVideoStart = (video: {
  id: string;
  title: string;
  duration?: number;
}): void => {
  trackEvent('video_start', {
    video_id: video.id,
    video_title: video.title,
    video_duration: video.duration,
  });
};

/**
 * Track video progress
 */
export const trackVideoProgress = (video: {
  id: string;
  title: string;
  current_time: number;
  duration: number;
  percent_watched: number;
}): void => {
  trackEvent('video_progress', {
    video_id: video.id,
    video_title: video.title,
    video_current_time: video.current_time,
    video_duration: video.duration,
    video_percent: video.percent_watched,
  });
};

/**
 * Track video complete
 */
export const trackVideoComplete = (video: {
  id: string;
  title: string;
  duration: number;
}): void => {
  trackEvent('video_complete', {
    video_id: video.id,
    video_title: video.title,
    video_duration: video.duration,
  });
};

// ==================== COURSE EVENTS ====================

/**
 * Track course enrollment
 */
export const trackCourseEnrollment = (course: {
  id: string;
  title: string;
  price?: number;
}): void => {
  trackEvent('course_enrollment', {
    course_id: course.id,
    course_title: course.title,
    course_price: course.price,
  });
};

/**
 * Track course completion
 */
export const trackCourseCompletion = (course: {
  id: string;
  title: string;
}): void => {
  trackEvent('course_completion', {
    course_id: course.id,
    course_title: course.title,
  });
};

/**
 * Track lesson start
 */
export const trackLessonStart = (lesson: {
  id: string;
  title: string;
  course_id: string;
}): void => {
  trackEvent('lesson_start', {
    lesson_id: lesson.id,
    lesson_title: lesson.title,
    course_id: lesson.course_id,
  });
};

/**
 * Track lesson completion
 */
export const trackLessonCompletion = (lesson: {
  id: string;
  title: string;
  course_id: string;
}): void => {
  trackEvent('lesson_completion', {
    lesson_id: lesson.id,
    lesson_title: lesson.title,
    course_id: lesson.course_id,
  });
};

// ==================== RETREAT EVENTS ====================

/**
 * Track retreat registration
 */
export const trackRetreatRegistration = (retreat: {
  id: string;
  title: string;
  type: string;
  price?: number;
}): void => {
  trackEvent('retreat_registration', {
    retreat_id: retreat.id,
    retreat_title: retreat.title,
    retreat_type: retreat.type,
    retreat_price: retreat.price,
  });
};

// ==================== MEMBERSHIP EVENTS ====================

/**
 * Track membership upgrade
 */
export const trackMembershipUpgrade = (membership: {
  from_tier: string;
  to_tier: string;
  price: number;
}): void => {
  trackEvent('membership_upgrade', {
    from_tier: membership.from_tier,
    to_tier: membership.to_tier,
    upgrade_price: membership.price,
  });
};

/**
 * Track free trial start
 */
export const trackFreeTrialStart = (tier: string): void => {
  trackEvent('free_trial_start', {
    trial_tier: tier,
  });
};

/**
 * Track subscription cancellation
 */
export const trackSubscriptionCancel = (tier: string, reason?: string): void => {
  trackEvent('subscription_cancel', {
    subscription_tier: tier,
    cancel_reason: reason,
  });
};

// ==================== FORM EVENTS ====================

/**
 * Track form start
 */
export const trackFormStart = (formName: string): void => {
  trackEvent('form_start', {
    form_name: formName,
  });
};

/**
 * Track form submit
 */
export const trackFormSubmit = (formName: string, success: boolean): void => {
  trackEvent('form_submit', {
    form_name: formName,
    form_success: success,
  });
};

/**
 * Track form error
 */
export const trackFormError = (formName: string, errorMessage: string): void => {
  trackEvent('form_error', {
    form_name: formName,
    error_message: errorMessage,
  });
};

// ==================== ENGAGEMENT TRACKING ====================

/**
 * Track button click
 */
export const trackButtonClick = (buttonName: string, location?: string): void => {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: location || window.location.pathname,
  });
};

/**
 * Track link click
 */
export const trackLinkClick = (linkUrl: string, linkText?: string): void => {
  trackEvent('link_click', {
    link_url: linkUrl,
    link_text: linkText,
  });
};

/**
 * Track file download
 */
export const trackFileDownload = (fileName: string, fileType?: string): void => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  });
};

/**
 * Track share action
 */
export const trackShare = (method: string, contentType?: string, contentId?: string): void => {
  trackEvent('share', {
    method,
    content_type: contentType,
    content_id: contentId,
  });
};

// ==================== ERROR TRACKING ====================

/**
 * Track error
 */
export const trackError = (error: {
  message: string;
  stack?: string;
  page?: string;
}): void => {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    error_page: error.page || window.location.pathname,
  });
};

/**
 * Set user ID for cross-device tracking
 */
export const setUserId = (userId: string): void => {
  if (!window.gtag) return;

  window.gtag('config', GA4_MEASUREMENT_ID, {
    user_id: userId,
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!window.gtag) return;

  window.gtag('set', 'user_properties', properties);
};

export default {
  initGA4,
  trackPageView,
  trackEvent,
  trackProductView,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackRefund,
  trackLogin,
  trackSignup,
  trackSearch,
  trackScroll,
  trackTeachingView,
  trackVideoStart,
  trackVideoProgress,
  trackVideoComplete,
  trackCourseEnrollment,
  trackCourseCompletion,
  trackLessonStart,
  trackLessonCompletion,
  trackRetreatRegistration,
  trackMembershipUpgrade,
  trackFreeTrialStart,
  trackSubscriptionCancel,
  trackFormStart,
  trackFormSubmit,
  trackFormError,
  trackButtonClick,
  trackLinkClick,
  trackFileDownload,
  trackShare,
  trackError,
  setUserId,
  setUserProperties,
};
