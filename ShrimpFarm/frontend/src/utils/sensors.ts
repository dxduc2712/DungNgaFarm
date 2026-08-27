import i18n from '../i18n'

export const PH_MIN = 7.0
export const PH_MAX = 9.0
export const SALINITY_MIN = 5
export const SALINITY_MAX = 25
export const TEMP_MIN = 26
export const TEMP_MAX = 32

/** Latest IoT reading must be newer than this to count as firmware-connected. */
export const FIRMWARE_STALE_MS = 45_000

export function expectsFirmwareSensors(recordMode?: string | null): boolean {
  return recordMode === 'ALERT' || recordMode === 'ALL'
}

export function isFirmwareConnected(lastIotAt: string | null | undefined): boolean {
  if (!lastIotAt) return false
  const recorded = new Date(lastIotAt).getTime()
  if (Number.isNaN(recorded)) return false
  return Date.now() - recorded < FIRMWARE_STALE_MS
}

export function isOutOfRange(
  type: 'ph' | 'salinity' | 'temperature',
  value: number,
): boolean {
  if (type === 'ph') return value < PH_MIN || value > PH_MAX
  if (type === 'salinity') return value < SALINITY_MIN || value > SALINITY_MAX
  return value < TEMP_MIN || value > TEMP_MAX
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN')
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN')
}

export function pondTypeLabel(type: string) {
  if (type === 'GROW') return i18n.t('ponds.typeGrow')
  if (type === 'WATER') return i18n.t('ponds.typeWater')
  return type
}
