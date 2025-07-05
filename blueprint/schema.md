# 📄 問診テンプレートスキーマ（v2 草案）

このドキュメントは、`input-app` および `restore-app` で使用される、診療科別問診テンプレートの JSON 構造を定義します。
ステップ式UI、QRコード制約、bitflag圧縮、条件付き表示といった仕様を前提に再設計されたものです。

各テンプレートは `/templates/DEPT_ID.json` に配置されます。

---

## 📌 トップレベルの項目

| プロパティ               | 型       | 説明                          |
| ------------------- | ------- | --------------------------- |
| `department_id`     | 数値      | 診療科を一意に識別するID。              |
| `department_name`   | 文字列     | 人間が読める診療科名。                 |
| `version`           | 文字列     | テンプレートバージョン。                |
| `max_payload_bytes` | 数値（省略可） | QRエンコード後の推奨最大バイト数。超過時は警告表示。 |
| `questions`         | 配列      | 表示順に並んだ質問オブジェクトの配列。         |

---

## 🧩 Questionオブジェクトのプロパティ

テンプレート内でのIDはすべて一意である必要があります。ステップ式UIでは、順番通りに表示・スキップされます。

| プロパティ               | 型                                                                         | 説明                                                        |
| ------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| `id`                | 文字列                                                                       | 質問の一意な識別子。                                                |
| `label`             | 文字列                                                                       | ユーザーに表示される質問文。復元時CSVの見出しにも使用。                             |
| `type`              | "text" \| "textarea" \| "number" \| "date" \| "select" \| "multi\_select" \| "coordinate" | 入力形式。textareaは複数行自由記述。                                    |
| `options`           | 配列（`{ id: 数値, label: 文字列 }`）                                              | select や multi\_select タイプで必須。                            |
| `bitflag`           | 真偽値（省略可）                                                                  | multi\_select の圧縮方式。`true` の場合、idは2進ビット列として扱われる（上限32個推奨）。 |
| `required`          | 真偽値                                                                       | 入力が必須かどうか。条件未満足の場合は無視される。                                 |
| `maxLength`         | 数値（省略可）                                                                   | text/textarea に適用される最大文字数（推奨: 300以下）。                     |
| `min` / `max`       | 数値（省略可）                                                                   | number フィールドの最小値／最大値。                                     |
| `validationRegex`   | 文字列（省略可）                                                                  | 入力値に適用する正規表現（文字列として指定）。                                   |
| `conditional_on`    | 文字列（省略可）                                                                  | 表示条件となる質問の `id`。                                          |
| `conditional_value` | 配列（省略可）                                                                   | conditional\_on の質問の値がこの配列に含まれる場合のみ表示される。bitflag は現状非対応。  |
| `placeholder`       | 文字列（省略可）
                          | 入力欄に表示されるヒント。空欄時にプレースホルダーとして表示される。                           
| `defaultValue`      | 任意型（省略可）
                          | 初期表示される値。UIロード時に既定値として入力欄へ反映される。                             
| `section`           | 文字列（省略可）                                                                  | 質問の論理的グループ名。画面表示上は使用しないがCSV構造に反映可。                        |
| `image`             | 文字列（省略可）                                                                  | `coordinate` タイプで必須。表示する画像のパス。                                     |

*   `coordinate` タイプの場合、回答は `{ x: 数値, y: 数値 }` の形式で保存されます。`x` と `y` は画像の左上を (0,0)、右下を (1,1) とした相対座標（0〜1のfloat値）です。

---

## 💡 テンプレート例（簡略）

```json
{
  "department_id": 1,
  "department_name": "内科",
  "version": "2.0",
  "max_payload_bytes": 1600,
  "questions": [
    {
      "id": "q1",
      "label": "受診予定日",
      "type": "date",
      "required": true
    },
    {
      "id": "q2",
      "label": "症状",
      "type": "multi_select",
      "bitflag": true,
      "options": [
        { "id": 1, "label": "発熱" },
        { "id": 2, "label": "頭痛" }
      ],
      "required": true
    },
    {
      "id": "q3",
      "label": "補足コメント",
      "type": "textarea",
      "maxLength": 100,
      "conditional_on": "q2",
      "conditional_value": [99]  
    }
  ]
}
```

---

## 🎯 注意事項と設計ポリシー

* 各質問は **順番通りに表示** されます。条件に合致しない質問はスキップされます。
* `bitflag` を使う場合、`options[].id` は 1, 2, 4, 8, ... のようなビット値で構成してください。
* `conditional_on` は select / multi\_select（非bitflag）でのみ使用可能です。
* placeholder や defaultValue は入力アプリに反映されます。利用することで初期値やヒントを指定できます。
* `max_payload_bytes` はエンコード後の目安であり、復元アプリがサイズ超過を検出する運用が推奨されます。

このテンプレート構造に従うことで、質問ごとの表示制御、QR制限対応、UI設計との統一が可能になります。

