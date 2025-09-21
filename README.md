# study-transformers-js

学習目的でtransformers.jsを試すためのリポジトリです。ブラウザ / Node.js で推論が完結する PoC・デモを素早く作るためのサンプルと実装ノウハウをまとめています。

## サンプル一覧

| ディレクトリ | 説明 | 主目的 |
|--------------|------|--------|
| `samples/vanilla-app` | 最小構成 (Vanilla + Vite) | 基本 API 確認 / パイプライン呼び出し |
| `samples/vue-app` | Vue 3 + Vite + Web Worker + 進捗 UI | 実務寄り構成 / 非同期 & UI 応答性 |

## Hugging Faceとは

Hugging Faceとは、機械学習モデルの共有と利用を促進するためのプラットフォームです。
Hugging Faceには、数千もの事前学習済みモデルが公開されており、これらのモデルは様々なタスク（自然言語処理、画像認識、音声認識など）に利用できます。

<https://huggingface.co/>

## Transformers.jsとは

Transformers.jsは、Hugging FaceのTransformersライブラリの一部をJavaScriptで実装したものです。
Transformers.jsを使用すると、ブラウザやNode.js環境で機械学習モデルを実行できます。

- 📝自然言語処理：テキスト分類、固有表現認識、質問応答、言語モデル化、要約、翻訳、複数選択、テキスト生成。
- 🖼️コンピューター ビジョン: 画像分類、オブジェクト検出、セグメンテーション、深度推定。
- 🗣️オーディオ: 自動音声認識、オーディオ分類、およびテキスト読み上げ。
- 🐙マルチモーダル: 埋め込み、ゼロショットオーディオ分類、ゼロショット画像分類、ゼロショットオブジェクト検出。

<https://huggingface.co/docs/transformers.js/index>

### Transformers.jsの仕組み

Transformers.jsは、ダウンロードしたモデルをブラウザのIndexedDBに保存し、必要に応じてWebGLやWASMを使用してモデルを実行します。以下に、Transformers.jsがどのように動作するかを示します。

1. モデルのダウンロード: Transformers.jsは、Hugging Faceのモデルをダウンロードし、ブラウザのIndexedDBに保存します。
2. モデルの実行: 必要に応じて、Transformers.jsはWebGLやWASMを使用してモデルを実行します。これにより、ブラウザ上で高速にモデルを実行できます。
3. 結果の取得: モデルの実行結果は、JavaScriptのPromiseとして返されます。これにより、非同期的に結果を取得できます。

### モデルの形式について

モデルは`.onnx`という形式で提供されます。ONNX（Open Neural Network Exchange）は、FacebookとMicrosoftが共同で開発したオープンソースの深層学習モデルのフォーマットです。ONNXは、異なるフレームワーク間でモデルを共有するための標準的な形式を提供します。

Pythonを使って学習させたモデルはそのままではTransformers.jsで使えないことがあります。Transformers.jsで使うには、Hugging FaceのTransformersライブラリを使ってONNX形式に変換する必要があります。

### WASMとWebGLについて

WASM（WebAssembly）は、ブラウザ上で高性能なコードを実行するためのバイナリ形式の命令セットです。WASMを使用すると、C++やRustなどの言語で書かれたコードをブラウザ上で実行できます。
Transformers.jsでは、WASMを使用してモデルの推論を高速化しています。

WebGLは、ブラウザ上で3Dグラフィックスを描画するためのAPIです。
Transformers.jsでは、WebGLを使用することでWASMよりもさらに高速にモデルを実行できます。
ただ、初回のモデルの読み込みに時間がかかる場合があります。

### 外部LLMではなく、Transformers.jsを使うメリット

gpt-5やclaude sonetなどの汎用大規模言語モデル（LLM）は、強力な自然言語処理能力を持っており、
わざわざTransformers.jsを使う必要はないように思えます。
しかし、以下のようなケースではTransformers.jsを使うメリットがあります。

- **プライバシー**: 外部のLLMを使用すると、ユーザーデータが第三者に送信される可能性があります。Transformers.jsを使用すると、すべての処理がクライアント側で完結するため、データのプライバシーを保護できます。
- **オフライン動作**: 外部のLLMはインターネット接続が必要ですが、Transformers.jsは一度モデルをダウンロードすればオフラインでも動作します。これにより、ネットワークが不安定な環境でも利用できます。
- **コスト削減**: 外部のLLMはAPI使用料が発生する場合があります。Transformers.jsを使用すると、API使用料を削減できます。
- **カスタマイズ**: Transformers.jsを使用すると、特定のタスクに特化したモデルを使用できます。これにより、特定のユースケースに最適化されたパフォーマンスを実現できます。

## 実装時のポイント

以下に、Transformers.jsを実装する際のポイントを示します。

### react/vue + vite/webpackなどのbundlerを使う場合の注意点

Vite や Webpack などの bundler を使うと、モデルの JSON 取得先が誤って書き換わり、`Unexpected token '<'` が出ることがあります。このエラーは「JSON を期待したのに HTML が返ってきた」＝**正しいモデル JSON が取得できていない**ことを意味します。

回避するには、環境変数を設定します。
これにより bundler によるパスの誤解決やキャッシュの不整合を防げます。

```ts
import { env } from "@xenova/transformers";

env.allowLocalModels = false; // ローカル参照を無効化（相対パス解決の誤作動防止）
env.useBrowserCache = false;   // ブラウザキャッシュを使わない
```

### Web Workerを使ってUIの応答性を保つ

Transformers.jsは、モデルのロードや推論に時間がかかる場合があります。これにより、UIがフリーズしたり、応答性が低下したりすることがあります。
Web Workerを使用すると、モデルのロードや推論をバックグラウンドで実行できるため、UIの応答性を保つことができます。
Web Workerとの通信は、`postMessage`と`onmessage`を使用して行います。

```ts
const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

worker.postMessage({ type: "start", data: inputData });
worker.onmessage = (event) => {
  const { status, result, progress } = event.data;
  if (status === "result") {
    // 結果を処理
  } else if (status === "progress") {
    // 進捗を処理
  }
};
```

### WASMではなくWebGLを使う

Transformers.jsは、WASMとWebGLの両方をサポートしています。WebGLは、WASMよりも高速にモデルを実行できる場合があります。
ただし、WebGLは初回のモデルの読み込みに時間がかかる場合があります。
WebGLを使用するには、`use`オプションを設定します。  

```ts
const translator = await pipeline("translation", model, { use: "webgl" });
```

### モデル情報をglobalThisにキャッシュする

globalThisにモデル情報をキャッシュすることで、同じモデルを複数回ロードする場合に、再度ダウンロードする必要がなくなります。

```ts
if (!globalThis.translator) {
  globalThis.translator = await pipeline("translation", "Xenova/nllb-200-distilled-600M", { use: "webgl" });
}
const translator = globalThis.translator;
```

### progress_callbackを使って進捗を表示する

Transformers.jsの多くの関数は、`progress_callback`というオプションをサポートしています。
`progress_callback`は、モデルのロードや実行の進捗を監視するためのコールバック関数です。
`progress_callback`を使用すると、ユーザーに進捗状況を表示できます。

```ts
const translator = await pipeline("translation", "Xenova/nllb-200-distilled-600M", {
  progress_callback: (progress) => {
    self.postMessage({
      status: "progress",
      progress,
    });
  },
});

// Vue.jsの例
<template>
  <div v-for="data in progressItems" :key="data.file" class="progress-bar">
    <div class="progress-bar-fill" :style="{ width: data.progress + '%' }"></div>
    <span class="progress-bar-text">{{ data.file }}: {{ data.progress }}%</span>
  </div>
</template>
```

### パフォーマンス最適化のポイント

Transformers.jsはモデルのサイズによっては、ブラウザでのロードや推論に時間がかかる場合があります。以下に、パフォーマンスを最適化するためのポイントを示します。

- **モデルの選択**: より小さなモデルを選択することで、ロード時間と推論時間を短縮できます。必要に応じて、蒸留モデルや量子化モデルを検討してください。
- **WebGLの利用**: 可能であれば、WASMよりも高速なWebGLを使用してください。ただし、初回のロード時間が長くなる場合があります。
- **キャッシュの活用**: IndexedDBやglobalThisにモデルをキャッシュすることで、再度ダウンロードする必要がなくなります。
- **非同期処理**: Web Workerを使用して、モデルのロードや推論をバックグラウンドで実行し、UIの応答性を保ちます。
- **進捗表示**: `progress_callback`を使用して、ユーザーに進捗状況を表示します。
