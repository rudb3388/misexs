import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wpgtupngvtbazaoxyhyx.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZ3R1cG5ndnRiYXphb3h5aHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2OTI0MDYsImV4cCI6MjA2MjI2ODQwNn0.d8Hd7_cVfNvfWXIjkZSRJ0NlgziorMGQ4883Oc-fdhY'

export const supabase = createClient(supabaseUrl, supabaseKey)
