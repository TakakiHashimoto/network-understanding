export function normalizeTarget(value) {
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password || /\s/.test(value)) return null;
    url.protocol = 'https:';
    return { host: url.hostname, href: url.href, path: `${url.pathname}${url.search}` };
  } catch { return null; }
}
export function ipNumber(ip) {
  const octets = ip.split('.');
  if (octets.length !== 4 || octets.some(n => !/^\d{1,3}$/.test(n) || Number(n) > 255)) return null;
  return octets.reduce((v, n) => (v * 256 + Number(n)), 0) >>> 0;
}
export function prefixMatches(ip, cidr) {
  const [network, bits] = cidr.split('/');
  const n = ipNumber(network), a = ipNumber(ip), length = Number(bits);
  if (n === null || a === null || bits === undefined || !Number.isInteger(length) || length < 0 || length > 32) return false;
  const mask = length === 0 ? 0 : (0xffffffff << (32 - length)) >>> 0;
  return (a & mask) === (n & mask);
}
export function longestPrefix(ip, routes) {
  return routes.filter(r => r.enabled !== false && prefixMatches(ip, r.prefix)).sort((a,b) => Number(b.prefix.split('/')[1]) - Number(a.prefix.split('/')[1]))[0] ?? null;
}
export function transmissionTime(bytes, mbps, km, medium = 'fiber') {
  const serialization = bytes * 8 / (mbps * 1000);
  const propagation = km / (medium === 'radio' ? 300 : 200);
  return { serialization, propagation, total: serialization + propagation };
}
export function congestionStep(state, event, rwnd) {
  const flight = Math.min(state.cwnd, rwnd);
  const threshold = event === 'loss' ? Math.max(2, Math.floor(flight / 2)) : state.threshold;
  const cwnd = event === 'loss' ? threshold : state.cwnd < threshold ? Math.min(threshold, state.cwnd + flight) : Math.round((state.cwnd + flight / state.cwnd) * 100) / 100;
  return { cwnd, threshold, history: [...state.history, cwnd], phase: cwnd < threshold ? 'Slow start' : 'Congestion avoidance' };
}
export function dnsTrace(host, cache) {
  const tld = host.split('.').at(-1);
  return cache ? [
    { from: 'Browser', to: 'OS cache', text: `${host} → 203.0.113.80`, detail: 'A valid cached A record answers immediately. Its remaining TTL must be greater than zero.' },
    { from: 'OS cache', to: 'Browser', text: 'Cache hit · TTL 240 s', detail: 'No DNS packet leaves the device in this scenario.' }
  ] : [
    { from: 'Browser', to: 'Recursive resolver', text: `A ${host}? · RD=1`, detail: 'The stub requests recursion. This resolver has an empty relevant cache; transport here is UDP/53.' },
    { from: 'Recursive resolver', to: 'Root server', text: `Where is .${tld}?`, detail: 'A QNAME-minimizing resolver first asks about the TLD. Root hints bootstrap contact with root servers.' },
    { from: 'Root server', to: 'Recursive resolver', text: `Referral: .${tld} nameservers`, detail: 'NS records delegate the next zone. Glue A/AAAA records can supply nameserver addresses where needed.' },
    { from: 'Recursive resolver', to: 'TLD server', text: `Who serves ${host}?`, detail: 'For this two-label example, the TLD points to the authoritative zone. Deeper names may need more referrals.' },
    { from: 'TLD server', to: 'Recursive resolver', text: 'Referral: authoritative NS', detail: 'The resolver follows delegation; the TLD does not normally return the website address itself.' },
    { from: 'Recursive resolver', to: 'Authoritative server', text: `A ${host}?`, detail: 'The authority owns the zone data. CNAME aliases would require following another name.' },
    { from: 'Authoritative server', to: 'Recursive resolver', text: 'A 203.0.113.80 · TTL 300', detail: 'The answer is cached for its TTL. This address is a documentation fixture, not a live DNS answer.' },
    { from: 'Recursive resolver', to: 'Browser', text: '203.0.113.80 · RA=1', detail: 'The browser can now select an address. Real clients also request AAAA and may race IPv6 and IPv4.' }
  ];
}
