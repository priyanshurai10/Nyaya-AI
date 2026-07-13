import { NextRequest } from "next/server";
import pincodeSearch from "india-pincode-search";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.pincode) {
      return errorResponse("PIN code is required.", 400);
    }
    const pin = body.pincode;

    if (pin.length !== 6) {
      return errorResponse("Invalid PIN code length.", 400);
    }

    const results = pincodeSearch.search(pin);
    if (!results || results.length === 0) {
      return errorResponse("PIN Code not found.", 404);
    }

    const firstMatch = results[0];

    return successResponse(
      {
        pincode: firstMatch.pincode,
        village: firstMatch.office || firstMatch.village || firstMatch.city,
        district: firstMatch.district,
        state: firstMatch.state,
        lat: null,
        lng: null
      },
      "Location found"
    );

  } catch (error: any) {
    console.error("Pincode search error:", error);
    return errorResponse("Internal server error", 500);
  }
}

