<template>
  <div class="w-full space-y-2">
    <div
      class="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      role="region"
      aria-label="Translation result"
    >
      <div
        v-if="isTranslating"
        data-testid="translation-loading"
        class="flex items-center justify-center h-full text-muted-foreground"
      >
        <div class="animate-pulse">翻訳中...</div>
      </div>
      <div
        v-else-if="translatedText"
        data-testid="translation-output"
        class="whitespace-pre-wrap"
      >
        {{ translatedText }}
      </div>
      <div
        v-else
        data-testid="translation-placeholder"
        class="flex items-center justify-center h-full text-muted-foreground"
      >
        翻訳結果がここに表示されます
      </div>
    </div>

    <div v-if="translatedText" class="flex justify-end">
      <button
        data-testid="copy-button"
        @click="handleCopy"
        aria-label="Copy translation result"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
      >
        コピー
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  translatedText?: string
  isTranslating?: boolean
}

interface Emits {
  (e: 'copy', text: string): void
}

const props = withDefaults(defineProps<Props>(), {
  translatedText: '',
  isTranslating: false
})

const emit = defineEmits<Emits>()

const handleCopy = () => {
  if (props.translatedText) {
    emit('copy', props.translatedText)
  }
}
</script>