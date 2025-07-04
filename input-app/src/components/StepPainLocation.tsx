import { useRef } from 'react'
import type { Question, Coordinate } from '../types/Questionnaire'

interface Props {
  question: Question
  value?: Coordinate
  onChange: (value: Coordinate) => void
}

export const StepPainLocation = ({ question, value, onChange }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const rect = (e.target as HTMLImageElement).getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    onChange({ x, y })
  }

  return (
    <div className="relative" ref={containerRef}>
      <img
        src={question.image || '/vite.svg'}
        alt={question.text}
        onClick={handleClick}
        className="w-full max-w-xs mx-auto"
      />
      {value && (
        <div
          className="absolute w-3 h-3 bg-red-500 rounded-full"
          style={{
            left: `${value.x * 100}%`,
            top: `${value.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </div>
  )
}

