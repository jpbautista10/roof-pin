import { Check, Filter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WorkTypeFilterProps {
  workTypes: string[];
  /** null = all types selected (default) */
  selected: string[] | null;
  onChange: (selected: string[] | null) => void;
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

  const hasFilter = selected !== null;

  function toggleType(type: string) {
    if (selected === null) {
      onChange(workTypes.filter((t) => t !== type));
      return;
    }
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
      return;
    }
    const next = [...selected, type];
    if (next.length === workTypes.length) {
      onChange(null);
    } else {
      onChange(next);
    }
  }

  function selectAll() {
    onChange(null);
  }

  if (workTypes.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium text-slate-700/90 transition-colors hover:bg-white/80 sm:px-3"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          boxShadow: "0 0.5px 0 rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Work Type</span>
        {hasFilter && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] font-semibold text-white">
            {selected?.length ?? 0}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-3 top-auto z-50 mt-1.5 rounded-2xl shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:left-auto sm:w-52"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            boxShadow:
              "0 0.5px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
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
              const isSelected = selected === null || selected.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 sm:py-1.5 sm:text-xs"
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
