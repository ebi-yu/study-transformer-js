<template>
  <h1>Transformers.js : 翻訳デモ</h1>

  <div class="container">
    <div class="language-container">
      <LanguageSelector
        type="Source"
        :defaultLanguage="'eng_Latn'"
        @update:language="(lang) => (sourceLanguage = lang)"
      />
      <LanguageSelector
        type="Target"
        :defaultLanguage="'jpn_Jpan'"
        @update:language="(lang) => (targetLanguage = lang)"
      />
    </div>

    <div class="textbox-container">
      <textarea v-model="input" rows="10"></textarea>
      <textarea v-model="output" rows="10" readonly></textarea>
    </div>
  </div>

  <button :disabled="disabled" @click="translate">{{ buttonLabel }}</button>

  <div class="progress-bars-container">
    <div v-for="data in progressItems" :key="data.file">
      <Progress :text="data.file" :percentage="data.progress" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import LanguageSelector from "./components/LanguageSelector.vue";
import Progress from "./components/Progress.vue";

// 状態管理
const disabled = ref(false);
const progressItems = ref([]);
const buttonLabel = computed(() =>
  disabled.value ? "Loading..." : "Translate"
);

const input = ref("I love walking my dog.");
const sourceLanguage = ref("eng_Latn");
const targetLanguage = ref("jpn_Jpan");
const output = ref("");

// Worker 参照
let worker = null;

onMounted(() => {
  if (!worker) {
    worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
  }

  const onMessageReceived = (e) => {
    switch (e.data.status) {
      case "initiate":
        progressItems.value.push(e.data);
        disabled.value = true;
        break;
      case "progress":
        progressItems.value = progressItems.value.map((item) =>
          item.file === e.data.file
            ? { ...item, progress: e.data.progress }
            : item
        );
        break;
      case "done":
        progressItems.value = progressItems.value.filter(
          (item) => item.file !== e.data.file
        );
        break;
      case "ready_to_translate":
        // 翻訳準備完了
        progressItems.value = [];
        disabled.value = false;
        break;
      case "error":
        console.error("Worker error:", e.data.error);
        disabled.value = false;
        break;
      case "translated":
        output.value = e.data.output;
        disabled.value = false;
        break;
    }
  };

  worker.addEventListener("message", onMessageReceived);

  onUnmounted(() => {
    worker.removeEventListener("message", onMessageReceived);
  });
});

const translate = () => {
  disabled.value = true;
  worker.postMessage({
    text: input.value,
    src_lang: sourceLanguage.value,
    tgt_lang: targetLanguage.value,
  });
};
</script>

<style scoped>
.container {
  margin: 1rem 0;
}
.language-container {
  display: flex;
  gap: 1rem;
}
.textbox-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.progress-bars-container {
  margin-top: 1rem;
}

button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
