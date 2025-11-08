import { createClient } from '@supabase/supabase-js'

const supabaseURL = "https://bxrjmfqsmrpbfrtsloui.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cmptZnFzbXJwYmZydHNsb3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODQwODYsImV4cCI6MjA3NzI2MDA4Nn0.muDg95w2PpgVDo4Cs4lu4ZqaejmQtsAdHLSaYJMOGKI"

export const supabase = createClient(supabaseURL, supabaseKey);