/*
  Public browser configuration only.
  The Supabase anon/publishable key is safe to expose when Row Level Security
  policies in supabase-schema.sql are correctly configured.
  NEVER put service_role keys, database passwords, or private secrets here.
*/
window.SM_PRIME_CONFIG = {
  supabaseUrl: "",       // e.g. https://YOUR_PROJECT.supabase.co
  supabaseAnonKey: "",   // Supabase publishable / anon key
  whatsappNumber: ""     // Optional: digits only, with country code, e.g. 919876543210
};
