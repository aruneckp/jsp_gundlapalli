import { VOTERS, BY_NO, LINKS, GHOSTS } from "../lib/data.js";
import { go } from "../lib/useHashRoute.js";
import { sex } from "../lib/stats.js";
import { Avatar } from "./VoterCard.jsx";
import Icon from "./Icon.jsx";

// Builds the family as a tree: each box is a person with the wives who name him;
// children hang below. Relatives who are not on the voter list appear in grey.
function buildFamily(fam) {
  const ids = VOTERS.filter((o) => o._fam === fam).map((o) => o.gp_serial_no);
  for (const g in GHOSTS) if (GHOSTS[g][1] === fam) ids.push(g);
  const link = (id) => (id.startsWith("g") ? null : LINKS[id]);
  const pointsTo = (x, id, husband) => {
    const l = link(x);
    return l && String(l[0]) === id && (l[1] === "Husband") === husband;
  };
  const spousesOf = (id) => ids.filter((x) => pointsTo(x, id, true));
  const kidsOf = (id) => ids.filter((x) => pointsTo(x, id, false));
  const roots = ids.filter((x) => { const l = link(x); return !l || !ids.includes(String(l[0])); });
  return { ids, link, spousesOf, kidsOf, roots };
}

export default function FamilyPage({ voter }) {
  const F = buildFamily(voter._fam);
  const me = voter.gp_serial_no;
  const age = (id) => (BY_NO.get(id) ? BY_NO.get(id).age : 999);
  const seen = new Set();

  const role = (id) => {
    const l = F.link(id);
    if (!l) return "";
    const female = BY_NO.get(id).gender === "Female";
    return l[1] === "Husband" ? (female ? "Wife" : "Husband") : (female ? "Daughter" : "Son");
  };

  const Row = ({ id }) => {
    if (id.startsWith("g")) {
      return (
        <div className="krow ghost">
          <span className="avatar other" aria-hidden="true">?</span>
          <span className="kbody"><span className="n" lang="te">{GHOSTS[id][0]}</span><span className="m">Not on the voter list</span></span>
        </div>
      );
    }
    const o = BY_NO.get(id);
    const note = F.link(id)?.[2];
    return (
      <button type="button" className={"krow " + sex(o) + (id === me ? " me" : "")} onClick={() => go("voter", id, true)}>
        <Avatar o={o} />
        <span className="kbody">
          <span className="n" lang="te">{o.voter_name}</span>
          <span className="m">{[role(id), `${o.age} yrs`, `#${id}`, `House ${o.house_no}`].filter(Boolean).join(" · ")}</span>
          {note && <span className="m check">Check: {note}</span>}
        </span>
      </button>
    );
  };

  const Item = ({ id }) => {
    seen.add(id);
    const spouses = F.spousesOf(id);
    spouses.forEach((s) => seen.add(s));
    const kids = [...F.kidsOf(id), ...spouses.flatMap(F.kidsOf)]
      .filter((k, i, a) => a.indexOf(k) === i && !seen.has(k))
      .sort((a, b) => age(b) - age(a));
    kids.forEach((k) => seen.add(k));
    return (
      <li>
        <div className="unit">
          <Row id={id} />
          {spouses.map((s) => <Row key={s} id={s} />)}
        </div>
        {kids.length > 0 && <ul>{kids.map((k) => <Item key={k} id={k} />)}</ul>}
      </li>
    );
  };

  const top = F.roots[0];
  const title = top.startsWith("g") ? GHOSTS[top][0] : BY_NO.get(top).voter_name;
  const nVoters = F.ids.filter((x) => !x.startsWith("g")).length;

  return (
    <div className="page">
      <div className="topline">
        <button type="button" className="backbtn" onClick={() => go("voter", me)}><Icon name="left" size={18} /> Voter #{me}</button>
      </div>
      <section className="card">
        <div className="cardhead">
          <h2>Family of <span lang="te">{title}</span></h2>
          <span>{nVoters} voter{nVoters === 1 ? "" : "s"} on the list</span>
        </div>
        <ul className="kin">{F.roots.map((r) => <Item key={r} id={r} />)}</ul>
        <p className="source">
          Links are worked out from the printed father, husband or mother names at the same house number, so check
          them locally. Grey names are relatives who are not on the voter list.
        </p>
      </section>
    </div>
  );
}
