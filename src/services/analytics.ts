declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_IDS = ['G-W136GWE5E0', 'G-QN3QBT9QX4'];
export const GA_MEASUREMENT_ID = 'G-W136GWE5E0';

// ─── Microsoft Clarity Client API Wrappers ─────────────────────────────────────

/**
 * Identify a user in Microsoft Clarity session recordings
 * @param customId Unique user identifier (e.g. Firebase UID or email)
 * @param customSessionId Optional custom session identifier
 * @param customPageId Optional custom page identifier
 * @param friendlyName Optional display name (e.g. candidate name or email)
 */
export const clarityIdentify = (
  customId: string,
  customSessionId?: string,
  customPageId?: string,
  friendlyName?: string
) => {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
  try {
    window.clarity('identify', customId, customSessionId, customPageId, friendlyName);
  } catch (err) {
    console.warn('[Clarity] identify error:', err);
  }
};

/**
 * Set custom tag key-value pairs in Microsoft Clarity for recording filters
 */
export const claritySet = (key: string, value: string | string[]) => {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
  try {
    window.clarity('set', key, value);
  } catch (err) {
    console.warn(`[Clarity] set tag (${key}) error:`, err);
  }
};

/**
 * Trigger a custom event in Microsoft Clarity
 */
export const clarityEvent = (eventName: string) => {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
  try {
    window.clarity('event', eventName);
  } catch (err) {
    console.warn(`[Clarity] event (${eventName}) error:`, err);
  }
};

/**
 * Prioritize and upgrade recording fidelity for high-value user sessions
 */
export const clarityUpgrade = (upgradeReason: string) => {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
  try {
    window.clarity('upgrade', upgradeReason);
  } catch (err) {
    console.warn(`[Clarity] upgrade (${upgradeReason}) error:`, err);
  }
};

/**
 * Grant cookie consent to Clarity
 */
export const clarityConsent = () => {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
  try {
    window.clarity('consent');
  } catch (err) {
    console.warn('[Clarity] consent error:', err);
  }
};

/**
 * Helper to identify an authenticated user and tag session attributes
 */
export const identifyUser = (user: {
  uid?: string;
  email?: string;
  displayName?: string;
  role?: string;
  scholarCredits?: number;
  is_premium?: boolean;
}) => {
  if (!user || (!user.uid && !user.email)) return;
  const customId = user.uid || user.email || 'unknown';
  const friendlyName = user.displayName || user.email || user.role || 'Scholar';
  
  clarityIdentify(customId, undefined, undefined, friendlyName);
  
  if (user.role) claritySet('user_role', user.role);
  if (user.is_premium !== undefined) claritySet('is_premium', user.is_premium ? 'true' : 'false');
  if (user.scholarCredits !== undefined) claritySet('scholar_credits', String(user.scholarCredits));
};

// ─── Google Analytics & Dual-Dispatch Handlers ──────────────────────────────────

/**
 * Tracks a pageview in Google Analytics across all measurement IDs
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    try {
      GA_MEASUREMENT_IDS.forEach((id) => {
        window.gtag!('config', id, {
          page_path: url,
          page_title: title || document.title,
          page_location: window.location.href,
        });
      });
    } catch (err) {
      console.warn("[GA] trackPageView error:", err);
    }
  }
};

/**
 * Tracks standard user interaction events in Google Analytics and Microsoft Clarity
 */
export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    } catch (err) {
      console.warn("[GA] trackEvent error:", err);
    }
  }
  // Sync to Microsoft Clarity
  clarityEvent(action);
};

/**
 * Tracks custom events with flexible key-value parameter payloads
 */
export const trackCustomEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (err) {
      console.warn(`[GA] trackCustomEvent (${eventName}) error:`, err);
    }
  }
  // Sync to Microsoft Clarity
  clarityEvent(eventName);
};

// ─── 1. calculator_used ───────────────────────────────────────────────────────
export const trackCalculatorUsed = (data: {
  calculator_type?: string;
  university?: string;
  course?: string;
  aggregate_score?: number | string;
  jamb_score?: number | string;
  post_utme_score?: number | string;
  state_of_origin?: string;
}) => {
  trackCustomEvent('calculator_used', {
    calculator_type: data.calculator_type || 'jamb_aggregate',
    university: data.university || 'unspecified',
    course: data.course || 'unspecified',
    aggregate_score: data.aggregate_score,
    jamb_score: data.jamb_score,
    post_utme_score: data.post_utme_score,
    state_of_origin: data.state_of_origin,
  });

  if (data.university) claritySet('target_university', data.university);
  if (data.course) claritySet('target_course', data.course);
};

// ─── 2. admission_analysis ───────────────────────────────────────────────────
export const trackAdmissionAnalysis = (data: {
  university: string;
  course: string;
  aggregate_score?: number | string;
  verdict?: string;
  probability?: number | string;
  is_official_cutoff?: boolean;
  cutoff_used?: string | number;
  quota?: string;
}) => {
  trackCustomEvent('admission_analysis', {
    university: data.university,
    course: data.course,
    aggregate_score: data.aggregate_score,
    verdict: data.verdict,
    probability: data.probability,
    is_official_cutoff: !!data.is_official_cutoff,
    cutoff_used: data.cutoff_used,
    quota: data.quota,
  });

  if (data.verdict) claritySet('analysis_verdict', data.verdict);
};

// ─── 3. institution_search ───────────────────────────────────────────────────
export const trackInstitutionSearch = (data: {
  search_term: string;
  search_type?: 'university' | 'course' | 'syllabus' | 'general';
  institution_type?: string;
  result_count?: number;
}) => {
  trackCustomEvent('institution_search', {
    search_term: data.search_term,
    search_type: data.search_type || 'university',
    institution_type: data.institution_type,
    result_count: data.result_count,
  });
};

// ─── 4. sign_up ──────────────────────────────────────────────────────────────
export const trackSignUp = (data: {
  method: string;
  role?: string;
  user_id?: string;
}) => {
  trackCustomEvent('sign_up', {
    method: data.method,
    role: data.role || 'student',
    user_id: data.user_id,
  });

  if (data.user_id) {
    clarityIdentify(data.user_id, undefined, undefined, data.role || 'Scholar');
  }
  if (data.role) claritySet('user_role', data.role);
};

// ─── 5. premium_click ────────────────────────────────────────────────────────
export const trackPremiumClick = (data: {
  placement: string;
  target_plan?: string;
  current_credits?: number;
}) => {
  trackCustomEvent('premium_click', {
    placement: data.placement,
    target_plan: data.target_plan || 'scholar_pack',
    current_credits: data.current_credits ?? 0,
  });

  clarityUpgrade('paywall_interacted');
  claritySet('paywall_placement', data.placement);
  if (data.target_plan) claritySet('target_plan', data.target_plan);
};

// ─── 6. payment_started ──────────────────────────────────────────────────────
export const trackPaymentStarted = (data: {
  item_name: string;
  amount: number;
  currency?: string;
  payment_type?: string;
  tx_ref?: string;
}) => {
  trackCustomEvent('payment_started', {
    item_name: data.item_name,
    value: data.amount,
    currency: data.currency || 'NGN',
    payment_type: data.payment_type || 'pack',
    tx_ref: data.tx_ref,
  });

  clarityUpgrade('checkout_started');
  claritySet('checkout_item', data.item_name);
  claritySet('checkout_amount', String(data.amount));
};

// ─── 7. purchase ─────────────────────────────────────────────────────────────
export const trackPurchase = (data: {
  transaction_id: string | number;
  value: number;
  currency?: string;
  item_name: string;
  payment_type?: string;
}) => {
  trackCustomEvent('purchase', {
    transaction_id: String(data.transaction_id),
    value: data.value,
    currency: data.currency || 'NGN',
    items: [{
      item_name: data.item_name,
      price: data.value,
      quantity: 1,
    }],
    payment_type: data.payment_type || 'pack',
  });

  clarityUpgrade('purchase_completed');
  claritySet('purchased_plan', data.item_name);
  claritySet('purchase_value', String(data.value));
};


