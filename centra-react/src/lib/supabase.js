import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xxpkhvsetnntarhhfzgb.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cGtodnNldG5udGFyaGhmemdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTk3NDIsImV4cCI6MjA2NjI3NTc0Mn0.BZCnavyl3DkDIr00TEXj_-HjOpAnQVppRvsA5PqrATg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
