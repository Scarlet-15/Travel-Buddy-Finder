export const darkSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#242424',
    borderColor: state.isFocused ? '#f97316' : 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '4px 4px',
    boxShadow: 'none',
    minHeight: '46px',
    '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#2e2e2e' : 'transparent',
    color: '#f5f5f5',
    borderRadius: '8px',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#3a3a3a' },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f5f5f5',
  }),
  input: (base) => ({
    ...base,
    color: '#f5f5f5',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgba(255,255,255,0.3)',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'rgba(255,255,255,0.3)',
    '&:hover': { color: 'rgba(255,255,255,0.5)' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'rgba(255,255,255,0.3)',
    '&:hover': { color: '#ef4444' },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'rgba(255,255,255,0.4)',
  }),
};
