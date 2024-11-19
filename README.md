# まんまみいや

ありのままの飯を共有するアプリケーション。

## 特徴

- メールアドレス認証
- 画像付き投稿
- リアクション機能（リアル/ウソ）
- コメント機能
- レスポンシブデザイン
- PWA対応

## 技術スタック

- React + TypeScript
- Vite
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS

## 開発環境のセットアップ

1. リポジトリのクローン:
```bash
git clone https://github.com/yourusername/manmamiya.git
cd manmamiya
```

2. 依存関係のインストール:
```bash
npm install
```

3. 環境変数の設定:
- `.env.example` をコピーして `.env` を作成
- Firebase設定を入力

4. 開発サーバーの起動:
```bash
npm run dev
```

## デプロイ

1. ビルド:
```bash
npm run build
```

2. Firebase Hostingへのデプロイ:
```bash
firebase deploy
```

## ライセンス

MIT