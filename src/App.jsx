import { useEffect, useMemo, useRef, useState } from "react";
import { VOTERS, BY_NO } from "./lib/data.js";
import { matches } from "./lib/search.js";
import { useEdits, current } from "./lib/useEdits.js";
import { useHashRoute, go } from "./lib/useHashRoute.js";
import SearchTab from "./components/SearchTab.jsx";
import VoterTab from "./components/VoterTab.jsx";
import FamilyTab from "./components/FamilyTab.jsx";
import EditsTab from "./components/EditsTab.jsx";

export default function App() {
  const { edits, setEdits, setOne, saveFailed } = useEdits();
  const route = useHashRoute();
  const [filters, setFilters] = useState({ q: "", hab: "", ward: "", gen: "", editedOnly: false });
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const say = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

  const results = useMemo(() => VOTERS.filter((o) => {
    const r = current(o, edits);
    if (filters.hab && String(o.habitation_no) !== filters.hab) return false;
    if (filters.ward && String(r.ward_no) !== filters.ward) return false;
    if (filters.gen && r.gender !== filters.gen) return false;
    if (filters.editedOnly && !edits[o.gp_serial_no]) return false;
    return matches(r, o, filters.q);
  }), [filters, edits]);

  useEffect(() => setPage(0), [filters]);

  const selected = route.no ? BY_NO.get(route.no) : null;
  const tab = (route.tab === "voter" || route.tab === "family") && !selected ? "search" : route.tab;
  const nEdited = Object.keys(edits).length;

  const tabs = [
    { id: "search", label: "Search" },
    { id: "voter", label: "Voter", needs: true },
    { id: "family", label: "Family", needs: true },
    { id: "edits", label: nEdited ? `Edits (${nEdited})` : "Edits" },
  ];

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Vedagirivaripalle voter register</h1>
          <p className="sub" lang="te">వేదగిరివారిపల్లె గ్రామ పంచాయతీ ఓటర్ల జాబితా 2026</p>
        </div>
        <div className="counts">{VOTERS.length.toLocaleString("en-IN")} voters · {nEdited} edited</div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {tabs.map((t) => (
          <button key={t.id} className="tab" role="tab" type="button"
            aria-selected={tab === t.id} disabled={t.needs && !selected}
            onClick={() => go(t.id, t.needs ? selected?.gp_serial_no : null)}>
            {t.label}
          </button>
        ))}
      </nav>

      {saveFailed && (
        <p className="warn">This browser is not saving edits. Export the CSV from the Edits tab before you leave.</p>
      )}

      {tab === "search" && (
        <SearchTab filters={filters} setFilters={setFilters} results={results}
          page={page} setPage={setPage} edits={edits} />
      )}
      {tab === "voter" && (
        <VoterTab key={selected.gp_serial_no} voter={selected} edits={edits} setOne={setOne}
          results={results} say={say} />
      )}
      {tab === "family" && <FamilyTab voter={selected} edits={edits} />}
      {tab === "edits" && <EditsTab edits={edits} setEdits={setEdits} say={say} />}

      <footer className="note">
        Source: AP State Election Commission, Gram Panchayat voter list, published 15-04-2026. Ages as on 01-01-2026.
        Family links are worked out from the printed relative names and should be checked locally.
      </footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
