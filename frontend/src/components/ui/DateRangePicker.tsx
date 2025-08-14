"use client";
import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format, addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onDateRangeChange, 
  className = "" 
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState([
    {
      startDate: startDate,
      endDate: endDate,
      key: "selection",
    },
  ]);
  
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempDateRange([
      {
        startDate: startDate,
        endDate: endDate,
        key: "selection",
      },
    ]);
  }, [startDate, endDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        // Don't close on outside click, let user use Cancel/Apply buttons
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateRangeChange = (item: any) => {
    if (item.selection) {
      setTempDateRange([item.selection]);
    }
  };

  const handleApply = () => {
    if (tempDateRange[0].startDate && tempDateRange[0].endDate) {
      onDateRangeChange(tempDateRange[0].startDate, tempDateRange[0].endDate);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setTempDateRange([
      {
        startDate: startDate,
        endDate: endDate,
        key: "selection",
      },
    ]);
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy");
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <div
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-calendar text-gray-500 dark:text-gray-400"></i>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
        <i className={`fas fa-chevron-down text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <DateRange
            ranges={tempDateRange}
            onChange={handleDateRangeChange}
            rangeColors={["#3b82f6"]}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={1}
            direction="horizontal"
            className="dark:bg-gray-800"
          />
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 p-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 