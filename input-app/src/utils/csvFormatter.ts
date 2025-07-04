import type { FormState, Coordinate } from '../types/Questionnaire'

export const formatToCsv = (answers: FormState['answers']): string => {
  const header = Object.keys(answers).join(',')
  const values = Object.values(answers)
    .map((value) => {
      if (Array.isArray(value)) {
        return `"${value.join('|')}"`
      }
      if (typeof value === 'object' && value && 'x' in value && 'y' in value) {
        const c = value as Coordinate
        return `"${c.x},${c.y}"`
      }
      return `"${value}"`
    })
    .join(',')

  return `${header}\n${values}`
}

