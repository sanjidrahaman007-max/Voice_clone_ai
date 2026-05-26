export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          credits: number;
          subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          credits?: number;
          subscription_tier?: 'free' | 'starter' | 'pro' | 'enterprise';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          credits?: number;
          subscription_tier?: 'free' | 'starter' | 'pro' | 'enterprise';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      voice_models: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          model_type: 'clone' | 'rvc' | 'preset';
          audio_url: string | null;
          model_url: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          model_type: 'clone' | 'rvc' | 'preset';
          audio_url?: string | null;
          model_url?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          model_type?: 'clone' | 'rvc' | 'preset';
          audio_url?: string | null;
          model_url?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          job_type: 'tts' | 'clone' | 'rvc';
          status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
          input_data: Json;
          output_url: string | null;
          credits_used: number;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_type: 'tts' | 'clone' | 'rvc';
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
          input_data?: Json;
          output_url?: string | null;
          credits_used?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_type?: 'tts' | 'clone' | 'rvc';
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
          input_data?: Json;
          output_url?: string | null;
          credits_used?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
          description: string;
          stripe_payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
          description?: string;
          stripe_payment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transaction_type?: 'purchase' | 'usage' | 'refund' | 'bonus';
          description?: string;
          stripe_payment_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
