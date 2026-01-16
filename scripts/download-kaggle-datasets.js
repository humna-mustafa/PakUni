/**
 * Kaggle Datasets Downloader for PakUni
 * 
 * Datasets identified for PakUni app enhancement:
 * 
 * 1. HEC-Accredited Universities of Pakistan (156 kB)
 *    - University Name, Category, Campuses, Contact Info
 *    - Website, Map URLs, Lat/Long, Established Year
 *    - Sector (public/private), Province, Distance Education
 *    URL: https://www.kaggle.com/datasets/whisperingkahuna/hec-accredited-universities-of-pakistan-dataset
 * 
 * 2. Pakistan Intellectual Capital (675 kB)
 *    - CS/IT Professors from 89 universities
 *    - Research areas, specializations
 *    - PhD faculty info
 *    URL: https://www.kaggle.com/datasets/zusmani/pakistanintellectualcapitalcs
 * 
 * 3. Pakistan's Job Market (2.5 MB)
 *    - 7,000 job openings (Dec 2019 - Mar 2021)
 *    - Job titles, departments, required experience
 *    - City, nature of job, descriptions
 *    URL: https://www.kaggle.com/datasets/zusmani/pakistans-job-market
 * 
 * 4. All Intermediate Colleges in Pakistan (268 kB)
 *    - College names, locations, study programs
 *    - Sector, affiliation, ratings
 *    URL: https://www.kaggle.com/datasets/tayyarhussain/all-the-intermediate-colleges-in-pakistan
 * 
 * 5. Every University in Pakistan (19 kB)
 *    - University names, locations, establishment dates
 *    - Types (public/private), campus locations
 *    URL: https://www.kaggle.com/datasets/tayyarhussain/all-of-the-universities-in-pakistan
 * 
 * 6. Number of Teachers/Students in Pakistan 1947-2018
 *    - Historical education statistics
 *    URL: https://www.kaggle.com/datasets/tariqbashir/number-of-teachersstudents-in-pakistan-1947-2018
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Dataset URLs and info
// Focus on datasets that ENHANCE existing features
const DATASETS = [
  {
    id: 'hec-universities',
    name: 'HEC-Accredited Universities of Pakistan',
    kaggleUrl: 'whisperingkahuna/hec-accredited-universities-of-pakistan-dataset',
    filename: 'hec_universities.csv',
    features: ['geo_coordinates', 'campuses', 'contact_info', 'map_urls'],
    addedValue: '🗺️ ENHANCE Universities: Add geolocation, contact info, map links',
    enhances: 'UniversityDetailScreen, UniversityListScreen'
  },
  {
    id: 'job-market',
    name: "Pakistan's Job Market",
    kaggleUrl: 'zusmani/pakistans-job-market',
    filename: 'pakistan_jobs.csv',
    features: ['job_titles', 'experience_levels', 'departments', 'city_demand'],
    addedValue: '💼 ENHANCE Careers: Real job market data, demand by field/city',
    enhances: 'CareerGuidanceScreen, ProgramDetailScreen'
  },
  {
    id: 'universities-basic',
    name: 'Every University in Pakistan',
    kaggleUrl: 'tayyarhussain/all-of-the-universities-in-pakistan',
    filename: 'universities_basic.csv',
    features: ['establishment_dates', 'locations', 'types'],
    addedValue: '✅ VALIDATE: Cross-reference and fill missing university data',
    enhances: 'Data completeness'
  }
];

// Create datasets directory
const DATASETS_DIR = path.join(__dirname, 'data-import', 'kaggle-datasets');

async function setup() {
  if (!fs.existsSync(DATASETS_DIR)) {
    fs.mkdirSync(DATASETS_DIR, { recursive: true });
    console.log('✅ Created kaggle-datasets directory');
  }
  
  // Create README with instructions
  const readme = `# Kaggle Datasets for PakUni

## How to Download

### Option 1: Kaggle CLI (Recommended)
1. Install Kaggle CLI: \`pip install kaggle\`
2. Set up API credentials from https://www.kaggle.com/settings
3. Run the download commands below

### Download Commands
\`\`\`bash
# HEC Universities (geolocation, distance education)
kaggle datasets download -d whisperingkahuna/hec-accredited-universities-of-pakistan-dataset -p ./data-import/kaggle-datasets --unzip

# Pakistan Intellectual Capital (faculty profiles)
kaggle datasets download -d zusmani/pakistanintellectualcapitalcs -p ./data-import/kaggle-datasets --unzip

# Pakistan Job Market (career insights)
kaggle datasets download -d zusmani/pakistans-job-market -p ./data-import/kaggle-datasets --unzip

# Intermediate Colleges
kaggle datasets download -d tayyarhussain/all-the-intermediate-colleges-in-pakistan -p ./data-import/kaggle-datasets --unzip

# All Universities Basic
kaggle datasets download -d tayyarhussain/all-of-the-universities-in-pakistan -p ./data-import/kaggle-datasets --unzip

# Education Statistics
kaggle datasets download -d tariqbashir/number-of-teachersstudents-in-pakistan-1947-2018 -p ./data-import/kaggle-datasets --unzip
\`\`\`

### Option 2: Manual Download
Visit each URL and click "Download" button:
- https://www.kaggle.com/datasets/whisperingkahuna/hec-accredited-universities-of-pakistan-dataset
- https://www.kaggle.com/datasets/zusmani/pakistanintellectualcapitalcs
- https://www.kaggle.com/datasets/zusmani/pakistans-job-market
- https://www.kaggle.com/datasets/tayyarhussain/all-the-intermediate-colleges-in-pakistan
- https://www.kaggle.com/datasets/tayyarhussain/all-of-the-universities-in-pakistan
- https://www.kaggle.com/datasets/tariqbashir/number-of-teachersstudents-in-pakistan-1947-2018

## Features Added to PakUni

### 1. University Enhancement
- **Geolocation**: Map coordinates for all universities
- **Distance Education**: Filter universities offering online programs
- **Contact Details**: Direct contact info for admissions

### 2. Career Guidance
- **Job Market Data**: 7,000+ real job postings
- **Popular Fields**: See which departments are hiring
- **Experience Levels**: Understand entry-level requirements

### 3. Faculty Insights
- **Research Areas**: 500+ PhD faculty profiles
- **Specializations**: AI, ML, Data Science faculty info
- **University Strengths**: Faculty expertise by institution

### 4. College Search
- **Intermediate Colleges**: Pre-university options
- **Affiliations**: Board affiliations
- **Programs**: Available study programs

### 5. Analytics
- **Historical Trends**: Education growth since 1947
- **Student-Teacher Ratios**: By province and year
`;

  fs.writeFileSync(path.join(DATASETS_DIR, 'README.md'), readme);
  console.log('✅ Created download instructions in README.md');
  
  // Create dataset info JSON
  fs.writeFileSync(
    path.join(DATASETS_DIR, 'datasets-info.json'),
    JSON.stringify(DATASETS, null, 2)
  );
  console.log('✅ Created datasets-info.json');
}

// Print summary
function printSummary() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║    Kaggle Datasets for PakUni - Download Instructions         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Identified Datasets:\n');
  
  DATASETS.forEach((ds, i) => {
    console.log(`${i+1}. ${ds.name}`);
    console.log(`   📁 https://www.kaggle.com/datasets/${ds.kaggleUrl}`);
    console.log(`   ✨ ${ds.addedValue}\n`);
  });
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📥 To download all datasets, run:\n');
  console.log('   pip install kaggle');
  console.log('   # Set up Kaggle API key first');
  DATASETS.forEach(ds => {
    console.log(`   kaggle datasets download -d ${ds.kaggleUrl} -p ./data-import/kaggle-datasets --unzip`);
  });
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

setup();
printSummary();
