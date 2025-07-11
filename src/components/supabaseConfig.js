import { createClient } from '@supabase/supabase-js';

// Supabase del LOGIN (principal)
const supabaseUrl = 'https://qjgnpmtzlyfbgcofdhny.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ25wbXR6bHlmYmdjb2ZkaG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDQ1MjcsImV4cCI6MjA2NjIyMDUyN30.gFDhd9vEHsxKLXFIPSu61A2c070FZC60S1K8WA7qUIs';

// Supabase DE ESTE PROYECTO (federado)
const federatedSupabaseUrl = 'https://vqfczcxcqbwgbwifuelb.supabase.co';
const federatedSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZmN6Y3hjcWJ3Z2J3aWZ1ZWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzQzMTcsImV4cCI6MjA1OTQ1MDMxN30.6Y7bxnc2lChTLkqWD9mKwHlztuFT-YyY4J-Pjs-iuKI';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const federatedSupabase = createClient(federatedSupabaseUrl, federatedSupabaseKey);
