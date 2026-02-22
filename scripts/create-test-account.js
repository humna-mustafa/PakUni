/**
 * Create Test Account for Google Play Store Review
 * This script creates a verified test user in Supabase for Play Store reviewers
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase config
const SUPABASE_URL = 'https://therewjnnidxlddgkaca.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Test account credentials for Google Play reviewers
const TEST_EMAIL = 'playstore.reviewer@pakuni.app';
const TEST_PASSWORD = 'PakUni@Review2026';
const TEST_NAME = 'Play Store Reviewer';

async function createTestAccount() {
  if (!SUPABASE_SERVICE_KEY) {
    console.log('\n❌ SUPABASE_SERVICE_KEY environment variable not set.');
    console.log('\nTo get the service role key:');
    console.log('1. Go to: https://supabase.com/dashboard/project/therewjnnidxlddgkaca/settings/api');
    console.log('2. Copy "service_role" key (NOT anon key)');
    console.log('3. Run: $env:SUPABASE_SERVICE_KEY = "your-key-here"');
    console.log('4. Run this script again\n');
    
    // Still output credentials for manual creation
    console.log('═══════════════════════════════════════════════════════');
    console.log('  MANUAL OPTION: Create in Supabase Dashboard');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n1. Go to: https://supabase.com/dashboard/project/therewjnnidxlddgkaca/auth/users');
    console.log('2. Click "Add user" > "Create new user"');
    console.log('3. Enter these details:\n');
    console.log(`   Email:    ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log('   ☑ Auto Confirm User (check this box)\n');
    console.log('4. Click "Create user"');
    console.log('\n═══════════════════════════════════════════════════════\n');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('\n🔄 Creating test account for Google Play reviewers...\n');

  try {
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: TEST_NAME,
        role: 'user',
        is_test_account: true
      }
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('✅ Test account already exists!\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Test account created successfully!\n');
      console.log('User ID:', data.user.id);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('  GOOGLE PLAY STORE - TEST CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n  Email:    ${TEST_EMAIL}`);
    console.log(`  Password: ${TEST_PASSWORD}`);
    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createTestAccount();
