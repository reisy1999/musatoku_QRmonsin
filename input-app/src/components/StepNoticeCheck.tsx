interface Props {
  onNext: () => void;
}

export const StepNoticeCheck = ({ onNext }: Props) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">入力前の注意事項</h2>
      <div className="prose">
        <p>ここに注意事項を記載します。</p>
        <ul>
          <li>再読み込みすると入力内容が失われます。</li>
          <li>...</li>
        </ul>
      </div>
      <div className="mt-4">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" onChange={(e) => {
            if (e.target.checked) {
              onNext();
            }
          }} />
          <span>注意事項に同意します</span>
        </label>
      </div>
    </div>
  );
};
