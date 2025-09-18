import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TranslationOutput from './TranslationOutput.vue'

describe('TranslationOutput', () => {
  describe('表示状態の管理', () => {
    it('翻訳結果が表示される', () => {
      // Arrange: 翻訳結果を含むプロパティでコンポーネントを準備
      const translatedText = 'こんにちは、世界！'
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText
        }
      })

      // Act: 翻訳結果の表示エリアを取得
      const output = wrapper.find('[data-testid="translation-output"]')

      // Assert: 翻訳結果が正しく表示される
      expect(output.exists()).toBe(true)
      expect(output.text()).toBe(translatedText)
    })

    it('翻訳結果が空の場合はプレースホルダーが表示される', () => {
      // Arrange: 空の翻訳結果でコンポーネントを準備
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText: ''
        }
      })

      // Act: プレースホルダーエリアを取得
      const placeholder = wrapper.find('[data-testid="translation-placeholder"]')

      // Assert: プレースホルダーが表示される
      expect(placeholder.exists()).toBe(true)
      expect(placeholder.text()).toBe('翻訳結果がここに表示されます')
    })

    it('翻訳中はローディング状態が表示される', () => {
      // Arrange: ローディング状態でコンポーネントを準備
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText: '',
          isTranslating: true
        }
      })

      // Act: ローディングインジケーターを取得
      const loading = wrapper.find('[data-testid="translation-loading"]')

      // Assert: ローディング状態が表示される
      expect(loading.exists()).toBe(true)
      expect(loading.text()).toContain('翻訳中')
    })
  })

  describe('コピー機能', () => {
    it('コピーボタンが翻訳結果がある場合に表示される', () => {
      // Arrange: 翻訳結果があるコンポーネントを準備
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText: 'こんにちは'
        }
      })

      // Act: コピーボタンを取得
      const copyButton = wrapper.find('[data-testid="copy-button"]')

      // Assert: コピーボタンが表示される
      expect(copyButton.exists()).toBe(true)
    })

    it('翻訳結果がない場合はコピーボタンが表示されない', () => {
      // Arrange: 翻訳結果がないコンポーネントを準備
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText: ''
        }
      })

      // Act: コピーボタンを取得
      const copyButton = wrapper.find('[data-testid="copy-button"]')

      // Assert: コピーボタンが表示されない
      expect(copyButton.exists()).toBe(false)
    })

    it('コピーボタンクリック時にcopyイベントが発火される', async () => {
      // Arrange: 翻訳結果があるコンポーネントを準備
      const translatedText = 'こんにちは'
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText
        }
      })
      const copyButton = wrapper.find('[data-testid="copy-button"]')

      // Act: コピーボタンをクリック
      await copyButton.trigger('click')

      // Assert: copyイベントが発火される
      expect(wrapper.emitted('copy')).toBeTruthy()
      expect(wrapper.emitted('copy')?.[0]).toEqual([translatedText])
    })
  })

  describe('アクセシビリティ', () => {
    it('適切なアクセシビリティ属性が設定されている', () => {
      // Arrange: コンポーネントを準備
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText: 'テスト'
        }
      })

      // Act: コンテナエリアを取得
      const container = wrapper.find('div[role="region"]')

      // Assert: アクセシビリティ属性が正しく設定されている
      expect(container.attributes('aria-label')).toBe('Translation result')
      expect(container.attributes('role')).toBe('region')
    })

    it('コピーボタンに適切なアクセシビリティ属性が設定されている', () => {
      // Arrange: コンポーネントを準備
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText: 'テスト'
        }
      })

      // Act: コピーボタンを取得
      const copyButton = wrapper.find('[data-testid="copy-button"]')

      // Assert: アクセシビリティ属性が正しく設定されている
      expect(copyButton.attributes('aria-label')).toBe('Copy translation result')
    })
  })

  describe('スタイリング', () => {
    it('shadcn/vueの適切なCSSクラスが適用されている', () => {
      // Arrange: コンポーネントを準備
      const wrapper = mount(TranslationOutput, {
        props: {
          translatedText: 'テスト'
        }
      })

      // Act: コンテナエリアを取得
      const container = wrapper.find('div[role="region"]')

      // Assert: 必要なCSSクラスが適用されている
      expect(container.classes()).toContain('min-h-[80px]')
      expect(container.classes()).toContain('rounded-md')
      expect(container.classes()).toContain('border')
    })
  })
})