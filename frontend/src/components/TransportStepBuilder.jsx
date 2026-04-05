import { Plus, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CreatableSelect from 'react-select/creatable';
import { modeIcons, MODES } from '../constants/icons';
import { LOCATION_OPTIONS } from '../constants/locations';
import { darkSelectStyles } from '../constants/reactSelectDarkTheme';

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
                className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          {/* Mode selector */}
          <div className="mb-3">
            <label className="label">Transport Mode</label>
            <div className="flex flex-wrap gap-2">
              {MODES.map(m => {
                const Icon = modeIcons[m];
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => update(index, 'mode', m)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                      step.mode === m
                        ? 'bg-brand-500 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">From</label>
              <CreatableSelect
                options={LOCATION_OPTIONS}
                styles={darkSelectStyles}
                value={step.from ? { value: step.from, label: step.from } : null}
                onChange={opt => update(index, 'from', opt?.value || '')}
                placeholder="e.g. NIT Trichy"
                isClearable
                formatCreateLabel={val => `Use "${val}"`}
              />
            </div>
            <div>
              <label className="label">To</label>
              <CreatableSelect
                options={LOCATION_OPTIONS}
                styles={darkSelectStyles}
                value={step.to ? { value: step.to, label: step.to } : null}
                onChange={opt => update(index, 'to', opt?.value || '')}
                placeholder="e.g. Trichy Railway Station"
                isClearable
                formatCreateLabel={val => `Use "${val}"`}
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
              <DatePicker
                selected={step.departureTime ? new Date(step.departureTime) : null}
                onChange={d => update(index, 'departureTime', d ? d.toISOString() : '')}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                placeholderText="Pick date & time"
                className="input-field w-full"
                isClearable
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
        <Plus className="w-5 h-5" /> Add Transport Step
      </button>
    </div>
  );
}
