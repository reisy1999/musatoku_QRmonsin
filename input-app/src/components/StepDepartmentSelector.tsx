import { useState } from 'react';

interface Props {
  onSelect: (departmentId: string) => void;
  onBack: () => void;
}

// Font Awesomeなどのアイコンライブラリを使うことを想定
// ここではダミーのコンポーネント
const Icon = ({ name }: { name: string }) => <i className={`fas fa-${name} mr-3`}></i>;

export const StepDepartmentSelector = ({ onSelect, onBack }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  // 本来はAPIから取得するが、ここではダミーデータを使用
  const departments = [
    { id: '1', name: '内科', icon: 'stethoscope' },
    { id: '2', name: '外科', icon: 'syringe' },
    { id: '3', name: '小児科', icon: 'child' },
    { id: '4', name: '整形外科', icon: 'bone' },
    { id: '5', name: '皮膚科', icon: 'spa' },
  ];

  const handleSelect = (id: string) => {
    setIsLoading(true);
    // onSelectは非同期処理（テンプレート取得）を開始する
    // 処理の完了はApp.tsx側で管理されるため、ここではローディング状態にするだけ
    onSelect(id);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">診療科を選択してください</h2>
      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">問診票を準備しています...</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map(dep => (
              <button
                key={dep.id}
                className="p-4 border rounded-lg text-left text-lg flex items-center
                           hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => handleSelect(dep.id)}
              >
                <Icon name={dep.icon} />
                <span>{dep.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button 
              onClick={onBack} 
              className="p-2 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              入力前の注意事項に戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
