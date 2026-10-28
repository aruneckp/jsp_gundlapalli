import { VOTERS, LABELS } from "../lib/data.js";
import { go } from "../lib/useHashRoute.js";
import { SHOW_VOTER_ID } from "../config.js";
import VoterCard, { Avatar } from "./VoterCard.jsx";
import Icon from "./Icon.jsx";

const FACTS = ["relation_type", "relation_name", "age", "gender", "house_no", "ward_no", "habitation",
  ...(SHOW_VOTER_ID ? ["epic_no"] : [])];
const TELUGU = new Set(["relation_name", "habitation"]);

export default function VoterPage({ voter, results }) {
  const i = results.indexOf(voter);
  const house = VOTERS.filter((o) => o._hh === voter._hh && o !== voter);
  const nFamily = VOTERS.filter((o) => o._fam === voter._fam).length;
  const step = (d) => go("voter", results[i + d].gp_serial_no, true);

  return (
    <div className="page">
      <div className="topline">
        <button type="button" className="backbtn" onClick={() => go("voters")}><Icon name="left" size={18} /> Results</button>
        <div className="stepper">
          {i >= 0 && <span>{i + 1} / {results.length}</span>}
          <button type="button" className="iconbtn" disabled={i <= 0} onClick={() => step(-1)} aria-label="Previous voter"><Icon name="left" /></button>
          <button type="button" className="iconbtn" disabled={i < 0 || i >= results.length - 1} onClick={() => step(1)} aria-label="Next voter"><Icon name="right" /></button>
        </div>
      </div>

      <article className="profile">
        <Avatar o={voter} big />
        <h2 lang="te">{voter.voter_name}</h2>
        <p className="profile-no">Voter no. <b>{voter.gp_serial_no}</b></p>
        <div className="profile-stats">
          <span><b>{voter.age}</b>years</span>
          <span><b>{voter.gender}</b>gender</span>
          <span><b>{voter.ward_no}</b>ward</span>
        </div>
      </article>

      <dl className="facts">
        {FACTS.map((c) => (
          <div key={c}>
            <dt>{LABELS[c]}</dt>
            <dd lang={TELUGU.has(c) ? "te" : undefined}>{voter[c] === "" || voter[c] == null ? "Not printed" : voter[c]}</dd>
          </div>
        ))}
      </dl>

      <button type="button" className="cta" onClick={() => go("family", voter.gp_serial_no, true)}>
        <span className="cta-icon"><Icon name="family" size={22} /></span>
        <span><b>View family tree</b><small>{nFamily} voter{nFamily === 1 ? "" : "s"} in this family</small></span>
        <Icon name="right" />
      </button>

      {house.length > 0 && (
        <>
          <div className="sechead"><h2><Icon name="house" size={18} /> Also at house {voter.house_no}</h2><span>{house.length} more</span></div>
          <div className="list">{house.map((o) => <VoterCard key={o.gp_serial_no} o={o} />)}</div>
        </>
      )}
    </div>
  );
}
