/**
 * Parses the CORS_ORIGIN environment variable.
 * If the environment variable contains commas, it splits the string into an array of allowed origins.
 * Otherwise, it returns a single origin string or a fallback value.
 *
 * @param corsOriginEnv The CORS_ORIGIN environment variable value
 * @param fallback The fallback value if the environment variable is not defined
 * @returns A string, an array of strings, or the fallback value
 */
export function getCorsOrigins(
  corsOriginEnv?: string,
  fallback: string | string[] = 'http://localhost:3001',
): string | string[] {
  if (!corsOriginEnv) {
    return fallback;
  }

  // If there are multiple origins separated by commas
  if (corsOriginEnv.includes(',')) {
    return corsOriginEnv
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return corsOriginEnv.trim();
}
