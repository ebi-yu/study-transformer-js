import { env, pipeline } from "@xenova/transformers";

// bundlerかつTransformer.jsを使う場合に必要
env.allowLocalModels = false;
env.useBrowserCache = false;

// デバッグのためにコンソールログを有効にする
if (typeof window !== "undefined") {
  window.transformersDebug = true;
}

// グローバル変数を初期化
globalThis.__translator = null;

// メッセージを送信する共通関数
function sendMessage(data) {
  switch (data.status) {
    case "initiate":
      console.log("Loading model...");
      self.postMessage({
        status: "initiate",
        file: data.file,
        progress: 0,
      });
      break;
    case "progress":
      self.postMessage({
        status: "progress",
        file: data.file,
        progress: Math.round(data.progress * 100),
      });
      break;
    case "done":
      console.log("Model loaded successfully");
      self.postMessage({
        status: "done",
        file: data.file,
      });
      break;
    case "error":
      console.error("Translation error:", data.error);
      self.postMessage({
        status: "error",
        error: data.error,
      });
      break;
    case "ready":
      console.log("Model loaded successfully Ready");
      self.postMessage({
        status: "ready_to_translate",
        file: data.file,
      });
      break;
    default:
      // その他のメッセージはそのまま送信
      self.postMessage(data);
      break;
  }
}

async function getInstance(callback) {
  if (globalThis.__translator === null) {
    try {
      callback({ status: "initiate", progress: 0 });

      globalThis.__translator = await pipeline(
        "translation",
        "Xenova/m2m100_418M",
        {
          progress_callback: (progress) => {
            console.log("Progress:", progress);
            callback(progress);
          },
        }
      );
    } catch (error) {
      console.error("Error loading model:", error);
      callback({
        status: "error",
        error: `モデルの初期化に失敗しました: ${error.message}`,
      });
      throw error;
    }
  }
  return globalThis.__translator;
}

self.addEventListener("message", async (event) => {
  try {
    let translator = await getInstance(sendMessage);

    let output = await translator(event.data.text, {
      src_lang: event.data.src_lang,
      tgt_lang: event.data.tgt_lang,
    });

    self.postMessage({
      status: "translated",
      output: output[0].translation_text,
    });
  } catch (error) {
    sendMessage({
      status: "error",
      error: `翻訳処理でエラーが発生しました: ${error.message}`,
    });
  }
});

getInstance(sendMessage).catch((error) => {
  console.error("Failed to initialize model:", error);
});
