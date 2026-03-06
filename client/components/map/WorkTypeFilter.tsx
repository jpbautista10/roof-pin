import { useState, useRef, useEffect } from "react";
import { Filter, Check, X } from "lucide-react";

interface WorkTypeFilterProps {
  workTypes: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function WorkTypeFilter({
  workTypes,
  selected,
  onChange,
}: WorkTypeFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hasFilter = selected.length > 0 && selected.length < workTypes.length;

  function toggleType(type: string) {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  }

  function selectAll() {
    onChange([]);
  }

  if (workTypes.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-slate-50"
      >
        <Filter className="h-3.5 w-3.5" />
        <span>Work Type</span>
        {hasFilter && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] font-semibold text-white">
            {selected.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-52 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-xs font-semibold text-slate-700">
              Filter by Work Type
            </span>
            {hasFilter && (
              <button
                type="button"
                onClick={selectAll}
                className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {workTypes.map((type) => {
              const isSelected =
                selected.length === 0 || selected.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-slate-700 bg-slate-700 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{type}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
