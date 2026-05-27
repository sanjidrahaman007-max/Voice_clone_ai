import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mockvoiceforge.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2t2b2ljZWZvcmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY2NTAwMDAsImV4cCI6MjAzMjIxMDAwMH0.mocksignaturehere';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
