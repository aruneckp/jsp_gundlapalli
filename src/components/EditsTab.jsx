import { useRef, useState } from "react";
import { VOTERS, BY_NO, COLS, LABELS } from "../lib/data.js";
import { current } from "../lib/useEdits.js";
import { go } from "../lib/useHashRoute.js";
import { toCSV, parseCSV, download } from "../lib/csv.js";
import { SHOW_VOTER_ID } from "../config.js";

const EDITABLE = ["voter_name", "relation_type", "relation_name", "age", "gender", "house_no", "ward_no", "habitation", "epic_no"];

export default function EditsTab({ edits, setEdits, say }) {
  const fileRef = useRef(null);
  const [armed, setArmed] = useState(false);
  const nos = Object.keys(edits).sort((a, b) => a - b);
  const cols = SHOW_VOTER_ID ? COLS : COLS.filter((c) => c !== "epic_no");

  const exportCSV = () => {
    const rows = VOTERS.map((o) => { const r = current(o, edits); return [...cols.map((c) => r[c]), edits[o.gp_serial_no] ? "yes" : ""]; });
    download("vedagirivaripalle_voters_edited.csv", toCSV([...cols, "edited"], rows));
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const rows = parseCSV(await file.text());
    const head = (rows.shift() || []).map((h) => h.trim());
    const idx = Object.fromEntries(head.map((h, i) => [h, i]));
    e.target.value = "";
    if (!("gp_serial_no" in idx)) { say("That file has no gp_serial_no column. Import a CSV exported from this app."); return; }
    const next = { ...edits };
    let n = 0;
    for (const r of rows) {
      const o = BY_NO.get(String(r[idx.gp_serial_no] || "").trim());
      if (!o) continue;
      const diff = {};
      for (const c of EDITABLE) if (c in idx && String(o[c]) !== (r[idx[c]] || "").trim()) diff[c] = (r[idx[c]] || "").trim();
      if (Object.keys(diff).length) { next[o.gp_serial_no] = diff; n++; } else delete next[o.gp_serial_no];
    }
    setEdits(next);
    say(`Imported. ${n} voters differ from the printed list.`);
  };

  const reset = () => {
    if (!nos.length) { say("There are no edits to undo"); return; }
    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 4000); return; }
    setEdits({}); setArmed(false); say(`Undid ${nos.length} edits`);
  };

  return (
    <section className="panel" role="tabpanel">
      <div className="bar">
        <button className="btn primary" type="button" onClick={exportCSV}>Export CSV</button>
        <button className="btn" type="button" onClick={() => fileRef.current.click()}>Import CSV</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCSV} />
        <button className="btn" type="button" onClick={reset}>{armed ? `Click again to undo ${nos.length} edits` : "Undo all edits"}</button>
      </div>
      <p className="note">Edits are saved in this browser only. Export the CSV to keep them or pass them to someone else, who can import it here.</p>
      <div className="tablebox">
        <table>
          <thead><tr><th>No.</th><th>Voter</th><th>What changed</th></tr></thead>
          <tbody>
            {nos.map((no) => {
              const o = BY_NO.get(no);
              if (!o) return null;
              return (
                <tr key={no} tabIndex={0} onClick={() => go("voter", no)} onKeyDown={(e) => e.key === "Enter" && go("voter", no)}>
                  <td className="num">{no}</td>
                  <td lang="te">{current(o, edits).voter_name}</td>
                  <td>{Object.entries(edits[no]).map(([c, v]) => `${LABELS[c]}: ${o[c] || "(blank)"} → ${v || "(blank)"}`).join("; ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!nos.length && <div className="empty">No edits yet. Open a voter from Search and change any field.</div>}
      </div>
    </section>
  );
}
