const STEPS = ['Describe', 'Review', 'Journey'] as const;

export default function PlanStepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 mb-5 px-1">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0"
                style={{
                  background: active || done ? 'var(--violet)' : 'var(--glass)',
                  border: active || done ? 'none' : '1px solid var(--line)',
                  color: active || done ? 'white' : 'var(--text-faint)',
                }}
              >
                {n}
              </span>
              <span
                className="text-[11.5px] font-medium hidden sm:inline"
                style={{ color: active ? 'var(--text)' : 'var(--text-faint)' }}
              >
                {label}
              </span>
            </div>
            {n < STEPS.length && (
              <span className="w-4 h-px shrink-0" style={{ background: done ? 'var(--violet)' : 'var(--line)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
