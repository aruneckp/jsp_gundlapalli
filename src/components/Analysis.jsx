import { useMemo, useState } from "react";
import { VOTERS, HAMLETS, WARDS } from "../lib/data.js";
import { summarize, groupBy, AGE_BANDS, bandLabel, RELATIONS, fmt, pct } from "../lib/stats.js";
import { go } from "../lib/useHashRoute.js";
import Icon from "./Icon.jsx";

export default function Analysis({ openList }) {
  const [hab, setHab] = useState("");
  const [ward, setWard] = useState("");
  const scope = useMemo(() => VOTERS.filter((o) => (!hab || o.habitation_no === hab) && (!ward || o.ward_no === ward)), [hab, ward]);
  const s = useMemo(() => summarize(scope), [scope]);
  const side = Math.max(1, ...s.bands.flatMap((b) => [b.male, b.female]));

  const homes = useMemo(() => [...groupBy(scope, (o) => o._hh).values()]
    .sort((a, b) => b.length - a.length).slice(0, 10), [scope]);
  const rels = RELATIONS.map(([k, label]) => [k, label, scope.filter((o) => (k === "none" ? !o.relation_type : o.relation_type === k)).length]);
  const relMax = Math.max(1, ...rels.map((r) => r[2]));

  const matrix = useMemo(() => {
    const m = {};
    for (const o of VOTERS) m[o.habitation_no + "|" + o.ward_no] = (m[o.habitation_no + "|" + o.ward_no] || 0) + 1;
    return m;
  }, []);
  const cellMax = Math.max(...Object.values(matrix));
  const base = { hab, ward };

  return (
    <div className="page">
      <div className="scope">
        <label><span>Village</span>
          <select value={hab} onChange={(e) => setHab(e.target.value)}>
            <option value="">All villages</option>
            {HAMLETS.map(([no, name]) => <option key={no} value={no}>{name}</option>)}
          </select>
        </label>
        <label><span>Ward</span>
          <select value={ward} onChange={(e) => setWard(e.target.value)}>
            <option value="">All wards</option>
            {WARDS.map((w) => <option key={w} value={w}>Ward {w}</option>)}
          </select>
        </label>
      </div>

      <section className="strip">
        <div><b>{fmt(s.total)}</b><span>voters</span></div>
        <div><b>{fmt(s.male)}</b><span>men</span></div>
        <div><b>{fmt(s.female)}</b><span>women</span></div>
        <div><b>{fmt(s.households)}</b><span>homes</span></div>
        <div><b>{s.avgAge.toFixed(1)}</b><span>avg age</span></div>
      </section>

      <section className="card">
        <div className="cardhead"><h2>Age and gender</h2><span>Tap a row to list those voters</span></div>
        <div className="pyramid">
          <div className="pyr-head"><span><i className="dot male" />Men</span><span>Age</span><span><i className="dot female" />Women</span></div>
          {AGE_BANDS.map(([a, b], i) => {
            const band = s.bands[i];
            return (
              <button key={a} type="button" className="pyr-row"
                onClick={() => openList({ ...base, ageMin: String(a), ageMax: b > 150 ? "" : String(b) })}>
                <span className="pyr-side left"><em>{band.male}</em><span className="bar male" style={{ width: `${(band.male * 100) / side}%` }} /></span>
                <span className="pyr-label">{bandLabel([a, b])}<small>{pct(band.total, s.total)}%</small></span>
                <span className="pyr-side"><span className="bar female" style={{ width: `${(band.female * 100) / side}%` }} /><em>{band.female}</em></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="cardhead"><h2>Village × ward</h2><span>How each village splits across wards. Tap a ward to list its voters there.</span></div>
        <div className="vxw">
          {HAMLETS.map(([no, name]) => {
            const parts = WARDS.map((w) => [w, matrix[no + "|" + w] || 0]).filter(([, n]) => n);
            const total = parts.reduce((t, [, n]) => t + n, 0);
            return (
              <div key={no} className="vxw-row">
                <div className="vxw-head"><span lang="te">{name}</span><b>{total}</b></div>
                <div className="vxw-parts">
                  {parts.map(([w, n]) => {
                    const heat = 0.12 + (0.78 * n) / cellMax;
                    return (
                      <button key={w} type="button" className={"cell" + (heat > 0.5 ? " hot" : "")} style={{ "--heat": heat }}
                        onClick={() => openList({ hab: no, ward: w })}>
                        <small>Ward {w}</small>{n}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="cardhead"><h2>Largest households</h2><span>Most voters at one house number</span></div>
        <ol className="homes">
          {homes.map((list) => {
            const o = list[0];
            return (
              <li key={o._hh}>
                <button type="button" onClick={() => go("voter", o.gp_serial_no, true)}>
                  <span className="homes-n">{list.length}</span>
                  <span className="homes-body">
                    <b>House {o.house_no}</b>
                    <small lang="te">{o.habitation} · Ward {o.ward_no}</small>
                    <small lang="te" className="homes-names">{list.map((x) => x.voter_name).join(", ")}</small>
                  </span>
                  <Icon name="right" size={16} />
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card">
        <div className="cardhead"><h2>How the relative is listed</h2><span>From the printed list</span></div>
        <div className="hbars">
          {rels.map(([k, label, n]) => (
            <button key={k} type="button" className="hbar" onClick={() => openList({ ...base, rel: k })}>
              <span className="hbar-label">{label}</span>
              <span className="hbar-track"><span style={{ width: `${(n * 100) / relMax}%` }} /></span>
              <span className="hbar-n">{n}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
