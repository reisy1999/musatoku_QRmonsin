declare module 'qrcode.react' {
  import * as React from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      x?: number;
      y?: number;
      height: number;
      width: number;
      excavate?: boolean;
    };
  }

  const QRCode: React.ComponentType<QRCodeProps>;

  export default QRCode;
}