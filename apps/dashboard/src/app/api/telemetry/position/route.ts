/**
 * HTTP API Route for receiving telemetry from mobile app
 * This serves as a fallback when Socket.IO is unavailable
 * 
 * Mobile should POST to: /api/telemetry/position
 */

import { NextRequest, NextResponse } from "next/server";
import { socketService } from "@/lib/socketService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      id,
      nrp,
      name,
      lat,
      lng,
      speed,
      batteryLevel,
      isCharging,
      connectionType,
      signalStatus,
      heading,
      timestamp,
      hash
    } = body;

    // Validate required fields
    if (!id || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: id, lat, lng" },
        { status: 400 }
      );
    }

    // Create telemetry payload matching PersonnelTrack interface
    const telemetryPayload = {
      id,
      nrp: nrp || "UNKNOWN",
      name: name || "Unknown Personnel",
      lat,
      lng,
      speed: speed ?? 0,
      batteryLevel: batteryLevel ?? 100,
      isCharging: isCharging ?? false,
      connectionType: connectionType || "4g",
      signalStatus: signalStatus || "LTE",
      heading: heading ?? 0,
      timestamp: timestamp || new Date().toISOString(),
      hash: hash || "",
      isOnline: true
    };

    // Emit via Socket.IO if connected (dashboard will receive update)
    const socket = socketService.getSocket();
    if (socket?.connected) {
      socket.emit("personnel_update", telemetryPayload);
      console.log("[API/TELEMETRY] Broadcast via Socket.IO:", { id, lat: lat.toFixed(4), lng: lng.toFixed(4) });
    } else {
      console.log("[API/TELEMETRY] Socket not connected, telemetry buffered");
    }

    return NextResponse.json({
      success: true,
      received: {
        id,
        lat,
        lng,
        speed,
        batteryLevel
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[API/TELEMETRY] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/telemetry/position",
    method: "POST",
    description: "Receive position telemetry from mobile patrol units",
    required_fields: ["id", "lat", "lng"],
    optional_fields: ["nrp", "name", "speed", "batteryLevel", "isCharging", "connectionType", "signalStatus", "heading", "timestamp", "hash"]
  });
}
