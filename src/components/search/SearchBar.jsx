import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onSearch, placeholder = 'Search...', autoFocus = false }) {
  const [localValue, setLocalValue] = useState(value || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localValue.trim()) {
      onSearch(localValue.trim());
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-12 pl-10 pr-10 bg-bg-secondary border border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bg-tertiary"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      )}
    </form>
  );
}
