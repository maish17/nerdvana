let counter = 0;

/** Unique id for aria-labelledby / label pairs. Deterministic per build. */
export const uid = (prefix: string) => `${prefix}-${++counter}`;
