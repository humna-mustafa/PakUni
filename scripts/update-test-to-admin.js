/**
 * Update Test Account to Admin Role
 * Gives Play Store reviewer full admin access for complete app review
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://therewjnnidxlddgkaca.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const TEST_USER_ID = '0067167c-4c17-4cfc-b141-e0b619e3c892';

async function updateToAdmin() {
  if (!SUPABASE_SERVICE_KEY) {
    console.log('❌ SUPABASE_SERVICE_KEY not set');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('\n🔄 Updating test account to admin role...\n');

  try {
    // Update user metadata to include admin role
    const { data, error } = await supabase.auth.admin.updateUserById(TEST_USER_ID, {
      user_metadata: {
        full_name: 'Play Store Reviewer',
        role: 'admin',
        is_test_account: true
      }
    });

    if (error) throw error;

    console.log('✅ User updated to ADMIN role!\n');
    
    // Also update the profiles table if it exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: TEST_USER_ID,
        full_name: 'Play Store Reviewer',
        role: 'admin',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.log('Note: Could not update profiles table:', profileError.message);
    } else {
      console.log('✅ Profile table updated with admin role!\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ADMIN TEST ACCOUNT - GOOGLE PLAY REVIEW');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n  Email:    playstore.reviewer@pakuni.app`);
    console.log(`  Password: PakUni@Review2026`);
    console.log(`  Role:     ADMIN (full access)`);
    console.log(`\n  User ID:  ${TEST_USER_ID}`);
    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updateToAdmin();
