// import React, { useState, useRef, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Filter as FilterIcon } from 'lucide-react'

// type FilterType = 'select' | 'multi'

// interface FilterOption {
//   label: string
//   value: string
// }

// interface FilterItem {
//   key: string
//   label: string
//   options: FilterOption[]
//   type: FilterType
//   defaultValue: string | string[]
// }

// interface FilterBarProps {
//   filters: FilterItem[]
//   onChange: (selected: Record<string, string | string[]>) => void
// }

// export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
//   const initialState: Record<string, any> = {}
//   for (const f of filters) {
//     initialState[f.key] = f.defaultValue
//   }

//   const [selected, setSelected] = useState(initialState)
//   const [expanded, setExpanded] = useState(false)

//   const updateFilter = (key: string, value: any) => {
//     const updated = { ...selected, [key]: value }
//     setSelected(updated)
//     onChange(updated)
//   }

//   const resetFilters = () => {
//     setSelected(initialState)
//     onChange(initialState)
//   }

//   const clearFilters = () => {
//     const cleared: Record<string, any> = {}
//     for (const f of filters) {
//       cleared[f.key] = f.type === 'multi' ? [] : ''
//     }
//     setSelected(cleared)
//     onChange(cleared)
//   }

//   return (
//     <div className="relative inline-block">
//       {/* Filter Icon Button */}
//       <button
//         onClick={() => setExpanded((prev) => !prev)}
//         aria-expanded={expanded}
//         className="p-2 rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm"
//       >
//         <FilterIcon className="w-5 h-5 text-gray-600" />
//       </button>

//       {/* Filter Panel */}
//       <AnimatePresence>
//         {expanded && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: -10 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: -10 }}
//             transition={{ duration: 0.2 }}
//             className="absolute z-10 mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[300px] space-y-4 overflow-hidden"
//           >
//             {/* Filter Fields */}
//             {filters.map((filter) => (
//               <div key={filter.key} className="space-y-1">
//                 <div className="text-sm text-gray-600 font-medium">{filter.label}</div>

//                 {filter.type === 'select' && (
//                   <select
//                     className="border border-gray-300 px-3 py-1 rounded-md text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-400 w-full"
//                     value={selected[filter.key]}
//                     onChange={(e) => updateFilter(filter.key, e.target.value)}
//                   >
//                     {filter.options.map((opt) => (
//                       <option key={opt.value} value={opt.value}>
//                         {opt.label}
//                       </option>
//                     ))}
//                   </select>
//                 )}

//                 {filter.type === 'multi' && (
//                   <div className="flex flex-wrap gap-2">
//                     {filter.options.map((opt) => {
//                       const isActive = (selected[filter.key] as string[]).includes(opt.value)
//                       return (
//                         <motion.button
//                           key={opt.value}
//                           whileTap={{ scale: 0.95 }}
//                           aria-pressed={isActive}
//                           className={`px-3 py-1 rounded-full border text-sm transition-all ${
//                             isActive
//                               ? 'bg-blue-500 text-white border-blue-500'
//                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                           }`}
//                           onClick={() => {
//                             const current = selected[filter.key] as string[]
//                             const next = current.includes(opt.value)
//                               ? current.filter((v) => v !== opt.value)
//                               : [...current, opt.value]
//                             updateFilter(filter.key, next)
//                           }}
//                         >
//                           {opt.label}
//                         </motion.button>
//                       )
//                     })}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {/* Control Buttons */}
//             <div className="flex justify-end gap-4 pt-2 border-t border-gray-100">
//               <button
//                 onClick={resetFilters}
//                 className="text-sm text-gray-600 hover:underline"
//               >
//                 Reset
//               </button>
//               <button
//                 onClick={clearFilters}
//                 className="text-sm text-red-600 hover:underline"
//               >
//                 Clear All
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter as FilterIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import { parseISO } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "./ui/button";

type FilterType = "select" | "multi" | "daterange";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterItem {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[]; // only for select/multi
  defaultValue: any;
}

interface FilterBarProps {
  filters: FilterItem[];
  onChange: (selected: Record<string, any>) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const initialState: Record<string, any> = {};
  for (const f of filters) {
    initialState[f.key] = f.defaultValue;
  }

  const [selected, setSelected] = useState(initialState);
  const [expanded, setExpanded] = useState(false);

  const updateFilter = (key: string, value: any) => {
    const updated = { ...selected, [key]: value };
    setSelected(updated);
    onChange(updated);
  };

  const resetFilters = () => {
    setSelected(initialState);
    onChange(initialState);
  };

  const clearFilters = () => {
    const cleared: Record<string, any> = {};
    for (const f of filters) {
      if (f.type === "multi") cleared[f.key] = [];
      else if (f.type === "daterange") cleared[f.key] = { from: "", to: "" };
      else cleared[f.key] = "";
    }
    setSelected(cleared);
    onChange(cleared);
  };

  return (
    <div className="relative inline-block">
      {/* Filter Icon Button */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="p-2 rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm"
      >
        <FilterIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[320px] space-y-4"
          >
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-1">
                <div className="text-sm text-gray-600 font-medium">
                  {filter.label}
                </div>

                {/* Select */}
                {filter.type === "select" && (
                  <select
                    className="border border-gray-300 px-3 py-1 rounded-md text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-400 w-full"
                    value={selected[filter.key]}
                    onChange={(e) => updateFilter(filter.key, e.target.value)}
                  >
                    {(filter.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Multi */}
                {filter.type === "multi" && (
                  <div className="flex flex-wrap gap-2">
                    {(filter.options ?? []).map((opt) => {
                      const isActive = (
                        selected[filter.key] as string[]
                      ).includes(opt.value);
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.95 }}
                          aria-pressed={isActive}
                          className={`px-3 py-1 rounded-full border text-sm transition-all ${
                            isActive
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => {
                            const current = selected[filter.key] as string[];
                            const next = current.includes(opt.value)
                              ? current.filter((v) => v !== opt.value)
                              : [...current, opt.value];
                            updateFilter(filter.key, next);
                          }}
                        >
                          {opt.label}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Daterange */}
                {filter.type === "daterange" && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500">From</span>
                      <DatePicker
                        selected={
                          selected[filter.key]?.from
                            ? parseISO(selected[filter.key].from)
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (date) {
                            updateFilter(filter.key, {
                              ...selected[filter.key],
                              from: date.toISOString().split("T")[0],
                            });
                          }
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Start Date"
                        className="border px-2 py-1 rounded text-sm"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500">To</span>
                      <DatePicker
                        selected={
                          selected[filter.key]?.to
                            ? parseISO(selected[filter.key].to)
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (date) {
                            updateFilter(filter.key, {
                              ...selected[filter.key],
                              to: date.toISOString().split("T")[0],
                            });
                          }
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="End Date"
                        className="border px-2 py-1 rounded text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Control Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <Button
                onClick={() => setExpanded(false)}
                className="text-sm hover:underline"
              >
                Done
              </Button>

              <div className="flex gap-4">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Reset
                </button>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
