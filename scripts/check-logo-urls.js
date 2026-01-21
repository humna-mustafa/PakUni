const fs = require('fs');
const https = require('https');
const http = require('http');

function checkUrl(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.request(url, {method: 'HEAD'}, (res) => {
        resolve({ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode});
      });
      req.on('error', (err) => resolve({ok: false, error: err.message}));
      req.setTimeout(timeoutMs, () => {
        req.abort();
        resolve({ok: false, error: 'timeout'});
      });
      req.end();
    } catch (err) {
      resolve({ok: false, error: String(err)});
    }
  });
}

(async () => {
  const content = fs.readFileSync('./src/data/universities.ts', 'utf8');
  const regex = /\{\s*id:\s*\d+,[\s\S]*?name:\s*"([^\"]+)",[\s\S]*?logo_url:\s*"([^\"]*)"/g;
  const entries = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const name = m[1];
    const url = m[2];
    entries.push({name, url});
  }

  console.log(`Found ${entries.length} university entries with logo_url. Testing HTTP status...`);

  const results = [];
  const CONCURRENCY = 10;
  let i = 0;
  async function worker() {
    while (i < entries.length) {
      const index = i++;
      const {name, url} = entries[index];
      if (!url || url.trim() === '') {
        results[index] = {name, url, ok: false, error: 'empty'};
        continue;
      }
      const r = await checkUrl(url);
      results[index] = {name, url, ...r};
      if ((index + 1) % 50 === 0) console.log(`  Tested ${index + 1}/${entries.length}`);
    }
  }

  await Promise.all(Array.from({length: CONCURRENCY}).map(worker));

  const failures = results.filter(r => !r.ok);
  console.log('\nFailures:', failures.length);
  failures.slice(0, 200).forEach(f => console.log(`${f.name} -> ${f.url} : ${f.error || f.status}`));

  if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
  fs.writeFileSync('./logs/logo-check.json', JSON.stringify(results, null, 2));
  console.log('\nWrote logs/logo-check.json');
})();