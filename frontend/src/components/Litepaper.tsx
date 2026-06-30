// Wellspring litepaper — a native long-form page using the same screen-state
// pattern as the other inner screens (feed/verify/freeze/profile).
export function Litepaper({ active, goFeed }: { active: boolean; goFeed: () => void }) {
  return (
    <section id="litepaper" className={`screen ${active ? 'active' : ''}`}>
      <div className="litepaper">
        <button className="back-link" onClick={goFeed}>
          ← Back to the Ledger
        </button>

        <header className="lp-head">
          <div className="lp-eyebrow">Litepaper</div>
          <h1>Wellspring</h1>
          <p className="lp-tagline">
            Proof that good things happened. Frozen forever.
            <br />
            A verifiable impact protocol on Sui.
          </p>
        </header>

        <section className="lp-section">
          <h2>
            <span className="lp-num">01</span> The problem
          </h2>
          <p>
            When a charity says it built a well, drilled a borehole, or brought clean water to a village,
            donors are asked to do one thing: trust. Trust that the photo is real. Trust that the work
            happened. Trust that the record won't be quietly edited, deleted, or fabricated later. Across
            the impact and philanthropy sector, accountability rests almost entirely on self-reported
            claims sitting in private databases the public can never independently inspect. This trust gap
            is expensive. It enables misreporting, it lets bad actors hide, and it forces honest
            organizations to compete on marketing rather than verifiable results.
          </p>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">02</span> The solution
          </h2>
          <p>
            Wellspring removes the trust step. It turns a claim of impact into a public, permanent,
            tamper-evident record that anyone in the world can verify, without permission and without an
            account. A proof of real-world impact — a photograph, a title, a location, a timestamp — is
            stored on decentralized storage and then frozen as an immutable object on the Sui blockchain.
            Once frozen, the record cannot be altered or deleted by anyone, including its creator. What you
            see is exactly what was sealed. "Freeze" is not a metaphor. On Sui,{' '}
            <span className="mono">transfer::public_freeze_object</span> makes an object immutable and
            publicly readable at the protocol level. Wellspring is built directly on that primitive.
          </p>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">03</span> How it works
          </h2>
          <p>
            Wellspring has no server and no database. The blockchain is the backend, decentralized storage
            holds the evidence, and the user's wallet is the identity.
          </p>
          <ul className="lp-list">
            <li>
              <b>Connect:</b> an operator connects a Sui wallet, which becomes their on-chain identity.
            </li>
            <li>
              <b>Submit:</b> they add a photo, a title, a location, and a description of the impact.
            </li>
            <li>
              <b>Store:</b> the photo is uploaded to Walrus, Sui's decentralized storage layer, which
              returns a content reference (<span className="mono">blob ID</span>).
            </li>
            <li>
              <b>Freeze:</b> the operator signs a transaction calling{' '}
              <span className="mono">freeze_proof</span>, which mints an immutable{' '}
              <span className="mono">ImpactProof</span> object on Sui and permanently freezes it.
            </li>
            <li>
              <b>Verify:</b> anyone can open the proof's verification page and confirm the image, the
              on-chain object, the storage reference, the creator's address, and the timestamp — all
              without a wallet or login.
            </li>
          </ul>
          <p>
            Every frozen proof emits an on-chain event, and the public Ledger is built directly from those
            events. The record is the chain itself.
          </p>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">04</span> Architecture
          </h2>
          <ul className="lp-list">
            <li>
              <b>Smart contract (Sui Move):</b> the <span className="mono">wellspring::impact</span> module
              defines the <span className="mono">ImpactProof</span> object and the{' '}
              <span className="mono">freeze_proof</span> function. Logic and the canonical record live
              on-chain.
            </li>
            <li>
              <b>Storage (Walrus):</b> evidence photos are stored on decentralized storage; the on-chain
              object holds the immutable reference.
            </li>
            <li>
              <b>Frontend:</b> a browser application that talks directly to Sui and Walrus. No backend, no
              custodial layer.
            </li>
            <li>
              <b>Identity:</b> the wallet signs every freeze; the creator address is recorded permanently
              and publicly.
            </li>
          </ul>
          <p>
            There is no central party who can tamper with records, take the system offline, or gatekeep
            verification.
          </p>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">05</span> Why Sui
          </h2>
          <p>
            Wellspring is only possible because of primitives native to the Sui stack: object freezing (
            <span className="mono">public_freeze_object</span>) gives true, protocol-level immutability —
            the exact guarantee impact records need; Walrus makes decentralized storage of real evidence
            practical and affordable; low fees and fast finality make freezing a proof cheap enough to do
            at the scale of real-world fieldwork. Wellspring uses the Sui stack not as a buzzword, but
            because no other foundation provides immutability, decentralized storage, and public
            verifiability together.
          </p>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">06</span> First user: Lofi the Yeti's clean-water mission
          </h2>
          <p>
            Wellspring's first operator is Lofi the Yeti's clean-water charity. Each well, pump, and tap
            stand becomes a frozen, verifiable proof — a permanent public record of impact donors can check
            for themselves. Lofi's wells are the beginning. The protocol is built for any organization
            whose work deserves to be believed.
          </p>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">07</span> Trust model
          </h2>
          <p>
            Wellspring is intentionally open: anyone with a wallet can freeze a proof. The protocol does
            not pretend to judge whether a claim is true at the moment of freezing. What it guarantees is
            permanence and attribution — every proof is forever tied to the creator's address and can never
            be quietly altered after the fact. This shifts accountability from "trust the database" to
            "trust the public record." Reputation, organizational verification, and witness attestation are
            natural layers on top of this foundation.
          </p>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">08</span> Roadmap
          </h2>
          <p>
            The current protocol delivers the core loop: store, freeze, verify, browse. Planned layers
            extend it without changing that foundation:
          </p>
          <ul className="lp-list">
            <li>
              <b>Organization profiles:</b> a verifiable track record per organization, aggregating all of
              its frozen proofs.
            </li>
            <li>
              <b>Reputation &amp; verification:</b> on-chain signals that distinguish verified organizations
              and trusted creators.
            </li>
            <li>
              <b>Seal integration:</b> selective privacy for sensitive donor or beneficiary data, while
              keeping the proof of impact public.
            </li>
            <li>
              <b>Witness co-signing:</b> independent parties attesting to a proof at the moment of freezing.
            </li>
            <li>
              <b>Search &amp; filtering:</b> discovery across the Ledger by organization, location, and date
              as the record grows.
            </li>
            <li>
              <b>Impact-linked funding (<span className="mono">DeepBook</span>):</b> connecting verified
              impact to on-chain funding flows.
            </li>
          </ul>
        </section>

        <section className="lp-section">
          <h2>
            <span className="lp-num">09</span> Summary
          </h2>
          <p>
            Wellspring makes impact verifiable by default. It replaces "trust us" with a public, permanent,
            tamper-evident record that anyone can check, built on Sui's freezing primitive and Walrus
            storage. Lofi's wells today; any organization's impact tomorrow.
          </p>
          <p className="lp-closing">Proof that good things happened. Frozen forever.</p>
        </section>

        <div className="lp-foot">
          Built by{' '}
          <a href="https://x.com/solution_o1" target="_blank" rel="noopener noreferrer">
            solutiono1
          </a>{' '}
          · Built on Sui · Stored on Walrus
        </div>
      </div>
    </section>
  )
}
