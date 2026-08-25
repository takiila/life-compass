# Life Compass

Study CompassとTraining Compassを切り替えながら、資格勉強・運動・回復の「次の一歩」を小さくするExpoアプリです。PWA、iOS、Androidを同じTypeScriptコードベースで提供します。

このリポジトリはprivate GitHub repository `takiila/life-compass` の `main` が正本です。最初のManus版Training Compassは参照元であり、このリポジトリのcurrent lineageではありません。

## 新しいWindows PCで始める

推奨手順は、private repository `takiila/AI-Memory` を `C:\soft\AI-Memory` へcloneし、そちらの `SETUP_NEW_PC.cmd` を実行する方法です。Life Compass本体と依存関係、Codex Skillがまとめて準備されます。

Life Compassだけを準備する場合は、Git、Node.js 22.13以上、npmをインストールしてから次を実行します。

```powershell
cd C:\soft
git clone https://github.com/takiila/life-compass.git
cd life-compass
.\SETUP_NEW_PC.cmd
```

`SETUP_NEW_PC.cmd` はツールの存在を確認し、`package-lock.json` から `npm ci` で依存関係を復元して、`npm run check` まで実行します。既存のローカルDB、ユーザーデータ、生成物を削除しません。

既存PCでセットアップをやり直す場合は、先にLife Compassのレビュー画面とExpoのコマンド画面を終了してください。使用中の `node_modules` があるとWindowsが `EPERM` を返すため、その場合も画面を閉じて `SETUP_NEW_PC.cmd` を再実行します。セットアップは実行中processを勝手に終了しません。

## 初心者向けローカルレビュー

Windowsでは [`START_REVIEW_WINDOWS.cmd`](START_REVIEW_WINDOWS.cmd) をダブルクリックしてください。初回だけ必要なパッケージを導入し、Life CompassのWeb版を起動します。ブラウザが自動で開かなければ `http://localhost:8081` を開きます。終了するときは黒いコマンド画面で `Ctrl+C` を押します。

Life CompassとCMTRをまとめた詳しい手順は、sibling AI-Memoryの `Knowledge/ローカルレビュー起動ガイド.md` にあります。AI-Memoryの `START_PROJECTS.cmd` からもPCレビューを開始できます。同一LANのスマホレビューは `START_PHONE_REVIEW.cmd` を使用し、public Wi-Fiやrouterのport開放は使わないでください。

## Data and privacy

- 状態はWatermelonDBへ保存します。WebはIndexedDB、iOS/AndroidはSQLiteです。
- JSONバックアップは手動で作成・復元できます。
- HealthKit / Health Connectは体重とワークアウトの読み取り専用です。
- カメラはライブ自己確認だけに使い、写真・動画・音声を保存しません。
- クラウド同期、広告、課金、医療診断はありません。

## Commands

- `npm run web` — Expo Web reviewを起動する。
- `npm run check` — 型検査、単体・プロパティテスト、Web書き出し、PWA配信物検証を実行する。
- `npm run test:e2e` — 書き出し済みPWAをChromiumで検証する。

Expo SDK 57はNode.js 22.13以上を必要とします。Expo CLIはprojectの `expo` packageに含まれるため、global installではなくnpm scriptsまたは `npx expo` を使用します。

ネイティブAPIの確認にはExpo GoではなくDevelopment Buildを使用します。署名済みビルドにはExpoおよびApple/Googleの資格情報が必要です。

`expo-doctor`のReact Native Directory確認では、計画で採用したWatermelonDBと内部依存のsimdjsonを明示的に除外しています。WatermelonDB 0.28はNew Architectureがディレクトリ上で未検証のため、Development Buildでの実機DB移行・ロールバック試験をリリース条件として扱います。

## AI-Memoryとの関係

実装の正本はこのGit repositoryです。目的、現在状態、TODO、系譜、Golden Journeyは `../AI-Memory/Projects/traning-compass/` が正本です。作業開始時は少なくとも `PROJECT.md`、`CURRENT.md`、`TODO.md` を読み、一次コードやテストの結果が記録と異なる場合は一次証拠を優先して作業終了時にAI-Memoryを更新します。
