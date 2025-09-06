import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  searchable?: boolean;
  required?: boolean;
  clearable?: boolean;
  maxHeight?: string;
  noOptionsMessage?: string;
  loading?: boolean;
  onSearch?: (searchTerm: string) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  label,
  error,
  disabled = false,
  children,
  searchable = false,
  clearable = true,
  maxHeight = "200px",
  noOptionsMessage = "No options found",
  loading = false,
  onSearch,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Get the selected option label
  const selectedOption = options?.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  // Filter options based on search term
  const filteredOptions = useMemo(() => 
    options?.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !option.disabled
    ) || [], [options, searchTerm]
  );

  // Handle option selection
  const handleOptionSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
    setInputValue("");
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, highlightedIndex, filteredOptions, handleOptionSelect]);

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    setInputValue("");
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setInputValue(newSearchTerm);
    setHighlightedIndex(-1);
    
    if (onSearch) {
      onSearch(newSearchTerm);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // If not searchable, render the original select element
  if (!searchable) {
    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 cursor-pointer transition-all duration-300 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg ${
            error ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' : ''
          } ${
            disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''
          } ${className}`}
        >
          {placeholder && <option value="" className="text-gray-500 dark:text-gray-400">{placeholder}</option>}
          {children ? (
            children
          ) : options ? (
            options.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-900 dark:text-white">
                {option.label}
              </option>
            ))
          ) : null}
        </select>
        <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors duration-200"></i>
        {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1 transition-colors duration-200">{error}</p>}
      </div>
    );
  }

  // Render searchable dropdown
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div
          className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer transition-all duration-300 text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg ${
            error ? 'border-red-500 dark:border-red-400' : ''
          } ${
            disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''
          } ${
            isOpen ? 'ring-2 ring-primary-500 dark:ring-primary-400 border-primary-500 dark:border-primary-400' : ''
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? 'select-input-options' : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {isOpen ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleSearchChange}
                  placeholder={placeholder}
                  className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <span className={`${!displayValue ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                  {displayValue || placeholder}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-2">
              {clearable && value && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-200"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div 
              ref={optionsRef}
              className="overflow-y-auto"
              style={{ maxHeight }}
              role="listbox"
              id="select-input-options"
            >
              {loading ? (
                <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? noOptionsMessage : "No options available"}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${
                      option.value === value
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                        : index === highlightedIndex
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${
                      option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.label}</span>
                      {option.value === value && (
                        <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1 transition-colors duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectInput; 