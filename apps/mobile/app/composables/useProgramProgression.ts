export function useProgramProgression() {
  /**
   * Returns the highest day_index that is currently unlocked,
   * based on calendar-day diff from enrollment date (user's local timezone).
   * Day 1 unlocks on the enrollment day itself.
   */
  function getUnlockedDayCount(enrolledAt: string | Date | null): number {
    if (!enrolledAt) return 0
    const enrolled = new Date(enrolledAt)
    const now = new Date()
    const enrolledDay = new Date(enrolled.getFullYear(), enrolled.getMonth(), enrolled.getDate())
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = today.getTime() - enrolledDay.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays + 1)
  }

  function isDayUnlocked(dayIndex: number, enrolledAt: string | Date | null): boolean {
    return dayIndex <= getUnlockedDayCount(enrolledAt)
  }

  /**
   * The "current" day = the earliest unlocked day that has NOT been completed,
   * or the last unlocked day if all are done.
   */
  function getCurrentDay(
    enrolledAt: string | Date | null,
    completedDays: Set<number>,
    totalDays: number,
  ): number {
    const maxUnlocked = Math.min(getUnlockedDayCount(enrolledAt), totalDays)
    for (let d = 1; d <= maxUnlocked; d++) {
      if (!completedDays.has(d)) return d
    }
    return maxUnlocked
  }

  return { getUnlockedDayCount, isDayUnlocked, getCurrentDay }
}
