# ✅ input-app 実装チェックリスト（設計書完全準拠確認用）

このチェックリストは `input-app-blueprint.md` に基づき、Google Gemini CLI によって自動生成された `input-app` の実装が設計と一致しているか詳細に確認するためのものです。

---

## 0. 🎯 アプリの目的

- [x] 回答データはネット送信せず暗号化してQRコード化するのみ
- [x] テンプレート取得・公開鍵取得・ログ送信以外の通信を行わない

## 1. 📂 ディレクトリ構成とファイル配置

- [x] `public/index.html` が存在する
- [x] `src/main.tsx` にエントリーポイントがある
- [x] `src/App.tsx` にステップ管理とルーティング処理がある
- [x] `src/components/` 以下に以下の各ファイルがある
  - [x] StepNoticeCheck.tsx
  - [x] StepDepartmentSelector.tsx
  - [x] StepQuestionnaire.tsx
  - [x] StepConfirm.tsx
  - [x] StepQRCode.tsx
- [x] `src/services/` 以下に以下の各ファイルがある
  - [x] TemplateLoader.ts
  - [x] EncryptionService.ts
  - [x] LoggerService.ts
- [x] `src/utils/` 以下に以下の各ファイルがある
  - [x] csvFormatter.ts
  - [x] encoding.ts（Shift_JIS変換）
  - [x] compressor.ts（zlib）
- [x] `src/types/Questionnaire.ts` が存在する
- [x] `vite.config.ts` がある
- [ ] `README.md` がある

---

## 2. 🔄 ステップUI（遷移フロー）

- [x] `useReducer` による状態管理でステップを切り替えている
- [x] ステップ構成：
  - [x] StepNoticeCheck
    - [ ] チェックボックスをオンにしないと次へ進めない
  - [x] StepDepartmentSelector
    - [x] 選択後、TemplateLoader.ts でテンプレートを取得
  - [x] StepQuestionnaire
    - [x] JSONテンプレートに従い質問を動的表示
    - [ ] `conditional_on` 条件で表示を制御
  - [x] StepConfirm
    - [ ] 回答内容を一覧表示
  - [x] StepQRCode
    - [x] EncryptionService.ts で暗号化してQR生成
    - [x] LoggerService.ts で生成ログを送信

---

## 3. 🧠 状態管理

- [x] `FormState` インターフェースが以下のプロパティを含む：
  - [x] step
  - [x] noticeChecked
  - [x] departmentId
  - [x] formTemplate
  - [x] answers
- [x] `answers` に `number` 型や `bitflag` が正しく格納される

---

## 4. ✅ バリデーション仕様

- [ ] `required: true` で未入力時にボタン無効化
- [ ] `conditional_on` により非表示時は `required` を無視
- [x] 質問タイプごとのバリデーション：
  - [x] text → maxLength / validationRegex
  - [x] textarea → maxLength
  - [x] number → min / max
  - [x] date / select → required
  - [x] multi_select（bitflag）→ 1つ以上選択必須
- [ ] エラーは入力欄下にインライン表示し、進行ボタンを無効化

---

## 5. ⬅️ 戻る操作と入力保持

- [x] StepNoticeCheck を除き「戻る」ボタンがある
- [x] 戻った際に入力状態を保持している
- [x] `conditional_on` 条件が変化したら該当回答を自動削除
- [x] 戻る遷移順：`qrcode`→`confirm`→`form`→`department`→`notice`

---

## 6. 📏 ペイロード処理とQRサイズ制限

- [x] StepConfirm にて `payload_size` を計測
- [x] 処理順：CSV → Shift_JIS → zlib圧縮 → Base64
- [x] QRサイズ（2953バイト）超過時に警告を表示し進行不可に
- [x] `max_payload_bytes` はテンプレート依存で取得

---

## 7. 📡 ログ送信（/api/logs）

- [x] ログ送信先： `/api/logs`
- [x] フォーマット確認：

```json
{
  "timestamp": "<ISO8601形式>",
  "department_id": <number>,
  "payload_size": <number>,
  "payload_over": <boolean>,
  "errors": ["..."]
}
```

- [x] 通信失敗時はリトライやエラーハンドリングがある

---

## 8. 🔐 公開鍵取得と暗号化

- [x] `VITE_KEY_ENDPOINT` にアクセスして公開鍵を取得
- [x] 鍵は常に「最新の鍵」を使用（鍵ローテーションを考慮）
- [x] RSA-OAEP で暗号化処理が行われている
- [x] 公開鍵取得失敗時にエラーメッセージ表示あり

---

## 9. 💻 環境変数（.env）

- [x] `VITE_API_BASE_URL` が定義されている
- [x] `VITE_KEY_ENDPOINT` が定義されている

---

## 10. 🎨 UIとUX設計

- [x] Tailwind CSS を導入している
- [ ] モバイルファーストでレスポンシブ対応
- [ ] aria属性とラベルが適切に設置されている
- [ ] ローディングスピナーが実装されている（テンプレ取得 / QR生成）
- [ ] 通信エラー時に再試行を促す画面あり
- [x] QR生成失敗時は「最初からやり直してください」などの案内表示あり
- [ ] StepNoticeCheck で「再読み込みで入力が消える」旨の警告表示あり

---

## 11. 🖨️ QRコード表示仕様

- [x] QRコードは StepQRCode のみで表示される
- [x] 画像保存・印刷ボタンは存在しない

---

## 12. 🚫 永続ストレージの排除

- [x] Cookie / LocalStorage / IndexedDB を使用していない
- [x] 状態は useReducer でメモリ上にのみ保持
- [x] リロードで全情報が破棄される構成

---

## 13. 🗃️ ストレージ抽象化の備え

- [x] `StorageService.ts` など将来的な拡張に備えた構造が存在する（任意）

---

## 📱 UI・UX / モバイル対応（追加）

- [ ] スマホ画面で表示崩れがない（iOS/Android）
- [ ] ボタンがタップしやすいサイズ・間隔
- [ ] スマホキーボードが入力欄を隠さない
- [ ] スマホでの画面回転後もレイアウトが維持される

---

## 📏 ペイロード事前検査（追加）

- [ ] StepQuestionnaire中に `estimatePayloadSize()` によるサイズ計測が行われる
- [ ] UI上で現在サイズを表示（○○ / 2953 bytes）
- [ ] 超過時はQR生成をブロックし、警告表示

---

## 🧪 テンプレートバリデーション（追加）

- [ ] CLIまたはスクリプトで `/templates/*.json` のQR容量チェックが可能
- [ ] max_payload_bytes に適切な値が設定されている

---

## 📝 差異確認のための備考欄

| 項目 | 設計通りか | 差異・メモ |
|------|------------|-------------|
| ステップ名構成 | Yes / No |             |
| 状態管理（useReducer） | Yes / No |             |
| QRサイズチェック手順 | Yes / No |             |
| 条件付き表示再評価 | Yes / No |             |
| 永続ストレージ不使用 | Yes / No |             |

## ✅ 14. テスト方針

- [ ] ユニットテスト対象が明記されている（バリデーション関数、変換関数）
- [ ] 結合テスト対象が明確（ステップ遷移・QR生成・APIエラー）
- [ ] E2Eテスト（Cypress/Playwright等）でモバイルUIとフロー検証が可能

## ✅ 15. パフォーマンス要件

- [ ] QR生成処理はユーザー操作後1秒以内に完了する
- [ ] ページ遷移時のレスポンスは500ms以下を目安とする

## ✅ 16. ♿ アクセシビリティ（a11y）対応

- [ ] WCAG 2.1に準拠したキーボード操作・フォーカス管理がされている
- [ ] スクリーンリーダーで主要UIが読み上げられる
- [ ] aria-label / role の設計が適切

## ✅ 17. i18n/l10n 設計（将来拡張）

- [ ] 文字列がすべて定数または辞書形式で管理されている
- [ ] 日付/数値表示はロケール依存に対応できる構造になっている

## ✅ 18. ⚠️ エラーハンドリング設計

- [ ] APIの失敗時レスポンス（400/401/500）ごとにUIが分岐している
- [x] ユーザーに再試行やサポート誘導など次の行動を明示
- [x] QR生成中に暗号エラーなどが起きた際のメッセージが具体的

## ✅ 19. README.md

- [ ] セットアップ手順（依存モジュール・.env例）が記載されている
- [ ] 開発用コマンド一覧（npm run dev など）が記載されている
- [ ] このチェックリストへのリンクが記載されている
