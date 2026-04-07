export function useDayItemCompletion() {
  const client = useSupabaseClient()
  const { user } = useAuth()

  async function markDayItemCompleted(params: {
    programId: string
    dayIndex: number
    dayItemId: string
    run: number
  }) {
    if (!user.value?.id) return

    const { data: existing } = await client
      .from('program_checkins')
      .select('payload')
      .eq('program_id', params.programId)
      .eq('day_index', params.dayIndex)
      .eq('user_id', user.value.id)
      .eq('run', params.run)
      .maybeSingle()

    const existingItems: string[] = (existing?.payload as any)?.completed_items ?? []
    if (existingItems.includes(params.dayItemId)) return

    const updatedItems = [...existingItems, params.dayItemId]
    const payload = {
      ...((existing?.payload as any) ?? {}),
      completed_items: updatedItems,
    }

    await client.from('program_checkins').upsert({
      program_id: params.programId,
      day_index: params.dayIndex,
      run: params.run,
      payload,
    }, { onConflict: 'program_id,user_id,day_index,run' })
  }

  return { markDayItemCompleted }
}
