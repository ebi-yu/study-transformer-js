import { beforeEach, describe, expect, it, vi } from "vitest";
import { TranslationService } from "./TranslationService";

// @xenova/transformersのモック
vi.mock("@xenova/transformers", () => ({
  pipeline: vi.fn(),
}));

describe("TranslationService", () => {
  let translationService: TranslationService;
  let mockPipeline: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const { pipeline } = vi.mocked(await import("@xenova/transformers"));
    mockPipeline = vi.fn();
    // 型整合: テスト内では任意関数を TranslationPipeline 互換として扱う
    pipeline.mockResolvedValue(mockPipeline as any);
    translationService = new TranslationService();
  });

  describe("サービスの初期化", () => {
    it("TranslationServiceインスタンスが正しく作成される", () => {
      // Arrange & Act: TranslationServiceインスタンスを作成

      // Assert: インスタンスが正しく作成される
      expect(translationService).toBeInstanceOf(TranslationService);
      expect(translationService.isLoaded).toBe(false);
    });

    it("モデルが正しく初期化される", async () => {
      // Arrange: モックパイプラインの設定
      const { pipeline } = vi.mocked(await import("@xenova/transformers"));

      // Act: モデルを初期化
      await translationService.initialize();

      // Assert: パイプラインが正しく呼ばれ、モデルが読み込まれる
      expect(pipeline).toHaveBeenCalled();
      expect(translationService.isLoaded).toBe(true);
    });

    it("初期化に失敗した場合はエラーをスローする", async () => {
      // Arrange: パイプラインでエラーが発生するように設定
      const { pipeline } = vi.mocked(await import("@xenova/transformers"));
      const initError = new Error("モデルの読み込みに失敗しました");
      pipeline.mockRejectedValue(initError);

      // Act & Assert: 初期化時にエラーがスローされる
      await expect(translationService.initialize()).rejects.toThrow(
        "モデルの読み込みに失敗しました"
      );
      expect(translationService.isLoaded).toBe(false);
    });
  });

  describe("翻訳機能", () => {
    beforeEach(async () => {
      // 各テスト前にモデルを初期化
      await translationService.initialize();
    });

    it("英語から日本語に正しく翻訳される", async () => {
      // Arrange: 翻訳結果をモック
      const inputText = "Hello, world!";
      const expectedTranslation = "こんにちは、世界！";
      mockPipeline.mockResolvedValue([
        { translation_text: expectedTranslation },
      ]);

      // Act: 翻訳を実行
      const result = await translationService.translate(inputText);

      // Assert: 正しく翻訳される
      expect(mockPipeline).toHaveBeenCalledWith(inputText);
      expect(result).toBe(expectedTranslation);
    });

    it("空の文字列を渡した場合は空文字列を返す", async () => {
      // Arrange: 空の入力テキスト
      const inputText = "";

      // Act: 翻訳を実行
      const result = await translationService.translate(inputText);

      // Assert: 空文字列が返される
      expect(result).toBe("");
      expect(mockPipeline).not.toHaveBeenCalled();
    });

    it("モデルが未初期化の場合はエラーをスローする", async () => {
      // Arrange: 未初期化のサービスインスタンス
      const uninitializedService = new TranslationService();

      // Act & Assert: 翻訳時にエラーがスローされる
      await expect(uninitializedService.translate("Hello")).rejects.toThrow(
        "翻訳モデルが初期化されていません"
      );
    });

    it("翻訳処理でエラーが発生した場合は適切にハンドリングされる", async () => {
      // Arrange: 翻訳処理でエラーが発生するように設定
      const inputText = "Hello, world!";
      const translationError = new Error("翻訳処理でエラーが発生しました");
      mockPipeline.mockRejectedValue(translationError);

      // Act & Assert: 翻訳時にエラーがスローされる
      await expect(translationService.translate(inputText)).rejects.toThrow(
        "翻訳処理でエラーが発生しました"
      );
    });

    it("出力が text キーのみの場合でも翻訳文字列を返す", async () => {
      const inputText = "Good morning";
      const expected = "おはよう";
      mockPipeline.mockResolvedValue([{ text: expected }]);
      const result = await translationService.translate(inputText);
      expect(result).toBe(expected);
    });
  });

  describe("状態管理", () => {
    it("isLoadedプロパティが正しく状態を反映する", async () => {
      // Arrange: 初期状態の確認
      expect(translationService.isLoaded).toBe(false);

      // Act: モデルを初期化
      await translationService.initialize();

      // Assert: 状態が正しく更新される
      expect(translationService.isLoaded).toBe(true);
    });
  });
});
