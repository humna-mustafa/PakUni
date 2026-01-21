require('dotenv').config();
const {createClient} = require('@libsql/client');
const https = require('https');
const http = require('http');
const {URL} = require('url');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function httpGet(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    try {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.get(url, {headers: {'User-Agent': 'PakUniLogoFixer/1.0'}}, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body: data}));
      });
      req.on('error', reject);
      req.setTimeout(timeout, () => { req.abort(); reject(new Error('timeout')); });
    } catch (err) { reject(err); }
  });
}

function headCheck(url, timeout = 10000) {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.request(url, {method: 'HEAD', headers: {'User-Agent': 'PakUniLogoFixer/1.0'}}, (res) => {
        resolve({ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, headers: res.headers});
      });
      req.on('error', () => resolve({ok: false, error: 'request error'}));
      req.setTimeout(timeout, () => { req.abort(); resolve({ok: false, error: 'timeout'}); });
      req.end();
    } catch (err) { resolve({ok: false, error: String(err)}); }
  });
}

async function findLogoFromWebsite(website) {
  if (!website) return null;
  try {
    const parsed = new URL(website);
    const base = `${parsed.protocol}//${parsed.hostname}`;
    const res = await httpGet(website).catch(() => null);
    if (!res || !res.body) return null;
    const html = res.body;
    // Try og:image
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogMatch && ogMatch[1]) {
      const url = new URL(ogMatch[1], base).toString();
      const ok = await headCheck(url);
      if (ok.ok) return url;
    }
    // Try link rel icon
    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut icon|icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if (iconMatch && iconMatch[1]) {
      const url = new URL(iconMatch[1], base).toString();
      const ok = await headCheck(url);
      if (ok.ok && /(png|svg|ico|jpg|jpeg|webp)$/i.test(url)) return url;
    }
    // Try <img ... logo ...>
    const imgMatch = html.match(/<img[^>]*src=["']([^"']+logo[^"']+)["'][^>]*>/i);
    if (imgMatch && imgMatch[1]) {
      const url = new URL(imgMatch[1], base).toString();
      const ok = await headCheck(url);
      if (ok.ok) return url;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function findLogoFromWikimedia(name) {
  try {
    // Try pageimages by title first
    const search = encodeURIComponent(name);
    const api = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=${search}`;
    let r = await httpGet(api).catch(() => null);
    if (r && r.body) {
      const j = JSON.parse(r.body);
      const pages = j.query && j.query.pages;
      for (const k of Object.keys(pages || {})) {
        const p = pages[k];
        if (p && p.original && p.original.source) {
          const url = p.original.source;
          const ok = await headCheck(url);
          if (ok.ok) return url;
        }
      }
    }

    // Fallback: opensearch to get best matching titles
    const opensearch = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(name)}&limit=5&format=json`;
    r = await httpGet(opensearch).catch(() => null);
    if (!r || !r.body) return null;
    const arr = JSON.parse(r.body);
    const titles = arr && arr[1] ? arr[1] : [];
    for (const t of titles) {
      const api2 = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=${encodeURIComponent(t)}`;
      const r2 = await httpGet(api2).catch(() => null);
      if (!r2 || !r2.body) continue;
      const j2 = JSON.parse(r2.body);
      const pages2 = j2.query && j2.query.pages;
      for (const k of Object.keys(pages2 || {})) {
        const p = pages2[k];
        if (p && p.original && p.original.source) {
          const url = p.original.source;
          const ok = await headCheck(url);
          if (ok.ok) return url;
        }
      }
    }

    // Try Wikimedia Commons search page image via special search (less reliable)
    const commonsSearch = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(name)}&srlimit=5`;
    r = await httpGet(commonsSearch).catch(() => null);
    if (r && r.body) {
      const j = JSON.parse(r.body);
      const results = j.query && j.query.search ? j.query.search : [];
      for (const resu of results) {
        const title = resu.title;
        const imageApi = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(title)}`;
        const r3 = await httpGet(imageApi).catch(() => null);
        if (!r3 || !r3.body) continue;
        const j3 = JSON.parse(r3.body);
        const pages3 = j3.query && j3.query.pages;
        for (const k of Object.keys(pages3 || {})) {
          const p = pages3[k];
          if (p && p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
            const url = p.imageinfo[0].url;
            const ok = await headCheck(url);
            if (ok.ok) return url;
          }
        }
      }
    }

    return null;
  } catch (err) { return null; }
}

(async () => {
  console.log('🔍 Finding universities with suspicious logos (encrypted/google/data/empty)');
  const q = `SELECT id, name, website, logo_url FROM universities WHERE logo_url IS NULL OR logo_url = '' OR logo_url LIKE '%encrypted-tbn0.%' OR logo_url LIKE 'data:%' OR logo_url LIKE '%gstatic%';`;
  const res = await client.execute(q);
  const rows = res.rows;
  console.log(`Found ${rows.length} candidates. Attempting fixes (will update Turso records if successful)...`);

  const fixes = [];
  for (const row of rows) {
    const id = row.id;
    const name = row.name;
    const website = row.website;
    console.log(`
> Trying: ${name} (${id})`);
    try {
      let found = null;
      if (website) {
        console.log(' - Checking university website for logo...');
        found = await findLogoFromWebsite(website);
      }
      if (!found) {
        console.log(' - Trying Wikimedia...');
        found = await findLogoFromWikimedia(name);
      }
      if (found) {
        console.log(` ✅ Found logo: ${found}`);
        // Update DB
        await client.execute({sql: 'UPDATE universities SET logo_url = ? WHERE id = ?', args: [found, id]});
        fixes.push({id, name, newLogo: found});
      } else {
        console.log(' ❌ Could not find a stable logo for this entry');
      }
    } catch (err) {
      console.log(' ⚠️ Error processing entry:', err && err.message ? err.message : String(err));
      continue;
    }
  }

  console.log('\nSummary - fixes applied:', fixes.length);
  fixes.forEach(f => console.log(` - ${f.name}: ${f.newLogo}`));
  console.log('\nIf fixes applied, run: npm run turso:export to sync bundled file and rebuild app');
})();