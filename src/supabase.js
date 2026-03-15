import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qvpaynsufsjtpxnnehol.supabase.co'
const supabaseKey = 'TA_CLE_ANON_ICI'

export const supabase = createClient(supabaseUrl, supabaseKey)