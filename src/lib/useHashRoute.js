import { useEffect, useState } from "react";

// Routes live in the hash (#search, #voter-104, #family-104, #edits) so a
// static host needs no rewrite rules and the browser Back button works.
const parse = () => {
  const m = /^#?(search|voter|family|edits)(?:-(\d+))?$/.exec(window.location.hash);
  return m ? { tab: m[1], no: m[2] || null } : { tab: "search", no: null };
};

export function useHashRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const go = (tab, no) => { window.location.hash = no ? `${tab}-${no}` : tab; };
