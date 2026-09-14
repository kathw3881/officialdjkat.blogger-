import { NextResponse } from "next/server";
import { authorizationUrl } from "../../../../../lib/google";

export async function GET() {
  return NextResponse.redirect(authorizationUrl());
}
