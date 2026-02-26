import { Pin, Tenant, WorkType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hammer, Star, CheckCircle2 } from "lucide-react";

interface StatsViewProps {
  tenant: Tenant;
  pins: Pin[];
}

export default function StatsView({ tenant, pins }: StatsViewProps) {
  const totalProjects = pins.length;

  // Top work type
  const workTypeCounts: Record<string, number> = {};
  pins.forEach((p) => {
    workTypeCounts[p.work_type] = (workTypeCounts[p.work_type] || 0) + 1;
  });
  const topWorkType = Object.entries(workTypeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] as WorkType | undefined;

  // Average rating (only non-privacy pins with stars > 0)
  const ratedPins = pins.filter((p) => !p.privacy_mode && p.stars > 0);
  const avgRating =
    ratedPins.length > 0
      ? ratedPins.reduce((sum, p) => sum + p.stars, 0) / ratedPins.length
      : 0;

  // Sort pins by date_completed (rough sort — Month Year format)
  const monthOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const sortedPins = [...pins].sort((a, b) => {
    const [aMonth, aYear] = a.date_completed.split(" ");
    const [bMonth, bYear] = b.date_completed.split(" ");
    const aVal = Number(aYear) * 12 + monthOrder.indexOf(aMonth);
    const bVal = Number(bYear) * 12 + monthOrder.indexOf(bMonth);
    return bVal - aVal;
  });

  return (
    <div className="absolute inset-0 z-10 bg-slate-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-4 text-center">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${tenant.brand_color}15` }}
              >
                <CheckCircle2
                  className="w-4.5 h-4.5"
                  style={{ color: tenant.brand_color }}
                />
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalProjects}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Total Projects</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-4 text-center">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${tenant.brand_color}15` }}
              >
                <Hammer
                  className="w-4.5 h-4.5"
                  style={{ color: tenant.brand_color }}
                />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {topWorkType || "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Top Work Type</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-4 text-center">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${tenant.brand_color}15` }}
              >
                <Star
                  className="w-4.5 h-4.5"
                  style={{ color: tenant.brand_color }}
                />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Avg. Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Table */}
        <Card className="border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Completed Projects
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-xs font-medium">Neighborhood</TableHead>
                <TableHead className="text-xs font-medium">Work Type</TableHead>
                <TableHead className="text-xs font-medium text-right">
                  Completed
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPins.map((pin) => (
                <TableRow key={pin.id}>
                  <TableCell className="font-medium text-sm text-slate-900">
                    {pin.neighborhood}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                      {pin.work_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {pin.date_completed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
