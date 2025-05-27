// src/components/Tabs.jsx
import { useState } from "react";
import PropTypes from "prop-types";

/**
 * Tabs component
 * Props: tabs = [{ label: string, content: ReactNode }]
 */
export default function Tabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]?.label);
  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map(({ label }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`px-4 py-2 -mb-px font-medium transition-colors ${
              active === label
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        {tabs.find((t) => t.label === active)?.content}
      </div>
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
};