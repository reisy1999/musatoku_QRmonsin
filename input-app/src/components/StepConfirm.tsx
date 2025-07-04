interface Props {
  answers: Record<string, any>;
  onConfirm: () => void;
  onBack: () => void;
}

export const StepConfirm = ({ answers, onConfirm, onBack }: Props) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">入力内容の確認</h2>
      <div className="prose">
        <ul>
          {Object.entries(answers).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="p-2 border rounded-lg">戻る</button>
        <button onClick={onConfirm} className="p-2 border rounded-lg bg-blue-500 text-white">確定してQRコード生成</button>
      </div>
    </div>
  )
}
