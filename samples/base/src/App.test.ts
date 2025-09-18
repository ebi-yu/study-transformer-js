import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import App from "./App.vue";
import TranslationInput from "./components/TranslationInput.vue";
import TranslationOutput from "./components/TranslationOutput.vue";

// TranslationService クラスをテスト用モッククラスで置換
vi.mock("./services/TranslationService", () => {
  class MockTranslationService {
    initialize = vi.fn();
    translate = vi.fn();
    isLoaded = false;
  }
  return { TranslationService: MockTranslationService };
});

describe("App", () => {
  let mockTranslationService: any;

  beforeEach(async () => {
    const mod = await import("./services/TranslationService");
    const Cls: any = mod.TranslationService;
    mockTranslationService = new Cls();
    mockTranslationService.initialize.mockResolvedValue(undefined);
    mockTranslationService.translate.mockResolvedValue("こんにちは、世界！");
  });

  describe("アプリケーションの初期表示", () => {
    it("タイトルが表示される", () => {
      // Arrange & Act: アプリケーションをマウント
      const wrapper = mount(App);

      // Assert: タイトルが表示される
      const title = wrapper.find("h1");
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe("リアルタイム翻訳アプリ");
    });

    it("初期化完了後に入力コンポーネントと出力コンポーネントが表示される", async () => {
      // Arrange: 初期化が完了した状態
      mockTranslationService.isLoaded = true;

      // Act: アプリケーションをマウント
      const wrapper = mount(App);
      await nextTick();

      // Assert: 入力と出力コンポーネントが存在する
      const inputComponent = wrapper.findComponent(TranslationInput);
      const outputComponent = wrapper.findComponent(TranslationOutput);

      expect(inputComponent.exists()).toBe(true);
      expect(outputComponent.exists()).toBe(true);
    });

    it("初期化中はローディング状態が表示される", () => {
      // Arrange & Act: アプリケーションをマウント
      const wrapper = mount(App);

      // Assert: 初期化中メッセージが表示される
      const initMessage = wrapper.find('[data-testid="initialization-status"]');
      expect(initMessage.exists()).toBe(true);
      expect(initMessage.text()).toContain("翻訳モデルを初期化中");
    });
  });

  describe("リアルタイム翻訳機能", () => {
    it("テキスト入力時に翻訳が実行される", async () => {
      // Arrange: 初期化済みのアプリケーションを準備
      mockTranslationService.isLoaded = true;
      const wrapper = mount(App);
      await nextTick();

      const inputComponent = wrapper.findComponent(TranslationInput);

      // Act: テキストを入力
      await inputComponent.vm.$emit("input", "Hello, world!");
      await nextTick();

      // Assert: 翻訳サービスが呼ばれる
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "Hello, world!"
      );
    });

    it("翻訳結果が出力コンポーネントに渡される", async () => {
      // Arrange: 初期化済みのアプリケーションを準備
      mockTranslationService.isLoaded = true;
      const wrapper = mount(App);
      await nextTick();

      const inputComponent = wrapper.findComponent(TranslationInput);

      // Act: テキストを入力し翻訳を実行
      await inputComponent.vm.$emit("input", "Hello, world!");
      await nextTick();

      // Assert: 出力コンポーネントに翻訳結果が渡される
      const outputComponent = wrapper.findComponent(TranslationOutput);
      expect(outputComponent.props("translatedText")).toBe(
        "こんにちは、世界！"
      );
    });

    it("翻訳中はローディング状態が表示される", async () => {
      // Arrange: 翻訳に時間がかかるように設定
      mockTranslationService.isLoaded = true;
      mockTranslationService.translate.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve("結果"), 100))
      );
      const wrapper = mount(App);
      await nextTick();

      const inputComponent = wrapper.findComponent(TranslationInput);

      // Act: テキストを入力
      await inputComponent.vm.$emit("input", "Hello");

      // Assert: ローディング状態が表示される
      const outputComponent = wrapper.findComponent(TranslationOutput);
      expect(outputComponent.props("isTranslating")).toBe(true);
    });

    it("空のテキストの場合は翻訳を実行しない", async () => {
      // Arrange: 初期化済みのアプリケーションを準備
      mockTranslationService.isLoaded = true;
      const wrapper = mount(App);
      await nextTick();

      const inputComponent = wrapper.findComponent(TranslationInput);

      // Act: 空のテキストを入力
      await inputComponent.vm.$emit("input", "");
      await nextTick();

      // Assert: 翻訳サービスが呼ばれない
      expect(mockTranslationService.translate).not.toHaveBeenCalled();
    });
  });

  describe("コピー機能", () => {
    it("コピーイベント時にクリップボードにコピーされる", async () => {
      // Arrange: クリップボードAPIのモック
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      mockTranslationService.isLoaded = true;
      const wrapper = mount(App);
      const outputComponent = wrapper.findComponent(TranslationOutput);

      // Act: コピーイベントを発火
      const textToCopy = "コピーされるテキスト";
      await outputComponent.vm.$emit("copy", textToCopy);

      // Assert: クリップボードにテキストがコピーされる
      expect(mockWriteText).toHaveBeenCalledWith(textToCopy);
    });
  });

  describe("エラーハンドリング", () => {
    it("翻訳エラー時にエラーメッセージが表示される", async () => {
      // Arrange: 翻訳でエラーが発生するように設定
      mockTranslationService.isLoaded = true;
      mockTranslationService.translate.mockRejectedValue(
        new Error("翻訳エラー")
      );
      const wrapper = mount(App);
      await nextTick();

      const inputComponent = wrapper.findComponent(TranslationInput);

      // Act: テキストを入力
      await inputComponent.vm.$emit("input", "Hello");
      await nextTick();

      // Assert: エラーメッセージが表示される
      const errorMessage = wrapper.find('[data-testid="error-message"]');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toContain("翻訳中にエラーが発生しました");
    });

    it("初期化エラー時にエラーメッセージが表示される", async () => {
      // Arrange: 初期化でエラーが発生するように設定
      mockTranslationService.initialize.mockRejectedValue(
        new Error("初期化エラー")
      );

      // Act: アプリケーションをマウント
      const wrapper = mount(App);

      // 初期化の完了を待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
      await nextTick();

      // Assert: エラーメッセージが表示される
      const errorMessage = wrapper.find('[data-testid="error-message"]');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toContain("モデルの初期化に失敗しました");
    });
  });
});
