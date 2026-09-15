export function formatTableDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { short: 'Unknown', full: value }

  return {
    short: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    full: date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  }
}
