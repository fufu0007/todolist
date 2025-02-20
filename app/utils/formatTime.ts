export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  
  const weeks = Math.floor(minutes / (24 * 60 * 7));
  const days = Math.floor((minutes % (24 * 60 * 7)) / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainingMinutes = minutes % 60;

  if (weeks > 0) {
    return `${weeks}周${days}天`;
  }
  
  if (days > 0) {
    return `${days}天${hours}小时`;
  }
  
  if (hours > 0) {
    return `${hours}小时${remainingMinutes}分钟`;
  }

  return `${minutes}分钟`;
} 