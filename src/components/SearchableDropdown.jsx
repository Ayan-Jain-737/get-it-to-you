import React, { useState, useRef, useEffect, useMemo } from 'react';

const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  disabled = false,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Normalize options to handle both simple arrays and group arrays
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') return { value: opt, label: opt };
      return opt;
    });
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update visual text when closed
  useEffect(() => {
    if (!isOpen) {
      let label = "";
      for (const opt of normalizedOptions) {
        if (opt.groupLabel) {
          const found = opt.options.find(o => o.value === value);
          if (found) label = found.label;
        } else if (opt.value === value) {
          label = opt.label;
        }
      }
      setSearchTerm(label || value || "");
    } else {
      setSearchTerm("");
    }
  }, [value, isOpen, normalizedOptions]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return normalizedOptions;
    const lowerSearch = searchTerm.toLowerCase();
    
    return normalizedOptions.map(opt => {
      if (opt.groupLabel) {
        const filteredGroupOptions = opt.options.filter(o => o.label.toLowerCase().includes(lowerSearch));
        if (filteredGroupOptions.length > 0) {
          return { ...opt, options: filteredGroupOptions };
        }
        return null;
      }
      return opt.label.toLowerCase().includes(lowerSearch) ? opt : null;
    }).filter(Boolean);
  }, [normalizedOptions, searchTerm]);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`border-2 border-on-surface bg-surface-container-lowest shadow-[2px_2px_0px_0px_#141414] focus-within:bg-primary-container focus-within:outline-none outline-none transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      >
        <div className="flex items-center px-3 py-2 md:py-3">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent font-body-md text-body-md font-bold focus:outline-none outline-none border-none ring-0 focus:ring-0 placeholder-on-surface-variant truncate"
          />
          <span 
            className="material-symbols-outlined text-on-surface ml-2 flex-shrink-0 cursor-pointer select-none p-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
          >
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute top-[100%] left-0 w-full mt-1 bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_#141414] max-h-56 overflow-y-auto z-[9999] animate-in slide-in-from-top-2 duration-150">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => {
              if (opt.groupLabel) {
                return (
                  <div key={`group-${i}`}>
                    <div className="px-3 py-1.5 bg-surface-variant text-[10px] font-label-mono font-black uppercase text-on-surface sticky top-0 z-10 border-b border-on-surface/20">
                      {opt.groupLabel}
                    </div>
                    {opt.options.map(subOpt => (
                      <div
                        key={subOpt.value}
                        className={`px-4 py-2.5 font-body-md cursor-pointer hover:bg-primary-container border-b border-on-surface/10 last:border-0 ${value === subOpt.value ? 'bg-primary-container font-bold' : ''}`}
                        onClick={() => handleSelect(subOpt.value)}
                      >
                        {subOpt.label}
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div
                  key={opt.value}
                  className={`px-3 py-2.5 font-body-md cursor-pointer hover:bg-primary-container border-b border-on-surface/10 last:border-0 ${value === opt.value ? 'bg-primary-container font-bold' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              );
            })
          ) : (
            <div className="p-3 font-body-md text-on-surface-variant italic">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
