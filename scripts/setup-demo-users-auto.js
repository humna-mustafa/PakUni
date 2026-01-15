/**
 * PakUni Auto Demo Users Setup
 * Creates demo users directly using Supabase REST API
 * 
 * Run: node setup-demo-users-auto.js
 */

const https = require('https');

// Supabase Configuration
const SUPABASE_URL = 'https://therewjnnidxlddgkaca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZXJld2pubmlkeGxkZGdrYWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjMxMjEsImV4cCI6MjA4Mzg5OTEyMX0.h5wPplUUJFIErD6S765UW-L4x4j1Lskcbq-9x4ztH5k';

// Demo Users
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

// Helper function to make HTTP requests
function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Sign up a user
async function signUpUser(user) {
  const response = await makeRequest('/auth/v1/signup', 'POST', {
    email: user.email,
    password: user.password,
    data: {
      full_name: user.full_name,
      role: user.role,
    },
  });
  return response;
}

// Main function
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🎓 PakUni Demo Users Auto-Setup                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const results = [];

  for (const user of DEMO_USERS) {
    process.stdout.write(`📧 Creating ${user.email}... `);
    
    try {
      const response = await signUpUser(user);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Created!');
        results.push({ user: user.email, status: 'created', role: user.role });
      } else if (response.data?.msg?.includes('already registered') || 
                 response.data?.error?.message?.includes('already registered')) {
        console.log('⚠️  Already exists');
        results.push({ user: user.email, status: 'exists', role: user.role });
      } else {
        console.log(`❌ Error: ${JSON.stringify(response.data)}`);
        results.push({ user: user.email, status: 'error', error: response.data });
      }
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      results.push({ user: user.email, status: 'error', error: err.message });
    }
  }

  console.log('\n' + '═'.repeat(66));
  console.log('\n📋 SETUP RESULTS SUMMARY:\n');
  
  const created = results.filter(r => r.status === 'created').length;
  const exists = results.filter(r => r.status === 'exists').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⚠️  Already exist: ${exists}`);
  console.log(`   ❌ Errors: ${errors}`);

  console.log('\n' + '═'.repeat(66));
  console.log('\n🔐 LOGIN CREDENTIALS:\n');
  console.log('┌────────────────────────────┬──────────────────────┬────────────────┐');
  console.log('│ Email                      │ Password             │ Role           │');
  console.log('├────────────────────────────┼──────────────────────┼────────────────┤');
  
  for (const user of DEMO_USERS) {
    console.log(`│ ${user.email.padEnd(26)} │ ${user.password.padEnd(20)} │ ${user.role.padEnd(14)} │`);
  }
  
  console.log('└────────────────────────────┴──────────────────────┴────────────────┘');

  console.log('\n⚠️  IMPORTANT: After users are created, you need to:');
  console.log('   1. Go to Supabase Dashboard → Authentication → Users');
  console.log('   2. Click on each user and "Confirm" their email');
  console.log('   3. Run the SQL below to set roles in profiles table\n');

  console.log('📝 SQL to update roles (run in Supabase SQL Editor):');
  console.log('─'.repeat(66));
  console.log(`
UPDATE public.profiles SET role = 'super_admin', is_verified = true WHERE email = 'superadmin@pakuni.app';
UPDATE public.profiles SET role = 'admin', is_verified = true WHERE email = 'admin@pakuni.app';
UPDATE public.profiles SET role = 'content_editor', is_verified = true WHERE email = 'editor@pakuni.app';
UPDATE public.profiles SET role = 'moderator', is_verified = true WHERE email = 'moderator@pakuni.app';
UPDATE public.profiles SET role = 'user', is_verified = true WHERE email = 'student@pakuni.app';
UPDATE public.profiles SET role = 'user', is_verified = true WHERE email = 'test@pakuni.app';
  `);
  console.log('─'.repeat(66));
  
  console.log('\n✨ Done! You can now login with these credentials.\n');
}

main().catch(console.error);
