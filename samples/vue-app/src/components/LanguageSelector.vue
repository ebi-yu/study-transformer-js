<template>
  <div className="language-selector">
    <label>{{ type }}: </label>
    <select
      :onChange="
        () => {
          emit('update:language', language);
        }
      "
      v-model="language"
    >
      <option v-for="(value, key) in LANGUAGES" :key="key" :value="value">
        {{ key }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  defaultLanguage: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:language"]);
const language = ref(props.defaultLanguage);

const LANGUAGES = {
  Afrikaans: "af",
  Amharic: "am",
  Arabic: "ar",
  Asturian: "ast",
  Azerbaijani: "az",
  Bashkir: "ba",
  Belarusian: "be",
  Bulgarian: "bg",
  Bengali: "bn",
  Breton: "br",
  Bosnian: "bs",
  Catalan: "ca",
  Cebuano: "ceb",
  Czech: "cs",
  Welsh: "cy",
  Danish: "da",
  German: "de",
  Greek: "el",
  English: "en",
  Spanish: "es",
  Estonian: "et",
  Persian: "fa",
  Fulah: "ff",
  Finnish: "fi",
  French: "fr",
  Frisian: "fy",
  Irish: "ga",
  "Scottish Gaelic": "gd",
  Galician: "gl",
  Gujarati: "gu",
  Hausa: "ha",
  Hebrew: "he",
  Hindi: "hi",
  Croatian: "hr",
  Haitian: "ht",
  Hungarian: "hu",
  Armenian: "hy",
  Indonesian: "id",
  Igbo: "ig",
  Iloko: "ilo",
  Icelandic: "is",
  Italian: "it",
  Japanese: "ja",
  Javanese: "jv",
  Georgian: "ka",
  Kazakh: "kk",
  Khmer: "km",
  Kannada: "kn",
  Korean: "ko",
  Luxembourgish: "lb",
  Ganda: "lg",
  Lingala: "ln",
  Lao: "lo",
  Lithuanian: "lt",
  Latvian: "lv",
  Malagasy: "mg",
  Macedonian: "mk",
  Malayalam: "ml",
  Mongolian: "mn",
  Marathi: "mr",
  Malay: "ms",
  Myanmar: "my",
  Nepali: "ne",
  Dutch: "nl",
  Norwegian: "no",
  "Northern Sotho": "ns",
  Occitan: "oc",
  Oriya: "or",
  Panjabi: "pa",
  Polish: "pl",
  Pashto: "ps",
  Portuguese: "pt",
  Romanian: "ro",
  Russian: "ru",
  Sindhi: "sd",
  Sinhalese: "si",
  Slovak: "sk",
  Slovenian: "sl",
  Somali: "so",
  Albanian: "sq",
  Serbian: "sr",
  Sesotho: "st",
  Sundanese: "su",
  Swedish: "sv",
  Swahili: "sw",
  Tamil: "ta",
  Thai: "th",
  Tagalog: "tl",
  Tunisian: "tn",
  Turkish: "tr",
  Ukrainian: "uk",
  Urdu: "ur",
  Uzbek: "uz",
  Vietnamese: "vi",
  Wolof: "wo",
  Xhosa: "xh",
  Yiddish: "yi",
  Yoruba: "yo",
  Chinese: "zh",
  Zulu: "zu",
};
</script>
