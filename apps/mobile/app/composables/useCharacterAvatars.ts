interface CharacterAvatars {
  carlotta: string
  gabriel: string
}

const defaults: CharacterAvatars = {
  carlotta: '/images/carlotta.png',
  gabriel: '/images/gabriel.png',
}

export function useCharacterAvatars() {
  const client = useSupabaseClient()

  const { data } = useAsyncData('character-avatars', async () => {
    const { data } = await client
      .from('app_settings')
      .select('value')
      .eq('key', 'character_avatars')
      .single()
    if (!data?.value) return defaults
    const val = data.value as unknown as { carlotta_avatar_url: string; gabriel_avatar_url: string }
    return {
      carlotta: val.carlotta_avatar_url || defaults.carlotta,
      gabriel: val.gabriel_avatar_url || defaults.gabriel,
    }
  }, { default: () => defaults })

  const avatarUrl = (character?: string | null) => {
    const normalized = character?.trim().toLowerCase()
    if (!normalized) return defaults.gabriel

    const key = normalized as keyof CharacterAvatars
    return data.value[key] ?? defaults.gabriel
  }

  return { characterAvatars: data, avatarUrl }
}
