import i18n from '../i18n'

export const PH_MIN = 7.0
export const PH_MAX = 9.0
export const SALINITY_MIN = 5
export const SALINITY_MAX = 25
export const TEMP_MIN = 26
export const TEMP_MAX = 32

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
