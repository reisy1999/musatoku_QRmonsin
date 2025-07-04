# ✅ input-app 実装チェックリスト（設計書完全準拠確認用）

このチェックリストは `input-app-blueprint.md` に基づき、Google Gemini CLI によって自動生成された `input-app` の実装が設計と一致しているか詳細に確認するためのものです。

---
## 0. 🎯 アプリの目的

- [ ] 回答データはネット送信せず暗号化してQRコード化するのみ
- [ ] テンプレート取得・公開鍵取得・ログ送信以外の通信を行わない


## 1. 📂 ディレクトリ構成とファイル配置

- [ ] `public/index.html` が存在する  
- [ ] `src/main.tsx` にエントリーポイントがある  
- [ ] `src/App.tsx` にステップ管理とルーティング処理がある  
- [ ] `src/components/` 以下に以下の各ファイルがある  
  - [ ] StepNoticeCheck.tsx  
  - [ ] StepDepartmentSelector.tsx  
  - [ ] StepQuestionnaire.tsx  
  - [ ] StepConfirm.tsx  
  - [ ] StepQRCode.tsx  
- [ ] `src/services/` 以下に以下の各ファイルがある  
  - [ ] TemplateLoader.ts  
  - [ ] EncryptionService.ts  
  - [ ] LoggerService.ts  
- [ ] `src/utils/` 以下に以下の各ファイルがある  
  - [ ] csvFormatter.ts  
  - [ ] encoding.ts（Shift_JIS変換）  
  - [ ] compressor.ts（zlib）  
- [ ] `src/types/Questionnaire.ts` が存在する  
- [ ] `vite.config.ts` がある  
- [ ] `README.md` がある  

---

## 2. 🔄 ステップUI（遷移フロー）

- [ ] `useReducer` による状態管理でステップを切り替えている  
- [ ] ステップ構成：  
  - [ ] StepNoticeCheck
    - [ ] チェックボックスをオンにしないと次へ進めない
  - [ ] StepDepartmentSelector
    - [ ] 選択後、TemplateLoader.ts でテンプレートを取得
  - [ ] StepQuestionnaire
    - [ ] JSONテンプレートに従い質問を動的表示
    - [ ] `conditional_on` 条件で表示を制御
  - [ ] StepConfirm
    - [ ] 回答内容を一覧表示
  - [ ] StepQRCode
    - [ ] EncryptionService.ts で暗号化してQR生成
    - [ ] LoggerService.ts で生成ログを送信

---

## 3. 🧠 状態管理

- [ ] `FormState` インターフェースが以下のプロパティを含む：  
  - [ ] step  
  - [ ] noticeChecked  
  - [ ] departmentId  
  - [ ] formTemplate  
  - [ ] answers  
- [ ] `answers` に `number` 型や `bitflag` が正しく格納される  

---

## 4. ✅ バリデーション仕様

- [ ] `required: true` で未入力時にボタン無効化  
- [ ] `conditional_on` により非表示時は `required` を無視  
- [ ] 質問タイプごとのバリデーション：  
  - [ ] text → maxLength / validationRegex  
  - [ ] textarea → maxLength  
  - [ ] number → min / max  
  - [ ] date / select → required  
  - [ ] multi_select（bitflag）→ 1つ以上選択必須  
- [ ] エラーは入力欄下にインライン表示し、進行ボタンを無効化

---

## 5. ⬅️ 戻る操作と入力保持

- [ ] StepNoticeCheck を除き「戻る」ボタンがある  
- [ ] 戻った際に入力状態を保持している  
- [ ] `conditional_on` 条件が変化したら該当回答を自動削除  
- [ ] 戻る遷移順：`qrcode`→`confirm`→`form`→`department`→`notice`

---

## 6. 📏 ペイロード処理とQRサイズ制限

- [ ] StepConfirm にて `payload_size` を計測  
- [ ] 処理順：CSV → Shift_JIS → zlib圧縮 → Base64  
- [ ] QRサイズ（2953バイト）超過時に警告を表示し進行不可に  
- [ ] `max_payload_bytes` はテンプレート依存で取得  

---

## 7. 📡 ログ送信（/api/logs）

- [ ] ログ送信先： `/api/logs`  
- [ ] フォーマット確認：  
```json
{
  "timestamp": "<ISO8601形式>",
  "department_id": <number>,
  "payload_size": <number>,
  "payload_over": <boolean>,
  "errors": ["..."]
}
```
- [ ] 通信失敗時はリトライやエラーハンドリングがある  

---

## 8. 🔐 公開鍵取得と暗号化

- [ ] `VITE_KEY_ENDPOINT` にアクセスして公開鍵を取得  
- [ ] 鍵は常に「最新の鍵」を使用（鍵ローテーションを考慮）  
- [ ] RSA-OAEP で暗号化処理が行われている  
- [ ] 公開鍵取得失敗時にエラーメッセージ表示あり  

---

## 9. 💻 環境変数（.env）

- [ ] `VITE_API_BASE_URL` が定義されている  
- [ ] `VITE_KEY_ENDPOINT` が定義されている  

---

## 10. 🎨 UIとUX設計

- [ ] Tailwind CSS を導入している  
- [ ] モバイルファーストでレスポンシブ対応  
- [ ] aria属性とラベルが適切に設置されている  
- [ ] ローディングスピナーが実装されている（テンプレ取得 / QR生成）  
- [ ] 通信エラー時に再試行を促す画面あり  
- [ ] QR生成失敗時は「最初からやり直してください」などの案内表示あり  
- [ ] StepNoticeCheck で「再読み込みで入力が消える」旨の警告表示あり  

---

## 11. 🖨️ QRコード表示仕様

- [ ] QRコードは StepQRCode のみで表示される  
- [ ] 画像保存・印刷ボタンは存在しない  

---

## 12. 🚫 永続ストレージの排除

- [ ] Cookie / LocalStorage / IndexedDB を使用していない  
- [ ] 状態は useReducer でメモリ上にのみ保持  
- [ ] リロードで全情報が破棄される構成  

---

## 13. 🗃️ ストレージ抽象化の備え

- [ ] `StorageService.ts` など将来的な拡張に備えた構造が存在する（任意）  

---

## 📌 差異確認のための備考欄

- 実装と異なる点を以下にメモしておくこと：

| 項目 | 設計通りか | 差異・メモ |
|------|------------|-------------|
| ステップ名構成 | Yes / No |             |
| 状態管理（useReducer） | Yes / No |             |
| QRサイズチェック手順 | Yes / No |             |
| 条件付き表示再評価 | Yes / No |             |
| 永続ストレージ不使用 | Yes / No |             |

