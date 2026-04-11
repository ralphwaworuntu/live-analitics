import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nrp = searchParams.get('nrp') || 'default';

  // Return a mock planned route polygon (Sektor Kupang Kota area path)
  const plannedRoute = [
    { lat: -10.158, lng: 123.606 },
    { lat: -10.160, lng: 123.610 },
    { lat: -10.165, lng: 123.615 },
    { lat: -10.170, lng: 123.612 },
    { lat: -10.175, lng: 123.605 },
    { lat: -10.170, lng: 123.595 },
    { lat: -10.165, lng: 123.590 },
    { lat: -10.160, lng: 123.595 },
  ];

  return NextResponse.json({
    missionId: "M-001",
    title: "Patroli Sektor Kupang Kota",
    assignedTo: nrp,
    plannedRoute
  });
}
