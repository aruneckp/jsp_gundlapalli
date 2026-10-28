export const LABELS = {
  gp_serial_no: "Voter no.", ward_no: "Ward", habitation_no: "Village no.", habitation: "Village",
  house_no: "House no.", voter_name: "Name", relation_type: "Relation", relation_name: "Relative's name",
  gender: "Gender", age: "Age", epic_no: "Voter ID card no.",
};

// Filled by init() once the list is decrypted. ES module bindings are live,
// so every importer sees the loaded values.
export let COLS = [];
export let LINKS = {};   // voter no. -> [linked id, link type, check note]
export let GHOSTS = {};  // "g12" -> [name, family id]  (relatives not on the list)
export let VOTERS = [];
export let BY_NO = new Map();
export let HAMLETS = []; // [[no, name], ...]
export let WARDS = [];

export function init(RAW) {
  COLS = RAW.cols;
  LINKS = RAW.links;
  GHOSTS = RAW.ghosts;
  VOTERS = RAW.rows.map((r) => {
    const o = {};
    COLS.forEach((c, i) => (o[c] = r[i]));
    o.gp_serial_no = String(o.gp_serial_no);
    o.ward_no = String(o.ward_no);
    o.habitation_no = String(o.habitation_no);
    o.age = Number(o.age);
    o._key = r[COLS.length];      // Latin sound-alike key for English search
    o._fam = r[COLS.length + 1];  // family id from the family graph
    o._hh = o.habitation_no + "|" + o.house_no;
    return o;
  });
  BY_NO = new Map(VOTERS.map((o) => [o.gp_serial_no, o]));
  HAMLETS = [...new Map(VOTERS.map((o) => [o.habitation_no, o.habitation])).entries()].sort((a, b) => a[0] - b[0]);
  WARDS = [...new Set(VOTERS.map((o) => o.ward_no))].sort((a, b) => a - b);
}

export const hamletName = (no) => HAMLETS.find((h) => h[0] === no)?.[1] || "";
