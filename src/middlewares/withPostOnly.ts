import { jsonError } from "@/lib/json-response";
import { NextRequest } from "next/server";

const withPostOnly = async (request: NextRequest) => {
  if (request.method !== "POST") {
    return jsonError("Method not allowed. Only POST is accepted.", 405);
  }
  return null;
};

export default withPostOnly;
