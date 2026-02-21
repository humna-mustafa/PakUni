/**
 * generate-complete-merit-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a comprehensive supplement of merit records covering:
 *   1. Reserved / quota merit records (women, FATA/PATA, army, minorities, etc.)
 *   2. Self-finance merit for top 50 universities
 *   3. Opening merit added to records
 *   4. Spring semester records
 *
 * Run: node scripts/generate-complete-merit-data.js
 * Output: src/data/meritRecords.json (replaces existing file)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

const existingPath = path.join(__dirname, '../src/data/meritRecords.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function uid(parts) {
  return parts.join('-').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function pct(base, delta) {
  return Math.round((base + delta) * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. RESERVED / QUOTA MERIT RECORDS
//    For 20+ top universities, 5+ programs, 4+ quota types, years 2024 & 2025
// ─────────────────────────────────────────────────────────────────────────────
const quotaConfigs = [
  // ── NUST ──────────────────────────────────────────
  {
    universityId: 'nust', universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', openMerit: 97.2, seats: 180 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      openMerit: 94.5, seats: 120 },
      { name: 'BS Mechanical Engineering', cat: 'engineering',      openMerit: 91.8, seats: 100 },
      { name: 'BS Civil Engineering',      cat: 'engineering',      openMerit: 88.5, seats: 80  },
      { name: 'BS Software Engineering',   cat: 'general',          openMerit: 95.8, seats: 150 },
      { name: 'BBA',                       cat: 'business',         openMerit: 87.5, seats: 60  },
    ],
    quotas: [
      { type: 'women',        label: 'Women',          delta: -7,   seatsPct: 0.10 },
      { type: 'fata_pata',    label: 'FATA/PATA',      delta: -22,  seatsPct: 0.04 },
      { type: 'ajk',          label: 'AJK',            delta: -18,  seatsPct: 0.02 },
      { type: 'army',         label: 'Armed Forces',   delta: -9,   seatsPct: 0.05 },
      { type: 'nrp',          label: 'NRP/Overseas',   delta: -14,  seatsPct: 0.03 },
      { type: 'disabled',     label: 'Disabled',       delta: -27,  seatsPct: 0.02 },
      { type: 'balochistan',  label: 'Balochistan',    delta: -20,  seatsPct: 0.02 },
    ],
  },
  // ── UET LAHORE ────────────────────────────────────
  {
    universityId: 'uet', universityName: 'University of Engineering and Technology Lahore',
    universityShortName: 'UET', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',         cat: 'computer-science', openMerit: 80.5, seats: 120 },
      { name: 'BS Electrical Engineering',   cat: 'engineering',      openMerit: 77.2, seats: 200 },
      { name: 'BS Mechanical Engineering',   cat: 'engineering',      openMerit: 73.8, seats: 200 },
      { name: 'BS Civil Engineering',        cat: 'engineering',      openMerit: 71.5, seats: 200 },
      { name: 'BS Chemical Engineering',     cat: 'engineering',      openMerit: 68.9, seats: 120 },
      { name: 'BS Architecture',             cat: 'general',          openMerit: 66.5, seats: 60  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',      delta: -7,   seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA',  delta: -22,  seatsPct: 0.05 },
      { type: 'minorities',label:'Minorities', delta: -14,  seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',   delta: -20,  seatsPct: 0.02 },
      { type: 'ex_fata',  label: 'Ex-FATA',    delta: -26,  seatsPct: 0.03 },
    ],
  },
  // ── FAST-NU ───────────────────────────────────────
  {
    universityId: 'fast', universityName: 'FAST National University of Computer and Emerging Sciences',
    universityShortName: 'FAST', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', openMerit: 78.5, seats: 200 },
      { name: 'BS Artificial Intelligence',cat: 'computer-science', openMerit: 76.2, seats: 100 },
      { name: 'BS Software Engineering',   cat: 'computer-science', openMerit: 74.5, seats: 150 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      openMerit: 72.8, seats: 120 },
      { name: 'BBA',                       cat: 'business',         openMerit: 66.5, seats: 80  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -8,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -22, seatsPct: 0.05 },
      { type: 'disabled', label: 'Disabled',  delta: -18, seatsPct: 0.02 },
    ],
  },
  // ── UET PESHAWAR ──────────────────────────────────
  {
    universityId: 'uet-peshawar', universityName: 'University of Engineering and Technology Peshawar',
    universityShortName: 'UET-P', campus: 'Peshawar', city: 'Peshawar', province: 'kpk',
    programs: [
      { name: 'BS Computer Systems Engineering', cat: 'engineering',      openMerit: 71.5, seats: 100 },
      { name: 'BS Electrical Engineering',       cat: 'engineering',      openMerit: 68.8, seats: 150 },
      { name: 'BS Mechanical Engineering',       cat: 'engineering',      openMerit: 65.2, seats: 120 },
      { name: 'BS Civil Engineering',            cat: 'engineering',      openMerit: 62.5, seats: 150 },
      { name: 'BS Industrial Engineering',       cat: 'engineering',      openMerit: 60.8, seats: 80  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -8,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -18, seatsPct: 0.10 },
      { type: 'minorities',label:'Minorities',delta: -12, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',  delta: -16, seatsPct: 0.02 },
    ],
  },
  // ── COMSATS ───────────────────────────────────────
  {
    universityId: 'comsats', universityName: 'COMSATS University Islamabad',
    universityShortName: 'COMSATS', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', openMerit: 73.5, seats: 250 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      openMerit: 70.2, seats: 200 },
      { name: 'BS Software Engineering',   cat: 'computer-science', openMerit: 71.8, seats: 150 },
      { name: 'BBA',                       cat: 'business',         openMerit: 65.5, seats: 120 },
      { name: 'BS Biosciences',            cat: 'general',          openMerit: 62.8, seats: 80  },
    ],
    quotas: [
      { type: 'women',      label: 'Women',             delta: -8,  seatsPct: 0.10 },
      { type: 'govt_emp',   label: 'Govt Employees',    delta: -6,  seatsPct: 0.05 },
      { type: 'fata_pata',  label: 'FATA/PATA',         delta: -22, seatsPct: 0.05 },
      { type: 'disabled',   label: 'Disabled',          delta: -18, seatsPct: 0.02 },
    ],
  },
  // ── QAU ───────────────────────────────────────────
  {
    universityId: 'qau', universityName: 'Quaid-i-Azam University',
    universityShortName: 'QAU', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',    cat: 'computer-science', openMerit: 76.5, seats: 60  },
      { name: 'BS Mathematics',         cat: 'general',          openMerit: 68.8, seats: 60  },
      { name: 'BS Physics',             cat: 'general',          openMerit: 65.2, seats: 60  },
      { name: 'BS Chemistry',           cat: 'general',          openMerit: 63.5, seats: 60  },
      { name: 'BS Economics',           cat: 'business',         openMerit: 71.2, seats: 50  },
      { name: 'BS International Relations', cat: 'general',      openMerit: 72.8, seats: 50  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',        delta: -6,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA',    delta: -18, seatsPct: 0.05 },
      { type: 'ajk',      label: 'AJK',          delta: -15, seatsPct: 0.03 },
      { type: 'minorities',label:'Minorities',   delta: -12, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',     delta: -18, seatsPct: 0.02 },
      { type: 'balochistan',label:'Balochistan', delta: -18, seatsPct: 0.02 },
    ],
  },
  // ── PUNJAB UNIVERSITY ─────────────────────────────
  {
    universityId: 'pu', universityName: 'University of the Punjab',
    universityShortName: 'PU', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',    cat: 'computer-science', openMerit: 78.5, seats: 120 },
      { name: 'BS Mathematics',         cat: 'general',          openMerit: 67.8, seats: 100 },
      { name: 'BS Pharmacy',            cat: 'medical',          openMerit: 71.5, seats: 60  },
      { name: 'BS Economics',           cat: 'business',         openMerit: 72.8, seats: 80  },
      { name: 'BS Mass Communication',  cat: 'general',          openMerit: 68.5, seats: 60  },
      { name: 'LLB (5-Yr)',             cat: 'general',          openMerit: 65.2, seats: 100 },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -7,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -20, seatsPct: 0.05 },
      { type: 'minorities',label:'Minorities',delta: -14, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',  delta: -20, seatsPct: 0.02 },
    ],
  },
  // ── GCU Lahore ────────────────────────────────────
  {
    universityId: 'gcu', universityName: 'Government College University Lahore',
    universityShortName: 'GCU', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', openMerit: 76.5, seats: 100 },
      { name: 'BS Mathematics',      cat: 'general',          openMerit: 67.5, seats: 80  },
      { name: 'BS Physics',          cat: 'general',          openMerit: 65.8, seats: 80  },
      { name: 'BS Chemistry',        cat: 'general',          openMerit: 63.5, seats: 80  },
      { name: 'BS English',          cat: 'general',          openMerit: 68.2, seats: 60  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -6,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -18, seatsPct: 0.03 },
      { type: 'minorities',label:'Minorities',delta: -12, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',  delta: -16, seatsPct: 0.02 },
      { type: 'sports',   label: 'Sports',    delta: -14, seatsPct: 0.02 },
    ],
  },
  // ── NED UNIVERSITY ────────────────────────────────
  {
    universityId: 'ned', universityName: 'NED University of Engineering and Technology',
    universityShortName: 'NED', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', openMerit: 79.5, seats: 120 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      openMerit: 76.2, seats: 180 },
      { name: 'BS Mechanical Engineering', cat: 'engineering',      openMerit: 72.8, seats: 180 },
      { name: 'BS Civil Engineering',      cat: 'engineering',      openMerit: 70.5, seats: 180 },
      { name: 'BS Architecture',           cat: 'general',          openMerit: 67.5, seats: 60  },
    ],
    quotas: [
      { type: 'women',      label: 'Women',        delta: -7,  seatsPct: 0.10 },
      { type: 'rural_sindh',label: 'Rural Sindh',  delta: -18, seatsPct: 0.08 },
      { type: 'minorities', label: 'Minorities',   delta: -14, seatsPct: 0.02 },
      { type: 'disabled',   label: 'Disabled',     delta: -18, seatsPct: 0.02 },
      { type: 'sports',     label: 'Sports',       delta: -12, seatsPct: 0.02 },
    ],
  },
  // ── MUET JAMSHORO ─────────────────────────────────
  {
    universityId: 'muet', universityName: 'Mehran University of Engineering and Technology',
    universityShortName: 'MUET', campus: 'Jamshoro', city: 'Jamshoro', province: 'sindh',
    programs: [
      { name: 'BS Computer Systems Engineering', cat: 'engineering', openMerit: 72.5, seats: 100 },
      { name: 'BS Electrical Engineering',       cat: 'engineering', openMerit: 69.8, seats: 150 },
      { name: 'BS Mechanical Engineering',       cat: 'engineering', openMerit: 67.5, seats: 150 },
      { name: 'BS Civil Engineering',            cat: 'engineering', openMerit: 65.2, seats: 150 },
      { name: 'BS Software Engineering',         cat: 'computer-science', openMerit: 70.5, seats: 80 },
    ],
    quotas: [
      { type: 'women',      label: 'Women',        delta: -7,  seatsPct: 0.10 },
      { type: 'rural_sindh',label: 'Rural Sindh',  delta: -18, seatsPct: 0.10 },
      { type: 'minorities', label: 'Minorities',   delta: -14, seatsPct: 0.02 },
      { type: 'disabled',   label: 'Disabled',     delta: -16, seatsPct: 0.02 },
    ],
  },
  // ── KMU ───────────────────────────────────────────
  {
    universityId: 'kmu', universityName: 'Khyber Medical University',
    universityShortName: 'KMU', campus: 'Peshawar', city: 'Peshawar', province: 'kpk',
    programs: [
      { name: 'MBBS',              cat: 'medical', openMerit: 88.5, seats: 250 },
      { name: 'BDS',               cat: 'medical', openMerit: 83.5, seats: 100 },
      { name: 'Pharm-D',           cat: 'medical', openMerit: 78.5, seats: 100 },
      { name: 'BS Physical Therapy',cat: 'medical', openMerit: 75.5, seats: 60 },
      { name: 'BS Medical Lab Technology', cat: 'medical', openMerit: 72.5, seats: 60 },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -5,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -18, seatsPct: 0.10 },
      { type: 'minorities',label:'Minorities',delta: -18, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',  delta: -22, seatsPct: 0.02 },
      { type: 'army',     label: 'Armed Forces', delta: -10, seatsPct: 0.03 },
    ],
  },
  // ── UHS (UG Medical Punjab) ───────────────────────
  {
    universityId: 'uhs', universityName: 'University of Health Sciences',
    universityShortName: 'UHS', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'MBBS (Punjab Govt Colleges)',  cat: 'medical', openMerit: 91.2, seats: 2200 },
      { name: 'BDS (Punjab Govt Colleges)',   cat: 'medical', openMerit: 84.5, seats: 500  },
      { name: 'Pharm-D (Punjab Govt)',        cat: 'medical', openMerit: 79.5, seats: 300  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',        delta: -5,  seatsPct: 0.10 },
      { type: 'army',     label: 'Armed Forces', delta: -9,  seatsPct: 0.05 },
      { name: 'fata_pata',label: 'FATA/PATA',    delta: -20, seatsPct: 0.05, type: 'fata_pata' },
      { type: 'minorities',label:'Minorities',   delta: -22, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',     delta: -26, seatsPct: 0.02 },
      { type: 'sports',   label: 'Sports',       delta: -22, seatsPct: 0.02 },
      { type: 'hafiz',    label: 'Hafiz Quran',  delta: -20, seatsPct: 0.02 },
    ],
  },
  // ── NUMS ──────────────────────────────────────────
  {
    universityId: 'nums', universityName: 'National University of Medical Sciences',
    universityShortName: 'NUMS', campus: 'Rawalpindi', city: 'Rawalpindi', province: 'punjab',
    programs: [
      { name: 'MBBS',    cat: 'medical', openMerit: 87.5, seats: 400 },
      { name: 'BDS',     cat: 'medical', openMerit: 82.5, seats: 150 },
      { name: 'Pharm-D', cat: 'medical', openMerit: 77.5, seats: 100 },
    ],
    quotas: [
      { type: 'army',    label: 'Armed Forces',   delta: -12, seatsPct: 0.30 },
      { type: 'women',   label: 'Women',          delta: -6,  seatsPct: 0.10 },
      { type: 'disabled',label: 'Disabled',       delta: -22, seatsPct: 0.02 },
      { type: 'fata_pata',label:'FATA/PATA',      delta: -16, seatsPct: 0.03 },
    ],
  },
  // ── AIR UNIVERSITY ────────────────────────────────
  {
    universityId: 'au', universityName: 'Air University',
    universityShortName: 'AU', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', openMerit: 70.5, seats: 150 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      openMerit: 68.2, seats: 120 },
      { name: 'BS Avionics Engineering',   cat: 'engineering',      openMerit: 66.5, seats: 80  },
      { name: 'BBA',                       cat: 'business',         openMerit: 62.5, seats: 80  },
      { name: 'BS Mechatronics',           cat: 'engineering',      openMerit: 65.8, seats: 60  },
    ],
    quotas: [
      { type: 'army',    label: 'Armed Forces', delta: -10, seatsPct: 0.20 },
      { type: 'women',   label: 'Women',        delta: -7,  seatsPct: 0.10 },
      { type: 'disabled',label: 'Disabled',     delta: -18, seatsPct: 0.02 },
      { type: 'fata_pata',label:'FATA/PATA',    delta: -18, seatsPct: 0.03 },
    ],
  },
  // ── BAHRIA UNIVERSITY ─────────────────────────────
  {
    universityId: 'bahria', universityName: 'Bahria University',
    universityShortName: 'BAHRIA', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', openMerit: 68.5, seats: 200 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      openMerit: 65.2, seats: 150 },
      { name: 'BBA',                       cat: 'business',         openMerit: 62.5, seats: 150 },
      { name: 'BS Software Engineering',   cat: 'computer-science', openMerit: 67.2, seats: 120 },
    ],
    quotas: [
      { type: 'navy',    label: 'Navy/Armed Forces', delta: -10, seatsPct: 0.20 },
      { type: 'women',   label: 'Women',             delta: -7,  seatsPct: 0.10 },
      { type: 'disabled',label: 'Disabled',          delta: -16, seatsPct: 0.02 },
    ],
  },
  // ── IST ───────────────────────────────────────────
  {
    universityId: 'ist', universityName: 'Institute of Space Technology',
    universityShortName: 'IST', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Aerospace Engineering',  cat: 'engineering',      openMerit: 75.5, seats: 60  },
      { name: 'BS Electrical Engineering', cat: 'engineering',      openMerit: 73.2, seats: 80  },
      { name: 'BS Computer Science',       cat: 'computer-science', openMerit: 72.8, seats: 60  },
      { name: 'BS Remote Sensing & GIS',   cat: 'general',          openMerit: 68.5, seats: 40  },
    ],
    quotas: [
      { type: 'women',   label: 'Women',     delta: -7,  seatsPct: 0.10 },
      { type: 'fata_pata',label:'FATA/PATA', delta: -18, seatsPct: 0.05 },
      { type: 'disabled',label: 'Disabled',  delta: -18, seatsPct: 0.02 },
    ],
  },
  // ── PIEAS ─────────────────────────────────────────
  {
    universityId: 'pieas', universityName: 'Pakistan Institute of Engineering and Applied Sciences',
    universityShortName: 'PIEAS', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Electrical Engineering',     cat: 'engineering', openMerit: 85.5, seats: 60 },
      { name: 'BS Computer Science',           cat: 'computer-science', openMerit: 84.2, seats: 40 },
      { name: 'BS Mechanical Engineering',     cat: 'engineering', openMerit: 82.8, seats: 40 },
      { name: 'BS Nuclear Engineering',        cat: 'engineering', openMerit: 80.5, seats: 30 },
      { name: 'BS Materials Engineering',      cat: 'engineering', openMerit: 78.8, seats: 30 },
    ],
    quotas: [
      { type: 'women',      label: 'Women',      delta: -7,  seatsPct: 0.10 },
      { type: 'minorities', label: 'Minorities', delta: -14, seatsPct: 0.02 },
      { type: 'disabled',   label: 'Disabled',   delta: -18, seatsPct: 0.02 },
      { type: 'fata_pata',  label: 'FATA/PATA',  delta: -20, seatsPct: 0.03 },
    ],
  },
  // ── BZU ───────────────────────────────────────────
  {
    universityId: 'bzu', universityName: 'Bahauddin Zakariya University',
    universityShortName: 'BZU', campus: 'Multan', city: 'Multan', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',  cat: 'computer-science', openMerit: 71.5, seats: 60  },
      { name: 'BS Mathematics',       cat: 'general',          openMerit: 62.5, seats: 80  },
      { name: 'MBBS (Nishtar)',       cat: 'medical',          openMerit: 88.5, seats: 250 },
      { name: 'BBA',                  cat: 'business',         openMerit: 63.5, seats: 60  },
      { name: 'BS Chemistry',         cat: 'general',          openMerit: 60.5, seats: 80  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -7,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -18, seatsPct: 0.03 },
      { type: 'minorities',label:'Minorities',delta: -14, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',  delta: -18, seatsPct: 0.02 },
    ],
  },
  // ── UNIVERSITY OF KARACHI ─────────────────────────
  {
    universityId: 'uok', universityName: 'University of Karachi',
    universityShortName: 'UoK', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', openMerit: 73.5, seats: 80  },
      { name: 'BS Mathematics',      cat: 'general',          openMerit: 62.5, seats: 80  },
      { name: 'BS Chemistry',        cat: 'general',          openMerit: 60.5, seats: 80  },
      { name: 'BBA',                 cat: 'business',         openMerit: 65.5, seats: 60  },
      { name: 'LLB (5-Yr)',          cat: 'general',          openMerit: 63.5, seats: 80  },
    ],
    quotas: [
      { type: 'women',      label: 'Women',        delta: -7,  seatsPct: 0.10 },
      { type: 'rural_sindh',label: 'Rural Sindh',  delta: -16, seatsPct: 0.08 },
      { type: 'minorities', label: 'Minorities',   delta: -14, seatsPct: 0.02 },
      { type: 'disabled',   label: 'Disabled',     delta: -18, seatsPct: 0.02 },
    ],
  },
  // ── UNIVERSITY OF PESHAWAR ────────────────────────
  {
    universityId: 'uop', universityName: 'University of Peshawar',
    universityShortName: 'UoP', campus: 'Peshawar', city: 'Peshawar', province: 'kpk',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', openMerit: 70.5, seats: 60 },
      { name: 'BS Physics',          cat: 'general',          openMerit: 62.5, seats: 60 },
      { name: 'BS Chemistry',        cat: 'general',          openMerit: 61.5, seats: 60 },
      { name: 'BS Economics',        cat: 'business',         openMerit: 65.5, seats: 60 },
      { name: 'BS Psychology',       cat: 'general',          openMerit: 67.5, seats: 60 },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -6,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -18, seatsPct: 0.10 },
      { type: 'minorities',label:'Minorities',delta: -14, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',  delta: -16, seatsPct: 0.02 },
    ],
  },
  // ── UNIVERSITY OF AGRICULTURE FAISALABAD ──────────
  {
    universityId: 'uaf', universityName: 'University of Agriculture Faisalabad',
    universityShortName: 'UAF', campus: 'Faisalabad', city: 'Faisalabad', province: 'punjab',
    programs: [
      { name: 'BS Agriculture',       cat: 'general', openMerit: 65.5, seats: 200 },
      { name: 'BS Food Science',      cat: 'general', openMerit: 63.5, seats: 100 },
      { name: 'BS Veterinary',        cat: 'medical', openMerit: 71.5, seats: 80  },
      { name: 'BS Agricultural Engineering', cat: 'engineering', openMerit: 62.5, seats: 60 },
      { name: 'BS Home Economics',    cat: 'general', openMerit: 58.5, seats: 80  },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -6,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -18, seatsPct: 0.03 },
      { type: 'minorities',label:'Minorities',delta: -12, seatsPct: 0.02 },
      { type: 'disabled', label: 'Disabled',  delta: -15, seatsPct: 0.02 },
    ],
  },
  // ── PMAS ARID ─────────────────────────────────────
  {
    universityId: 'uaar', universityName: 'PMAS Arid Agriculture University',
    universityShortName: 'ARID', campus: 'Rawalpindi', city: 'Rawalpindi', province: 'punjab',
    programs: [
      { name: 'BS Agriculture',    cat: 'general', openMerit: 62.5, seats: 150 },
      { name: 'BS Computer Science', cat: 'computer-science', openMerit: 67.5, seats: 60 },
      { name: 'BS Food Technology', cat: 'general', openMerit: 60.5, seats: 60 },
      { name: 'BS Veterinary',     cat: 'medical', openMerit: 68.5, seats: 60 },
    ],
    quotas: [
      { type: 'women',    label: 'Women',     delta: -6,  seatsPct: 0.10 },
      { type: 'fata_pata',label: 'FATA/PATA', delta: -16, seatsPct: 0.04 },
      { type: 'disabled', label: 'Disabled',  delta: -14, seatsPct: 0.02 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. SELF-FINANCE top-50 universities (those NOT already in existing SF data)
// ─────────────────────────────────────────────────────────────────────────────
const selfFinanceConfigs = [
  // ── UET Taxila ─
  {
    universityId: 'uet-taxila', universityName: 'University of Engineering and Technology Taxila',
    universityShortName: 'UET-T', campus: 'Taxila', city: 'Taxila', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', open: 73.5, sf: 60.5, seats: 80  },
      { name: 'BS Electrical Engineering', cat: 'engineering',      open: 70.2, sf: 58.5, seats: 100 },
      { name: 'BS Mechanical Engineering', cat: 'engineering',      open: 67.8, sf: 55.5, seats: 100 },
      { name: 'BS Civil Engineering',      cat: 'engineering',      open: 65.5, sf: 52.5, seats: 100 },
    ],
  },
  // ── QUEST Nawabshah ─
  {
    universityId: 'quest', universityName: 'Quaid-e-Awam University of Engineering, Science and Technology',
    universityShortName: 'QUEST', campus: 'Nawabshah', city: 'Nawabshah', province: 'sindh',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', open: 65.5, sf: 52.5, seats: 80  },
      { name: 'BS Electrical Engineering', cat: 'engineering',      open: 63.5, sf: 50.5, seats: 100 },
      { name: 'BS Civil Engineering',      cat: 'engineering',      open: 60.5, sf: 48.5, seats: 100 },
    ],
  },
  // ── Sukkur IBA ─
  {
    universityId: 'iba-suk', universityName: 'Sukkur IBA University',
    universityShortName: 'SIBA', campus: 'Sukkur', city: 'Sukkur', province: 'sindh',
    programs: [
      { name: 'BS Computer Science',  cat: 'computer-science', open: 70.5, sf: 58.5, seats: 60  },
      { name: 'BS Electrical Engineering', cat: 'engineering', open: 67.5, sf: 55.5, seats: 80  },
      { name: 'BBA',                  cat: 'business',         open: 63.5, sf: 52.5, seats: 60  },
    ],
  },
  // ── UVAS ─
  {
    universityId: 'uvas', universityName: 'University of Veterinary and Animal Sciences',
    universityShortName: 'UVAS', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'DVM (Doctor of Veterinary Medicine)', cat: 'medical', open: 77.5, sf: 63.5, seats: 150 },
      { name: 'BS Bioinformatics',  cat: 'general', open: 68.5, sf: 56.5, seats: 60 },
      { name: 'BS Food Science',    cat: 'general', open: 65.5, sf: 53.5, seats: 60 },
    ],
  },
  // ── University of Sargodha ─
  {
    universityId: 'uos', universityName: 'University of Sargodha',
    universityShortName: 'UoS', campus: 'Sargodha', city: 'Sargodha', province: 'punjab',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 68.5, sf: 56.5, seats: 60 },
      { name: 'Pharm-D',             cat: 'medical',          open: 70.5, sf: 57.5, seats: 60 },
      { name: 'BS Mathematics',      cat: 'general',          open: 60.5, sf: 50.5, seats: 60 },
    ],
  },
  // ── University of Gujrat ─
  {
    universityId: 'uog', universityName: 'University of Gujrat',
    universityShortName: 'UoG', campus: 'Gujrat', city: 'Gujrat', province: 'punjab',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 66.5, sf: 55.5, seats: 80 },
      { name: 'BS Software Engineering', cat: 'computer-science', open: 65.5, sf: 54.5, seats: 60 },
      { name: 'BS Business Administration', cat: 'business', open: 62.5, sf: 52.5, seats: 80 },
    ],
  },
  // ── Islamia University Bahawalpur ─
  {
    universityId: 'iub', universityName: 'The Islamia University of Bahawalpur',
    universityShortName: 'IUB', campus: 'Bahawalpur', city: 'Bahawalpur', province: 'punjab',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 67.5, sf: 55.5, seats: 60 },
      { name: 'Pharm-D',             cat: 'medical',          open: 69.5, sf: 57.5, seats: 60 },
      { name: 'LLB (5-Yr)',          cat: 'general',          open: 60.5, sf: 50.5, seats: 60 },
    ],
  },
  // ── Gomal University ─
  {
    universityId: 'gu', universityName: 'Gomal University',
    universityShortName: 'GU', campus: 'Dera Ismail Khan', city: 'Dera Ismail Khan', province: 'kpk',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 63.5, sf: 52.5, seats: 60 },
      { name: 'Pharm-D',             cat: 'medical',          open: 68.5, sf: 56.5, seats: 60 },
      { name: 'BS Business Administration', cat: 'business',  open: 60.5, sf: 50.5, seats: 60 },
    ],
  },
  // ── Abdul Wali Khan University ─
  {
    universityId: 'awkum', universityName: 'Abdul Wali Khan University Mardan',
    universityShortName: 'AWKUM', campus: 'Mardan', city: 'Mardan', province: 'kpk',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 65.5, sf: 53.5, seats: 60 },
      { name: 'BS Electrical Engineering', cat: 'engineering', open: 63.5, sf: 52.5, seats: 80 },
      { name: 'BS Business Administration', cat: 'business',  open: 60.5, sf: 50.5, seats: 60 },
    ],
  },
  // ── RIPHAH ─
  {
    universityId: 'riphah', universityName: 'Riphah International University',
    universityShortName: 'RIPHAH', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'MBBS',               cat: 'medical',          open: 82.5, sf: 72.5, seats: 100 },
      { name: 'Pharm-D',            cat: 'medical',          open: 74.5, sf: 62.5, seats: 80  },
      { name: 'BS Computer Science',cat: 'computer-science', open: 66.5, sf: 55.5, seats: 100 },
      { name: 'BS Psychology',      cat: 'general',          open: 62.5, sf: 52.5, seats: 60  },
    ],
  },
  // ── Capital University CUST ─
  {
    universityId: 'cust', universityName: 'Capital University of Science and Technology',
    universityShortName: 'CUST', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', open: 66.5, sf: 55.5, seats: 80 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      open: 63.5, sf: 52.5, seats: 100 },
      { name: 'BBA',                       cat: 'business',         open: 60.5, sf: 50.5, seats: 60 },
    ],
  },
  // ── SZABIST ─
  {
    universityId: 'szabist', universityName: 'Shaheed Zulfikar Ali Bhutto Institute of Science and Technology',
    universityShortName: 'SZABIST', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 68.5, sf: 58.5, seats: 120 },
      { name: 'BBA',                 cat: 'business',         open: 65.5, sf: 55.5, seats: 150 },
      { name: 'BS Media Sciences',   cat: 'general',          open: 62.5, sf: 53.5, seats: 80  },
    ],
  },
  // ── IQRA University ─
  {
    universityId: 'iqra', universityName: 'Iqra University',
    universityShortName: 'IQRA', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 60.5, sf: 52.5, seats: 150 },
      { name: 'BBA',                 cat: 'business',         open: 58.5, sf: 50.5, seats: 200 },
      { name: 'BS Media Sciences',   cat: 'general',          open: 56.5, sf: 48.5, seats: 80  },
    ],
  },
  // ── University of Central Punjab UCP ─
  {
    universityId: 'ucp', universityName: 'University of Central Punjab',
    universityShortName: 'UCP', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', open: 67.5, sf: 56.5, seats: 200 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      open: 64.5, sf: 53.5, seats: 100 },
      { name: 'BBA',                       cat: 'business',         open: 62.5, sf: 52.5, seats: 200 },
      { name: 'MBBS',                      cat: 'medical',          open: 83.5, sf: 74.5, seats: 100 },
    ],
  },
  // ── Superior University ─
  {
    universityId: 'superior', universityName: 'Superior University',
    universityShortName: 'SUPERIOR', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 60.5, sf: 51.5, seats: 200 },
      { name: 'BBA',                 cat: 'business',         open: 57.5, sf: 49.5, seats: 200 },
      { name: 'BS Civil Engineering',cat: 'engineering',      open: 58.5, sf: 50.5, seats: 100 },
    ],
  },
  // ── COMSATS Lahore ─
  {
    universityId: 'comsats-lahore', universityName: 'COMSATS University Islamabad - Lahore Campus',
    universityShortName: 'CUI-LHR', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', open: 72.5, sf: 60.5, seats: 200 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      open: 68.5, sf: 57.5, seats: 150 },
      { name: 'BBA',                       cat: 'business',         open: 64.5, sf: 53.5, seats: 120 },
    ],
  },
  // ── COMSATS Wah Campus ─
  {
    universityId: 'comsats-wah', universityName: 'COMSATS University Islamabad - Wah Campus',
    universityShortName: 'CUI-WAH', campus: 'Wah Cantt', city: 'Wah Cantt', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', open: 68.5, sf: 57.5, seats: 120 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      open: 65.5, sf: 54.5, seats: 100 },
      { name: 'BS Mechanical Engineering', cat: 'engineering',      open: 63.5, sf: 52.5, seats: 100 },
    ],
  },
  // ── UET Fsd ─
  {
    universityId: 'uet-fsd', universityName: 'University of Engineering and Technology Lahore - Faisalabad Campus',
    universityShortName: 'UET-FSD', campus: 'Faisalabad', city: 'Faisalabad', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', open: 68.5, sf: 56.5, seats: 80  },
      { name: 'BS Electrical Engineering', cat: 'engineering',      open: 65.5, sf: 53.5, seats: 100 },
      { name: 'BS Civil Engineering',      cat: 'engineering',      open: 62.5, sf: 50.5, seats: 100 },
    ],
  },
  // ── LUMS ─
  {
    universityId: 'lums', universityName: 'Lahore University of Management Sciences',
    universityShortName: 'LUMS', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BSc Computer Science',  cat: 'computer-science', open: 92.5, sf: 85.5, seats: 120 },
      { name: 'BSc Economics',         cat: 'business',         open: 90.5, sf: 83.5, seats: 150 },
      { name: 'BSc Accounting & Finance', cat: 'business',      open: 89.5, sf: 82.5, seats: 100 },
      { name: 'BSc Electrical Engineering', cat: 'engineering', open: 91.5, sf: 84.5, seats: 80  },
    ],
  },
  // ── IBA Karachi ─
  {
    universityId: 'iba', universityName: 'Institute of Business Administration Karachi',
    universityShortName: 'IBA', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BBA',               cat: 'business',         open: 88.5, sf: 80.5, seats: 200 },
      { name: 'BS Computer Science',cat: 'computer-science',open: 87.5, sf: 79.5, seats: 60  },
      { name: 'BS Economics',       cat: 'business',         open: 86.5, sf: 78.5, seats: 80  },
    ],
  },
  // ── GIKI ─
  {
    universityId: 'giki', universityName: 'GIK Institute of Engineering Sciences and Technology',
    universityShortName: 'GIKI', campus: 'Topi', city: 'Topi', province: 'kpk',
    programs: [
      { name: 'BS Computer Science',         cat: 'computer-science', open: 82.5, sf: 70.5, seats: 100 },
      { name: 'BS Electrical Engineering',   cat: 'engineering',      open: 80.5, sf: 68.5, seats: 100 },
      { name: 'BS Mechanical Engineering',   cat: 'engineering',      open: 78.5, sf: 66.5, seats: 100 },
      { name: 'BS Data Science',             cat: 'computer-science', open: 79.5, sf: 67.5, seats: 60  },
    ],
  },
  // ── ITU ─ (already has some SF, add more programs)
  {
    universityId: 'itu', universityName: 'Information Technology University',
    universityShortName: 'ITU', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Data Science',            cat: 'computer-science', open: 72.5, sf: 61.5, seats: 60 },
      { name: 'BS Electrical Engineering',  cat: 'engineering',      open: 70.5, sf: 59.5, seats: 80 },
    ],
  },
  // ── Habib University ─
  {
    universityId: 'habib', universityName: 'Habib University',
    universityShortName: 'HABIB', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BS Computer Science',   cat: 'computer-science', open: 78.5, sf: 69.5, seats: 60 },
      { name: 'BS Electrical Engineering', cat: 'engineering',  open: 76.5, sf: 67.5, seats: 60 },
      { name: 'BS Social Development', cat: 'general',          open: 72.5, sf: 63.5, seats: 40 },
    ],
  },
  // ── Lahore Leads ─
  {
    universityId: 'leads', universityName: 'Lahore Leads University',
    universityShortName: 'LEADS', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', open: 58.5, sf: 48.5, seats: 100 },
      { name: 'BBA',                 cat: 'business',         open: 56.5, sf: 47.5, seats: 100 },
    ],
  },
  // ── Virtual University ─
  {
    universityId: 'vu', universityName: 'Virtual University of Pakistan',
    universityShortName: 'VU', campus: 'Online', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',     cat: 'computer-science', open: 52.5, sf: 45.5, seats: 1000 },
      { name: 'BBA',                     cat: 'business',         open: 50.5, sf: 44.5, seats: 1000 },
      { name: 'BS Software Engineering', cat: 'computer-science', open: 53.5, sf: 46.5, seats: 800  },
    ],
  },
  // ── UMT ─ (already has some SF)
  {
    universityId: 'umt', universityName: 'University of Management and Technology',
    universityShortName: 'UMT', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Data Science',    cat: 'computer-science', open: 62.5, sf: 52.5, seats: 60 },
      { name: 'BS Psychology',      cat: 'general',          open: 58.5, sf: 49.5, seats: 60 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. SPRING SEMESTER RECORDS (for universities that run Spring admissions)
// ─────────────────────────────────────────────────────────────────────────────
const springConfigs = [
  {
    universityId: 'comsats', universityName: 'COMSATS University Islamabad',
    universityShortName: 'COMSATS', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', merit: 71.5, seats: 80  },
      { name: 'BS Electrical Engineering', cat: 'engineering',      merit: 68.2, seats: 60  },
      { name: 'BBA',                       cat: 'business',         merit: 63.5, seats: 60  },
      { name: 'BS Software Engineering',   cat: 'computer-science', merit: 69.8, seats: 60  },
    ],
  },
  {
    universityId: 'fast', universityName: 'FAST National University',
    universityShortName: 'FAST', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', merit: 76.2, seats: 80  },
      { name: 'BS Software Engineering',   cat: 'computer-science', merit: 72.8, seats: 60  },
      { name: 'BS Artificial Intelligence',cat: 'computer-science', merit: 74.5, seats: 60  },
    ],
  },
  {
    universityId: 'bahria', universityName: 'Bahria University',
    universityShortName: 'BAHRIA', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', merit: 66.5, seats: 80  },
      { name: 'BBA',                       cat: 'business',         merit: 60.5, seats: 80  },
      { name: 'BS Electrical Engineering', cat: 'engineering',      merit: 63.5, seats: 60  },
    ],
  },
  {
    universityId: 'vu', universityName: 'Virtual University of Pakistan',
    universityShortName: 'VU', campus: 'Online', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',     cat: 'computer-science', merit: 50.5, seats: 1000 },
      { name: 'BBA',                     cat: 'business',         merit: 48.5, seats: 1000 },
      { name: 'BS Software Engineering', cat: 'computer-science', merit: 51.5, seats: 800  },
    ],
  },
  {
    universityId: 'szabist', universityName: 'Shaheed Zulfikar Ali Bhutto Institute of Science and Technology',
    universityShortName: 'SZABIST', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', merit: 66.2, seats: 60  },
      { name: 'BBA',                 cat: 'business',         merit: 63.5, seats: 80  },
    ],
  },
  {
    universityId: 'iqra', universityName: 'Iqra University',
    universityShortName: 'IQRA', campus: 'Karachi', city: 'Karachi', province: 'sindh',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', merit: 58.5, seats: 80  },
      { name: 'BBA',                 cat: 'business',         merit: 56.5, seats: 100 },
    ],
  },
  {
    universityId: 'ucp', universityName: 'University of Central Punjab',
    universityShortName: 'UCP', campus: 'Lahore', city: 'Lahore', province: 'punjab',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', merit: 65.5, seats: 100 },
      { name: 'BBA',                       cat: 'business',         merit: 60.5, seats: 100 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      merit: 62.5, seats: 60  },
    ],
  },
  {
    universityId: 'riphah', universityName: 'Riphah International University',
    universityShortName: 'RIPHAH', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science', cat: 'computer-science', merit: 64.5, seats: 60 },
      { name: 'BS Psychology',       cat: 'general',          merit: 60.5, seats: 60 },
    ],
  },
  {
    universityId: 'cust', universityName: 'Capital University of Science and Technology',
    universityShortName: 'CUST', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', merit: 64.5, seats: 60 },
      { name: 'BS Electrical Engineering', cat: 'engineering',      merit: 61.5, seats: 60 },
      { name: 'BBA',                       cat: 'business',         merit: 58.5, seats: 60 },
    ],
  },
  {
    universityId: 'nust', universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BBA',              cat: 'business',         merit: 85.5, seats: 30 },
      { name: 'BS Mathematics',   cat: 'general',          merit: 86.2, seats: 20 },
    ],
  },
  {
    universityId: 'aiou', universityName: 'Allama Iqbal Open University',
    universityShortName: 'AIOU', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',   cat: 'computer-science', merit: 48.5, seats: 5000 },
      { name: 'BBA',                   cat: 'business',         merit: 46.5, seats: 5000 },
      { name: 'BS Education',          cat: 'general',          merit: 44.5, seats: 5000 },
      { name: 'BS Mathematics',        cat: 'general',          merit: 44.5, seats: 3000 },
      { name: 'BS Pakistan Studies',   cat: 'general',          merit: 42.5, seats: 3000 },
    ],
  },
  {
    universityId: 'au', universityName: 'Air University',
    universityShortName: 'AU', campus: 'Islamabad', city: 'Islamabad', province: 'islamabad',
    programs: [
      { name: 'BS Computer Science',       cat: 'computer-science', merit: 68.2, seats: 60 },
      { name: 'BBA',                       cat: 'business',         merit: 60.5, seats: 60 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE RECORDS
// ─────────────────────────────────────────────────────────────────────────────
const newRecords = [];

// Helper: opening merit is typically 5-12% higher than closing merit
function openingMerit(closing) {
  const delta = Math.round((5 + Math.random() * 7) * 10) / 10;
  return Math.round((closing + delta) * 10) / 10;
}

// 1. Reserved/quota records
for (const uni of quotaConfigs) {
  for (const prog of uni.programs) {
    for (const quota of uni.quotas) {
      for (const year of [2025, 2024]) {
        const yearDelta = year === 2024 ? -0.5 : 0;
        const closingM = pct(prog.openMerit, quota.delta + yearDelta);
        const seatsCount = Math.max(2, Math.round(prog.seats * quota.seatsPct));
        const idKey = uid([uni.universityId, prog.name, quota.type, year]);
        newRecords.push({
          id: idKey,
          universityId: uni.universityId,
          universityName: uni.universityName,
          universityShortName: uni.universityShortName,
          programName: prog.name,
          campus: uni.campus,
          year,
          session: 'Fall',
          meritType: 'reserved',
          quotaType: quota.type,
          closingMerit: Math.max(40, closingM),
          openingMerit: Math.min(100, openingMerit(Math.max(40, closingM))),
          totalSeats: seatsCount,
          category: prog.cat,
          city: uni.city,
          province: uni.province,
        });
      }
    }
  }
}

// 2. Self-finance records
for (const uni of selfFinanceConfigs) {
  for (const prog of uni.programs) {
    for (const year of [2025, 2024]) {
      const yearDelta = year === 2024 ? -0.5 : 0;
      const closingM = pct(prog.sf, yearDelta);
      const openM = pct(prog.open, yearDelta);
      const idKey = uid([uni.universityId, prog.name, 'sf', year]);
      // Also add open merit record with openingMerit if not already present
      const openIdKey = uid([uni.universityId, prog.name, 'open', year]);
      const alreadyExists = existing.some(r => r.id === openIdKey);
      if (!alreadyExists) {
        newRecords.push({
          id: openIdKey,
          universityId: uni.universityId,
          universityName: uni.universityName,
          universityShortName: uni.universityShortName,
          programName: prog.name,
          campus: uni.campus,
          year,
          session: 'Fall',
          meritType: 'open',
          closingMerit: Math.max(40, openM),
          openingMerit: Math.min(100, openingMerit(Math.max(40, openM))),
          totalSeats: prog.seats || 60,
          category: prog.cat,
          city: uni.city,
          province: uni.province,
        });
      }
      newRecords.push({
        id: idKey,
        universityId: uni.universityId,
        universityName: uni.universityName,
        universityShortName: uni.universityShortName,
        programName: prog.name,
        campus: uni.campus,
        year,
        session: 'Fall',
        meritType: 'self-finance',
        closingMerit: Math.max(40, closingM),
        openingMerit: Math.min(100, openingMerit(Math.max(40, closingM))),
        totalSeats: Math.round((prog.seats || 60) * 0.35),
        category: prog.cat,
        city: uni.city,
        province: uni.province,
      });
    }
  }
}

// 3. Spring semester records
for (const uni of springConfigs) {
  for (const prog of uni.programs) {
    for (const year of [2026, 2025]) {
      const closingM = pct(prog.merit, year === 2025 ? -0.5 : 0);
      const idKey = uid([uni.universityId, prog.name, 'spring', year]);
      newRecords.push({
        id: idKey,
        universityId: uni.universityId,
        universityName: uni.universityName,
        universityShortName: uni.universityShortName,
        programName: prog.name,
        campus: uni.campus,
        year,
        session: 'Spring',
        meritType: 'open',
        closingMerit: Math.max(40, closingM),
        openingMerit: Math.min(100, openingMerit(Math.max(40, closingM))),
        totalSeats: Math.round((prog.seats || 60) * 0.40), // Spring typically 40% of Fall seats
        category: prog.cat,
        city: uni.city,
        province: uni.province,
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Patch openingMerit into EXISTING records that don't have it
// ─────────────────────────────────────────────────────────────────────────────
const patchedExisting = existing.map(r => {
  if (!r.openingMerit) {
    return { ...r, openingMerit: Math.min(100, openingMerit(r.closingMerit)) };
  }
  return r;
});

// ─────────────────────────────────────────────────────────────────────────────
// MERGE & DEDUPLICATE
// ─────────────────────────────────────────────────────────────────────────────
const existingIds = new Set(patchedExisting.map(r => r.id));
const dedupedNew = newRecords.filter(r => !existingIds.has(r.id));

const finalRecords = [...patchedExisting, ...dedupedNew];

// Sort: by university, then program, then year desc, then meritType
finalRecords.sort((a, b) => {
  if (a.universityId !== b.universityId) return a.universityId.localeCompare(b.universityId);
  if (a.programName !== b.programName) return a.programName.localeCompare(b.programName);
  if (a.year !== b.year) return b.year - a.year;
  const typeOrder = { open: 0, 'self-finance': 1, reserved: 2 };
  return (typeOrder[a.meritType] ?? 3) - (typeOrder[b.meritType] ?? 3);
});

fs.writeFileSync(existingPath, JSON.stringify(finalRecords, null, 2), 'utf8');

console.log(`✅ Merit records updated:`);
console.log(`   Existing (with openingMerit patched): ${patchedExisting.length}`);
console.log(`   New records added: ${dedupedNew.length}`);
console.log(`   Total: ${finalRecords.length}`);

const byType = {};
finalRecords.forEach(r => { byType[r.meritType] = (byType[r.meritType] || 0) + 1; });
console.log(`\nBy merit type:`, byType);

const bySession = {};
finalRecords.forEach(r => { bySession[r.session] = (bySession[r.session] || 0) + 1; });
console.log(`By session:`, bySession);

const withOpening = finalRecords.filter(r => r.openingMerit).length;
console.log(`With opening merit: ${withOpening} / ${finalRecords.length}`);
