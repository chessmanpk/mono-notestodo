// Checks whether a name ends with an emoji (allowing trailing whitespace).
// Covers the vast majority of everyday emoji (faces, objects, symbols, etc.)
// via the Unicode Extended_Pictographic property, plus an optional variation
// selector. Very obscure multi-codepoint sequences (flags, ZWJ family emoji)
// aren't guaranteed to match — a deliberate simplicity tradeoff, not worth
// the complexity for what's meant to be a fun, lightweight signup rule.
const EMOJI_AT_END_PATTERN = /\p{Extended_Pictographic}\uFE0F?$/u;

export function endsWithEmoji(name: string): boolean {
  return EMOJI_AT_END_PATTERN.test(name.trim());
}
