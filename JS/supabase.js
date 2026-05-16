import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://wjlfldsrdhxrgybjmekz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGZsZHNyZGh4cmd5YmptZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5Mjg5NjIsImV4cCI6MjA5NDUwNDk2Mn0.L1kvhYefJMpd1u52Tu-yhhwKSjTO6ZMHrAP91FRwP-c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)