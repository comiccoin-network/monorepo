"use client";

import { useTimezoneSelect, allTimezones } from "react-timezone-select";

interface FormTimezoneSelectFieldProps {
  label?: string;
  name?: string;
  placeholder?: string;
  selectedTimezone: string;
  setSelectedTimezone: (timezone: string) => void;
  errorText?: string;
  helpText?: string;
  disabled?: boolean;
  isRequired?: boolean;
}

const FormTimezoneSelectField = ({
  label = "Timezone",
  name = "timezone",
  placeholder,
  selectedTimezone,
  setSelectedTimezone,
  errorText,
  helpText = "Please select the timezone that your business operates in.",
  disabled = false,
  isRequired = true,
}: FormTimezoneSelectFieldProps) => {
  // We use 'original' label style for more readable timezone names
  const labelStyle = "original";

  // Add custom timezones to the list
  const timezones = {
    ...allTimezones,
    "America/Toronto": "Toronto",
  };

  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parsedTimezone = parseTimezone(e.currentTarget.value);
    setSelectedTimezone(parsedTimezone.value);
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {isRequired && "*"}
      </label>
      <select
        id={name}
        name={name}
        disabled={disabled}
        onChange={handleChange}
        value={selectedTimezone}
        className={`w-full h-11 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ${
          errorText ? "border-red-500" : "border-gray-300"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
      {errorText && <p className="mt-1 text-sm text-red-600">{errorText}</p>}
    </div>
  );
};

export default FormTimezoneSelectField;
