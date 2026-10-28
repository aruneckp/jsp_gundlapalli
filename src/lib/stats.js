import { matches } from "./search.js";

export const AGE_BANDS = [[18, 25], [26, 35], [36, 45], [46, 55], [56, 65], [66, 200]];
export const bandLabel = ([a, b]) => (b > 150 ? `${a}+` : `${a}–${b}`);
export const fmt = (n) => n.toLocaleString("en-IN");
export const pct = (n, d) => {
  const p = d ? Math.round((n * 100) / d) : 0;
  return n > 0 && p === 0 ? "<1" : p;
};
export const sex = (o) => (o.gender === "Male" ? "male" : o.gender === "Female" ? "female" : "other");

export function summarize(list) {
  const s = { total: list.length, male: 0, female: 0, other: 0, young: 0, senior: 0,
    bands: AGE_BANDS.map(() => ({ male: 0, female: 0, other: 0, total: 0 })) };
  const hh = new Set(), fam = new Set();
  let ages = 0;
  for (const o of list) {
    const g = sex(o);
    s[g]++;
    ages += o.age;
    hh.add(o._hh);
    fam.add(o._fam);
    if (o.age <= 25) s.young++;
    if (o.age >= 60) s.senior++;
    const i = AGE_BANDS.findIndex(([a, b]) => o.age >= a && o.age <= b);
    if (i >= 0) { s.bands[i][g]++; s.bands[i].total++; }
  }
  return { ...s, households: hh.size, families: fam.size, avgAge: list.length ? ages / list.length : 0 };
}

export function groupBy(list, key) {
  const m = new Map();
  for (const o of list) {
    const k = key(o);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(o);
  }
  return m;
}

// ---- voter list filters ----

export const EMPTY = { q: "", hab: "", ward: "", gen: "", ageMin: "", ageMax: "", rel: "", sort: "no" };

export const SORTS = {
  no: ["Voter no.", (a, b) => a.gp_serial_no - b.gp_serial_no],
  name: ["Name", (a, b) => a.voter_name.localeCompare(b.voter_name, "te")],
  ageAsc: ["Youngest first", (a, b) => a.age - b.age],
  ageDesc: ["Oldest first", (a, b) => b.age - a.age],
  house: ["House no.", (a, b) => a.habitation_no - b.habitation_no
    || a.house_no.localeCompare(b.house_no, "en", { numeric: true })],
};

export const RELATIONS = [["Father", "Father"], ["Husband", "Husband"], ["Mother", "Mother"], ["none", "Not printed"]];

export function applyFilters(list, f) {
  const min = f.ageMin === "" ? 0 : +f.ageMin, max = f.ageMax === "" ? 999 : +f.ageMax;
  const out = list.filter((o) => (!f.hab || o.habitation_no === f.hab)
    && (!f.ward || o.ward_no === f.ward)
    && (!f.gen || o.gender === f.gen)
    && o.age >= min && o.age <= max
    && (!f.rel || (f.rel === "none" ? !o.relation_type : o.relation_type === f.rel))
    && matches(o, o, f.q));
  return out.sort(SORTS[f.sort]?.[1] || SORTS.no[1]);
}

export const activeCount = (f) => ["hab", "ward", "gen", "rel"].filter((k) => f[k]).length + (f.ageMin || f.ageMax ? 1 : 0);
