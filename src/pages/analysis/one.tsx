import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const One = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/sensors/");
      if (res.ok) {
        const json = await res.json();
        setData(json || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Insights
  const totalRecords = data.length;
  const avgConcentration = useMemo(() => {
    if (!data.length) return 0;
    const s = data.reduce((a, b) => a + (Number(b.Concentration) || 0), 0);
    return Number((s / data.length).toFixed(2));
  }, [data]);

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((d) => {
      const t = d.Type || "Unknown";
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([Type, count]) => ({ Type, count }));
  }, [data]);

  const concentrationOverTime = useMemo(() => {
    const sorted = [...data].sort((a, b) => Number(a.Time) - Number(b.Time));
    return sorted.slice(0, 200).map((d) => ({ Time: d.Time, Concentration: d.Concentration }));
  }, [data]);

  return (
    <div className="bg-background flex w-full flex-col">
      <SiteHeader heading="Analysis-I" />
      <main className="flex flex-col">
        <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dataset Insights</h2>
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              {loading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin"/>Refreshing...</> : "Refresh"}
            </Button>
          </div>

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Average Concentration</p>
              <p className="text-2xl font-bold">{avgConcentration}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Unique Types</p>
              <p className="text-2xl font-bold">{typeCounts.length}</p>
            </Card>
          </div>

          {/* Chart 1: Count by Type (Bar) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Count by Type</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeCounts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="Type" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Concentration over Time (Line) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Concentration over Time</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={concentrationOverTime} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="Time" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="Concentration" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default One;
