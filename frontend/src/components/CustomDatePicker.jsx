import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale";

// Register once (outside component)
registerLocale("en-GB", enGB);

// ✅ Safe parser (fixes timezone bug)
const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-");
  return new Date(y, m - 1, d);
};

// ✅ Format Date -> "yyyy-mm-dd" (API safe)
const formatToISO = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const CustomDatePicker = ({
  value, // string (yyyy-mm-dd)
  onChange, // function
  placeholder,
  className = "",
  minDate,
  maxDate,
}) => {
  return (
    <DatePicker
      selected={parseDate(value)}
      onChange={(date) => onChange(formatToISO(date))}
      dateFormat="dd/MM/yyyy"
      locale="en-GB"
      placeholderText={placeholder}
      minDate={minDate}
      maxDate={maxDate}
      className={`border outline-none cursor-pointer rounded-lg px-3 py-2 w-full sm:w-auto ${className}`}
    />
  );
};

export default CustomDatePicker;
