import type { Template, Question, Coordinate, FormState } from '../types/Questionnaire'
import CoordinatePicker from './CoordinatePicker'

interface Props {
  template: Template
  answers: FormState['answers']
  onAnswer: (questionId: string, answer: FormState['answers'][string] | undefined) => void
  onNext: () => void
  onBack: () => void
}

export const StepQuestionnaire = ({ template, answers, onAnswer, onNext, onBack }: Props) => {
  const getError = (q: Question): string | null => {
    // skip if hidden
    if (q.conditional_on) {
      const target = answers[q.conditional_on.field]
      if (target !== q.conditional_on.value) {
        return null
      }
    }
    const v = answers[q.id]
    if (q.required) {
      if (v === undefined || v === null || v === '') {
        return 'この項目は必須です。'
      }
      if (Array.isArray(v) && v.length === 0) {
        return 'この項目は必須です。'
      }
      if (q.type === 'coordinate' && (v === undefined || v === null || (v as Coordinate).x === undefined || (v as Coordinate).y === undefined)) {
        return 'この項目は必須です。'
      }
    }
    if (v !== undefined && v !== null && v !== '') {
      if ((q.type === 'text' || q.type === 'textarea') && q.maxLength && String(v).length > q.maxLength) {
        return `最大${q.maxLength}文字までです。`
      }
      if ((q.type === 'text' || q.type === 'textarea') && q.validationRegex) {
        const r = new RegExp(q.validationRegex)
        if (!r.test(String(v))) return '形式が正しくありません。'
      }
      if (q.type === 'number') {
        const num = Number(v)
        if (Number.isNaN(num)) return '数値を入力してください。'
        if (q.min !== undefined && num < q.min) return `${q.min}以上を入力してください。`
        if (q.max !== undefined && num > q.max) return `${q.max}以下を入力してください。`
      }
    }
    return null
  }
  const errors = template.questions.reduce<Record<string, string | null>>((acc, q) => {
    acc[q.id] = getError(q)
    return acc
  }, {})

  const isFormValid = Object.values(errors).every((e) => e === null)

  const renderQuestion = (q: Question) => {
    if (q.conditional_on) {
      const target = answers[q.conditional_on.field]
      if (target !== q.conditional_on.value) {
        return null
      }
    }

    const error = errors[q.id]
    const common = 'w-full p-2 border rounded'

    switch (q.type) {
      case 'text':
        return (
          <div key={q.id} className="mb-4">
            <label className="block mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={typeof answers[q.id] === 'string' || typeof answers[q.id] === 'number' ? answers[q.id] as string | number : ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              className={common}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )
      case 'textarea':
        return (
          <div key={q.id} className="mb-4">
            <label className="block mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={typeof answers[q.id] === 'string' ? (answers[q.id] as string) : ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              className={common}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )
      case 'number':
        return (
          <div key={q.id} className="mb-4">
            <label className="block mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={typeof answers[q.id] === 'number' || typeof answers[q.id] === 'string' ? (answers[q.id] as string | number) : ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              className={common}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )
      case 'date':
        return (
          <div key={q.id} className="mb-4">
            <label className="block mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={typeof answers[q.id] === 'string' ? (answers[q.id] as string) : ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              className={common}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )
      case 'select':
        return (
          <div key={q.id} className="mb-4">
            <label className="block mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={typeof answers[q.id] === 'string' || typeof answers[q.id] === 'number' ? (answers[q.id] as string | number) : ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              className={common}
            >
              <option value="">選択してください</option>
              {q.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )
      case 'multi_select':
        return (
          <div key={q.id} className="mb-4">
            <label className="block mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            {q.options?.map((option, index) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${q.id}-${index}`}
                  value={option}
                  checked={
                    q.bitflag
                      ? ((typeof answers[q.id] === 'number' ? (answers[q.id] as number) : 0) & (1 << index)) !== 0
                      : Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(option)
                  }
                  onChange={(e) => {
                    if (q.bitflag) {
                      let cur: number = typeof answers[q.id] === 'number' ? (answers[q.id] as number) : 0
                      if (e.target.checked) {
                        cur |= 1 << index
                      } else {
                        cur &= ~(1 << index)
                      }
                      onAnswer(q.id, cur)
                    } else {
                      let cur: string[] = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []
                      if (e.target.checked) cur = [...cur, option]
                      else cur = cur.filter((it) => it !== option)
                      onAnswer(q.id, cur)
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor={`${q.id}-${index}`}>{option}</label>
              </div>
            ))}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )
      case 'coordinate':
        return (
          <div key={q.id} className="mb-4">
            <label className="block mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            {q.image && (
              <CoordinatePicker
                imageSrc={q.image}
                value={answers[q.id] as Coordinate | undefined}
                onChange={(v) => onAnswer(q.id, v)}
              />
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )
      default:
        return (
          <div key={q.id} className="mb-4">
            {q.text} (未実装)
          </div>
        )
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{template.name}</h2>
      {template.questions.map(renderQuestion)}
      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="p-2 border rounded-lg">
          戻る
        </button>
        <button
          onClick={onNext}
          className={`p-2 border rounded-lg ${isFormValid ? 'bg-blue-500 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
          disabled={!isFormValid}
        >
          次に進む
        </button>
      </div>
    </div>
  )
}

