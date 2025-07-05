import React, { useState, useRef, useEffect } from 'react';
import { Coordinate } from '../types/Questionnaire';

interface CoordinatePickerProps {
  imageSrc: string;
  value?: Coordinate;
  onChange: (coordinate: Coordinate) => void;
}

const CoordinatePicker: React.FC<CoordinatePickerProps> = ({ imageSrc, value, onChange }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [markerPosition, setMarkerPosition] = useState<Coordinate | null>(value || null);

  useEffect(() => {
    setMarkerPosition(value || null);
  }, [value]);

  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (imgRef.current) {
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const newCoordinate: Coordinate = { x, y };
      setMarkerPosition(newCoordinate);
      onChange(newCoordinate);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Body Diagram"
        className="w-full h-auto cursor-pointer"
        onClick={handleClick}
      />
      {markerPosition && (
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: `${markerPosition.x * 100}%`,
            top: `${markerPosition.y * 100}%`,
            width: '16px',
            height: '16px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};

export default CoordinatePicker;
