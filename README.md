# 概要

このリポジトリはtransformer.jsの学習用です。
transformer.jsは、Hugging FaceのTransformersライブラリをJavaScriptで実装したもので、ブラウザやNode.js環境で機械学習モデルを実行するためのツールです。
transformer.jsを用いるとブラウザ上でもAIを利用したアプリケーションを構築できます。

## Hugging Faceとは

Hugging Faceとは、機械学習モデルの共有と利用を促進するためのプラットフォームです。
Hugging Faceには、数千もの事前学習済みモデルが公開されており、これらのモデルは様々なタスク（自然言語処理、画像認識、音声認識など）に利用できます。

<https://huggingface.co/>

## Transformer.jsとは

Transformer.jsは、Hugging FaceのTransformersライブラリの一部をJavaScriptで実装したものです。
Transformer.jsを使用すると、ブラウザやNode.js環境で機械学習モデルを実行できます。

- 📝自然言語処理：テキスト分類、固有表現認識、質問応答、言語モデル化、要約、翻訳、複数選択、テキスト生成。
- 🖼️コンピューター ビジョン: 画像分類、オブジェクト検出、セグメンテーション、深度推定。
- 🗣️オーディオ: 自動音声認識、オーディオ分類、およびテキスト読み上げ。
- 🐙マルチモーダル: 埋め込み、ゼロショットオーディオ分類、ゼロショット画像分類、ゼロショットオブジェクト検出。

<https://huggingface.co/docs/transformers.js/index>

### Transformer.jsの仕組み

Transformer.jsは、ダウンロードしたモデルをブラウザのIndexedDBに保存し、必要に応じてWebFLやWSMを使用してモデルを実行します。以下に、Transformer.jsがどのように動作するかを示します。

1. モデルのダウンロード: Transformer.jsは、Hugging Faceのモデルをダウンロードし、ブラウザのIndexedDBに保存します。
2. モデルの実行: 必要に応じて、Transformer.jsはWebGLやWSMを使用してモデルを実行します。これにより、ブラウザ上で高速にモデルを実行できます。
3. 結果の取得: モデルの実行結果は、JavaScriptのPromiseとして返されます。これにより、非同期的に結果を取得できます。
4.

### モデルの形式について

モデルは`.onnx`という形式で提供されます。ONNX（Open Neural Network Exchange）は、FacebookとMicrosoftが共同で開発したオープンソースの深層学習モデルのフォーマットです。ONNXは、異なるフレームワーク間でモデルを共有するための標準的な形式を提供します。

### WASMとWebGLについて

WASM（WebAssembly）は、ブラウザ上で高性能なコードを実行するためのバイナリ形式の命令セットです。WASMを使用すると、C++やRustなどの言語で書かれたコードをブラウザ上で実行できます。
Transformer.jsでは、WASMを使用してモデルの推論を高速化しています。

WebGLは、ブラウザ上で3Dグラフィックスを描画するためのAPIです。
Transformer.jsでは、WebGLを使用することでWASMよりもさらに高速にモデルを実行できます。
ただ、初回のモデルの読み込みに時間がかかる場合があります。

## 実装時のポイント

以下に、Transformer.jsを実装する際のポイントを示します。

### react/vue + vite/webpackなどのbundlerを使う場合の注意点

Vite や Webpack などの bundler を使うと、モデルの JSON 取得先が誤って書き換わり、`Unexpected token '<'` が出ることがあります。

このエラーは「JSON を期待したのに HTML が返ってきた」＝**正しいモデル JSON が取得できていない**ことを意味します。

<https://github.com/huggingface/transformers.js/issues/366>>
<https://github.com/huggingface/transformers.js/issues/142#issuecomment-2018319444>

#### 1.回避方法

環境変数の設定で回避可能.
これにより bundler によるパスの誤解決やキャッシュの不整合を防げます。

```ts
import { env } from "@xenova/transformers";

env.allowLocalModels = false;   // ローカルのモデル参照を無効化
env.useBrowserCache = false;   // ブラウザキャッシュを使わない
```

##### 追加の対策ポイント

- 必要に応じて `env.localModelPath` や `env.remoteModelPath` を明示的に指定してパスを固定する。
- bundler を使わず CDN 経由でロードする場合は問題が発生しにくい。

### モデルをグローバルにキャッシュする

Transformer.js はモデルのロードに時間がかかる場合があります。
特に、アプリケーションの複数のコンポーネントで同じモデルを使用する場合、各コンポーネントでモデルを再度ロードすると無駄に時間がかかります。  
globalThis にモデルをキャッシュしておくと、モデルがキャッシュされ、再度ロードする必要がなくなります。

```js
if (!globalThis.__translator) {
  globalThis.__translator = await pipeline(
    "object-detection",
    "Xenova/detr-resnet-50"
  );
}
const detector = globalThis.__translator;
```

### Web Workerでモデルを実行する

Transformer.js はモデルのロードと実行に時間がかかる場合があります。
特に、大きなモデルを使用する場合、メインスレッドでモデルを実行すると、UIがフリーズすることがあります。

Web Workerとは、JavaScriptのコードをバックグラウンドで実行するための仕組みです。
Web Workerを使用してモデルを実行すると、メインスレッドがブロックされるのを防ぎ、UIの応答性を維持できます。Web Workerとの通信には`postMessage`と`onmessage`を使用します。

```ts
const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

worker.postMessage({ text: input.value });
worker.addEventListener("message", onMessageReceived);
```
