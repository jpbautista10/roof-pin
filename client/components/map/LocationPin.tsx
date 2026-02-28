import { House } from "lucide-react";
import { getContrastTextColor, getValidBrandColor } from "@/lib/color";
import { cn } from "@/lib/utils";

interface LocationPinProps {
  className?: string;
  color?: string;
}

export default function LocationPin({ className, color }: LocationPinProps) {
  const pinColor = getValidBrandColor(color);
  const pinContrastColor = getContrastTextColor(pinColor);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div
        className="grid h-10 w-10 place-items-center rounded-full border-2 shadow-lg"
        style={{ backgroundColor: pinColor, borderColor: pinContrastColor }}
      >
        <House className="h-4 w-4" style={{ color: pinContrastColor }} />
      </div>
      <div
        className="-mt-2 h-3 w-3 rotate-45 border-b-2 border-r-2"
        style={{ backgroundColor: pinColor, borderColor: pinContrastColor }}
      />
    </div>
  );
}
