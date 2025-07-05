import { useState } from 'react';

interface Props {
  onNext: () => void;
}

export const StepNoticeCheck = ({ onNext }: Props) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">入力前の注意事項</h2>
      <div className="prose max-w-none">
        <p>
          このシステムは、あなたの回答を暗号化してQRコードを生成します。
          入力された情報がインターネット経由で外部に送信されることはありません。
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>データの安全性:</strong> 
            ご入力いただいた内容は、お使いのスマートフォン内でのみ処理され、QRコードに変換されます。サーバーに個人情報や回答内容が保存されることは一切ありません。
          </li>
          <li>
            <strong>入力内容の破棄:</strong> 
            ブラウザを再読み込みしたり、画面を閉じたりすると、入力中の内容はすべて失われます。ご注意ください。
          </li>
          <li>
            <strong>QRコードの提示:</strong> 
            最後に表示されるQRコードを、受付の読み取り機にかざしてください。
          </li>
        </ul>
      </div>
      <div className="mt-6">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="mr-3 h-5 w-5" 
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)} 
          />
          <span className="text-lg">上記の注意事項をすべて確認し、同意します</span>
        </label>
      </div>
      <div className="mt-6 text-center">
        <button 
          onClick={onNext} 
          disabled={!isChecked}
          className={`p-3 border rounded-lg w-full max-w-xs ${
            isChecked 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          同意して次に進む
        </button>
      </div>
    </div>
  );
};
