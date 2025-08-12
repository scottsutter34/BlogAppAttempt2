export const log = {
  info: (...args: any[]) => console.log("[info]", ...args),
  warn: (...args: any[]) => console.warn("[warn]", ...args),
  error: (...args: any[]) => console.error("[error]", ...args),
};
