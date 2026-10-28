import { go } from "../lib/useHashRoute.js";
import { sex } from "../lib/stats.js";
import Icon from "./Icon.jsx";

const seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("te", { granularity: "grapheme" }) : null;
export const initial = (name) => {
  const s = String(name || "?").trim();
  return seg ? seg.segment(s)[Symbol.iterator]().next().value?.segment || "?" : [...s][0];
};

export function Avatar({ o, big }) {
  return <span className={`avatar ${sex(o)}${big ? " big" : ""}`} lang="te" aria-hidden="true">{initial(o.voter_name)}</span>;
}

export default function VoterCard({ o }) {
  return (
    <button type="button" className="vcard" onClick={() => go("voter", o.gp_serial_no, true)}>
      <Avatar o={o} />
      <span className="vbody">
        <span className="vname" lang="te">{o.voter_name}</span>
        <span className="vrel" lang="te">{o.relation_type ? `${o.relation_type}: ` : ""}{o.relation_name || "—"}</span>
        <span className="vtags">
          <span className="tag">{o.age} yrs</span>
          <span className={`tag ${sex(o)}`}>{o.gender}</span>
          <span className="tag">House {o.house_no}</span>
          <span className="tag">Ward {o.ward_no}</span>
          <span className="tag te" lang="te">{o.habitation}</span>
        </span>
      </span>
      <span className="vno">#{o.gp_serial_no}<Icon name="right" size={16} /></span>
    </button>
  );
}
