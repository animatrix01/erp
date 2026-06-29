export function calculateExperience(fromDate: Date, toDate: Date): number {
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(diffYears * 10) / 10; // Round to 1 decimal place
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
