import { useState } from "react";
import { LABELS } from "../lib/data.js";
import { current } from "../lib/useEdits.js";
import { go } from "../lib/useHashRoute.js";
import { SHOW_VOTER_ID } from "../config.js";

const FIELDS = ["voter_name", "relation_type", "relation_name", "age", "gender", "house_no", "ward_no", "habitation",
  ...(SHOW_VOTER_ID ? ["epic_no"] : [])];
const WIDE = new Set(["voter_name", "relation_name"]);
const TELUGU = new Set(["voter_name", "relation_name", "habitation"]);
const NUMBER = new Set(["age", "ward_no"]);

export default function VoterTab({ voter, edits, setOne, results, say }) {
  const rec = current(voter, edits);
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((c) => [c, rec[c] == null ? "" : String(rec[c])])));
  const i = results.indexOf(voter);
  const edited = !!edits[voter.gp_serial_no];

  const save = (e) => {
    e.preventDefault();
    const diff = {};
    for (const c of FIELDS) {
      let v = form[c].trim();
      if (NUMBER.has(c) && v !== "") v = String(parseInt(v, 10));
      if (String(voter[c]) !== v) diff[c] = v;
    }
    // keep a hidden voter ID edit made earlier, if any
    const prev = edits[voter.gp_serial_no] || {};
    if (!SHOW_VOTER_ID && prev.epic_no) diff.epic_no = prev.epic_no;
    setOne(voter.gp_serial_no, diff);
    say(Object.keys(diff).length ? `Saved voter no. ${voter.gp_serial_no}` : "No changes from the printed record");
  };
  const restore = () => {
    setOne(voter.gp_serial_no, null);
    setForm(Object.fromEntries(FIELDS.map((c) => [c, voter[c] == null ? "" : String(voter[c])])));
    say(`Voter no. ${voter.gp_serial_no} restored to the printed record`);
  };

  return (
    <section className="panel" role="tabpanel">
      <div className="row">
        <button className="btn" type="button" onClick={() => go("search")}>← Back to results</button>
        <button className="btn" type="button" disabled={i <= 0} onClick={() => go("voter", results[i - 1].gp_serial_no)}>Previous voter</button>
        <button className="btn" type="button" disabled={i < 0 || i >= results.length - 1} onClick={() => go("voter", results[i + 1].gp_serial_no)}>Next voter</button>
        {i >= 0 && <span className="note">{i + 1} of {results.length} in your results</span>}
      </div>

      <form className="card" onSubmit={save}>
        <div>
          <h2 lang="te">{rec.voter_name}</h2>
          <div className="meta">
            Voter no. {voter.gp_serial_no} · Ward {rec.ward_no} · House {rec.house_no} · <span lang="te">{rec.habitation}</span>
            {edited && " · edited"}
          </div>
        </div>
        <div className="grid">
          {FIELDS.map((c) => {
            const changed = String(voter[c]) !== form[c];
            const onChange = (e) => setForm((f) => ({ ...f, [c]: e.target.value }));
            let input;
            if (c === "gender" || c === "relation_type") {
              const opts = c === "gender" ? ["Male", "Female", "Other"] : ["Father", "Husband", "Mother", "Other", ""];
              input = (
                <select id={"e_" + c} value={form[c]} onChange={onChange}>
                  {opts.map((v) => <option key={v} value={v}>{v || "Not printed"}</option>)}
                </select>
              );
            } else {
              input = (
                <input id={"e_" + c} value={form[c]} onChange={onChange} required={c === "voter_name"}
                  type={NUMBER.has(c) ? "number" : "text"} lang={TELUGU.has(c) ? "te" : undefined}
                  min={c === "age" ? 18 : undefined} max={c === "age" ? 120 : undefined} />
              );
            }
            return (
              <label key={c} className={"f" + (WIDE.has(c) ? " wide" : "")} htmlFor={"e_" + c}>
                {LABELS[c]}
                {input}
                <span className="orig">{changed ? `Printed: ${voter[c] === "" ? "(blank)" : voter[c]}` : ""}</span>
              </label>
            );
          })}
        </div>
        <div className="actions">
          <span className="row">
            <button className="btn primary" type="submit">Save changes</button>
            <button className="btn" type="button" onClick={restore}>Restore printed values</button>
          </span>
          <button className="btn" type="button" onClick={() => go("family", voter.gp_serial_no)}>View family →</button>
        </div>
      </form>
    </section>
  );
}
