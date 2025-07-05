---

# 📘 API仕様書（QR問診システム input-app 用）

## 共通事項

* **ベースURL**（開発中）: `http://localhost:5174/api/`
* **ベースURL**（本番）: `https://monsin.example.com/api/`
* **ヘッダー**

  ```http
  Content-Type: application/json
  ```

---

## 1. 🔑 公開鍵取得API

### `GET /api/public-key`

問診データの暗号化に使用する **RSA公開鍵** を取得する。

### ✅ リクエスト

* パラメータなし

### 🔁 レスポンス（200 OK）

```json
{
  "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----"
}
```

### 🔥 エラー（500 Internal Server Errorなど）

```json
{
  "error": "Internal server error"
}
```

### 📌 備考

* サーバーは常に最新の公開鍵を返す
* 開発中は `mock-public.pem` を返すようにモック構成済み

---

## 2. 📋 テンプレート取得API

### `GET /api/templates/:department_id`

診療科ごとの問診テンプレートを取得する。

### ✅ リクエスト

* `:department_id`（例: `1`）

### 🔁 レスポンス（200 OK）

```json
{
  "template": {
    "id": 1,
    "department": "内科",
    "max_payload_bytes": 2900,
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "label": "症状を教えてください",
        "required": true
      },
      {
        "id": "q2",
        "type": "multi_select",
        "label": "既往歴",
        "required": false,
        "bitflag": true,
        "options": [
          { "id": 1, "label": "高血圧" },
          { "id": 2, "label": "糖尿病" }
        ]
      }
    ]
  }
}
```

### 🔥 エラー（404 Not Found）

```json
{
  "error": "Template not found"
}
```

### 📌 備考

* テンプレートは `functions/src/templates/template_<id>.json` に保存されている
* 本番では Azure Functions + Blob Storage または Key Vault 経由を想定

---

## 3. 🛰️ ログ送信API

### `POST /api/logs`

QRコード生成時の状態ログを送信する（匿名）。

### ✅ リクエストボディ

```json
{
  "timestamp": "2025-07-04T09:00:00+09:00",
  "department_id": 1,
  "payload_size": 1744,
  "payload_over": false,
  "errors": []
}
```

* `payload_over`: QRサイズ制限を超過していた場合は `true`
* `errors`: エラーメッセージ配列（文字列）。なければ空配列

### 🔁 レスポンス（204 No Content）

* 成功時は空で返す

### 🔥 エラー（500 Internal Server Error など）

```json
{
  "error": "Failed to save log"
}
```

### 📌 備考

* 応答内容は `204` または `{ status: "ok" }` のどちらかが許容される
* フロントエンドでは `.env` により `/logs` と `/api/logs` の切り替えが可能

---

## ✅ 実装側注意点（統一ルール）

| 項目        | 内容                                                       |
| --------- | -------------------------------------------------------- |
| 🔑 公開鍵取得  | 常に `GET /api/public-key` を使用                             |
| 📋 テンプレ取得 | `GET /api/templates/:department_id` に統一                  |
| 🛰️ ログ送信  | `POST /api/logs` に統一。`Content-Type: application/json` 必須 |
| 🔐 認証     | なし（今後対応を検討）                                              |
| 🌐 CORS   | モックAPIでは `Access-Control-Allow-Origin: *` を設定済み          |
| 📁 .env構成 | `VITE_API_BASE_URL` を変更すれば Azure/Mock 切替可                |


