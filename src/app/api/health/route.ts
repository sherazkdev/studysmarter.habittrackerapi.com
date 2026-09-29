import { jsonSuccess } from "@/lib/json-response";

export async function GET() {
  return jsonSuccess(
    {
      service: "study-smarter-api",
      status: "ok",
    },
    "Healthy.",
    200,
  );
}
