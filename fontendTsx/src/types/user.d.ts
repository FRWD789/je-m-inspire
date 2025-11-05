export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  date_of_birth: string;
  city?: string;
  motivation_letter?: string; // For professionals
}

export interface LoginResponse {
    success: boolean;

    user: User;
    access_token: string;
    expires_in: number;
    refresh_token: string;
    requires_onboarding: boolean;
    message: string;
}

export interface RefreshResponse {
  success: boolean;
    access_token: string;
    expires_in: number;
    user: User;
  message: string;
}
export interface User {
  id: number;
  profile: {
    name: string;
    last_name: string;
    email: string;
    city?: string;
    date_of_birth: string;
    biography?: string;
    profile_picture?: string;
    
  };
  auth_info?: {
    onboarding_skipped: boolean;
    onboarding_completed: boolean;
    is_approved: boolean;
    approved_at?: string;
    email_verified: boolean;
  };
  professional?: {
    motivation_lettre?:string
    commission_rate?: number;
    is_professional: boolean;
    professional_since?: string;
  };
  subscription?: {
    has_pro_plus: boolean;
    subscription_type?: string;
    status?: string;
    end_date?: string;
    is_active: boolean;
    features: {
      basic_analytics: boolean;
      limited_account_linking: boolean;
      standard_support: boolean;
      unlimited_account_linking: boolean;
      advanced_analytics: boolean;
      priority_support: boolean;
      custom_reports: boolean;
      api_access: boolean;
      bulk_operations: boolean;
    };
  };
  payment?: {
    stripe_account_id?: string;
    paypal_account_id?: string;
    paypal_email?: string;
    has_payment_method: boolean;
  };
  roles: Array<{
    id: number;
    role: string;
  }>;
  timestamps: {
    created_at: string;
    updated_at: string;
  };
}