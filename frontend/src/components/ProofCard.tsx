import type { Proof } from '../data'
import { IMG } from '../data'

export function ProofCard({ proof, onOpen }: { proof: Proof; onOpen: (id: string) => void }) {
  return (
    <div className="card" onClick={() => onOpen(proof.id)}>
      <div className="card-img">
        <img className="proof-photo" src={IMG[proof.img]} alt="" />
        <div className="seal-tag">
          <span className="s"></span>SEALED
        </div>
      </div>
      <div className="card-body">
        <h3>{proof.title}</h3>
        <div className="meta">
          <svg className="pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {proof.loc}
        </div>
        <div className="card-foot">
          <span className="addr">{proof.by}</span>
          <span className="stamp">{proof.ts.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  )
}
