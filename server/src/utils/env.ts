export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing in environment variables`);
  return value;
}
