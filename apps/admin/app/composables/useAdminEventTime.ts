const ADMIN_EVENT_TIME_ZONE = 'America/Mexico_City'
const ADMIN_EVENT_TIME_ZONE_LABEL = 'CDMX'

type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function getLocalDateParts(date: Date): DateParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  }
}

function getTimeZoneDateParts(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const lookup = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value]),
  ) as Record<string, string>

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  }
}

function datePartsToUtc(parts: DateParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
}

function datePartsToLocalDate(parts: DateParts): Date {
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
}

function shiftWallTimeToTimeZone(date: Date, timeZone: string): Date {
  const desiredParts = getLocalDateParts(date)
  let guess = new Date(datePartsToUtc(desiredParts))

  // Run the correction twice so DST-style offsets still converge cleanly.
  for (let step = 0; step < 2; step += 1) {
    const zonedParts = getTimeZoneDateParts(guess, timeZone)
    const diffMs = datePartsToUtc(desiredParts) - datePartsToUtc(zonedParts)
    guess = new Date(guess.getTime() + diffMs)
  }

  return guess
}

export function useAdminEventTime() {
  function formatAdminEventDateTime(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(value) : value

    return `${new Intl.DateTimeFormat('es-MX', {
      timeZone: ADMIN_EVENT_TIME_ZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)} ${ADMIN_EVENT_TIME_ZONE_LABEL}`
  }

  function toAdminEventFormDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null

    const date = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(date.getTime())) return null

    return datePartsToLocalDate(getTimeZoneDateParts(date, ADMIN_EVENT_TIME_ZONE))
  }

  function fromAdminEventFormDate(value: Date | null | undefined): string | null {
    if (!value) return null
    if (Number.isNaN(value.getTime())) return null

    return shiftWallTimeToTimeZone(value, ADMIN_EVENT_TIME_ZONE).toISOString()
  }

  return {
    adminEventTimeZone: ADMIN_EVENT_TIME_ZONE,
    adminEventTimeZoneLabel: ADMIN_EVENT_TIME_ZONE_LABEL,
    formatAdminEventDateTime,
    toAdminEventFormDate,
    fromAdminEventFormDate,
  }
}
