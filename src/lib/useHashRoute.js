import { useEffect, useLayoutEffect, useState } from "react";

// Routes live in the hash (#home, #voters, #analysis, #voter-104, #family-104)
// so a static host needs no rewrite rules and the browser Back button works.
const parse = () => {
  const m = /^#?(home|voters|analysis|voter|family)(?:-(\d+))?$/.exec(window.location.hash);
  return m ? { tab: m[1], no: m[2] || null } : { tab: "home", no: null };
};

// Scroll position per page, so Back returns to the same spot in a long list.
// `shown` is the page on screen; it is null while one page swaps for another,
// so scrolls caused by the swap are not recorded against either page.
const scrolls = {};
let shown = null;

export function useHashRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onScroll = () => { if (shown) scrolls[shown] = window.scrollY; };
    const onHash = () => { shown = null; setRoute(parse()); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("hashchange", onHash); };
  }, []);
  useLayoutEffect(() => {
    const hash = window.location.hash || "#home";
    window.scrollTo(0, scrolls[hash] || 0);
    shown = hash;
  }, [route]);
  return route;
}

export const go = (tab, no, fresh = false) => {
  const hash = no ? `${tab}-${no}` : tab;
  if (fresh) delete scrolls["#" + hash];
  if (window.location.hash === "#" + hash) window.scrollTo(0, 0);
  else window.location.hash = hash;
};
