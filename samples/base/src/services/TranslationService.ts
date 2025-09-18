import { pipeline, TranslationPipeline } from "@xenova/transformers";

// 利用候補モデル（先頭から順に試行）
// 単言語ペア -> 汎用多言語順 (JS 変換済み優先: xenova-* / nllb / m2m100)
const MODEL_CANDIDATES = [
  "Xenova/nllb-200-distilled-600M",
  "Xenova/m2m100_418M",
  "Xenova/mbart-large-50-many-to-many-mmt",
];

export class TranslationService {
  private model: TranslationPipeline | null = null;
  private _isLoaded = false;
  private _usedModel: string | null = null;

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  get usedModel(): string | null {
    return this._usedModel;
  }

  /**
   * モデル初期化
   * - 複数モデルを順に試行
   * - JSON ではなく HTML が返る（= 404/エラーページ）ケースを検出してフォールバック
   */
  async initialize(): Promise<void> {
    this._isLoaded = false;
    let lastError: unknown = null;

    for (const modelId of MODEL_CANDIDATES) {
      try {
        // 第3引数のオプション型がライブラリ更新で変わることがあるため安全側で省略
        this.model = await pipeline("translation", modelId);
        this._isLoaded = true;
        this._usedModel = modelId;
        return;
      } catch (err: any) {
        console.log(err);
        lastError = err;
        // HTML 断片検出（Unexpected token '<' など）
        const message = (err?.message || "") as string;
        if (/Unexpected token '<'/.test(message)) {
          continue;
        }
        // それ以外のエラーでも次モデルを試す方針
        continue;
      }
    }

    // すべて失敗
    this._isLoaded = false;
    this._usedModel = null;
    throw new Error(
      `翻訳モデル初期化に失敗しました (tried: ${MODEL_CANDIDATES.join(", ")})\nLast error: ${(lastError as any)?.message || lastError}`
    );
  }

  /**
   * 翻訳実行
   * ライブラリの出力差異に備え translation_text / text 双方を考慮
   */
  async translate(text: string): Promise<string> {
    if (!text.trim()) return "";
    if (!this.model || !this._isLoaded) {
      throw new Error("翻訳モデルが初期化されていません");
    }

    try {
      const results = await this.model(text, {
        src_lang: "ja",
        tgt_lang: "en",
      });
      return results[0].translation_text || results[0].text || "";
    } catch (error) {
      throw error;
    }
  }
}
