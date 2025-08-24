import React, { useState, useEffect } from "react";
import { Map } from "lucide-react";
import EmergencyServices from "./EmergencyServices";
import type { EmergencyEntity, Incident } from "@/lib/emergency-data";

interface DynamicEmergencyMapProps {
  height?: string;
  showUserLocation?: boolean;
  showEntities?: boolean;
  showIncidents?: boolean;
  onEntityClick?: (entity: EmergencyEntity) => void;
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

// Loading component
const ServicesLoading = ({ height }: { height: string }) => (
  <div className="relative" style={{ height }}>
    <div className="absolute inset-0 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
      <div className="text-center text-slate-500">
        <Map className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
        <p className="font-medium">Loading Emergency Services...</p>
        <p className="text-sm">Initializing emergency response system</p>
      </div>
    </div>
  </div>
);

export default function DynamicEmergencyMap(props: DynamicEmergencyMapProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure this only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return <ServicesLoading height={props.height || "400px"} />;
  }

  return (
    <EmergencyServices
      height={props.height}
      onEntityClick={props.onEntityClick}
      onIncidentClick={props.onIncidentClick}
      className={props.className}
    />
  );
}
