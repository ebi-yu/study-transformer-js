<template>
  <h1>Transformers.js</h1>
  <h2>ML-powered multilingual translation in Vue 3!</h2>

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
      <textarea v-model="input" rows="3"></textarea>
      <textarea v-model="output" rows="3" readonly></textarea>
    </div>
  </div>

  <button :disabled="disabled" @click="translate">Translate</button>

  <div class="progress-bars-container">
    <label v-if="ready === false">Loading models... (only run once)</label>
    <div v-for="data in progressItems" :key="data.file">
      <Progress :text="data.file" :percentage="data.progress" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import LanguageSelector from "./components/LanguageSelector.vue";
import Progress from "./components/Progress.vue";

// 状態管理
const ready = ref(null);
const disabled = ref(false);
const progressItems = ref([]);

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
        ready.value = false;
        progressItems.value.push(e.data);
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
      case "ready":
        ready.value = true;
        break;
      case "error":
        console.error("Worker error:", e.data.error);
        ready.value = false;
        disabled.value = false;
        break;
      case "update":
        output.value = e.data.output;
        break;
      case "complete":
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
</style>
