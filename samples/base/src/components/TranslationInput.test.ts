import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import TranslationInput from "./TranslationInput.vue";

describe("TranslationInput", () => {
  describe("コンポーネントの表示", () => {
    it("textareaが表示される", () => {
      // Arrange: テスト用のコンポーネントを準備
      const wrapper = mount(TranslationInput);

      // Act: textareaを取得
      const textarea = wrapper.find("textarea");

      // Assert: textareaが存在し、適切な属性を持つ
      expect(textarea.exists()).toBe(true);
      expect(textarea.attributes("placeholder")).toBe(
        "Enter text to translate..."
      );
    });

    it("文字数カウンターが表示される", () => {
      // Arrange: テキストが入力された状態のコンポーネントを準備
      const testText = "Hello";
      const wrapper = mount(TranslationInput, {
        props: {
          modelValue: testText,
        },
      });

      // Act: 文字数カウンターを取得
      const characterCount = wrapper.find('[data-testid="character-count"]');

      // Assert: 正しい文字数が表示される
      expect(characterCount.text()).toBe("5");
    });
  });

  describe("ユーザー入力時の動作", () => {
    it("テキスト入力時にinputイベントが発火される", async () => {
      // Arrange: コンポーネントを準備
      const wrapper = mount(TranslationInput);
      const textarea = wrapper.find("textarea");
      const inputText = "Hello world";

      // Act: テキストを入力
      await textarea.setValue(inputText);

      // Assert: inputイベントが正しく発火される
      expect(wrapper.emitted("input")).toBeTruthy();
      expect(wrapper.emitted("input")?.[0]).toEqual([inputText]);
    });

    it("v-modelバインディングが正しく動作する", async () => {
      // Arrange: 初期値を持つコンポーネントを準備
      const initialText = "Initial text";
      const newText = "New text";
      const wrapper = mount(TranslationInput, {
        props: {
          modelValue: initialText,
          "onUpdate:modelValue": (value: string) =>
            wrapper.setProps({ modelValue: value }),
        },
      });
      const textarea = wrapper.find("textarea");

      // Act: 初期値を確認し、新しい値を入力
      expect(textarea.element.value).toBe(initialText);
      await textarea.setValue(newText);
      await nextTick();

      // Assert: モデル値が更新される
      expect(wrapper.props("modelValue")).toBe(newText);
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なアクセシビリティ属性が設定されている", () => {
      // Arrange: コンポーネントを準備
      const wrapper = mount(TranslationInput);

      // Act: textareaを取得
      const textarea = wrapper.find("textarea");

      // Assert: アクセシビリティ属性が正しく設定されている
      expect(textarea.attributes("aria-label")).toBe("Text to translate");
      expect(textarea.attributes("role")).toBe("textbox");
    });
  });

  describe("スタイリング", () => {
    it("shadcn/vueの適切なCSSクラスが適用されている", () => {
      // Arrange: コンポーネントを準備
      const wrapper = mount(TranslationInput);

      // Act: textareaを取得
      const textarea = wrapper.find("textarea");

      // Assert: 必要なCSSクラスが適用されている
      expect(textarea.classes()).toContain("flex");
      expect(textarea.classes()).toContain("min-h-[80px]");
      expect(textarea.classes()).toContain("w-full");
      expect(textarea.classes()).toContain("rounded-md");
    });
  });
});
