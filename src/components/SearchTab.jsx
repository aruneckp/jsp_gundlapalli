import { HAMLETS, WARDS } from "../lib/data.js";
import { current } from "../lib/useEdits.js";
import { go } from "../lib/useHashRoute.js";
import { PAGE_SIZE, SHOW_VOTER_ID } from "../config.js";

export default function SearchTab({ filters, setFilters, results, page, setPage, edits }) {
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const slice = results.slice(start, start + PAGE_SIZE);
  const turn = (d) => { setPage(page + d); window.scrollTo(0, 0); };

  return (
    <section className="panel" role="tabpanel">
      <div className="bar">
        <label className="sr" htmlFor="q">Search</label>
        <input id="q" type="search" autoComplete="off" value={filters.q} onChange={set("q")}
          placeholder={`Search name (Telugu or English), relative, voter no.${SHOW_VOTER_ID ? ", voter ID" : ""} or house no.`} />
        <label className="sr" htmlFor="fHab">Hamlet</label>
        <select id="fHab" value={filters.hab} onChange={set("hab")}>
          <option value="">All hamlets</option>
          {HAMLETS.map(([no, name]) => <option key={no} value={no}>{name}</option>)}
        </select>
        <label className="sr" htmlFor="fWard">Ward</label>
        <select id="fWard" value={filters.ward} onChange={set("ward")}>
          <option value="">All wards</option>
          {WARDS.map((w) => <option key={w} value={w}>Ward {w}</option>)}
        </select>
        <label className="sr" htmlFor="fGen">Gender</label>
        <select id="fGen" value={filters.gen} onChange={set("gen")}>
          <option value="">Everyone</option><option>Male</option><option>Female</option><option>Other</option>
        </select>
        <label className="chk"><input id="fEdited" type="checkbox" checked={filters.editedOnly} onChange={set("editedOnly")} /> Edited only</label>
      </div>

      <div className="tablebox">
        <table>
          <thead>
            <tr><th>No.</th><th>Voter</th><th>Age</th><th>Gender</th><th>House</th><th>Hamlet</th><th>Ward</th>{SHOW_VOTER_ID && <th>Voter ID</th>}</tr>
          </thead>
          <tbody>
            {slice.map((o) => {
              const r = current(o, edits);
              const edited = !!edits[o.gp_serial_no];
              const open = () => go("voter", o.gp_serial_no);
              return (
                <tr key={o.gp_serial_no} tabIndex={0} className={edited ? "edited" : ""} onClick={open}
                  onKeyDown={(e) => e.key === "Enter" && open()}>
                  <td className="num">{o.gp_serial_no}</td>
                  <td>
                    <span className="n" lang="te">{r.voter_name}</span>
                    {edited && <span className="tag">edited</span>}
                    <span className="r" lang="te">{(r.relation_type || "Relation not printed") + ": " + r.relation_name}</span>
                  </td>
                  <td className="num">{r.age}</td>
                  <td>{r.gender}</td>
                  <td className="num">{r.house_no}</td>
                  <td lang="te">{r.habitation}</td>
                  <td className="num">{r.ward_no}</td>
                  {SHOW_VOTER_ID && <td className="num">{r.epic_no}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!results.length && (
          <div className="empty">No voters match. Try another spelling, a voter number, or a house number like 13-2.</div>
        )}
      </div>

      <div className="pager">
        <span>{results.length ? `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, results.length)} of ${results.length} · page ${page + 1} of ${pages}` : ""}</span>
        <span className="row">
          <button className="btn" type="button" disabled={page === 0} onClick={() => turn(-1)}>Previous</button>
          <button className="btn" type="button" disabled={page >= pages - 1} onClick={() => turn(1)}>Next</button>
        </span>
      </div>
    </section>
  );
}
