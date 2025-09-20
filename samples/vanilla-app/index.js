import {
  env,
  pipeline,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";

env.allowLocalModels = false; // ローカルモデルの使用を禁止

// UI要素の取得
const status = document.getElementById("status");
const fileUpload = document.getElementById("file-upload");
const imageContainer = document.getElementById("image-container");

// モデルのロード
status.textContent = "Loading model...";
if (!globalThis.__translator) {
  globalThis.__translator = await pipeline(
    "object-detection",
    "Xenova/detr-resnet-50"
  );
}
const detector = globalThis.__translator;
status.textContent = "Ready";

// 画像がアップロードされたときの処理
fileUpload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();

  // Set up a callback when the file is loaded
  reader.onload = function (e2) {
    imageContainer.innerHTML = "";
    const image = document.createElement("img");
    image.src = e2.target.result;
    imageContainer.appendChild(image);
    detect(image);
  };
  reader.readAsDataURL(file);
});

// 画像内の物体を検出する
async function detect(img) {
  status.textContent = "Analysing...";
  const output = await detector(img.src, {
    threshold: 0.5,
    percentage: true,
  });
  status.textContent = "";
  output.forEach(renderBox);
}

// 画像にバウンディングボックスとラベルを描画する
function renderBox({ box, label }) {
  const { xmax, xmin, ymax, ymin } = box;

  // ボックスにランダムな色を割り当てる
  const color =
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, 0);

  // ボックスを描画する
  const boxElement = document.createElement("div");
  boxElement.className = "bounding-box";
  Object.assign(boxElement.style, {
    borderColor: color,
    left: 100 * xmin + "%",
    top: 100 * ymin + "%",
    width: 100 * (xmax - xmin) + "%",
    height: 100 * (ymax - ymin) + "%",
  });

  // ラベルを描画する
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  labelElement.className = "bounding-box-label";
  labelElement.style.backgroundColor = color;

  boxElement.appendChild(labelElement);
  imageContainer.appendChild(boxElement);
}
