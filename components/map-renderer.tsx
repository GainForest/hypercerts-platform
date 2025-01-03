// components/MapRenderer.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMetadata } from "@/utils/metadata";
import { type HypercertMetadata, validateMetaData } from "@hypercerts-org/sdk";
import { CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MapRendererProps {
  uri: string;
}

export type MapData = {
  geoJSON: unknown;
  baseUrl: string;
  metadata: HypercertMetadata;
};
export default function MapRenderer({ uri }: MapRendererProps) {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMapData(uri: string) {
      try {
        const res = await getMetadata(uri);
        const { data } = res;
        const metadata = data;

        const validationResult = validateMetaData(metadata);
        if (!validationResult.valid) {
          throw new Error("Invalid metadata");
        }

        // @ts-ignore
        const geoJSON = JSON.parse(validationResult.data.properties[0].value);
        const polygon = geoJSON.features[0].geometry.coordinates[0];
        const _baseUrl = `https://www.trace.gainforest.app/?polygon=${encodeURI(
          JSON.stringify(polygon)
        )}&satellite=true`;

        setMapData({
          geoJSON,
          baseUrl: _baseUrl,
          metadata: validationResult.data as HypercertMetadata,
        });
      } catch (error) {
        console.error(error);
        setError("Error rendering map");
      }
    }

    if (!uri) return;
    fetchMapData(uri);
  }, [uri]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 h-auto min-h-[300px] max-w-[400px] md:max-w-full aspect-square rounded-xl border border-border overflow-hidden">
      {error ? (
        <>
          <CircleAlert className="text-muted-foreground/75 mb-4" size={50} />
          <p className="text-muted-foreground">An error occured.</p>
        </>
      ) : mapData ? (
        mapData.baseUrl ? (
          <iframe
            height="500"
            width="500"
            src={mapData.baseUrl}
            title={`GeoJSON for ${mapData.metadata.name}`}
            className="h-full w-full"
          />
        ) : (
          <>
            <CircleAlert className="text-muted-foreground/75 mb-4" size={50} />
            <p className="text-muted-foreground">No map found</p>
          </>
        )
      ) : (
        <>
          <Loader2
            className="text-muted-foreground/75 mb-4 animate-spin"
            size={40}
          />
          <p className="text-muted-foreground">Loading map...</p>
        </>
      )}
    </div>
  );
}
