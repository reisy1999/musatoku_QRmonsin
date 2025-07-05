import { useState, useEffect } from 'react'
import type { Template, Coordinate, FormState, Question } from '../types/Questionnaire'
import { formatToCsv } from '../utils/csvFormatter'
import { toShiftJIS } from '../utils/encoding'
import { compress } from '../utils/compressor'

interface Props {
  template: Template
  answers: FormState['answers']
  onConfirm: () => void
  onBack: () => void
}

export const StepConfirm = ({ template, answers, onConfirm, onBack }: Props) => {
  const [payloadSize, setPayloadSize] = useState(0)
  const [isOver, setIsOver] = useState(false)

  useEffect(() => {
    try {
      const csv = formatToCsv(answers)
      const sjis = toShiftJIS(csv)
      const compressed = compress(sjis)
      const base64 = btoa(String.fromCharCode(...compressed))
      setPayloadSize(base64.length)
      setIsOver(base64.length > template.max_payload_bytes)
    } catch {
      setPayloadSize(0)
      setIsOver(true) // 計算失敗時もエラーとして扱う
    }
  }, [answers, template])

  const getDisplayValue = (q: Question, value: FormState['answers'][string]): string => {
    if (value === undefined || value === null) return ''
    if (Array.isArray(value)) return value.join(', ')
    if (q.type === 'multi_select' && q.bitflag && typeof value === 'number') {
      return q.options?.filter((_, index) => (value & (1 << index)) !== 0).join(', ') || ''
    }
    if (typeof value === 'object') return '' // coordinateは別途処理
    return String(value)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">入力内容の確認</h2>
      {isOver && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">入力データ超過: </strong>
          <span className="block sm:inline">
            入力内容が多すぎるため、QRコードを生成できません。前の画面に戻って入力を修正してください。
            (サイズ: {payloadSize} / 上限: {template.max_payload_bytes} バイト)
          </span>
        </div>
      )}
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
            return (
              <li key={q.id} className="my-2">
                <strong>{q.text}:</strong> {getDisplayValue(q, value)}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="p-2 border rounded-lg">戻る</button>
        <button
          onClick={onConfirm}
          className={`p-2 border rounded-lg ${!isOver ? 'bg-blue-500 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
          disabled={isOver}
        >
          確定してQRコード生成
        </button>
      </div>
    </div>
  )
}

