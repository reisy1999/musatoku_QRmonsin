interface Props {
  onSelect: (departmentId: string) => void;
  onBack: () => void;
}

export const StepDepartmentSelector = ({ onSelect, onBack }: Props) => {
  // 本来はAPIから取得するが、ここではダミーデータを使用
  const departments = [
    { id: '1', name: '内科' },
    { id: '2', name: '外科' },
    { id: '3', name: '小児科' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">診療科を選択してください</h2>
      <div className="grid grid-cols-1 gap-4">
        {departments.map(dep => (
          <button
            key={dep.id}
            className="p-4 border rounded-lg text-left"
            onClick={() => onSelect(dep.id)}
          >
            {dep.name}
          </button>
        ))}
      </div>
      <button onClick={onBack} className="mt-4 p-2 border rounded-lg">戻る</button>
    </div>
  );
};
