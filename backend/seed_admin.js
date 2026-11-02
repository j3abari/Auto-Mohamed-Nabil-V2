/**
 * Seed admin user script
 * Run: node seed_admin.js
 * Then paste the INSERT into Supabase SQL Editor
 */
require('dotenv').config();
const bcrypt     = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seedAdmin() {
    const username  = process.env.ADMIN_USER || 'Performax';
    const password  = process.env.ADMIN_PASS;

    if (!password) {
        console.error('ERROR: ADMIN_PASS not set in .env');
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase.from('admin_users').upsert({
        username:      username.toLowerCase(),
        email:         'admin@auto-mnabil.com',
        password_hash: hash,
        full_name:     'Performax Admin',
        role:          'admin',
        is_active:     true
    }, { onConflict: 'username' }).select('id, username, role');

    if (error) {
        console.error('ERROR seeding admin:', error.message);
        process.exit(1);
    }

    console.log('✅ Admin user created/updated:');
    console.table(data);
    process.exit(0);
}

seedAdmin();
