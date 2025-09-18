<template>
  <div class="w-full space-y-2">
    <textarea
      :value="modelValue"
      @input="handleInput"
      placeholder="Enter text to translate..."
      aria-label="Text to translate"
      role="textbox"
      class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
    <div class="flex justify-end">
      <span
        data-testid="character-count"
        class="text-xs text-muted-foreground"
      >
        {{ characterCount }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

const characterCount = computed(() => {
  return props.modelValue?.length || 0
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value

  emit('update:modelValue', value)
  emit('input', value)
}
</script>