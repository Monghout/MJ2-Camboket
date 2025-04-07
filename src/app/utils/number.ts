// utils/numbers.ts
export const safeToFixed = (value: unknown, digits = 1): string => {
  const num = typeof value === "number" ? value : 0;
  return num.toFixed(digits);
};
