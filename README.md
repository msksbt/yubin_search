# 郵便局コード番号検索APIサンプルアプリケーション

日本郵便のコード番号検索APIを使用したWebアプリケーションのサンプルです。郵便番号、事業所個別郵便番号、デジタルアドレスの検索ができます。

## 機能

- 🔐 APIトークンの自動取得
- 🔍 郵便番号検索
- 🏢 事業所個別郵便番号検索
- 📱 デジタルアドレス検索
- ✂️ ハイフン自動除去（入力コードのハイフンを自動的に除去）
- 🎨 モダンで使いやすいWebUI
- 🐳 Docker対応

## テスト可能なサンプルデータ

### デジタルアドレス
- **A7E-2FK2** - 東京都千代田区丸の内2丁目7-2
- **JN4-LKS2** - 大阪府大阪市北区梅田3丁目2-2
- **QN6-GQX1** - 福岡県福岡市博多区博多駅中央街9-1

### 郵便番号
- 東京都千代田区の郵便番号（例：1000001, 1000002など）

## セットアップ方法

### Docker（推奨）

1. プロジェクトをクローン
```bash
git clone <repository-url>
cd yubin
```

2. 環境変数ファイルを作成
```bash
cp .env.example .env
```

3. Dockerコンテナを起動
```bash
docker-compose up -d --build
```

4. ブラウザでアクセス
```
http://localhost:3000
```

### 手動セットアップ

1. 依存関係をインストール
```bash
npm install
```

2. 環境変数を設定（.envファイルを作成）
```env
CLIENT_ID=TEST7t6fj7eqC5v6UDaHlpvvtesttest
SECRET_KEY=testGzhSdzpZ1muyICtest0123456789
API_BASE_URL=https://stub-qz73x.da.pf.japanpost.jp/api/v1
PORT=3000
```

3. アプリケーションを起動
```bash
npm start
```

## 使用方法

1. ブラウザで `http://localhost:3000` にアクセス
2. 「トークンを取得」ボタンをクリック
3. 検索コードを入力（郵便番号、デジタルアドレスなど）
4. 検索オプションを選択
5. 「検索実行」ボタンをクリック

## API仕様

### 認証
- **エンドポイント**: POST `/api/token`
- **説明**: APIアクセス用のトークンを取得

### 検索
- **エンドポイント**: POST `/api/search`
- **パラメータ**:
  - `searchCode`: 検索コード（必須）
  - `page`: ページ番号（デフォルト: 1）
  - `limit`: 取得件数（デフォルト: 100、最大: 1000）
  - `choikitype`: 町域表示形式（1: 括弧なし、2: 括弧あり）
  - `searchtype`: 検索タイプ（1: 全て、2: 郵便番号・デジタルのみ）
  - `ec_uid`: プロバイダーユーザーID（オプション）

## 技術スタック

- **バックエンド**: Node.js + Express
- **フロントエンド**: HTML5 + Bootstrap 5 + Vanilla JavaScript
- **API**: 日本郵便 コード番号検索API
- **コンテナ**: Docker + Docker Compose

## ライセンス

MIT License

## 注意事項

このアプリケーションは日本郵便の**テスト用API**を使用しています。本番環境では適切な認証情報と本番APIエンドポイントを使用してください。
