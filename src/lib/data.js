import RAW from "../data/voters.json";

export const LABELS = {
  gp_serial_no: "Voter no.", ward_no: "Ward", habitation_no: "Hamlet no.", habitation: "Hamlet",
  house_no: "House no.", voter_name: "Name", relation_type: "Relation", relation_name: "Relative's name",
  gender: "Gender", age: "Age", epic_no: "Voter ID card no.",
};
export const COLS = RAW.cols;
export const LINKS = RAW.links;   // voter no. -> [linked id, link type, check note]
export const GHOSTS = RAW.ghosts; // "g12" -> [name, family id]  (relatives not on the list)

// One record per voter, as printed on the list.
export const VOTERS = RAW.rows.map((r) => {
  const o = {};
  COLS.forEach((c, i) => (o[c] = r[i]));
  o.gp_serial_no = String(o.gp_serial_no);
  o._key = r[COLS.length];      // Latin sound-alike key for English search
  o._fam = r[COLS.length + 1];  // family id from the family graph
  return o;
});
export const BY_NO = new Map(VOTERS.map((o) => [o.gp_serial_no, o]));

export const HAMLETS = [...new Map(VOTERS.map((o) => [String(o.habitation_no), o.habitation])).entries()]
  .sort((a, b) => a[0] - b[0]);
export const WARDS = [...new Set(VOTERS.map((o) => String(o.ward_no)))].sort((a, b) => a - b);
