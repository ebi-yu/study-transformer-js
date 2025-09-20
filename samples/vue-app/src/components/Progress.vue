<template>
  <div class="progress-container">
    <div class="progress-bar" :style="{ width: percentage + '%' }">
      {{ text }} ({{ formattedPercentage }}%)
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

// propsを受け取る
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  percentage: {
    type: Number,
    default: 0,
  },
});

// 小数点2桁にフォーマットした表示用の値
const formattedPercentage = computed(() => {
  return props.percentage.toFixed(2);
});
</script>

<style scoped>
.progress-container {
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  background-color: #4caf50;
  color: #fff;
  padding: 4px;
  transition: width 0.3s;
}
</style>
