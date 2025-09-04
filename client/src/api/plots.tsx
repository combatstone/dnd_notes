// client/src/api/plots.ts
import { type Plot, type InsertPlot } from "@shared/schema";

export const getPlots = async (campaignId: string): Promise<Plot[]> => {
  const response = await fetch(`/api/plots/${campaignId}`);
  if (!response.ok) throw new Error("Failed to fetch plots");
  return response.json();
};

export const createPlot = async (plotData: InsertPlot): Promise<Plot> => {
  const response = await fetch("/api/plots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plotData),
  });
  if (!response.ok) throw new Error("Failed to create plot");
  return response.json();
};

export const updatePlot = async (
  plotId: string,
  plotData: Partial<InsertPlot>
): Promise<Plot> => {
  const response = await fetch(`/api/plots/${plotId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plotData),
  });
  if (!response.ok) throw new Error("Failed to update plot");
  return response.json();
};

export const deletePlot = async (plotId: string): Promise<void> => {
  const response = await fetch(`/api/plots/${plotId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete plot");
};