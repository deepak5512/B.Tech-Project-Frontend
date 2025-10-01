import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type SensorData = {
  id: string;
  Time: number;
  sensor_readings: number[];
  Type: string;
  Concentration: number;
};

export const columns: ColumnDef<SensorData>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-mono text-xs">{row.getValue("id")}</div>;
    },
  },
  {
    accessorKey: "Time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const time = row.getValue("Time") as number;
      return <div>{time}</div>;
    },
  },
  {
    accessorKey: "Type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("Type")}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "Concentration",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Concentration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const concentration = row.getValue("Concentration") as number;
      return <div>{concentration}</div>;
    },
    filterFn: (row, id, value) => {
      const concentration = row.getValue(id) as number;
      const [min, max] = value as [number, number];
      if (min !== undefined && max !== undefined) {
        return concentration >= min && concentration <= max;
      }
      if (min !== undefined) {
        return concentration >= min;
      }
      if (max !== undefined) {
        return concentration <= max;
      }
      return true;
    },
  },
  {
    accessorKey: "sensor_readings",
    header: "Sensor Readings",
    cell: ({ row }) => {
      const readings = row.getValue("sensor_readings") as number[];
      return (
        <div className="max-w-[200px]">
          <div className="text-xs text-muted-foreground mb-1">
            {readings.length} readings
          </div>
          <div className="text-xs font-mono bg-muted p-1 rounded truncate">
            {readings.length > 0 
              ? readings.map(r => r.toFixed(2)).join(", ")
              : "No readings"
            }
          </div>
        </div>
      );
    },
  },
];