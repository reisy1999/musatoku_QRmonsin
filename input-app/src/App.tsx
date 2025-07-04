import { useReducer, useState } from 'react';
import { StepNoticeCheck } from './components/StepNoticeCheck';
import { StepDepartmentSelector } from './components/StepDepartmentSelector';
import { StepQuestionnaire } from './components/StepQuestionnaire';
import { StepConfirm } from './components/StepConfirm';
import { StepQRCode } from './components/StepQRCode';
import type { FormState, Template } from './types/Questionnaire';
import { fetchTemplate } from './services/TemplateLoader';
import { formatToCsv } from './utils/csvFormatter';
import { toShiftJIS } from './utils/encoding';
import { compress } from './utils/compressor';
import { fetchPublicKey, encryptData } from './services/EncryptionService';
import { sendLog } from './services/LoggerService';

type FormAction =
  | { type: 'CHECK_NOTICE' }
  | { type: 'SELECT_DEPARTMENT'; payload: string }
  | { type: 'SET_TEMPLATE'; payload: Template }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answer: FormState['answers'][string] | undefined } }
  | { type: 'GO_TO_CONFIRM' }
  | { type: 'GO_TO_QRCODE' }
  | { type: 'GO_BACK' };

const initialState: FormState = {
  step: 'notice',
  noticeChecked: false,
  departmentId: '',
  formTemplate: null,
  answers: {},
};

const clearHiddenAnswers = (template: Template | null, answers: FormState['answers']): FormState['answers'] => {
  if (!template) return answers;
  let changed = true;
  const result: FormState['answers'] = { ...answers };
  while (changed) {
    changed = false;
    for (const q of template.questions) {
      if (q.conditional_on) {
        const target = result[q.conditional_on.field];
        if (target !== q.conditional_on.value && q.id in result) {
          delete result[q.id];
          changed = true;
        }
      }
    }
  }
  return result;
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'CHECK_NOTICE':
      return { ...state, noticeChecked: true, step: 'department' };
    case 'SELECT_DEPARTMENT':
      return { ...state, departmentId: action.payload };
    case 'SET_TEMPLATE':
      return { ...state, formTemplate: action.payload, step: 'form' };
    case 'ANSWER_QUESTION': {
      const updated: FormState['answers'] = { ...state.answers }
      if (action.payload.answer === undefined) {
        delete updated[action.payload.questionId]
      } else {
        updated[action.payload.questionId] = action.payload.answer
      }
      const cleaned = clearHiddenAnswers(state.formTemplate, updated)
      return { ...state, answers: cleaned }
    }
    case 'GO_TO_CONFIRM':
      return { ...state, step: 'confirm' };
    case 'GO_TO_QRCODE':
        return { ...state, step: 'qrcode' };
    case 'GO_BACK':
      switch (state.step) {
        case 'department': return { ...state, step: 'notice' };
        case 'form': return { ...state, step: 'department' };
        case 'confirm': return { ...state, step: 'form' };
        case 'qrcode': return { ...state, step: 'confirm' };
        default: return state;
      }
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSelectDepartment = async (departmentId: string) => {
    dispatch({ type: 'SELECT_DEPARTMENT', payload: departmentId });
    try {
      const template = await fetchTemplate(departmentId);
      dispatch({ type: 'SET_TEMPLATE', payload: template });
      setError(null);
    } catch {
      setError('テンプレートの取得に失敗しました。再試行してください。');
      // エラー発生時はステップを戻すか、エラー表示専用のステップに遷移させるなど、適切なハンドリングが必要
      // ここではdepartmentに戻る
      dispatch({ type: 'GO_BACK' });
    }
  }

  const handleConfirm = async () => {
    setError(null);
    try {
      const csv = formatToCsv(state.answers);
      const sjis = toShiftJIS(csv);
      const compressed = compress(sjis);
      const base64 = btoa(String.fromCharCode(...compressed));

      if (base64.length > state.formTemplate!.max_payload_bytes) {
          await sendLog({
              timestamp: new Date().toISOString(),
              department_id: Number(state.departmentId),
              payload_size: base64.length,
              payload_over: true,
              errors: ['payload size over'],
          });
          setError('入力データが大きすぎます。QRコードを生成できません。');
          return;
      }

      const publicKey = await fetchPublicKey();
      const encryptedData = encryptData(base64, publicKey);
      setQrData(encryptedData);
      dispatch({ type: 'GO_TO_QRCODE' });

      await sendLog({
          timestamp: new Date().toISOString(),
          department_id: Number(state.departmentId),
          payload_size: base64.length,
          payload_over: false,
          errors: [],
      });
    } catch (e: unknown) {
      setError('QRコードの生成に失敗しました。最初からやり直してください。');
      await sendLog({
          timestamp: new Date().toISOString(),
          department_id: Number(state.departmentId),
          payload_size: 0, // エラー時は0または不明な値
          payload_over: false,
          errors: [(e as Error).message || 'unknown error'],
      });
    }
  }

  return (
    <div className="container mx-auto p-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">エラー: </strong>
        <span className="block sm:inline">{error}</span>
      </div>}
      {state.step === 'notice' && <StepNoticeCheck onNext={() => dispatch({ type: 'CHECK_NOTICE' })} />}
      {state.step === 'department' && <StepDepartmentSelector onSelect={handleSelectDepartment} onBack={() => dispatch({ type: 'GO_BACK' })} />}
      {state.step === 'form' && state.formTemplate && <StepQuestionnaire template={state.formTemplate} answers={state.answers} onAnswer={(questionId, answer) => dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answer }})} onNext={() => dispatch({ type: 'GO_TO_CONFIRM' })} onBack={() => dispatch({ type: 'GO_BACK' })} />}
      {state.step === 'confirm' && state.formTemplate && (
        <StepConfirm
          template={state.formTemplate}
          answers={state.answers}
          onConfirm={handleConfirm}
          onBack={() => dispatch({ type: 'GO_BACK' })}
        />
      )}
      {state.step === 'qrcode' && <StepQRCode qrData={qrData} onBack={() => dispatch({ type: 'GO_BACK' })} />}
    </div>
  )
}

export default App