export interface Coordinate {
  x: number;
  y: number;
}

export interface Option {
  id: string | number
  label: string
}

export interface Question {
  id: string
  label: string
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'select'
    | 'multi_select'
    | 'coordinate'
  options?: Option[]
  image?: string; // for coordinate questions
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  validationRegex?: string;
  conditional_on?: {
    field: string;
    value: string | number;
  };
  bitflag?: boolean;
}

export interface Template {
  id: string;
  name: string;
  questions: Question[];
  max_payload_bytes: number;
}

export interface FormState {
  step: 'notice' | 'department' | 'form' | 'confirm' | 'qrcode';
  noticeChecked: boolean;
  departmentId: string;
  formTemplate: Template | null;
  answers: Record<string, string | string[] | number | Coordinate>;
}
