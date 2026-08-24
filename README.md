# Life Compass

Study CompassとTraining Compassを切り替えながら、資格勉強・運動・回復の「次の一歩」を小さくするExpoアプリです。PWA、iOS、Androidを同じTypeScriptコードベースで提供します。

## Data and privacy

- 状態はWatermelonDBへ保存します。WebはIndexedDB、iOS/AndroidはSQLiteです。
- JSONバックアップは手動で作成・復元できます。
- HealthKit / Health Connectは体重とワークアウトの読み取り専用です。
- カメラはライブ自己確認だけに使い、写真・動画・音声を保存しません。
- クラウド同期、広告、課金、医療診断はありません。

## Commands

`npm run check`で型検査、単体・プロパティテスト、Web書き出し、PWA配信物検証を実行します。

`npm run test:e2e`で書き出し済みPWAをChromiumへ配信し、JavaScriptのMIMEとHydration後の操作、主要ルートを確認します。

ネイティブAPIの確認にはExpo GoではなくDevelopment Buildを使用します。署名済みビルドにはExpoおよびApple/Googleの資格情報が必要です。

`expo-doctor`のReact Native Directory確認では、計画で採用したWatermelonDBと内部依存のsimdjsonを明示的に除外しています。WatermelonDB 0.28はNew Architectureがディレクトリ上で未検証のため、Development Buildでの実機DB移行・ロールバック試験をリリース条件として扱います。
