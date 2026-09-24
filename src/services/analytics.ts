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

// ─── 8. cbt_exam_interaction ────────────────────────────────────────────────
export interface CbtTrackingData {
  action: 'start' | 'complete' | 'abandon' | 'resume' | 'submit_early' | 'auto_submit' | 'pause' | 'question_answered' | 'question_flagged' | 'subject_switch' | 'review_answers' | 'ai_explanation_requested' | 'manual_score_logged' | 'retake' | 'reset';
  exam_type: string;
  test_mode?: string;
  subject_count?: number;
  selected_subjects?: string[];
  current_subject?: string;
  question_index?: number;
  total_questions?: number;
  score_raw?: number;
  score_percentage?: number;
  time_elapsed?: number;
  user_id?: string;
  user_email?: string;
  user_name?: string;
}

export const trackCbtInteraction = (data: CbtTrackingData) => {
  trackCustomEvent('cbt_interaction', {
    action: data.action,
    exam_type: data.exam_type,
    test_mode: data.test_mode || 'standard',
    subject_count: data.subject_count,
    score_percentage: data.score_percentage,
    score_raw: data.score_raw,
    total_questions: data.total_questions,
    time_elapsed: data.time_elapsed,
    current_subject: data.current_subject,
    question_index: data.question_index,
    user_id: data.user_id,
    user_email: data.user_email
  });

  if (data.exam_type) claritySet('cbt_exam_type', data.exam_type);
  if (data.test_mode) claritySet('cbt_test_mode', data.test_mode);
  if (data.score_percentage !== undefined) claritySet('cbt_last_score', String(data.score_percentage));
  if (data.action === 'start') clarityUpgrade('cbt_exam_started');
  if (data.action === 'complete' || data.action === 'submit_early' || data.action === 'auto_submit') {
    clarityUpgrade('cbt_exam_completed');
  }
};

// ─── 9. cgpa_interaction ───────────────────────────────────────────────────
export interface CgpaTrackingData {
  action: 'scale_switch' | 'calculate' | 'semester_add' | 'semester_delete' | 'course_add' | 'course_update' | 'course_delete' | 'ai_advisor_run' | 'goal_simulate' | 'transcript_export' | 'reset' | 'sync_cloud';
  scale?: 4 | 5;
  cgpa?: number | string;
  honours_class?: string;
  semesters_count?: number;
  courses_count?: number;
  total_units?: number;
  total_points?: number;
  semester_name?: string;
  course_code?: string;
  course_grade?: string;
  institution?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
}

export const trackCGPAInteraction = (data: CgpaTrackingData) => {
  trackCustomEvent('cgpa_interaction', {
    action: data.action,
    scale: data.scale,
    cgpa: data.cgpa ? Number(data.cgpa) : undefined,
    honours_class: data.honours_class,
    semesters_count: data.semesters_count,
    courses_count: data.courses_count,
    total_units: data.total_units,
    total_points: data.total_points,
    semester_name: data.semester_name,
    course_code: data.course_code,
    institution: data.institution,
    user_id: data.user_id,
    user_email: data.user_email
  });

  if (data.scale) claritySet('cgpa_scale', `${data.scale}.0`);
  if (data.cgpa !== undefined) claritySet('cgpa_score', String(data.cgpa));
  if (data.honours_class) claritySet('cgpa_honours', data.honours_class);
  if (data.action === 'ai_advisor_run') clarityUpgrade('cgpa_ai_advisor_used');
  if (data.action === 'calculate' && Number(data.cgpa) > 0) clarityUpgrade('cgpa_calculated');
};

// ─── 10. general_tool_interaction ──────────────────────────────────────────
export const trackToolInteraction = (tool: 'cbt' | 'cgpa' | 'calculator' | 'syllabus' | 'cutoff', action: string, details?: any) => {
  trackCustomEvent('tool_interaction', {
    tool,
    action,
    ...details
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campusai_activity_logged', { detail: { tool, action, details } }));
  }
};

// ─── 11. official_portal_click ─────────────────────────────────────────────
export const trackOfficialPortalClick = (data: {
  url: string;
  domain?: string;
  label?: string;
  sourceArticleId?: string;
  institution?: string;
}) => {
  trackCustomEvent('official_portal_click', {
    url: data.url,
    domain: data.domain || (typeof window !== 'undefined' ? new URL(data.url).hostname : undefined),
    label: data.label || 'official_portal',
    source_article_id: data.sourceArticleId,
    institution: data.institution
  });
  if (data.institution) claritySet('portal_institution', data.institution);
  clarityUpgrade('portal_link_clicked');
};

// ─── 12. calculator_open ───────────────────────────────────────────────────
export const trackCalculatorOpen = (data: {
  source: string;
  university?: string;
  course?: string;
}) => {
  trackCustomEvent('calculator_open', {
    source: data.source,
    university: data.university,
    course: data.course
  });
  if (data.university) claritySet('calculator_preset_uni', data.university);
};

// ─── 13. table_horizontal_scroll ──────────────────────────────────────────
export const trackTableHorizontalScroll = (data: {
  direction?: 'left' | 'right';
  scroll_percentage?: number;
  table_title?: string;
}) => {
  trackCustomEvent('table_horizontal_scroll', {
    direction: data.direction,
    scroll_percentage: data.scroll_percentage,
    table_title: data.table_title || 'unspecified'
  });
};

// ─── 14. table_row_action_click ───────────────────────────────────────────
export const trackTableRowActionClick = (data: {
  action: string;
  row_title?: string;
  target_url?: string;
}) => {
  trackCustomEvent('table_row_action_click', {
    action: data.action,
    row_title: data.row_title,
    target_url: data.target_url
  });
};

// ─── 15. article_signup_click ─────────────────────────────────────────────
export const trackArticleSignupClick = (data: {
  article_id?: string;
  placement?: string;
  role?: string;
}) => {
  trackCustomEvent('article_signup_click', {
    article_id: data.article_id,
    placement: data.placement || 'article_footer_checklist',
    role: data.role || 'candidate'
  });
  clarityUpgrade('article_conversion_intent');
};

// ─── 16. cbt_session_started ───────────────────────────────────────────────
export const trackCbtSessionStarted = (data: {
  exam_type: string;
  subject_count?: number;
  mode?: string;
  test_mode?: string;
  subjects?: string[];
  total_questions?: number;
  timed?: boolean;
}) => {
  trackCustomEvent('cbt_session_started', {
    exam_type: data.exam_type,
    subject_count: data.subject_count,
    mode: data.mode || data.test_mode || 'standard',
    subjects: data.subjects?.join(','),
    total_questions: data.total_questions,
    timed: data.timed
  });
  clarityUpgrade('cbt_session_started');
};

// ─── 17. result_saved ─────────────────────────────────────────────────────
export const trackResultSaved = (data: {
  result_type?: 'calculator' | 'cbt' | 'cgpa' | 'admission_prediction';
  tool_name?: string;
  score?: number | string;
  total?: number;
  university?: string;
  institution?: string;
  course?: string;
  result_id?: string;
  exam_type?: string;
  user_id?: string;
}) => {
  trackCustomEvent('result_saved', {
    result_type: data.result_type || data.tool_name || 'calculator',
    score: data.score,
    total: data.total,
    university: data.university || data.institution,
    course: data.course,
    result_id: data.result_id,
    user_id: data.user_id
  });
  clarityUpgrade('admission_result_saved');
  claritySet('has_saved_results', 'true');
};

// ─── 18. permission_prompt_accepted ───────────────────────────────────────
export const trackPermissionPromptAccepted = (data: {
  permission_type: 'microphone' | 'geolocation' | 'notifications';
  feature?: string;
}) => {
  trackCustomEvent('permission_prompt_accepted', {
    permission_type: data.permission_type,
    feature: data.feature
  });
};

// ─── 19. permission_prompt_declined ───────────────────────────────────────
export const trackPermissionPromptDeclined = (data: {
  permission_type: 'microphone' | 'geolocation' | 'notifications';
  feature?: string;
  reason?: string;
}) => {
  trackCustomEvent('permission_prompt_declined', {
    permission_type: data.permission_type,
    feature: data.feature,
    reason: data.reason || 'user_declined'
  });
};



