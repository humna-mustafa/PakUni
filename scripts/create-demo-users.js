/**
 * PakUni Demo Users Creation Script
 * 
 * This script creates demo users in Supabase for testing purposes.
 * Run with: node create-demo-users.js
 * 
 * Prerequisites:
 * - Node.js installed
 * - npm install @supabase/supabase-js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const SUPABASE_URL = 'https://therewjnnidxlddgkaca.supabase.co';
// IMPORTANT: Replace with your SERVICE_ROLE key (NOT anon key) for admin operations
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Demo Users Configuration
const DEMO_USERS = [
  {
    email: 'superadmin@pakuni.app',
    password: 'SuperAdmin@2026!',
    full_name: 'Super Admin',
    role: 'super_admin',
  },
  {
    email: 'admin@pakuni.app',
    password: 'Admin@2026!',
    full_name: 'Admin User',
    role: 'admin',
  },
  {
    email: 'editor@pakuni.app',
    password: 'Editor@2026!',
    full_name: 'Content Editor',
    role: 'content_editor',
  },
  {
    email: 'moderator@pakuni.app',
    password: 'Moderator@2026!',
    full_name: 'Moderator',
    role: 'moderator',
  },
  {
    email: 'student@pakuni.app',
    password: 'Student@2026!',
    full_name: 'Ahmed Ali',
    role: 'user',
  },
  {
    email: 'test@pakuni.app',
    password: 'Test@2026!',
    full_name: 'Test User',
    role: 'user',
  },
];

async function createDemoUsers() {
  console.log('🚀 Starting Demo Users Creation...\n');

  for (const user of DEMO_USERS) {
    try {
      console.log(`📧 Creating user: ${user.email}`);

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      });

      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`   ⚠️  User already exists, updating role...`);
          
          // Update existing user's role
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: user.role, 
              full_name: user.full_name,
              is_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq('email', user.email);

          if (updateError) {
            console.log(`   ❌ Failed to update: ${updateError.message}`);
          } else {
            console.log(`   ✅ Role updated to: ${user.role}`);
          }
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
        continue;
      }

      // Update profile with role
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.log(`   ⚠️  Profile update warning: ${profileError.message}`);
        }

        console.log(`   ✅ Created successfully!`);
        console.log(`      ID: ${data.user.id}`);
        console.log(`      Role: ${user.role}`);
      }
    } catch (err) {
      console.log(`   ❌ Unexpected error: ${err.message}`);
    }
    
    console.log('');
  }

  console.log('─'.repeat(50));
  console.log('\n✨ Demo Users Creation Complete!\n');
  console.log('📋 Summary of Created Users:\n');
  console.log('┌────────────────────────────┬──────────────────────┬────────────────┐');
  console.log('│ Email                      │ Password             │ Role           │');
  console.log('├────────────────────────────┼──────────────────────┼────────────────┤');
  
  for (const user of DEMO_USERS) {
    const email = user.email.padEnd(26);
    const password = user.password.padEnd(20);
    const role = user.role.padEnd(14);
    console.log(`│ ${email} │ ${password} │ ${role} │`);
  }
  
  console.log('└────────────────────────────┴──────────────────────┴────────────────┘');
  console.log('\n💡 TIP: Use these credentials to login to the app\n');
}

// Check if service role key is set
if (SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.log('⚠️  ERROR: Please set your SUPABASE_SERVICE_ROLE_KEY');
  console.log('\n📝 How to get your Service Role Key:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your PakUni project');
  console.log('3. Go to Settings → API');
  console.log('4. Copy the "service_role" key (NOT anon key)');
  console.log('5. Replace YOUR_SERVICE_ROLE_KEY_HERE in this script');
  console.log('\n⚠️  IMPORTANT: Never commit service_role key to git!');
  process.exit(1);
}

// Run the script
createDemoUsers().catch(console.error);
