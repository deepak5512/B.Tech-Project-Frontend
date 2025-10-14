"use client";

// Import Switch and Label from your components library
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define the chart configuration
const chartConfig = {
  MeanReading: {
    label: "Mean Reading",
    color: "hsl(var(--chart-1))", // Using shadcn/ui's theme variables
  },
} satisfies ChartConfig;

const AnalysisPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // NEW: State to control live data fetching
  const [isLive, setIsLive] = useState(false);

  // Fetches the entire dataset, replacing existing data
  const fetchInitialData = async () => {
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

  // Initial data fetch on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // NEW: Effect for handling live data polling
  useEffect(() => {
    if (!isLive) {
      return; // Do nothing if live mode is off
    }

    // Set up an interval to fetch data every 3 seconds
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/sensors/");
        if (res.ok) {
          const latestData = await res.json();
          // Append new data points to the existing data state
          // NOTE: For production, a more efficient API endpoint that only returns
          // new records (e.g., /sensors?since=<timestamp>) would be better.
          setData((currentData) => {
            const existingTimes = new Set(currentData.map(d => d.Time));
            const newItems = latestData.filter((d: any) => !existingTimes.has(d.Time));
            return [...currentData, ...newItems];
          });
        }
      } catch (error) {
        console.error("Failed to fetch live data:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup function to clear the interval when the component unmounts or isLive changes
    return () => clearInterval(intervalId);
  }, [isLive]); // This effect depends only on the isLive state

  // Prepare data for the chart
  const chartData = useMemo(() => {
    // MODIFIED: Use the last 2000 records to create a "scrolling" chart effect in live mode
    return data.slice(-2000).map((d) => {
      const arr: number[] = Array.isArray(d.sensor_readings) ? d.sensor_readings : [];
      const mean = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return { Time: d.Time, MeanReading: Number(mean.toFixed(3)) };
    });
  }, [data]);

  // Calculate timespan for the card footer
  const timeSpan = useMemo(() => {
    if (chartData.length === 0) return '—';
    const times = chartData.map(d => d.Time);
    // This will now dynamically update as new data arrives
    return `${Math.min(...times)} → ${Math.max(...times)}`;
  }, [chartData]);


  return (
    <div className="bg-background flex w-full flex-col">
      <SiteHeader heading="Analysis-II" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Data Analysis</h2>
          <div className="flex items-center gap-4">
            {/* NEW: Live Data Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="live-mode"
                checked={isLive}
                onCheckedChange={setIsLive}
              />
              <Label htmlFor="live-mode">Live Data</Label>
            </div>
            {/* MODIFIED: Disable refresh button when loading or in live mode */}
            <Button variant="outline" onClick={fetchInitialData} disabled={loading || isLive}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        {/* Insight Cards (will now update in real-time) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sampled Records (Chart)</CardDescription>
              <CardTitle className="text-4xl">{chartData.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Records with Readings</CardDescription>
              <CardTitle className="text-4xl">
                {data.filter(d => Array.isArray(d.sensor_readings) && d.sensor_readings.length > 0).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Timespan (min→max)</CardDescription>
              <CardTitle className="text-4xl">{timeSpan}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Chart Card (will now update in real-time) */}
        <Card>
          <CardHeader>
            <CardTitle>Mean Sensor Reading over Time</CardTitle>
            <CardDescription>
              Showing the average sensor reading across the sampled time period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeOpacity={0.2} />
                <XAxis
                  dataKey="Time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="MeanReading"
                  type="natural"
                  fill="var(--color-MeanReading)"
                  fillOpacity={0.4}
                  stroke="var(--color-MeanReading)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="text-muted-foreground">
                Displaying data for the time range: {timeSpan}
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AnalysisPage;