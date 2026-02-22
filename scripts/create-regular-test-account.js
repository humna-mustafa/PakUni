/**
 * Create Regular Test Account for Google Play Store Review
 * This is a basic user account (no admin privileges)
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase config
const SUPABASE_URL = 'https://therewjnnidxlddgkaca.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Regular test account credentials
const TEST_EMAIL = 'pakuni.testuser@gmail.com';
const TEST_PASSWORD = 'PakUni@Test2026';
const TEST_NAME = 'Test User';

async function createRegularTestAccount() {
  if (!SUPABASE_SERVICE_KEY) {
    console.log('\n❌ SUPABASE_SERVICE_KEY not set.\n');
    console.log('Manual option - create in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/therewjnnidxlddgkaca/auth/users\n');
    console.log(`Email:    ${TEST_EMAIL}`);
    console.log(`Password: ${TEST_PASSWORD}`);
    console.log('☑ Auto Confirm User\n');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('\n🔄 Creating regular test account...\n');

  try {
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: TEST_NAME,
        role: 'user'
      }
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('ℹ️  User already exists - that\'s fine!\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Regular test account created!\n');
      console.log(`User ID: ${data.user.id}`);
    }

    console.log('\n════════════════════════════════════════');
    console.log('  REGULAR USER CREDENTIALS (NO ADMIN)');
    console.log('════════════════════════════════════════');
    console.log(`  Email:    ${TEST_EMAIL}`);
    console.log(`  Password: ${TEST_PASSWORD}`);
    console.log('════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createRegularTestAccount();
