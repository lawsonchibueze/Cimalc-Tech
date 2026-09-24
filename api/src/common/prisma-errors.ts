function errorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

/** A unique constraint was violated, for example a duplicate slug. */
export function isUniqueViolation(error: unknown): boolean {
  return errorCode(error) === "P2002" || (error instanceof Error && /unique constraint/i.test(error.message));
}

/** A foreign key blocked the operation, for example deleting a product used by a quote. */
export function isForeignKeyViolation(error: unknown): boolean {
  return errorCode(error) === "P2003" || (error instanceof Error && /foreign key constraint/i.test(error.message));
}
