
  const maxSheetWidth = 26.924; // 10.6 inch dalam cm
  const maxSheetHeight = 42.672; // 16.8 inch dalam cm

  const pricingSettings = {
    materialPrices: {
      mirrorkote: 7.00,
      whitepp: 8.0,
      transparent: 15.00,
      pvc: 15.00
    },
    laminateCharges: {
      none: 0,
      matte: 0.5,
      glossy: 0.5
    },
    cuttingCharges: {
      kissCut: 0,
      dieCut: 1.0
    },
    sheetDiscountTiers: [
      { minSheets: 101, price: 4.50 },
      { minSheets: 51, price: 5.00 },
      { minSheets: 21, price: 6.50 }
    ]
  };

  function getBasePrice(material) {
    return pricingSettings.materialPrices[material] || 10.0;
  }

  function getDiscountedPricePerSheet(material, laminate, cutting, sheetCount) {
    const laminateCharge = pricingSettings.laminateCharges[laminate] || 0;
    const cuttingCharge = pricingSettings.cuttingCharges[cutting] || 0;

    for (const tier of pricingSettings.sheetDiscountTiers) {
      if (sheetCount >= tier.minSheets) {
        return tier.price + laminateCharge + cuttingCharge;
      }
    }

    return getBasePrice(material) + laminateCharge + cuttingCharge;
  }

  function convertToCm(value, unit) {
    if (unit === "mm") return value / 10;
    if (unit === "inch") return value * 2.54;
    return value;
  }

  function formatLaminateText(value) {
    if (value === 'none') return 'Tiada';
    if (value === 'matte') return 'Matte';
    if (value === 'glossy') return 'Glossy';
    return value;
  }

  function updateLaminateOptions() {
    const material = document.getElementById("material").value;
    const laminate = document.getElementById("laminate");
    if (material === "transparent") {
      laminate.value = "none";
      laminate.disabled = true;
    } else {
      laminate.disabled = false;
    }
  }

  document.getElementById("material").addEventListener("change", () => {
    updateLaminateOptions();
    calculateStickerCost();
  });

  document.getElementById("laminate").addEventListener("change", () => {
    calculateStickerCost();
  });

  document.getElementById("cutting").addEventListener("change", () => {
    calculateStickerCost();
  });

  // Tambahan event listener untuk input yang ubah harga
  document.getElementById("quantity").addEventListener("input", () => {
    calculateStickerCost();
  });

  document.getElementById("width").addEventListener("input", () => {
    calculateStickerCost();
  });

  document.getElementById("height").addEventListener("input", () => {
    calculateStickerCost();
  });

  document.getElementById("widthUnit").addEventListener("change", () => {
    calculateStickerCost();
  });

  document.getElementById("heightUnit").addEventListener("change", () => {
    calculateStickerCost();
  });

  let isSyncing = false;
  document.getElementById("widthUnit").addEventListener("change", function () {
    if (isSyncing) return;
    isSyncing = true;
    document.getElementById("heightUnit").value = this.value;
    isSyncing = false;
  });

  document.getElementById("heightUnit").addEventListener("change", function () {
    if (isSyncing) return;
    isSyncing = true;
    document.getElementById("widthUnit").value = this.value;
    isSyncing = false;
  });

function calculateStickerCost() {
  const rawWidth = parseFloat(document.getElementById("width").value);
  const rawHeight = parseFloat(document.getElementById("height").value);
  const widthUnit = document.getElementById("widthUnit").value;
  const heightUnit = document.getElementById("heightUnit").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const material = document.getElementById("material").value;
  const laminate = document.getElementById("laminate").value;
  const cutting = document.getElementById("cutting").value;

  const resultBox = document.getElementById("whatsappText");

  if (
    isNaN(rawWidth) || rawWidth <= 0 ||
    isNaN(rawHeight) || rawHeight <= 0 ||
    isNaN(quantity) || quantity <= 0
  ) {
    resultBox.value = "Sila masukkan saiz dan kuantiti yang betul";
    return;
  }

  const width = convertToCm(rawWidth, widthUnit);
  const height = convertToCm(rawHeight, heightUnit);

  if (width > maxSheetWidth || height > maxSheetHeight) {
    resultBox.value = "Saiz sticker melebihi had maksimum cetakan. Sila pastikan saiz sticker anda muat dalam saiz kertas A3";
    return;
  }

  let columns = Math.floor(maxSheetWidth / width);
  let rows = Math.floor(maxSheetHeight / height);
  let stickersPerSheet = columns * rows;

  let altColumns = Math.floor(maxSheetWidth / height);
  let altRows = Math.floor(maxSheetHeight / width);
  let altStickersPerSheet = altColumns * altRows;

  if (altStickersPerSheet > stickersPerSheet) {
    columns = altColumns;
    rows = altRows;
    stickersPerSheet = altStickersPerSheet;
  }

  if (stickersPerSheet < 1) {
    resultBox.value = "Saiz sticker terlalu besar sehingga tak muat satu pun atas satu sheet.";
    return;
  }

  const sheetCount = Math.ceil(quantity / stickersPerSheet);
  const basePricePerSheet = getDiscountedPricePerSheet(material, laminate, cutting, sheetCount);

  const totalCost = basePricePerSheet * sheetCount;
  const pricePerSheet = basePricePerSheet;
  const costPerSticker = totalCost / quantity;

  const unitSymbol = widthUnit; // widthUnit dan heightUnit akan sentiasa sama

  const textForWhatsapp = `
Maklumat Tempahan Sticker:
📐 Saiz: ${rawWidth.toFixed(1)} x ${rawHeight.toFixed(1)} ${unitSymbol}
📦 Kuantiti: ${quantity} pcs
📄 Material: ${material.charAt(0).toUpperCase() + material.slice(1)}
✨ Finishing: ${formatLaminateText(laminate)}
✂ Cutting: ${cutting === 'dieCut' ? 'Die Cut' : 'Kiss Cut'}

✅ Bilangan sticker per sheet: ${stickersPerSheet} (${columns} x ${rows})
📄 A3 Sheet diperlukan: ${sheetCount}
💵 Harga per sheet (A3): RM ${pricePerSheet.toFixed(2)}
💰 Jumlah keseluruhan: RM ${totalCost.toFixed(2)}
💸 Harga per pcs: RM ${costPerSticker.toFixed(2)}`;

  resultBox.value = textForWhatsapp.trim();

  // Optional: Auto-refresh preview grid bila harga dikira
  if (document.getElementById("previewModal").style.display === "block") {
    showPreviewGrid();
  }
}


  document.getElementById("whatsappText").addEventListener("click", function () {
    this.select();
  });

function showPreviewGrid() {
  const quantity = parseInt(document.getElementById("quantity").value);
  const modal = document.getElementById("previewModal");
  const gridContainer = document.getElementById("gridContainer");

  if (isNaN(quantity) || quantity <= 0) {
    gridContainer.innerHTML = "<p style='color:red; text-align: center; padding: 10px;'>Sila isi kuantiti dahulu sebelum melihat preview grid.</p>";

    modal.style.display = "block";
    return;
  }

  modal.style.display = "block";

  const rawWidth = parseFloat(document.getElementById("width").value);
  const rawHeight = parseFloat(document.getElementById("height").value);
  const unit = document.getElementById("widthUnit").value;

  const width = convertToCm(rawWidth, unit);
  const height = convertToCm(rawHeight, unit);

  const maxSheetWidth = 26.924;
  const maxSheetHeight = 42.672;

  let columns = Math.floor(maxSheetWidth / width);
  let rows = Math.floor(maxSheetHeight / height);

  let altColumns = Math.floor(maxSheetWidth / height);
  let altRows = Math.floor(maxSheetHeight / width);

  if ((altColumns * altRows) > (columns * rows)) {
    columns = altColumns;
    rows = altRows;
    
  }

  if (columns < 1 || rows < 1) {
    gridContainer.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; height: 100px;">
    <p style="color: red; text-align: center;">Sila isi saiz dan kuantiti dahulu sebelum melihat preview grid.</p>
  </div>
`;

    return;
  }

  gridContainer.innerHTML = "";
  gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

  for (let i = 0; i < columns * rows; i++) {
    const shape = document.getElementById("shape")?.value || "square";
const div = document.createElement("div");
div.className = "grid-item";

if (shape === "circle") {
  div.classList.add("circle");
} else if (shape === "custom") {
  div.classList.add("custom");
}
    gridContainer.appendChild(div);
  }
  
function closePreviewGrid() {
  document.getElementById("previewModal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("previewModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
  
}


function closePreviewGrid() {
  document.getElementById("previewModal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("previewModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Auto-trigger calculateStickerCost bila input/select berubah
document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('change', calculateStickerCost);
});


const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const shapeSelect = document.getElementById("shape");

function enforceShapeConstraint() {
  const selectedShape = shapeSelect.value;

  if (selectedShape === "circle" || selectedShape === "square") {
    // Auto-sync both inputs
    heightInput.value = widthInput.value;
    heightInput.disabled = true;

    widthInput.addEventListener("input", () => {
      heightInput.value = widthInput.value;
      calculateStickerCost();
    });

  } else {
    // Allow full freedom
    heightInput.disabled = false;
  }

  calculateStickerCost(); // recalculate on shape change
}

shapeSelect.addEventListener("change", enforceShapeConstraint);

// Apply constraint on load too
enforceShapeConstraint();



