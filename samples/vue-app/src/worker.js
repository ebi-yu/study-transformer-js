import { env, pipeline } from "@xenova/transformers";

// Transformers.jsの環境設定を最小限に
env.allowLocalModels = false;
env.useBrowserCache = false;

// デバッグのためにコンソールログを有効にする
if (typeof window !== "undefined") {
  window.transformersDebug = true;
}

class MyTranslationPipeline {
  static task = "translation";
  static model = "Xenova/nllb-200-distilled-600M";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        // シンプルな設定でパイプラインを初期化
        this.instance = await pipeline(this.task, this.model, {
          progress_callback: (progress) => {
            if (progress_callback) progress_callback(progress);
          },
        });

        console.log("Model loaded successfully");
      } catch (error) {
        console.error("Pipeline initialization failed:", error);
        console.error("Error stack:", error.stack);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          cause: error.cause,
        });

        self.postMessage({
          status: "error",
          error: `モデルの初期化に失敗しました: ${error.message}`,
        });
        throw error;
      }
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  try {
    // Retrieve the translation pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let translator = await MyTranslationPipeline.getInstance((x) => {
      // We also add a progress callback to the pipeline so that we can
      // track model loading.
      self.postMessage(x);
    });

    // パイプラインが正常に初期化されたことを通知
    self.postMessage({
      status: "ready",
    });

    let output = await translator(event.data.text, {
      src_lang: event.data.src_lang,
      tgt_lang: event.data.tgt_lang,
    });
    self.postMessage({
      status: "update",
      output: output[0].translation_text,
    });
  } catch (error) {
    console.error("Translation error:", error);
    self.postMessage({
      status: "error",
      error: `翻訳処理でエラーが発生しました: ${error.message}`,
    });
  }
});
