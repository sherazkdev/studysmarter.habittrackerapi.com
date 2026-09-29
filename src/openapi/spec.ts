import type { OpenAPIV3 } from "openapi-types";

const languageCodeSchema: OpenAPIV3.SchemaObject = {
  type: "string",
  enum: ["en", "ar", "zh", "de", "fr", "pt", "es", "it", "tr", "id", "ms"],
  default: "en",
  description: "Selected app language (invalid values fall back to en on the server).",
};

const apiEnvelopeSuccess = (dataSchema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject => ({
  type: "object",
  required: ["success", "message", "statusCode", "data"],
  properties: {
    success: { type: "boolean", enum: [true] },
    message: { type: "string" },
    statusCode: { type: "integer" },
    data: dataSchema,
  },
});

const apiEnvelopeError: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["success", "message", "statusCode"],
  properties: {
    success: { type: "boolean", enum: [false] },
    message: { type: "string" },
    statusCode: { type: "integer" },
    errors: { description: "Optional validation details (e.g. Zod issues)." },
  },
};

const imageMathDataSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["answer", "verification", "steps", "why"],
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    verification: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        required: ["stepNumber", "stepTitle", "stepDescription"],
        properties: {
          stepNumber: { type: "integer", minimum: 1 },
          stepTitle: { type: "string" },
          stepDescription: { type: "string" },
        },
      },
    },
    why: {
      type: "object",
      required: ["exampleTitle", "explanation", "keyPoints", "conclusion"],
      properties: {
        exampleTitle: { type: "string" },
        explanation: { type: "string" },
        keyPoints: { type: "array", items: { type: "string" } },
        conclusion: { type: "string" },
      },
    },
  },
};

const imageNonMathDataSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["answer", "explanation"],
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    explanation: { type: "string" },
  },
};

export function buildOpenApiDocument(baseUrl: string): OpenAPIV3.Document {
  return {
    openapi: "3.0.3",
    info: {
      title: "Study Smarter API",
      version: "1.0.0",
      description:
        "Groq-powered study tutor backend for the Study Smarter mobile app. All `/api/v1/*` routes require `x-api-key`. Interactive docs: `/docs`.",
    },
    servers: [{ url: baseUrl.replace(/\/$/, "") }],
    tags: [{ name: "Tutor" }, { name: "System" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Client API key (same value as server `X_API_KEY` / Firebase Remote Config `tutor_api_key`).",
        },
      },
      schemas: {
        LanguageCode: languageCodeSchema,
        AskTextRequest: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", minLength: 1, maxLength: 8000 },
            languageCode: languageCodeSchema,
          },
        },
        AskTextResponse: apiEnvelopeSuccess({
          type: "object",
          required: ["text"],
          properties: { text: { type: "string" } },
        }),
        ImageMathData: imageMathDataSchema,
        ImageNonMathData: imageNonMathDataSchema,
        ImageResponse: apiEnvelopeSuccess({
          type: "object",
          description:
            "Image analysis payload: either math/calculus fields (answer, verification, steps, why) or non-math (answer, explanation). See ImageMathData and ImageNonMathData schemas.",
          properties: {
            answer: { type: "string" },
            verification: { type: "string" },
            explanation: { type: "string" },
            steps: { type: "array", items: { type: "object" } },
            why: { type: "object" },
          },
        }),
        FileResponse: apiEnvelopeSuccess({
          type: "object",
          required: ["answer"],
          properties: {
            answer: {
              type: "string",
              description:
                "Combined summary, key points, and answers with localized section headers inside one string.",
            },
          },
        }),
        HealthResponse: apiEnvelopeSuccess({
          type: "object",
          required: ["service", "status"],
          properties: {
            service: { type: "string", example: "study-smarter-api" },
            status: { type: "string", example: "ok" },
          },
        }),
        ErrorResponse: apiEnvelopeError,
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          description: "No authentication required.",
          security: [],
          responses: {
            "200": {
              description: "Service is healthy.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/tutor/ask": {
        post: {
          tags: ["Tutor"],
          summary: "Text study question",
          description: "Plain-text tutor answer in the selected app language.",
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AskTextRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Answer generated.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AskTextResponse" },
                },
              },
            },
            "400": {
              description: "Validation error.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "Missing or invalid x-api-key.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "429": {
              description: "Rate limit (2s gap or hourly cap).",
              headers: {
                "Retry-After": { schema: { type: "string" } },
              },
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "502": {
              description: "Groq or output validation failure.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/v1/tutor/image": {
        post: {
          tags: ["Tutor"],
          summary: "Image study question",
          description: "JPEG image (max 10MB). Returns structured JSON for math or non-math subjects.",
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["image"],
                  properties: {
                    image: {
                      type: "string",
                      format: "binary",
                      description: "JPEG only, max 10MB.",
                    },
                    languageCode: languageCodeSchema,
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Image analyzed.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ImageResponse" },
                },
              },
            },
            "400": { description: "Invalid image.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "401": { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "429": { description: "Rate limited.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "502": { description: "Processing failure.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/api/v1/tutor/file": {
        post: {
          tags: ["Tutor"],
          summary: "PDF document study question",
          description: "PDF (max 15MB). Text extraction only; scanned/image PDFs return 400.",
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file"],
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                      description: "application/pdf, max 15MB.",
                    },
                    languageCode: languageCodeSchema,
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Document analyzed.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FileResponse" },
                },
              },
            },
            "400": { description: "Invalid PDF or no extractable text.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "401": { description: "Unauthorized.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "429": { description: "Rate limited.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "502": { description: "Processing failure.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
    },
  };
}
