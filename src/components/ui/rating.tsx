"use client";

import { useState, useEffect } from "react";

interface RatingProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: number | string;
  labels?: string[]; // Add labels for each value 1-5
}

export function Rating({
  label,
  error,
  description,
  onChange,
  value,
  min = 1,
  max = 5,
  labels,
  ...props
}: RatingProps) {
  const [currentValue, setCurrentValue] = useState<number>(
    value !== undefined ? Number(value) : 3
  );

  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(Number(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setCurrentValue(newValue);

    if (onChange) {
      onChange(e);
    }
  };

  const getCurrentLabel = () => {
    if (labels && labels.length === 5) {
      return labels[currentValue - 1] || currentValue.toString();
    }
    return currentValue;
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-900">
          {label}
        </label>
        {description && (
          <p className="mt-1 text-sm text-gray-500 italic">{description}</p>
        )}
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            accent-blue-600 hover:accent-blue-700"
          {...props}
        />
        <div className="text-center">
          <span className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
            {getCurrentLabel()}
          </span>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
