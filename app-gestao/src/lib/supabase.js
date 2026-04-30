import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://lmhzwaymhlfxlettrbkk.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_LXNggTYlRoCDcD4LyuP9Sg_8T6aX94e"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
