<template>
  <div class="min-h-screen bg-background p-8">
    <div class="mx-auto max-w-4xl space-y-8">
      <!-- ヘッダー -->
      <header class="text-center">
        <h1 class="text-3xl font-bold tracking-tight">リアルタイム翻訳アプリ</h1>
        <p class="text-muted-foreground mt-2">
          Transformer.jsを使用した英語から日本語へのリアルタイム翻訳
        </p>
      </header>

      <!-- 初期化状態 -->
      <div
        v-if="!translationService.isLoaded && !error"
        data-testid="initialization-status"
        class="text-center p-4 bg-muted rounded-lg"
      >
        <div class="animate-pulse">翻訳モデルを初期化中...</div>
      </div>

      <!-- エラー表示 -->
      <div
        v-if="error"
        data-testid="error-message"
        class="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive"
      >
        {{ error }}
      </div>

      <!-- メインコンテンツ -->
      <div v-if="translationService.isLoaded" class="grid gap-6 md:grid-cols-2">
        <!-- 入力エリア -->
        <div class="space-y-2">
          <label class="text-sm font-medium">入力テキスト（英語）</label>
          <TranslationInput
            v-model="inputText"
            @input="handleInput"
          />
        </div>

        <!-- 出力エリア -->
        <div class="space-y-2">
          <label class="text-sm font-medium">翻訳結果（日本語）</label>
          <TranslationOutput
            :translated-text="translatedText"
            :is-translating="isTranslating"
            @copy="handleCopy"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TranslationInput from './components/TranslationInput.vue'
import TranslationOutput from './components/TranslationOutput.vue'
import { TranslationService } from './services/TranslationService'

// リアクティブな状態
const inputText = ref('')
const translatedText = ref('')
const isTranslating = ref(false)
const error = ref('')

// 翻訳サービスのインスタンス
const translationService = new TranslationService()

// 翻訳の実行
const translateText = async (text: string) => {
  if (!text.trim()) {
    translatedText.value = ''
    return
  }

  isTranslating.value = true
  error.value = ''

  try {
    const result = await translationService.translate(text)
    translatedText.value = result
  } catch (err) {
    error.value = '翻訳中にエラーが発生しました'
    console.error('Translation error:', err)
  } finally {
    isTranslating.value = false
  }
}

// 入力テキストの変更ハンドラー
const handleInput = (text: string) => {
  inputText.value = text
  translateText(text)
}

// コピー機能
const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

// コンポーネントのマウント時に翻訳サービスを初期化
onMounted(async () => {
  try {
    await translationService.initialize()
  } catch (err) {
    error.value = 'モデルの初期化に失敗しました'
    console.error('Initialization error:', err)
  }
})
</script>
