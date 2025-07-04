import * as QRCode from 'qrcode.react';

interface Props {
  qrData: string;
  onBack: () => void;
}

export const StepQRCode = ({ qrData, onBack }: Props) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">QRコード</h2>
      <div className="flex justify-center">
        <QRCode.default value={qrData} size={256} />
      </div>
      <div className="mt-4">
        <button onClick={onBack} className="p-2 border rounded-lg">戻る</button>
      </div>
    </div>
  )
}
