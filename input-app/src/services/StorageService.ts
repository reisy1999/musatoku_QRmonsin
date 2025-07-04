export interface IStorageService {
  // 将来的な拡張例：
  // saveFormData(data: any): Promise<void>;
  // loadFormData(): Promise<any | null>;
  // clearFormData(): Promise<void>;
}

// 現時点では永続化を行わないため、ダミーの実装を提供
export class LocalStorageService implements IStorageService {
  // async saveFormData(data: any): Promise<void> {
  //   console.warn("LocalStorageService: saveFormData is not implemented for persistent storage.");
  //   return Promise.resolve();
  // }

  // async loadFormData(): Promise<any | null> {
  //   console.warn("LocalStorageService: loadFormData is not implemented for persistent storage.");
  //   return Promise.resolve(null);
  // }

  // async clearFormData(): Promise<void> {
  //   console.warn("LocalStorageService: clearFormData is not implemented for persistent storage.");
  //   return Promise.resolve();
  // }
}
