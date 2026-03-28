const MODES = ['Cab', 'Train', 'Flight', 'Bus', 'Metro', 'Auto'];
const modeIcons = { Cab: '🚕', Train: '🚂', Flight: '✈️', Bus: '🚌', Metro: '🚇', Auto: '🛺' };

const emptyStep = () => ({ mode: 'Cab', from: '', to: '', transportName: '', departureTime: '' });

export default function TransportStepBuilder({ steps, onChange }) {
  const update = (index, field, value) => {
    const updated = steps.map((s, i) => i === index ? { ...s, [field]: value } : s);
    onChange(updated);
  };

  const addStep = () => onChange([...steps, emptyStep()]);

  const removeStep = (index) => onChange(steps.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="relative bg-dark-700 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <span className="text-sm text-white/60 font-medium">Step {index + 1}</span>
            </div>
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                Remove
              </button>
            )}
          </div>

          {/* Mode selector */}
          <div className="mb-3">
            <label className="label">Transport Mode</label>
            <div className="flex flex-wrap gap-2">
              {MODES.map(mode => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => update(index, 'mode', mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    step.mode === mode
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {modeIcons[mode]} {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">From</label>
              <input
                type="text"
                value={step.from}
                onChange={e => update(index, 'from', e.target.value)}
                placeholder="e.g. NIT Trichy"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">To</label>
              <input
                type="text"
                value={step.to}
                onChange={e => update(index, 'to', e.target.value)}
                placeholder="e.g. Trichy Railway Station"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Transport Name <span className="text-white/30">(optional)</span></label>
              <input
                type="text"
                value={step.transportName}
                onChange={e => update(index, 'transportName', e.target.value)}
                placeholder="Train no., Flight name, etc."
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Departure Time <span className="text-white/30">(optional)</span></label>
              <input
                type="datetime-local"
                value={step.departureTime}
                onChange={e => update(index, 'departureTime', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="w-full border-2 border-dashed border-white/10 hover:border-brand-500/40 rounded-xl py-3 text-sm text-white/40 hover:text-brand-400 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span className="text-lg">+</span> Add Transport Step
      </button>
    </div>
  );
}
