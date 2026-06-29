export type StepState = 'idle' | 'active' | 'done'

const STEP_LABELS = ['Storing evidence on Walrus', 'Sealing object on Sui', 'Confirming on-chain']

export function FreezeOverlay({ show, steps }: { show: boolean; steps: StepState[] }) {
  return (
    <div className={`freezing ${show ? 'show' : ''}`}>
      <div className="freeze-box">
        <div className="ice-anim">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9fd4e6" strokeWidth="1.4">
            <path d="M12 2v20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12h20M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
          </svg>
        </div>
        <h3>Freezing your proof</h3>
        <div className="steps">
          {STEP_LABELS.map((label, i) => {
            const st = steps[i]
            return (
              <div key={i} className={`step ${st === 'active' ? 'active' : ''} ${st === 'done' ? 'done' : ''}`}>
                <span className="tick">{st === 'done' ? '✓' : ''}</span>
                {label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
