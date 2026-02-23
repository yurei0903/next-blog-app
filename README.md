# ブログアプリ

## 公開しているURL

## 概要

アカウントを作成することで誰でも使うことのできるWebアプリです．
ブログの投稿ができます．

## 開発経緯

Webアプリケーションの開発をほとんどしたことがなかったので，学習のために
開発しました．

## 機能

最初のこの画面では記事を見ることができ，またヘッダーからログイン，サインアップができます．
<img width="1918" height="890" alt="Image" src="https://github.com/user-attachments/assets/8c7ed48f-d825-4a35-be44-8035ca944de2" />
ログイン，サインアップはSupabase Authを用いており，このような画面になっています．注意点としてサインアップ後は一度ログイン画面に遷移するようになっています．
また，ヘッダーのPostをクリックすると最初の画面に戻ります
<img width="1910" height="897" alt="Image" src="https://github.com/user-attachments/assets/16494fc5-8cd9-4f2a-82e8-5b8e2b08b7f6" />
<img width="1915" height="882" alt="Image" src="https://github.com/user-attachments/assets/0a48153a-7c82-4a3c-ad78-4fc41539a1a8" />

ログインをすると以下のようなプロフィール画面に遷移しますここではアカウント名，メールアドレス，アイコンの変更.
また，新規記事や作成した記事の編集ページへの遷移，記事の削除ができます．
<img width="1922" height="1453" alt="Image" src="https://github.com/user-attachments/assets/852dd5f4-3f2e-4eb8-a3bd-3e25b59919f0" />
新規作成の画面はこのようになっておりタイトル，内容を作成し，カテゴリを選ぶことができます．また，公開するのチェックを外すことで下書きにすることもできます．
<img width="1914" height="896" alt="Image" src="https://github.com/user-attachments/assets/fc3ce4b3-cc5f-4183-bb7d-39ee60b4955f" />
記事の更新も大枠は同じですが，この画面では記事の削除ができます．
<img width="1916" height="899" alt="Image" src="https://github.com/user-attachments/assets/44cf4656-6a5a-44c8-8de2-535803bd4e31" />

最後に，今まで出てきた四角い記事の見出しをクリックすると
以下のような画面になり，記事が読めます．このときユーザー名をクリックすることで
<img width="1922" height="934" alt="Image" src="https://github.com/user-attachments/assets/c9c03379-7dd9-483a-9629-a89541f009d8" />

以下のような閲覧用のプロフィール画面が見れます．
<img width="1922" height="984" alt="Image" src="https://github.com/user-attachments/assets/dfd3d134-1eb0-4950-825b-2df0803f43ab" />

## 仕様技術

- TypeScript
- Next.js
- Prisma
- supabase auth

## 開発期間

2025年12月～2026年2月

## 苦労した点

### サインアップ機能回り

- もともとユーザーが一人の前提だったWebアプリにサインアップの機能を追加した．そのため，多くの部分で書き直しが必要だった点
- そもそも理解できていない内容だったため全体的に手探りの実装になった点．

## 今後の展望

- タグの追加，削除のページや内容を検索できるAPIなど作りはしたけれどまだ実装できていないものがあるので実装したい．
- デザインが最低限になっているのでもっと見やすいものにしたい．
