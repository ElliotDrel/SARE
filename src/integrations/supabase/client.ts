import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://fapgoifqhtoryzykziye.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcGdvaWZxaHRvcnl6eWt6aXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzE2NTAsImV4cCI6MjA3MDA0NzY1MH0._FJDR-gqEt9y1oNatePT9oRY2NAQ9RMh_iHuNgVjSqQ";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);