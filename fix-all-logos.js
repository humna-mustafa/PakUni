require('dotenv').config();
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Logos that need fixing - direct replacement URLs
const logosToFix = [
  { 
    namePattern: 'Lahore University of Management Sciences',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Lahore_University_of_Management_Sciences.png'
  },
  { 
    namePattern: 'Aga Khan University',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Aga_Khan_University_Logo.png'
  },
  { 
    namePattern: 'University of Management and Technology',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/UMT_Lahore_logo.png'
  },
  { 
    namePattern: 'University of Engineering and Technology, Lahore',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8d/University_of_Engineering_and_Technology_Lahore_logo.svg'
  },
  { 
    namePattern: 'International Islamic University',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9d/International_Islamic_University_Islamabad_logo.png'
  },
  { 
    namePattern: 'University of Health Sciences',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1e/UHS_Lahore_Logo.png'
  },
  { 
    namePattern: 'University of Lahore',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/5/52/University_of_Lahore_Logo.png'
  },
  { 
    namePattern: 'University of Sindh',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/6/63/University_of_Sindh_logo.png'
  },
  { 
    namePattern: 'Government College University, Lahore',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Government_College_University_Lahore_Logo.png'
  },
  { 
    namePattern: 'Riphah International University',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Riphah_International_University_Logo.jpg'
  },
  { 
    namePattern: 'University of Peshawar',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/1/10/University_of_Peshawar_Logo.png'
  },
  { 
    namePattern: 'NED University',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e4/NED_University_logo.svg'
  },
  { 
    namePattern: 'University of Agriculture',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/1/14/University_of_Agriculture_Faisalabad_Logo.png'
  },
  { 
    namePattern: 'Bahauddin Zakariya University',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/4/47/Bahauddin_Zakariya_University_logo.png'
  },
  { 
    namePattern: 'National University of Modern Languages',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/8/80/NUML_Pakistan_Logo.png'
  },
  { 
    namePattern: 'Mehran University',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3f/Mehran_University_of_Engineering_and_Technology_Logo.svg'
  },
  { 
    namePattern: 'Mohammad Ali Jinnah University',
    newUrl: 'https://upload.wikimedia.org/wikipedia/en/9/91/Mohammad_Ali_Jinnah_University_logo.jpg'
  }
];

async function updateLogos() {
  console.log('🔧 Updating problematic logos in Turso...\n');
  
  let updated = 0;
  let failed = 0;
  
  for (const logo of logosToFix) {
    try {
      const result = await c.execute(
        'SELECT id, name FROM universities WHERE name LIKE ? LIMIT 1',
        [`%${logo.namePattern}%`]
      );
      
      if (result.rows.length === 0) {
        console.log(`⚠️  "${logo.namePattern}": Not found in Turso`);
        failed++;
        continue;
      }
      
      const uni = result.rows[0];
      
      // Update the logo_url
      await c.execute('UPDATE universities SET logo_url = ? WHERE id = ?', [logo.newUrl, uni.id]);
      console.log(`✅ ${uni.name}: Logo updated`);
      updated++;
    } catch (err) {
      console.log(`❌ "${logo.namePattern}": Error - ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Summary: ${updated} updated, ${failed} failed`);
  console.log('\n💾 Logos have been updated in Turso database.');
}

updateLogos().catch(console.error);
