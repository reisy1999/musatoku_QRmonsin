import type { Template, Question } from "../types/Questionnaire";

interface Props {
  template: Template;
  answers: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepQuestionnaire = ({ template, answers, onAnswer, onNext, onBack }: Props) => {

  const validateForm = () => {
    for (const q of template.questions) {
      // conditional_on で非表示の場合はバリデーション対象外
      if (q.conditional_on) {
        const targetAnswer = answers[q.conditional_on.field];
        if (targetAnswer !== q.conditional_on.value) {
          continue;
        }
      }

      if (q.required) {
        const answer = answers[q.id];
        if (answer === undefined || answer === null || answer === '') {
          return false; // 未入力の必須項目がある
        }
        if (Array.isArray(answer) && answer.length === 0) {
          return false; // multi_select で未選択
        }
      }
    }
    return true; // すべての必須項目が入力されている
  };

  const isFormValid = validateForm();

  const renderQuestion = (q: Question) => {
    // conditional_on の評価
    if (q.conditional_on) {
      const targetAnswer = answers[q.conditional_on.field];
      if (targetAnswer !== q.conditional_on.value) {
        return null;
      }
    }

    switch (q.type) {
      case 'text':
        return <div key={q.id} className="mb-4">
          <label className="block mb-1">{q.text} {q.required && <span className="text-red-500">*</span>}</label>
          <input type="text" value={answers[q.id] || ''} onChange={e => onAnswer(q.id, e.target.value)} className="w-full p-2 border rounded" />
          {q.required && (answers[q.id] === undefined || answers[q.id] === '') && <p className="text-red-500 text-sm">この項目は必須です。</p>}
        </div>
      case 'select':
        return <div key={q.id} className="mb-4">
          <label className="block mb-1">{q.text} {q.required && <span className="text-red-500">*</span>}</label>
          <select value={answers[q.id] || ''} onChange={e => onAnswer(q.id, e.target.value)} className="w-full p-2 border rounded">
            <option value="">選択してください</option>
            {q.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {q.required && (answers[q.id] === undefined || answers[q.id] === '') && <p className="text-red-500 text-sm">この項目は必須です。</p>}
        </div>
      case 'multi_select':
        return <div key={q.id} className="mb-4">
          <label className="block mb-1">{q.text} {q.required && <span className="text-red-500">*</span>}</label>
          {q.options?.map((option, index) => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                id={`${q.id}-${index}`}
                value={option}
                checked={q.bitflag ? ((answers[q.id] || 0) & (1 << index)) !== 0 : (answers[q.id] || []).includes(option)}
                onChange={e => {
                  if (q.bitflag) {
                    let currentBitflag = answers[q.id] || 0;
                    if (e.target.checked) {
                      currentBitflag |= (1 << index);
                    } else {
                      currentBitflag &= ~(1 << index);
                    }
                    onAnswer(q.id, currentBitflag);
                  } else {
                    let currentSelection = answers[q.id] || [];
                    if (e.target.checked) {
                      currentSelection = [...currentSelection, option];
                    } else {
                      currentSelection = currentSelection.filter((item: string) => item !== option);
                    }
                    onAnswer(q.id, currentSelection);
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={`${q.id}-${index}`}>{option}</label>
            </div>
          ))}
          {q.required && (answers[q.id] === undefined || (Array.isArray(answers[q.id]) && answers[q.id].length === 0) || (typeof answers[q.id] === 'number' && answers[q.id] === 0)) && <p className="text-red-500 text-sm">この項目は必須です。</p>}
        </div>
      // 他の質問タイプも同様に実装
      default:
        return <div key={q.id}>{q.text} (未実装)</div>
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{template.name}</h2>
      {template.questions.map(renderQuestion)}
      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="p-2 border rounded-lg">戻る</button>
        <button onClick={onNext} className={`p-2 border rounded-lg ${isFormValid ? 'bg-blue-500 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`} disabled={!isFormValid}>次に進む</button>
      </div>
    </div>
  )
}
