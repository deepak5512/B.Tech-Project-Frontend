import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

const Two = () => {
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

  // Build series for sensor_readings statistics
  const sensorDensity = useMemo(() => {
    // approximate density: average of sensor_readings per record
    return data.slice(0, 200).map((d) => {
      const arr: number[] = Array.isArray(d.sensor_readings) ? d.sensor_readings : [];
      const mean = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
      return { Time: d.Time, MeanReading: Number(mean.toFixed(3)) };
    });
  }, [data]);

  const scatterData = useMemo(() => {
    // relate Concentration and MeanReading
    return sensorDensity.map((s, idx) => ({
      MeanReading: s.MeanReading,
      Concentration: Number(data[idx]?.Concentration || 0)
    })).filter(p => !Number.isNaN(p.Concentration));
  }, [sensorDensity, data]);

  return (
    <div className="bg-background flex w-full flex-col">
      <SiteHeader heading="Analysis-II" />
      <main className="flex flex-col">
        <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Advanced Insights</h2>
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              {loading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin"/>Refreshing...</> : "Refresh"}
            </Button>
          </div>

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Sampled Records</p>
              <p className="text-2xl font-bold">{data.slice(0,200).length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">With Sensor Readings</p>
              <p className="text-2xl font-bold">{data.filter(d => Array.isArray(d.sensor_readings) && d.sensor_readings.length).length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Timespan (min→max)</p>
              <p className="text-2xl font-bold">
                {data.length ? `${Math.min(...data.map(d=>d.Time))} → ${Math.max(...data.map(d=>d.Time))}` : '—'}
              </p>
            </Card>
          </div>

          {/* Chart 1: Mean Sensor Reading over Time (Area) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Mean Sensor Reading over Time</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorDensity} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="Time" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="MeanReading" stroke="#6366f1" fill="#a5b4fc" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Concentration vs Mean Reading (Scatter) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Concentration vs Mean Reading</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="MeanReading" name="Mean Reading" />
                  <YAxis dataKey="Concentration" name="Concentration" />
                  <ZAxis range={[60, 60]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={scatterData} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Two;
