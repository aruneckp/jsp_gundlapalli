import { useEffect, useMemo, useState } from "react";
import { init, BY_NO, VOTERS } from "./lib/data.js";
import { resume, lock } from "./lib/crypto.js";
import { applyFilters, EMPTY } from "./lib/stats.js";
import { useHashRoute, go } from "./lib/useHashRoute.js";
import { PAGE_SIZE } from "./config.js";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import VotersPage from "./components/VotersPage.jsx";
import VoterPage from "./components/VoterPage.jsx";
import FamilyPage from "./components/FamilyPage.jsx";
import Analysis from "./components/Analysis.jsx";
import Icon from "./components/Icon.jsx";

export default function App() {
  const [state, setState] = useState("checking");
  useEffect(() => {
    resume().then((raw) => { if (raw) init(raw); setState(raw ? "ready" : "locked"); });
  }, []);

  if (state === "checking") return <div className="splash"><span className="spinner big" /></div>;
  if (state === "locked") return <Login onUnlock={(raw) => { init(raw); setState("ready"); }} />;
  return <Main onLogout={() => { lock(); setState("locked"); go("home"); }} />;
}

const NAV = [
  { id: "home", label: "Dashboard", icon: "home" },
  { id: "voters", label: "Voters", icon: "users" },
  { id: "analysis", label: "Analysis", icon: "chart" },
];

function Main({ onLogout }) {
  const route = useHashRoute();
  const [filters, setFilters] = useState(EMPTY);
  const [shown, setShown] = useState(PAGE_SIZE);
  const results = useMemo(() => applyFilters(VOTERS, filters), [filters]);
  useEffect(() => setShown(PAGE_SIZE), [filters]);

  const openList = (f) => { setFilters({ ...EMPTY, ...f }); go("voters", null, true); };
  const selected = route.no ? BY_NO.get(route.no) : null;
  const tab = (route.tab === "voter" || route.tab === "family") && !selected ? "voters" : route.tab;
  const section = tab === "voter" || tab === "family" ? "voters" : tab;

  const navButtons = NAV.map((n) => (
    <button key={n.id} type="button" className="navbtn" aria-current={section === n.id ? "page" : undefined}
      onClick={() => go(n.id)}>
      <Icon name={n.icon} size={22} /><span>{n.label}</span>
    </button>
  ));

  return (
    <div className="app">
      <header className="appbar">
        <button type="button" className="brand" onClick={() => go("home")}>
          <span className="logo"><Icon name="users" size={18} /></span>
          <span><b>Vedagirivaripalle</b><small>Voter register 2026</small></span>
        </button>
        <nav className="topnav" aria-label="Sections">{navButtons}</nav>
        <button type="button" className="signout" onClick={onLogout}>
          <Icon name="logout" size={18} /><span>Sign out</span>
        </button>
      </header>

      <main>
        {tab === "home" && <Dashboard openList={openList} />}
        {tab === "voters" && <VotersPage filters={filters} setFilters={setFilters} results={results} shown={shown} setShown={setShown} />}
        {tab === "voter" && <VoterPage key={selected.gp_serial_no} voter={selected} results={results} />}
        {tab === "family" && <FamilyPage voter={selected} />}
        {tab === "analysis" && <Analysis openList={openList} />}
      </main>

      <nav className="bottomnav" aria-label="Sections">{navButtons}</nav>
    </div>
  );
}
