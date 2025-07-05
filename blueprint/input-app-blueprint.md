この設計書は、QR問診システムのクライアントアプリ（input-app）をGoogle Gemini CLIで自動生成するための構造的な設計図である。Gemini CLIが構築するReactアプリケーションの全体像、各モジュールの役割、処理フロー、API設計、状態管理方針などを明示する。

## 🎯 アプリの目的

* ユーザー（患者）がスマートフォンから問診フォームに回答する
* 回答内容をローカルで暗号化・圧縮・エンコードしてQRコードとして出力する
* 一切の個人情報をインターネット上に送信しない

## 🏗️ ディレクトリ構成

```plaintext
input-app/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx                  // ステップ管理とルーティング
│   ├── main.tsx
│   ├── components/             // UIパーツ
│   │   ├── StepNoticeCheck.tsx       // 入力前の注意事項
│   │   ├── StepDepartmentSelector.tsx
│   │   ├── StepQuestionnaire.tsx
│   │   ├── StepConfirm.tsx
│   │   ├── StepQRCode.tsx
│   ├── services/               // 処理ロジック
│   │   ├── TemplateLoader.ts     // テンプレ取得
│   │   ├── EncryptionService.ts  // 公開鍵取得 + 暗号化処理
│   │   ├── LoggerService.ts      // QR生成ログ通知
│   ├── utils/
│   │   ├── csvFormatter.ts       // 回答CSV化
│   │   ├── encoding.ts           // Shift_JIS変換
│   │   ├── compressor.ts         // zlib圧縮
│   ├── types/
│   │   └── Questionnaire.ts
├── vite.config.ts
├── package.json
└── README.md
```

## ⚠️ 現在の実装ステータスについて（AI向け補足）

本プロジェクトでは、以下の外部APIを使用する設計となっているが、**現時点ではサーバー側のAPI実装は未着手である**。

* `GET /api/public-key`（公開鍵の取得）
* `GET /api/templates/:department_id`（テンプレ取得）
* `POST /api/logs`（QR生成ログの通知）

これらは将来的に **Azure Functions 上で実装される予定**であり、現時点では仮データまたはローカルモックで動作させている。

また、RSA公開鍵は本来 **Azure Key Vault** から取得する設計だが、開発段階では `mock-public.pem` のような固定ファイルで代用している。

> AIによるコード生成時には、これらが未実装である前提のもとで、**APIを生成対象に含めないか、モックとして扱うようにしてください。**

## 🔄 処理フロー（ステップUI）

1. StepNoticeCheck: 注意事項表示 + チェックボックス
2. 診療科選択（StepDepartmentSelector） → APIからテンプレ取得
3. 問診フォーム（StepQuestionnaire） → JSONに基づき順次表示 + 条件付き表示
4. 入力確認（StepConfirm）
5. 暗号化 & QR生成（StepQRCode）

## 🧠 状態構造（useReducerを想定）

```ts
interface FormState {
  step: 'notice' | 'department' | 'form' | 'confirm' | 'qrcode';
  noticeChecked: boolean;
  departmentId: string;
  formTemplate: Template | null;
  answers: Record<string, string | string[] | number | Coordinate>;
}
```

* ビットフラグでの multi\_select の回答は `number` 型として格納される
* "number" 型質問の回答も `string` ではなく `number` 型で格納される想定
* `coordinate` 型の回答は `{ x: number, y: number }` のオブジェクト形式で格納される

## 🔐 バリデーション仕様（スキーマ対応）

### `required: true` の挙動

* 入力アプリでは、`required: true` の項目は **未入力のままでは次に進めないようにステップボタンが無効化される。**
* `conditional_on` によって非表示の場合は `required` は無視される（表示されたときのみバリデーション対象）。

### typeごとのバリデーション仕様

| `type`          | 適用バリデーション                                  |
| --------------- | ------------------------------------------ |
| "text"          | `required`, `maxLength`, `validationRegex` |
| "textarea"      | `required`, `maxLength`                    |
| "number"        | `required`, `min`, `max`                   |
| "date"          | `required`                                 |
| "select"        | `required`                                 |
| "multi\_select" | `required`                                 |
| "coordinate"    | `required`（指定がある場合）                        |

* `multi_select` は `bitflag: true` の場合、1つ以上の選択が必須
* `maxLength` を指定しない場合でも、文字数やQRサイズ超過を検知して警告を表示
* エラーはインライン表示、ステップ進行ボタンは非活性化で制御
* `validationRegex` の例： `"^[0-9]{4}$"`

## ⬅️ 戻る操作の仕様

* 各ステップコンポーネントには「戻る」ボタンを設置する（Step 'notice' を除く）
* 状態はすべて `useReducer` に保持されており、戻った際にも入力内容は保持される
* 遷移規則は以下：

| 現在のステップ      | 戻ると戻る先       |
| ------------ | ------------ |
| 'qrcode'     | 'confirm'    |
| 'confirm'    | 'form'       |
| 'form'       | 'department' |
| 'department' | 'notice'     |
| 'notice'     | ×（戻る不可）      |

* 条件付き表示によってスキップされた質問に対しては、戻ったときに依存関係を再評価し、回答の整合性を保つ
* `FormState` に保存された回答が `conditional_on` 条件を満たさなくなった場合、自動で該当値を削除する

## 📏 ペイロードバイトサイズ処理（max\_payload\_bytes）

* StepConfirm にて以下の手順で算出：

  1. CSV文字列化（Shift\_JIS変換）
  2. zlib圧縮（バイナリ）
  3. Base64エンコード（文字列）
* このBase64文字列の長さが `max_payload_bytes` を超過した場合は警告を表示し、QR生成は不可とする
* QRコードの最大バイト数は2953バイトを上限とする（QRバージョン40-L基準）
* max\_payload\_bytes は問診テンプレートごとに異なる値を持つ。テンプレートに定義されている値を基準とする

## 📡 ログ送信API（/api/logs）

送信するJSON例：

```json
{
  "timestamp": "2025-07-04T09:00:00+09:00",
  "department_id": 1,
  "payload_size": 1744,
  "payload_over": false,
  "errors": []
}
```

* エラーがあった場合は `errors` に文字列配列を格納（例: \["Missing required field"]）

## 💻 環境変数（.envで管理）

* `VITE_API_BASE_URL`: APIルートURL（例: `https://monsin.example.com/api`）
* `VITE_KEY_ENDPOINT`: 公開鍵取得用URLパス（例: `/public-key`）
* `VITE_TEMPLATE_ENDPOINT`: テンプレ取得パス（例: `/api/templates`）
* `VITE_LOGS_ENDPOINT`: ログ送信パス（例: `/api/logs`）
* `VITE_REQUEST_TIMEOUT_MS`: リクエストのタイムアウト時間（ミリ秒）

## 🎨 UI設計方針

* モバイルファーストのレスポンシブ設計を前提とする
* Tailwind CSS を導入し、シンプルかつ柔軟なコンポーネント設計とする
* アクセシビリティ面も考慮し、ラベル・aria属性を適切に設置
* バックグラウンド処理中はローディングスピナーを表示（テンプレ取得、QR生成時など）
* API通信エラー時にはリトライ促進画面を表示（例：「通信に失敗しました。再試行してください」）
* 暗号・QR処理失敗時には「最初からやり直してください」等のフォールバック表示を行う
* StepNoticeCheck にて、「再読み込みすると入力内容が失われる」旨の警告文を表示する

## 🖨️ QR表示仕様

* StepQRCodeでは、QRコード画像を表示するのみとし、**画像保存・印刷機能は提供しない**
* ダウンロード要件が発生した場合は後日オプション対応とする

## 🔐 公開鍵取得と鍵ローテーション対応

* 公開鍵の取得は常に「最新の鍵（＝新鍵）」を使用し、APIサーバーがその提供責任を持つ
* 秘密鍵のローテーションにより復元アプリ側が旧鍵・新鍵両対応することで復元互換性を担保する

## 🗃️ ストレージ抽象化と将来対応

* 永続保存は現時点で不使用だが、StorageService.ts などの抽象モジュールを作成し、後日の拡張に備える
* 拡張例：入力一時保存機能、患者情報の保持（同意取得済み前提）など

## 🚫 永続ストレージ非依存設計について

* このアプリケーションでは **Cookie・LocalStorage・IndexedDBなどの永続ストレージを一切使用しない**。
* 入力データや中間状態はすべて `React useReducer` により **セッション中のメモリ上でのみ保持される**。
* セキュリティ要件上、情報はページリロード時に完全に破棄される。

---

この設計に従って、input-app の開発を段階的に進めれば、構造を見失うことなく、拡張性とセキュリティに優れたWebアプリケーションを構築できる。


