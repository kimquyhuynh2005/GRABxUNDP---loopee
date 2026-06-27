import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://toclneklmfcuravqqnhl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvY2xuZWtsbWZjdXJhdnFxbmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzY5NjksImV4cCI6MjA5ODE1Mjk2OX0.c-4weQ5hQtAQ3EgUZt00SyUMjlseMhayNb9WgvphWbI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Hardcoded demo user — seed data UUID
export const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111'
