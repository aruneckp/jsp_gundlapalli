import { useState } from "react";
import { HAMLETS, WARDS, COLS, hamletName } from "../lib/data.js";
import { EMPTY, SORTS, RELATIONS, AGE_BANDS, bandLabel, activeCount, summarize, fmt } from "../lib/stats.js";
import { toCSV, download } from "../lib/csv.js";
import { PAGE_SIZE, SHOW_VOTER_ID } from "../config.js";
import VoterCard from "./VoterCard.jsx";
import Icon from "./Icon.jsx";

function Chips({ value, options, onChange, all = "All" }) {
  return (
    <div className="chips">
      <button type="button" className="chip" aria-pressed={!value} onClick={() => onChange("")}>{all}</button>
      {options.map(([v, label, te]) => (
        <button key={v} type="button" className="chip" aria-pressed={value === v} lang={te ? "te" : undefined}
          onClick={() => onChange(value === v ? "" : v)}>{label}</button>
      ))}
    </div>
  );
}

export default function VotersPage({ filters, setFilters, results, shown, setShown }) {
  const [open, setOpen] = useState(false);
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));
  const nActive = activeCount(filters);
  const s = summarize(results);
  const band = AGE_BANDS.findIndex(([a, b]) => String(a) === filters.ageMin && (b > 150 ? "" : String(b)) === filters.ageMax);

  const active = [
    filters.hab && [`hab`, hamletName(filters.hab), true],
    filters.ward && ["ward", `Ward ${filters.ward}`],
    filters.gen && ["gen", { Male: "Men", Female: "Women" }[filters.gen] || filters.gen],
    (filters.ageMin || filters.ageMax) && ["age", `Age ${filters.ageMin || 18}–${filters.ageMax || "∞"}`],
    filters.rel && ["rel", RELATIONS.find((r) => r[0] === filters.rel)?.[1]],
  ].filter(Boolean);
  const clear = (k) => setFilters((f) => (k === "age" ? { ...f, ageMin: "", ageMax: "" } : { ...f, [k]: "" }));

  const exportCSV = () => {
    const cols = SHOW_VOTER_ID ? COLS : COLS.filter((c) => c !== "epic_no");
    download("vedagirivaripalle_voters.csv", toCSV(cols, results.map((o) => cols.map((c) => o[c]))));
  };

  return (
    <div className="page">
      <div className="searchbar">
        <label className="searchbox">
          <Icon name="search" size={18} />
          <input type="search" value={filters.q} onChange={(e) => set("q")(e.target.value)} enterKeyHint="search"
            autoComplete="off" placeholder="Name, house no., voter no."
            aria-label="Search voters" />
          {filters.q && <button type="button" className="clearq" aria-label="Clear search" onClick={() => set("q")("")}><Icon name="x" size={16} /></button>}
        </label>
        <button type="button" className={"filterbtn" + (open ? " on" : "")} aria-expanded={open}
          onClick={() => { setOpen(!open); window.scrollTo(0, 0); }}>
          <Icon name="sliders" size={18} /><span>Filters</span>{nActive > 0 && <b>{nActive}</b>}
        </button>
      </div>

      {open && (
        <section className="filters">
          <div className="fgroup">
            <h3>Village</h3>
            <Chips value={filters.hab} onChange={set("hab")} all="All villages"
              options={HAMLETS.map(([no, name]) => [no, name, true])} />
          </div>
          <div className="fgroup">
            <h3>Ward</h3>
            <Chips value={filters.ward} onChange={set("ward")} all="All wards" options={WARDS.map((w) => [w, `Ward ${w}`])} />
          </div>
          <div className="fgroup">
            <h3>Gender</h3>
            <Chips value={filters.gen} onChange={set("gen")} all="Everyone" options={[["Male", "Men"], ["Female", "Women"]]} />
          </div>
          <div className="fgroup">
            <h3>Age</h3>
            <div className="chips">
              {AGE_BANDS.map(([a, b], i) => (
                <button key={a} type="button" className="chip" aria-pressed={band === i}
                  onClick={() => setFilters((f) => band === i ? { ...f, ageMin: "", ageMax: "" }
                    : { ...f, ageMin: String(a), ageMax: b > 150 ? "" : String(b) })}>
                  {bandLabel([a, b])}
                </button>
              ))}
            </div>
            <div className="agerange">
              <input type="number" inputMode="numeric" min="18" max="120" placeholder="From" aria-label="Minimum age"
                value={filters.ageMin} onChange={(e) => set("ageMin")(e.target.value)} />
              <span>to</span>
              <input type="number" inputMode="numeric" min="18" max="120" placeholder="To" aria-label="Maximum age"
                value={filters.ageMax} onChange={(e) => set("ageMax")(e.target.value)} />
            </div>
          </div>
          <div className="fgroup">
            <h3>Relative listed as</h3>
            <Chips value={filters.rel} onChange={set("rel")} all="Any" options={RELATIONS} />
          </div>
          <div className="fgroup">
            <h3>Sort by</h3>
            <div className="chips">
              {Object.entries(SORTS).map(([k, [label]]) => (
                <button key={k} type="button" className="chip" aria-pressed={filters.sort === k}
                  onClick={() => set("sort")(k)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="factions">
            <button type="button" className="btn" onClick={() => setFilters({ ...EMPTY, q: filters.q })}>Reset filters</button>
            <button type="button" className="btn primary" onClick={() => { setOpen(false); window.scrollTo(0, 0); }}>Show {fmt(results.length)} voters</button>
          </div>
        </section>
      )}

      {active.length > 0 && (
        <div className="activechips">
          {active.map(([k, label, te]) => (
            <button key={k} type="button" className="achip" onClick={() => clear(k)} aria-label={`Remove filter ${label}`}>
              <span lang={te ? "te" : undefined}>{label}</span><Icon name="x" size={14} />
            </button>
          ))}
        </div>
      )}

      <div className="resultbar">
        <div>
          <b>{fmt(results.length)}</b> voters
          <span className="rsub"> · <i className="dot male" />{s.male} <i className="dot female" />{s.female} · {s.households} homes</span>
        </div>
        <button type="button" className="linkbtn" onClick={exportCSV} disabled={!results.length}>
          <Icon name="download" size={16} /> CSV
        </button>
      </div>

      <div className="list">
        {results.slice(0, shown).map((o) => <VoterCard key={o.gp_serial_no} o={o} />)}
      </div>
      {!results.length && (
        <div className="empty">
          <Icon name="search" size={28} />
          <p>No voters match. Try another spelling, a voter number, or a house number like 13-2.</p>
          <button type="button" className="btn" onClick={() => setFilters(EMPTY)}>Clear search and filters</button>
        </div>
      )}
      {shown < results.length && (
        <button type="button" className="btn block more" onClick={() => setShown(shown + PAGE_SIZE)}>
          Show more · {fmt(results.length - shown)} left
        </button>
      )}
    </div>
  );
}
