export function truncateLabel(text: string, max = 36): string {
  return text.length <= max ? text : `${text.slice(0, max - 3)}...`;
}
