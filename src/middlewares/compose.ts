type MiddlewareFn = (
  request: import("next/server").NextRequest,
) => Promise<Response | null>;

export function compose(...fns: MiddlewareFn[]): MiddlewareFn {
  return async (request) => {
    for (const fn of fns) {
      const result = await fn(request);
      if (result) return result;
    }
    return null;
  };
}
