import React, { useState, useRef, useEffect } from 'react';
import { searchUniversities } from '../../data/moroccoUniversities';

const UniversityAutocomplete = ({
  value,
  onChange,
  placeholder = "start typing to find...",
  label = "Université",
  showLabel = true,
  helperText = "Commencez à taper pour voir les suggestions d'universités",
  className = "",
  required = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    onChange(inputValue);

    if (inputValue.length >= 2) {
      const results = searchUniversities(inputValue);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle university selection
  const handleSelect = (university) => {
    setQuery(university.name);
    onChange(university.name);
    setShowDropdown(false);
    setSuggestions([]);
  };

  // Handle focus
  const handleFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query || value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400 placeholder:opacity-50 transition-all"
        />

        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((university, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(university)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm">{university.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      university.type === 'public'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {university.type === 'public' ? 'Public' : 'Privé'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {university.city} · {university.region}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default UniversityAutocomplete;
