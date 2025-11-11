import React, { useState, useRef, useEffect } from 'react';
import { searchLocations } from '../../data/moroccoLocations';

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "start typing to find...",
  label = "Ville/Localité",
  showLabel = true,
  helperText = "Commencez à taper pour voir les suggestions de villes et zones rurales",
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
      const results = searchLocations(inputValue);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle location selection
  const handleSelect = (location) => {
    setQuery(location.name);
    onChange(location.name);
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
            {suggestions.map((location, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(location)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{location.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      location.type === 'city'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {location.type === 'city' ? 'Ville' : 'Rural'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {location.region}
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

export default LocationAutocomplete;
