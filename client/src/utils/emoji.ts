// Mirrors server/src/utils/emoji.ts — kept identical so the client-side
// check and the server-side enforcement never disagree with each other.
const EMOJI_AT_END_PATTERN = /\p{Extended_Pictographic}\uFE0F?$/u;

export function endsWithEmoji(name: string): boolean {
  return EMOJI_AT_END_PATTERN.test(name.trim());
}
