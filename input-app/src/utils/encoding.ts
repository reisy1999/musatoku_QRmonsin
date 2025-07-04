import { convert } from 'encoding-japanese';

export const toShiftJIS = (text: string): Uint8Array => {
  const result = convert(text, {
    to: 'SJIS',
    from: 'UNICODE',
    type: 'arraybuffer'
  });
  return new Uint8Array(result as ArrayBuffer);
};
