import { useMemo, useState } from "react";
import { VOTERS, HAMLETS, WARDS } from "../lib/data.js";
import { summarize, groupBy, fmt, pct } from "../lib/stats.js";
import Icon from "./Icon.jsx";

export function GenderBar({ m, f, o = 0 }) {
  const t = m + f + o || 1;
  return (
    <span className="gbar" role="img" aria-label={`${m} men, ${f} women`}>
      <span className="male" style={{ width: `${(m * 100) / t}%` }} />
      <span className="female" style={{ width: `${(f * 100) / t}%` }} />
      {o > 0 && <span className="other" style={{ width: `${(o * 100) / t}%` }} />}
    </span>
  );
}

function Kpi({ label, value, sub, tone, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} className={`kpi ${tone || ""}`} onClick={onClick}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </Tag>
  );
}

export default function Dashboard({ openList }) {
  const [q, setQ] = useState("");
  const s = useMemo(() => summarize(VOTERS), []);
  const villages = useMemo(() => {
    const by = groupBy(VOTERS, (o) => o.habitation_no);
    return HAMLETS.map(([no, name]) => {
      const list = by.get(no) || [];
      return { no, name, ...summarize(list), wards: [...new Set(list.map((o) => o.ward_no))].sort((a, b) => a - b) };
    }).sort((a, b) => b.total - a.total);
  }, []);
  const wards = useMemo(() => {
    const by = groupBy(VOTERS, (o) => o.ward_no);
    return WARDS.map((w) => {
      const list = by.get(w) || [];
      return { w, ...summarize(list), villages: new Set(list.map((o) => o.habitation_no)).size };
    });
  }, []);
  const top = villages[0]?.total || 1;

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-row">
          <div>
            <p className="eyebrow">Gram Panchayat voter list · 2026</p>
            <h1>Vedagirivaripalle</h1>
            <p className="hero-te" lang="te">వేదగిరివారిపల్లె గ్రామ పంచాయతీ</p>
          </div>
          <div className="hero-total"><b>{fmt(s.total)}</b><span>voters</span></div>
        </div>
        <div className="hero-split">
          <GenderBar m={s.male} f={s.female} o={s.other} />
          <div className="legend">
            <span><i className="dot male" /> Men {fmt(s.male)} · {pct(s.male, s.total)}%</span>
            <span><i className="dot female" /> Women {fmt(s.female)} · {pct(s.female, s.total)}%</span>
          </div>
        </div>
        <form className="hero-search" onSubmit={(e) => { e.preventDefault(); openList({ q }); }}>
          <Icon name="search" size={18} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} enterKeyHint="search"
            placeholder="Name or house no." aria-label="Search voters" />
          <button type="submit">Search</button>
        </form>
      </section>

      <section className="kpis">
        <Kpi label="Households" value={fmt(s.households)} sub={`${(s.total / s.households).toFixed(1)} voters each`} />
        <Kpi label="Families" value={fmt(s.families)} sub="linked by relatives" />
        <Kpi label="Average age" value={s.avgAge.toFixed(1)} sub="years" />
        <Kpi label="Villages · Wards" value={`${HAMLETS.length} · ${WARDS.length}`} sub="in the panchayat" />
        <Kpi label="Young 18–25" value={fmt(s.young)} sub={`${pct(s.young, s.total)}% · tap to list`} tone="accent"
          onClick={() => openList({ ageMin: "18", ageMax: "25" })} />
        <Kpi label="Seniors 60+" value={fmt(s.senior)} sub={`${pct(s.senior, s.total)}% · tap to list`} tone="accent2"
          onClick={() => openList({ ageMin: "60" })} />
      </section>

      <div className="sechead">
        <h2><Icon name="pin" size={18} /> Village-wise voters</h2>
        <span>Tap a village to see its voters</span>
      </div>
      <section className="villages">
        {villages.map((v, i) => (
          <button key={v.no} type="button" className="village" onClick={() => openList({ hab: v.no })}>
            <span className="village-top">
              <span className="rank">{i + 1}</span>
              <span className="village-name" lang="te">{v.name}</span>
            </span>
            <span className="village-count"><b>{fmt(v.total)}</b> voters · {pct(v.total, s.total)}%</span>
            <span className="meter"><span style={{ width: `${(v.total * 100) / top}%` }} /></span>
            <span className="village-meta">
              <span><i className="dot male" />{v.male}</span>
              <span><i className="dot female" />{v.female}</span>
              <span><Icon name="house" size={13} />{v.households}</span>
              <span className="wardlist">Ward {v.wards.join(", ")}</span>
            </span>
          </button>
        ))}
      </section>

      <div className="sechead">
        <h2><Icon name="grid" size={18} /> Ward-wise voters</h2>
        <span>Tap a ward to see its voters</span>
      </div>
      <section className="wards">
        {wards.map((w) => (
          <button key={w.w} type="button" className="ward" onClick={() => openList({ ward: w.w })}>
            <span className="ward-no">Ward {w.w}</span>
            <b className="ward-count">{w.total}</b>
            <GenderBar m={w.male} f={w.female} o={w.other} />
            <span className="ward-meta">M {w.male} · F {w.female}</span>
            <span className="ward-meta">{w.villages} village{w.villages === 1 ? "" : "s"} · {w.households} homes</span>
          </button>
        ))}
      </section>

      <p className="source">
        Source: AP State Election Commission, Gram Panchayat voter list published 15-04-2026. Ages as on 01-01-2026.
      </p>
    </div>
  );
}
