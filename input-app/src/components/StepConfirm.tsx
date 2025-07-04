import type { Template, Coordinate, FormState } from '../types/Questionnaire'

interface Props {
  template: Template
  answers: FormState['answers']
  onConfirm: () => void
  onBack: () => void
}

export const StepConfirm = ({ template, answers, onConfirm, onBack }: Props) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">入力内容の確認</h2>
      <div className="prose">
        <ul>
          {template.questions.map((q) => {
            if (q.conditional_on) {
              const target = answers[q.conditional_on.field]
              if (target !== q.conditional_on.value) {
                return null
              }
            }
            const value = answers[q.id]
            if (q.type === 'coordinate' && value && typeof value === 'object') {
              const c = value as Coordinate
              return (
                <li key={q.id} className="my-2">
                  <div><strong>{q.text}:</strong></div>
                  <div className="relative w-48 h-48">
                    <img
                      src={q.image || '/vite.svg'}
                      alt={q.text}
                      className="w-full h-full"
                    />
                    <div
                      className="absolute w-3 h-3 bg-red-500 rounded-full"
                      style={{
                        left: `${c.x * 100}%`,
                        top: `${c.y * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                  <div>({c.x.toFixed(2)}, {c.y.toFixed(2)})</div>
                </li>
              )
            }
            const display = Array.isArray(value)
              ? value.join(', ')
              : typeof value === 'object'
                ? ''
                : value
            return (
              <li key={q.id} className="my-2">
                <strong>{q.text}:</strong> {display}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="p-2 border rounded-lg">戻る</button>
        <button onClick={onConfirm} className="p-2 border rounded-lg bg-blue-500 text-white">確定してQRコード生成</button>
      </div>
    </div>
  )
}

