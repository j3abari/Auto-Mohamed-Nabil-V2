require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET) {
    throw new Error('[DB] SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env');
}

// Service-role client — bypasses RLS — BACKEND ONLY, NEVER send to frontend
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: {
        autoRefreshToken: false,
        persistSession:   false
    }
});

// Test connection on startup
async function testConnection() {
    const { error } = await supabase.from('cars').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
        console.error('[DB] Supabase connection error:', error.message);
    } else {
        console.log('[DB] Supabase connected ✓');
    }
}

module.exports = { supabase, testConnection };
