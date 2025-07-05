import type { FormState, Coordinate } from '../types/Questionnaire'

const escapeCsvField = (field: unknown): string => {
  if (field === null || field === undefined) {
    return '""'
  }

  let value: string;
  if (Array.isArray(field)) {
    value = field.join('|')
  } else if (typeof field === 'object' && 'x' in field && 'y' in field) {
    const c = field as Coordinate
    value = `${c.x},${c.y}`
  } else {
    value = String(field)
  }
  
  // ダブルクォーテーションを2つにエスケープし、全体をダブルクォーテーションで囲む
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

export const formatToCsv = (answers: FormState['answers']): string => {
  const header = Object.keys(answers).map(escapeCsvField).join(',')
  const values = Object.values(answers).map(escapeCsvField).join(',')

  return `${header}\n${values}`
}

