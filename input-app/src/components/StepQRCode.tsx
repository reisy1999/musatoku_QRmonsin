import { QRCodeCanvas } from 'qrcode.react';

interface Props {
  qrData: string;
  onBack: () => void;
}

// Font Awesomeなどのアイコンライブラリを使うことを想定
// ここではダミーのコンポーネント
const Icon = ({ name, className }: { name: string, className?: string }) => <i className={`fas fa-${name} ${className}`}></i>;


export const StepQRCode = ({ qrData, onBack }: Props) => {
  return (
    <div className="text-center p-4 sm:p-6">
      <div className="bg-white shadow-lg rounded-lg max-w-md mx-auto p-8">
        
        <Icon name="check-circle" className="text-green-500 text-5xl mx-auto" />

        <h2 className="text-2xl sm:text-3xl font-bold mt-4 mb-2">ご協力ありがとうございました</h2>
        <p className="text-gray-600 mb-6">
          問診票のQRコードが作成されました。<br/>
          受付に設置されている読み取り機に、この画面をかざしてください。
        </p>
        
        <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
          {qrData ? (
            <QRCodeCanvas value={qrData} size={256} level="L" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-200 text-gray-500">
              QRコードの生成に失敗しました
            </div>
          )}
        </div>

        <div className="mt-8">
          <button 
            onClick={onBack} 
            className="p-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            入力内容の確認に戻る
          </button>
        </div>
      </div>
    </div>
  )
}
