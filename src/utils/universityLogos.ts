/**
 * University Logos Utility
 * Direct URLs to university logos from official sources
 * 
 * Benefits:
 * - No Supabase storage egress costs
 * - No API limits consumed
 * - Uses publicly available images from universities/Wikipedia
 * - Fallback to gradient + initials if image fails
 */

// Direct logo URLs from university websites, Wikipedia, or other public sources
export const UNIVERSITY_LOGO_MAP: Record<string, string> = {
  // ========== ISLAMABAD ==========
  'QAU': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/85/Quaid-i-Azam_University_logo.png/200px-Quaid-i-Azam_University_logo.png',
  'NUST': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/National_University_of_Sciences_and_Technology_logo.png/200px-National_University_of_Sciences_and_Technology_logo.png',
  'CUI': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/97/COMSATS_new_logo.jpg/200px-COMSATS_new_logo.jpg',
  'IIUI': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/International_Islamic_University%2C_Islamabad_logo.png/200px-International_Islamic_University%2C_Islamabad_logo.png',
  'PIEAS': 'https://upload.wikimedia.org/wikipedia/en/5/5a/PIEAS_logo.png',
  'AU': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Air_University_logo.png/200px-Air_University_logo.png',
  'BU': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Bahria_University_logo.png/200px-Bahria_University_logo.png',
  'NUML': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/National_University_of_Modern_Languages_logo.png/200px-National_University_of_Modern_Languages_logo.png',
  'FUUAST': 'https://upload.wikimedia.org/wikipedia/en/4/44/Federal_Urdu_University_logo.png',
  'CUST': 'https://cust.edu.pk/wp-content/uploads/2023/01/cust-logo.png',
  'GIKI': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/GIK_Institute_logo.svg/200px-GIK_Institute_logo.svg.png',
  'UET Taxila': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/University_of_Engineering_and_Technology%2C_Taxila_logo.png/200px-University_of_Engineering_and_Technology%2C_Taxila_logo.png',
  'Sukkur IBA': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Sukkur_IBA_University_logo.png/200px-Sukkur_IBA_University_logo.png',
  'NCA': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/National_College_of_Arts_logo.png/200px-National_College_of_Arts_logo.png',
  'FUI': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Foundation_University_Islamabad_logo.png/200px-Foundation_University_Islamabad_logo.png',
  'VU': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/35/Virtual_University_of_Pakistan_logo.png/200px-Virtual_University_of_Pakistan_logo.png',
  'AIOU': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Allama_Iqbal_Open_University_logo.png/200px-Allama_Iqbal_Open_University_logo.png',
  'UVAS': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/University_of_Veterinary_and_Animal_Sciences_logo.png/200px-University_of_Veterinary_and_Animal_Sciences_logo.png',
  'UETP': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/University_of_Engineering_%26_Technology_Peshawar_logo.png/200px-University_of_Engineering_%26_Technology_Peshawar_logo.png',
  'KIU': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Karakoram_International_University_logo.png/200px-Karakoram_International_University_logo.png',
  
  // ========== PUNJAB ==========
  'PU': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/University_of_the_Punjab_logo.png/200px-University_of_the_Punjab_logo.png',
  'LUMS': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/LUMS_logo.png/200px-LUMS_logo.png',
  'UET': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/38/University_of_Engineering_and_Technology_logo.png/200px-University_of_Engineering_and_Technology_logo.png',
  'KEMU': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/King_Edward_Medical_University_logo.png/200px-King_Edward_Medical_University_logo.png',
  'GCU': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/GCU_Lahore_Logo.png/200px-GCU_Lahore_Logo.png',
  'FAST-NU': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/FAST-NU_logo.png/200px-FAST-NU_logo.png',
  'UCP': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/University_of_Central_Punjab_logo.png/200px-University_of_Central_Punjab_logo.png',
  'UMT': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/University_of_Management_and_Technology_logo.png/200px-University_of_Management_and_Technology_logo.png',
  'LCWU': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Lahore_College_for_Women_University_logo.png/200px-Lahore_College_for_Women_University_logo.png',
  'UOL': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/The_University_of_Lahore_logo.png/200px-The_University_of_Lahore_logo.png',
  'UAF': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/University_of_Agriculture_Faisalabad_logo.png/200px-University_of_Agriculture_Faisalabad_logo.png',
  'GCUF': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Government_College_University%2C_Faisalabad_logo.png/200px-Government_College_University%2C_Faisalabad_logo.png',
  'BZU': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/89/Bahauddin_Zakariya_University_logo.png/200px-Bahauddin_Zakariya_University_logo.png',
  'UOS': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/University_of_Sargodha_logo.png/200px-University_of_Sargodha_logo.png',
  'IUB': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Islamia_University_of_Bahawalpur_logo.png/200px-Islamia_University_of_Bahawalpur_logo.png',
  
  // ========== SINDH ==========
  'UoK': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/University_of_Karachi_logo.png/200px-University_of_Karachi_logo.png',
  'NED': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/NED_University_of_Engineering_and_Technology_logo.png/200px-NED_University_of_Engineering_and_Technology_logo.png',
  'AKU': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/Aga_Khan_University_logo.svg/200px-Aga_Khan_University_logo.svg.png',
  'IBA': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/IBA_Karachi_logo.png/200px-IBA_Karachi_logo.png',
  'DUHS': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Dow_University_of_Health_Sciences_logo.png/200px-Dow_University_of_Health_Sciences_logo.png',
  'MUET': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Mehran_University_of_Engineering_and_Technology_logo.png/200px-Mehran_University_of_Engineering_and_Technology_logo.png',
  'SU': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/University_of_Sindh_logo.png/200px-University_of_Sindh_logo.png',
  
  // ========== KPK ==========
  'UoP': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/64/University_of_Peshawar_logo.png/200px-University_of_Peshawar_logo.png',
  'KMU': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Khyber_Medical_University_logo.png/200px-Khyber_Medical_University_logo.png',
  'UET Peshawar': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/University_of_Engineering_%26_Technology_Peshawar_logo.png/200px-University_of_Engineering_%26_Technology_Peshawar_logo.png',
  'AWKUM': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Abdul_Wali_Khan_University_Mardan_logo.png/200px-Abdul_Wali_Khan_University_Mardan_logo.png',
  'IMSciences': 'https://upload.wikimedia.org/wikipedia/en/2/21/Institute_of_Management_Sciences_logo.png',
  'HU': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Hazara_University_logo.png/200px-Hazara_University_logo.png',
  
  // ========== BALOCHISTAN ==========
  'UoB': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/University_of_Balochistan_logo.png/200px-University_of_Balochistan_logo.png',
  'BUITEMS': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/BUITEMS_logo.png/200px-BUITEMS_logo.png',
  
  // ========== AJK ==========
  'UAJK': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/University_of_Azad_Jammu_and_Kashmir_logo.png/200px-University_of_Azad_Jammu_and_Kashmir_logo.png',
  'MUST': 'https://upload.wikimedia.org/wikipedia/en/d/d9/Mirpur_University_of_Science_and_Technology_logo.png',
  
  // ========== Additional Universities ==========
  'ITU': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Information_Technology_University_logo.png/200px-Information_Technology_University_logo.png',
  'SZABIST': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/SZABIST_logo.svg/200px-SZABIST_logo.svg.png',
  'GIFT': 'https://gift.edu.pk/wp-content/uploads/2020/01/gift-logo.png',
  'RIPHAH': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Riphah_International_University_logo.png/200px-Riphah_International_University_logo.png',
  'FJWU': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Fatima_Jinnah_Women_University_logo.png/200px-Fatima_Jinnah_Women_University_logo.png',
};

/**
 * Get the logo URL for a university
 * @param shortName - University short name (e.g., 'NUST', 'LUMS')
 * @returns Direct URL to the logo or null if not mapped
 */
export function getUniversityLogoUrl(shortName: string): string | null {
  return UNIVERSITY_LOGO_MAP[shortName] || null;
}

/**
 * Get logo URL with fallback handling
 * @param shortName - University short name
 * @param _universityName - Full university name (unused, kept for API compatibility)
 * @returns Logo URL or empty string for fallback handling
 */
export function getLogoWithFallback(shortName: string, _universityName: string): string {
  return UNIVERSITY_LOGO_MAP[shortName] || '';
}

/**
 * Generate a unique color based on university name for placeholder backgrounds
 * @param name - University name or short name
 * @returns Hex color code
 */
export function getUniversityBrandColor(name: string): string {
  // University brand colors (approximate official colors from university websites/branding)
  const brandColors: Record<string, string> = {
    // ========== ISLAMABAD ==========
    'QAU': '#006633',       // Green (official)
    'NUST': '#003366',      // Navy Blue (official)
    'CUI': '#004B87',       // Royal Blue (COMSATS official)
    'IIUI': '#00573F',      // Islamic Green (official)
    'PIEAS': '#1B365D',     // Dark Blue (official)
    'AU': '#0066B3',        // Air Force Blue
    'BU': '#003366',        // Navy Blue (Pakistan Navy)
    'NUML': '#8B0000',      // Maroon (official)
    'FUUAST': '#006633',    // Green (Urdu/Pakistan theme)
    'CUST': '#CC0000',      // Red (official)
    
    // ========== PUNJAB ==========
    'PU': '#660066',        // Purple (official)
    'LUMS': '#8B0000',      // Crimson Red (official)
    'UET': '#8B4513',       // Brown/Gold (official)
    'KEMU': '#800020',      // Burgundy (official)
    'GCU': '#006633',       // Green (official)
    'FAST-NU': '#0066CC',   // Blue (official)
    'UCP': '#0055A5',       // Blue (official)
    'UMT': '#003366',       // Navy Blue (official)
    'LCWU': '#800080',      // Purple (women's theme)
    'UOL': '#003366',       // Navy Blue (official)
    'UAF': '#228B22',       // Agriculture Green (official)
    'GCUF': '#006633',      // Green (official)
    'BZU': '#003366',       // Blue (official)
    'UOS': '#00539C',       // Blue (official)
    'IUB': '#006633',       // Green (official)
    
    // ========== SINDH ==========
    'UoK': '#008080',       // Teal (official)
    'NED': '#CC0000',       // Red (official)
    'AKU': '#4B0082',       // Purple (Aga Khan official)
    'IBA': '#00274C',       // Midnight Blue (official)
    'DUHS': '#8B0000',      // Dark Red (medical theme)
    'MUET': '#003366',      // Navy Blue (official)
    'SU': '#006633',        // Green (official)
    
    // ========== KPK ==========
    'UoP': '#8B0000',       // Maroon (official)
    'KMU': '#CC0000',       // Red (medical theme)
    'UET Peshawar': '#8B4513', // Brown (engineering theme)
    'AWKUM': '#006633',     // Green (official)
    'CUI Abbottabad': '#004B87', // Blue (COMSATS)
    'HU': '#006633',        // Green (official)
    'IMSciences': '#003366', // Blue (official)
    
    // ========== BALOCHISTAN ==========
    'UoB': '#006633',       // Green (official)
    'BUITEMS': '#0066CC',   // Blue (IT theme)
    
    // ========== AJK ==========
    'UAJK': '#006633',      // Green (official)
    'MUST': '#003366',      // Blue (official)
    
    // ========== Additional Universities ==========
    'ITU': '#FF6600',       // Orange (official)
    'SZABIST': '#0066CC',   // Blue (official)
    'GIFT': '#8B0000',      // Maroon
    'RIPHAH': '#006633',    // Green (Islamic theme)
    'FJWU': '#800080',      // Purple (women's theme)
  };

  if (brandColors[name]) {
    return brandColors[name];
  }

  // Generate consistent, visually appealing color from name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use predefined attractive hues (avoiding yellows and light colors)
  const attractiveHues = [210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 0, 10, 20, 160, 170, 180, 190, 200];
  const hueIndex = Math.abs(hash) % attractiveHues.length;
  const hue = attractiveHues[hueIndex];
  
  return `hsl(${hue}, 55%, 40%)`;
}

/**
 * Check if a university has a logo URL mapped
 * @param shortName - University short name
 * @returns boolean
 */
export function hasStaticLogo(shortName: string): boolean {
  return shortName in UNIVERSITY_LOGO_MAP;
}

export default {
  getUniversityLogoUrl,
  getLogoWithFallback,
  getUniversityBrandColor,
  hasStaticLogo,
  UNIVERSITY_LOGO_MAP,
};
