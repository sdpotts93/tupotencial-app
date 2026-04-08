// Shared streak composable — single fetch shared across layouts and pages.
// Uses useState + a module-level watcher guard to ensure only one fetch.

const streakWatcherRegistered = ref(false)

export function useStreak() {
  const client = useSupabaseClient()
  const { user } = useAuth()
  const streak = useState<number>('user-streak', () => 0)

  async function fetchStreak() {
    if (!user.value?.id) return
    const { data } = await client
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user.value.id)
      .maybeSingle()
    streak.value = data?.current_streak ?? 0
  }

  if (!streakWatcherRegistered.value) {
    streakWatcherRegistered.value = true
    watch(() => user.value?.id, (uid) => {
      if (uid) fetchStreak()
    }, { immediate: true })
  }

  return { streak, refreshStreak: fetchStreak }
}
