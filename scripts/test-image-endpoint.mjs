/**
 * POST /api/v1/tutor/image smoke check (requires dev server + .env.local).
 */
const PORT = process.env.PORT || "3000";
const BASE = `http://localhost:${PORT}`;
const API_KEY = process.env.X_API_KEY || "your_client_api_key_for_app";

// 32×32 red JPEG (Groq min dimension)
const JPEG_B64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIVFhUVFRUVFRUVFRUWFxUXFhUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIACAAIAMBIgACEQEDEQH/xAAXAAADAQAAAAAAAAAAAAAAAAAAAgME/8QAFhABAQEAAAAAAAAAAAAAAAAAAAEh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD5mV6KpVAAAP/Z";

const buf = Buffer.from(JPEG_B64, "base64");
const form = new FormData();
form.append("image", new Blob([buf], { type: "image/jpeg" }), "test.jpg");
form.append("languageCode", "en");

const res = await fetch(`${BASE}/api/v1/tutor/image`, {
  method: "POST",
  headers: { "x-api-key": API_KEY },
  body: form,
});
const json = await res.json();
console.log("status", res.status);
console.log("success", json.success);
if (json.data?.answer) console.log("answer preview", String(json.data.answer).slice(0, 80));
else console.log("message", json.message?.slice(0, 200));
process.exitCode = res.status === 200 && json.success ? 0 : 1;
