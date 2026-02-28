import { House } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationPinProps {
  className?: string;
}

export default function LocationPin({ className }: LocationPinProps) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-slate-900 shadow-lg">
        <House className="h-4 w-4 text-white" />
      </div>
      <div className="-mt-2 h-3 w-3 rotate-45 border-b-2 border-r-2 border-white bg-slate-900" />
    </div>
  );
}
