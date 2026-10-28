// Search that accepts Telugu, English spellings, voter numbers, house numbers and voter IDs.
export function normLatin(s) {
  s = String(s || "").toLowerCase().replace(/[^a-z ]+/g, " ");
  const reps = [["naidu", "nayudu"], ["chh", "c"], ["ch", "c"], ["kh", "k"], ["gh", "g"], ["jh", "j"],
    ["th", "t"], ["dh", "d"], ["ph", "p"], ["bh", "b"], ["sh", "s"], ["aa", "a"], ["ee", "i"], ["ii", "i"],
    ["oo", "u"], ["uu", "u"], ["w", "v"], ["z", "j"], ["q", "k"], ["x", "ks"], ["f", "p"]];
  for (const [a, b] of reps) s = s.split(a).join(b);
  s = s.replace(/([^aeiou ])y\b/g, "$1i")          // reddy -> reddi
    .replace(/m(?=[kgcjtdnszyrlvh])/g, "n")         // anusvara before a consonant
    .replace(/(.)\1+/g, "$1");
  return s.replace(/\s+/g, "");
}

export const squash = (s) => String(s || "").replace(/[\s.]+/g, "").toUpperCase().replace(/\//g, "-");

const latinCache = new Map();
const latinKey = (o) => {
  if (!latinCache.has(o)) latinCache.set(o, normLatin(o._key));
  return latinCache.get(o);
};

export function matches(rec, orig, query) {
  const q = query.trim();
  if (!q) return true;
  if (/^\d+$/.test(q)) return rec.gp_serial_no === q || squash(rec.house_no).startsWith(q);
  if (/[ఀ-౿]/.test(q)) {
    const t = squash(q);
    return squash(rec.voter_name).includes(t) || squash(rec.relation_name).includes(t);
  }
  if (/\d/.test(q)) {
    const t = squash(q);
    return squash(rec.house_no).startsWith(t) || squash(rec.epic_no).includes(t);
  }
  const t = normLatin(q);
  return t.length >= 2 && (latinKey(orig).includes(t) || squash(rec.epic_no).includes(q.toUpperCase()));
}
