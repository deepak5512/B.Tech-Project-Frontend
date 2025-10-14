import { SiteHeader } from "@/components/site-header";
import { DataTable } from "@/components/data/data-table";
import { columns } from "@/components/data/columns";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface SensorData {
  id: string;
  Time: number;
  Type: string;
  Concentration: number;
  sensor_readings: number[];
}

export default function DataTablePage() {
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${API_URL}/sensors/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="bg-background flex w-full flex-col">
        <SiteHeader heading="Sensor Data" />
        <main className="flex flex-col">
          <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading sensor data...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex w-full flex-col">
        <SiteHeader heading="Sensor Data" />
        <main className="flex flex-col">
          <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-red-600 text-center">
                <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background flex w-full flex-col">
      <SiteHeader heading="Sensor Data" />
      <main className="flex flex-col">
        <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sensor Data Table</h2>
              <p className="text-muted-foreground">
                View and filter all sensor data from the database
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="">
            <DataTable columns={columns} data={data} />
          </div>

          {data.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sensor data found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add some data using the dashboard to see it here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
