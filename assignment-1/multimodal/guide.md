# COCO EDA — GitHub Pages Integration Guide

> How to turn every export from `coco_eda_web.ipynb` into an interactive section of your GitHub Pages site.

---

## Table of Contents

1. [Repository structure](#1-repository-structure)
2. [Export file reference](#2-export-file-reference)
3. [Section-by-section implementation guide](#3-section-by-section-implementation-guide)
   - 3.1 [Hero stats bar — `stats_overview.json`](#31-hero-stats-bar--stats_overviewjson)
   - 3.2 [Data quality panel — `data_quality.json`](#32-data-quality-panel--data_qualityjson)
   - 3.3 [Image resolution explorer — `image_stats.json`](#33-image-resolution-explorer--image_statsjson)
   - 3.4 [Colour profile cards — `color_profiles.json` + `category_color_profiles.json`](#34-colour-profile-cards--color_profilesjson--category_color_profilesjson)
   - 3.5 [Brightness & contrast — `brightness_by_category.json`](#35-brightness--contrast--brightness_by_categoryjson)
   - 3.6 [Bounding-box area — `bbox_area_by_category.json`](#36-bounding-box-area--bbox_area_by_categoryjson)
   - 3.7 [CLIP t-SNE scatter — `tsne_clip.json`](#37-clip-t-sne-scatter--tsne_clipjson)
   - 3.8 [Category gallery — `gallery_manifest.json` + `category_gallery/`](#38-category-gallery--gallery_manifestjson--category_gallery)
   - 3.9 [Co-occurrence heatmap — `cooccurrence.json`](#39-co-occurrence-heatmap--cooccurrencejson)
   - 3.10 [Vocabulary explorer — `vocab_freq.json`](#310-vocabulary-explorer--vocab_freqjson)
   - 3.11 [N-gram bar chart — `ngrams.json`](#311-n-gram-bar-chart--ngramsjson)
   - 3.12 [POS distribution — `pos_distribution.json`](#312-pos-distribution--pos_distributionjson)
   - 3.13 [Jaccard similarity — `jaccard_similarity.json`](#313-jaccard-similarity--jaccard_similarityjson)
   - 3.14 [Object–word alignment — `object_word_align.json`](#314-objectword-alignment--object_word_alignjson)
   - 3.15 [LDA topic explorer — `lda_topics.json`](#315-lda-topic-explorer--lda_topicsjson)
   - 3.16 [Bias dashboard — `bias.json`](#316-bias-dashboard--biasjson)
   - 3.17 [Text t-SNE — `tsne_text.json`](#317-text-t-sne--tsne_textjson)
   - 3.18 [Difficulty histogram — `difficulty.json`](#318-difficulty-histogram--difficultyjson)
4. [Recommended JavaScript libraries](#4-recommended-javascript-libraries)
5. [Site scaffold (copy-paste starter)](#5-site-scaffold-copy-paste-starter)
6. [Deployment checklist](#6-deployment-checklist)

---

## 1. Repository structure

After running the notebook, copy the entire `eda_output/web_exports/` folder into your GitHub Pages repo. Recommended layout:

```
your-repo/
├── index.html                  ← your landing page
├── assets/
│   ├── js/
│   │   └── eda.js              ← your chart/interaction code
│   └── css/
│       └── style.css
└── data/                       ← rename from eda_output/web_exports/
    ├── eda_summary.json
    ├── stats_overview.json
    ├── data_quality.json
    ├── image_stats.json
    ├── color_profiles.json
    ├── category_color_profiles.json
    ├── brightness_by_category.json
    ├── bbox_area_by_category.json
    ├── tsne_clip.json          ← large, ~20–80 MB with thumbnails
    ├── gallery_manifest.json
    ├── category_gallery/
    │   ├── outdoor/
    │   │   ├── 12345.jpg
    │   │   └── ...
    │   ├── food/
    │   └── ...
    ├── cooccurrence.json
    ├── vocab_freq.json
    ├── ngrams.json
    ├── pos_distribution.json
    ├── jaccard_similarity.json
    ├── object_word_align.json
    ├── lda_topics.json
    ├── bias.json
    ├── tsne_text.json
    └── difficulty.json
```

> **GitHub Pages file-size limit:** Individual files must be under 100 MB. `tsne_clip.json` (with base64 thumbnails embedded) can exceed this if you use a large sample. Either reduce `CLIP_TSNE_SAMPLE` in the notebook (500–1000 is comfortable) or strip thumbnails and link to `category_gallery/` images by `image_id` instead.

---

## 2. Export file reference

| File | Format | Size (typical) | Primary use on page |
|---|---|---|---|
| `eda_summary.json` | JSON | ~5 KB | Master data card |
| `stats_overview.json` | JSON | ~1 KB | Hero counter bar |
| `data_quality.json` | JSON | ~2 KB | Quality badges + histogram |
| `image_stats.json` | JSON | ~200 KB | Resolution scatter + histograms |
| `color_profiles.json` | JSON | ~50 KB | RGB scatter + brightness chart |
| `category_color_profiles.json` | JSON | ~2 KB | Colour swatch row |
| `brightness_by_category.json` | JSON | ~10 KB | Per-category box/violin |
| `bbox_area_by_category.json` | JSON | ~15 KB | Violin chart |
| `tsne_clip.json` | JSON | 5–80 MB | Interactive CLIP scatter |
| `gallery_manifest.json` | JSON | ~200 KB | Category image gallery |
| `category_gallery/` | JPEG folder | ~5–50 MB | Gallery thumbnails |
| `cooccurrence.json` | JSON | ~30 KB | Interactive heatmap |
| `vocab_freq.json` | JSON | ~20 KB | Word frequency bar / cloud |
| `ngrams.json` | JSON | ~5 KB | Bigram / trigram bar charts |
| `pos_distribution.json` | JSON | ~1 KB | Donut / bar chart |
| `jaccard_similarity.json` | JSON | ~3 KB | Histogram |
| `object_word_align.json` | JSON | ~5 KB | Dual-axis bar chart |
| `lda_topics.json` | JSON | ~10 KB | Topic card grid |
| `bias.json` | JSON | ~15 KB | Gender ratio + object freq bar |
| `tsne_text.json` | JSON | ~5 MB | Text t-SNE scatter |
| `difficulty.json` | JSON | ~10 KB | Histogram + top/bottom cards |

---

## 3. Section-by-section implementation guide

All code snippets below assume you load data with a small helper:

```js
async function loadJSON(path) {
  const r = await fetch(path);
  return r.json();
}
```

---

### 3.1 Hero stats bar — `stats_overview.json`

**What it is:** Top-level numbers (total images, captions, vocab size, avg captions/image) and the captions-per-image distribution.

**How to use:**
Render the four numbers as animated counters on page load. The `caps_per_image_dist` field drives a small bar chart showing that almost every image has exactly 5 captions.

```js
// stats_overview.json shape:
// {
//   "total_images": 5000,
//   "total_captions": 25014,
//   "avg_caps_per_image": 5.003,
//   "vocab_size": 10007,
//   "total_tokens": 264832,
//   "caps_per_image_dist": { "labels": [4,5,6], "values": [12, 4982, 6] }
// }

const data = await loadJSON('data/stats_overview.json');

// Animated counter (vanilla JS)
function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  requestAnimationFrame(function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(t * target).toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  });
}

document.querySelectorAll('[data-stat]').forEach(el => {
  animateCount(el, data[el.dataset.stat]);
});

// Bar chart with Chart.js
new Chart(document.getElementById('caps-dist'), {
  type: 'bar',
  data: {
    labels: data.caps_per_image_dist.labels,
    datasets: [{ data: data.caps_per_image_dist.values, backgroundColor: '#4f86c6' }]
  },
  options: { plugins: { legend: { display: false } } }
});
```

```html
<div class="stats-hero">
  <span data-stat="total_images"></span> images ·
  <span data-stat="total_captions"></span> captions ·
  <span data-stat="vocab_size"></span> unique tokens
</div>
<canvas id="caps-dist" width="300" height="120"></canvas>
```

---

### 3.2 Data quality panel — `data_quality.json`

**What it is:** Duplicate counts, outlier count, and a token-length histogram.

**How to use:**
Three coloured badge cards (green = no missing values, yellow = duplicates, red = outliers). Below them, a histogram using the pre-computed `bin_edges` + `counts` arrays.

```js
// data_quality.json shape:
// {
//   "duplicate_captions": 47,
//   "outlier_captions_gt40": 12,
//   "token_len_stats": { "mean": 10.57, "median": 10, ... },
//   "token_len_histogram": { "bin_edges": [...], "counts": [...] }
// }

const dq = await loadJSON('data/data_quality.json');
const h  = dq.token_len_histogram;

// Centre of each bin as label
const labels = h.bin_edges.slice(0,-1).map(
  (e, i) => ((e + h.bin_edges[i+1]) / 2).toFixed(1)
);

new Chart(document.getElementById('token-hist'), {
  type: 'bar',
  data: {
    labels,
    datasets: [{ data: h.counts, backgroundColor: '#7ec8a0', borderWidth: 0 }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { x: { title: { display: true, text: 'Token count' } } }
  }
});
```

---

### 3.3 Image resolution explorer — `image_stats.json`

**What it is:** Width/height/aspect-ratio histograms AND a `scatter_sample` array of 2000 `{x: width, y: height}` points.

**How to use:**
The scatter plot is the most engaging element here — it instantly reveals that almost all COCO images cluster at 640×480 and 640×427. Add a tooltip showing the exact dimensions on hover.

```js
// image_stats.json shape:
// {
//   "width_stats": { "mean": 594.0, ... },
//   "scatter_sample": [ {"x": 640, "y": 427}, ... ],
//   "aspect_histogram": { "bin_edges": [...], "counts": [...] }
// }

const imgStats = await loadJSON('data/image_stats.json');

// Scatter: width vs height
new Chart(document.getElementById('res-scatter'), {
  type: 'scatter',
  data: {
    datasets: [{
      data: imgStats.scatter_sample,
      backgroundColor: 'rgba(79, 134, 198, 0.25)',
      pointRadius: 3
    }]
  },
  options: {
    scales: {
      x: { title: { display: true, text: 'Width (px)' } },
      y: { title: { display: true, text: 'Height (px)' } }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.x} × ${ctx.parsed.y} px`
        }
      }
    }
  }
});
```

---

### 3.4 Colour profile cards — `color_profiles.json` + `category_color_profiles.json`

**What it is:**
- `color_profiles.json` — overall dataset brightness histogram + a 500-point scatter of `{r, g, b, brightness}` per sampled image.
- `category_color_profiles.json` — one `{name, R, G, B, hex}` record per supercategory.

**How to use:**
The category colour file is perfect for a swatch row — one coloured rectangle per supercategory labelled with the category name. The individual `hex` field means you don't need to do any RGB math in the browser.

```js
// category_color_profiles.json shape:
// { "categories": [ {"name":"outdoor","R":118,"G":112,"B":98,"hex":"#76706"},... ] }

const cats = await loadJSON('data/category_color_profiles.json');

const container = document.getElementById('swatches');
cats.categories.forEach(c => {
  const div = document.createElement('div');
  div.className = 'swatch';
  div.style.background = c.hex;
  div.title = `${c.name}\nR:${c.R} G:${c.G} B:${c.B}`;
  div.innerHTML = `<span>${c.name}</span>`;
  container.appendChild(div);
});
```

```css
.swatch {
  width: 90px; height: 70px; border-radius: 8px;
  display: inline-flex; align-items: flex-end; padding: 4px 6px;
}
.swatch span { font-size: 11px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.5); }
```

For the `rgb_scatter_sample`, plot a 3D scatter or use two 2D projections (R vs G, B vs brightness) with Chart.js scatter.

---

### 3.5 Brightness & contrast — `brightness_by_category.json`

**What it is:** Per-supercategory `brightness_mean`, `contrast_mean`, and a per-category brightness histogram for on-demand rendering.

**How to use:**
A grouped bar chart (one group per category, two bars: brightness vs contrast) gives an immediate comparison. Add a dropdown so users can click a category and see its full brightness histogram overlay.

```js
// brightness_by_category.json shape:
// { "data": [ { "supercategory":"outdoor","brightness_mean":118.4,
//               "contrast_mean":62.1, "brightness_histogram":{...} }, ...] }

const bData = await loadJSON('data/brightness_by_category.json');
const cats  = bData.data.map(d => d.supercategory);

new Chart(document.getElementById('brightness-chart'), {
  type: 'bar',
  data: {
    labels: cats,
    datasets: [
      { label: 'Mean brightness', data: bData.data.map(d => d.brightness_mean), backgroundColor: '#f5c842' },
      { label: 'Mean contrast',   data: bData.data.map(d => d.contrast_mean),   backgroundColor: '#e07b39' }
    ]
  }
});

// On-demand histogram per category
document.getElementById('cat-select').addEventListener('change', e => {
  const rec = bData.data.find(d => d.supercategory === e.target.value);
  const h   = rec.brightness_histogram;
  const labels = h.bin_edges.slice(0,-1).map((v,i) => ((v+h.bin_edges[i+1])/2).toFixed(0));
  brightnessHistChart.data.labels   = labels;
  brightnessHistChart.data.datasets[0].data = h.counts;
  brightnessHistChart.update();
});
```

---

### 3.6 Bounding-box area — `bbox_area_by_category.json`

**What it is:** Per object-category instance count, median/mean area, and a log-area histogram.

**How to use:**
A horizontal bar chart sorted by median area gives a clear size ranking (e.g. "sky" is enormous, "cell phone" is tiny). Clicking a bar can pop up the log-area histogram as a modal or inline expansion.

```js
// bbox_area_by_category.json shape:
// { "data": [ {"category":"person","count":10777,"median_area":18432,
//              "log_area_histogram":{...} }, ...] }

const bbox = await loadJSON('data/bbox_area_by_category.json');
const sorted = [...bbox.data].sort((a,b) => b.median_area - a.median_area);

new Chart(document.getElementById('bbox-chart'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: sorted.map(d => d.category),
    datasets: [{ label: 'Median area (px²)', data: sorted.map(d => d.median_area),
                 backgroundColor: '#6c9bd2' }]
  }
});
```

---

### 3.7 CLIP t-SNE scatter — `tsne_clip.json`

**What it is:** The most interactive and visually striking section. Each point is `{x, y, supercategory, image_id, file_name, thumb}` where `thumb` is an inline base64 JPEG (64×64 px).

**How to use:**
Use [Plotly.js](https://plotly.com/javascript/) (free, no API key) for this — it handles 1000-point scatters with hover images natively. The trick is putting the base64 thumbnail into the `customdata` field and rendering it in the hover template.

```js
// tsne_clip.json shape:
// { "method": "CLIP ViT-B/32 → PCA(50) → t-SNE(2)",
//   "categories": ["outdoor","food",...],
//   "points": [ {"x":12.3,"y":-4.1,"supercategory":"outdoor",
//                "image_id":12345,"thumb":"data:image/jpeg;base64,..."}, ...] }

const tsne = await loadJSON('data/tsne_clip.json');

// Group by supercategory for coloured traces
const byCat = {};
tsne.points.forEach(p => {
  if (!byCat[p.supercategory]) byCat[p.supercategory] = { x:[], y:[], text:[], imgs:[] };
  byCat[p.supercategory].x.push(p.x);
  byCat[p.supercategory].y.push(p.y);
  byCat[p.supercategory].text.push(`ID: ${p.image_id}`);
  byCat[p.supercategory].imgs.push(p.thumb);
});

const traces = Object.entries(byCat).map(([cat, d]) => ({
  type: 'scatter',
  mode: 'markers',
  name: cat,
  x: d.x,
  y: d.y,
  text: d.text,
  customdata: d.imgs,
  marker: { size: 6, opacity: 0.75 },
  hovertemplate:
    '<b>%{text}</b><br>' +
    '<img src="%{customdata}" width="64" height="64"><extra>%{fullData.name}</extra>'
}));

Plotly.newPlot('tsne-div', traces, {
  title: 'CLIP image embeddings — t-SNE (coloured by supercategory)',
  xaxis: { showticklabels: false, zeroline: false },
  yaxis: { showticklabels: false, zeroline: false },
  hovermode: 'closest',
  legend: { orientation: 'h', y: -0.1 }
});
```

```html
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<div id="tsne-div" style="width:100%; height:600px;"></div>
```

> **Performance tip:** `tsne_clip.json` with 1000 points × base64 thumbnails is ~15 MB. Load it lazily (only when the user scrolls the section into view) using an `IntersectionObserver`.

```js
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadJSON('data/tsne_clip.json').then(renderTsne);
    observer.disconnect();
  }
}, { threshold: 0.1 });
observer.observe(document.getElementById('tsne-div'));
```

---

### 3.8 Category gallery — `gallery_manifest.json` + `category_gallery/`

**What it is:** `gallery_manifest.json` is a structured index:
```json
{
  "thumb_size": [224, 224],
  "categories": ["outdoor", "food", ...],
  "images_by_cat": {
    "outdoor": [
      { "image_id": 12345, "thumb_path": "category_gallery/outdoor/12345.jpg",
        "captions": ["A man riding a bike...", ...] }
    ]
  }
}
```
The actual JPEG thumbnails live in `category_gallery/<supercategory>/`.

**How to use:**
A tabbed gallery. One tab per supercategory; clicking a tab loads that category's thumbnails and shows them in a CSS grid. Hovering an image reveals its captions in a tooltip.

```js
const manifest = await loadJSON('data/gallery_manifest.json');

const tabBar  = document.getElementById('gallery-tabs');
const grid    = document.getElementById('gallery-grid');

manifest.categories.forEach((cat, i) => {
  const btn = document.createElement('button');
  btn.textContent = cat;
  btn.className   = i === 0 ? 'tab active' : 'tab';
  btn.onclick     = () => showCategory(cat);
  tabBar.appendChild(btn);
});

function showCategory(cat) {
  // Highlight active tab
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.textContent === cat));

  grid.innerHTML = '';
  manifest.images_by_cat[cat].forEach(img => {
    const card = document.createElement('div');
    card.className = 'gallery-card';

    const imgEl      = document.createElement('img');
    imgEl.src        = `data/${img.thumb_path}`;
    imgEl.loading    = 'lazy';
    imgEl.alt        = img.captions[0] || '';

    const caption    = document.createElement('p');
    caption.textContent = img.captions[0] || '';

    card.appendChild(imgEl);
    card.appendChild(caption);
    grid.appendChild(card);
  });
}

showCategory(manifest.categories[0]);
```

```css
#gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.gallery-card img { width: 100%; border-radius: 6px; }
.gallery-card p   { font-size: 12px; color: #555; margin: 4px 0 0; }
```

---

### 3.9 Co-occurrence heatmap — `cooccurrence.json`

**What it is:** A square matrix where `matrix[i][j]` is the number of images containing both `categories[i]` and `categories[j]`.

**How to use:**
Use [D3.js](https://d3js.org/) for a fully interactive heatmap where hovering a cell shows the exact count and both category names. The diagonal is always the highest value (a category always co-occurs with itself); consider masking it.

```js
// cooccurrence.json shape:
// { "categories": ["person","car",...], "matrix": [[...],[...]] }

const coo  = await loadJSON('data/cooccurrence.json');
const cats = coo.categories;
const mat  = coo.matrix;

// With Plotly (simpler than D3 for heatmaps):
Plotly.newPlot('cooccur-div', [{
  type: 'heatmap',
  z: mat,
  x: cats,
  y: cats,
  colorscale: 'YlOrRd',
  hovertemplate: '<b>%{y}</b> + <b>%{x}</b><br>%{z} images<extra></extra>'
}], {
  title: 'Category co-occurrence (number of shared images)',
  margin: { l: 100, b: 120 }
});
```

---

### 3.10 Vocabulary explorer — `vocab_freq.json`

**What it is:** Top 200 content words with counts `[{word, count}]`.

**How to use:**
Two components from one file:
1. A horizontal bar chart (Chart.js) for the top 30 words.
2. An interactive word cloud using [d3-cloud](https://github.com/jasondavies/d3-cloud) where font size encodes frequency. Clicking a word could search for images containing it (linking to the gallery).

```js
// vocab_freq.json shape:
// { "top_200_content_words": [ {"word":"man","count":3241}, ...] }

const vocab = await loadJSON('data/vocab_freq.json');
const top30 = vocab.top_200_content_words.slice(0, 30);

// Bar chart
new Chart(document.getElementById('vocab-bar'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: top30.map(d => d.word),
    datasets: [{ data: top30.map(d => d.count), backgroundColor: '#5b8db8' }]
  },
  options: { plugins: { legend: { display: false } } }
});

// Word cloud with d3-cloud (include via CDN)
// font-size: scale count 40-120 → 12-60px
const maxCount = vocab.top_200_content_words[0].count;
const sizeScale = count => 12 + (count / maxCount) * 50;

d3.layout.cloud()
  .size([800, 350])
  .words(vocab.top_200_content_words.map(d => ({ text: d.word, size: sizeScale(d.count), count: d.count })))
  .padding(4)
  .rotate(() => (Math.random() > 0.7 ? 90 : 0))
  .fontSize(d => d.size)
  .on('end', words => {
    d3.select('#word-cloud').append('svg')
      .attr('width', 800).attr('height', 350)
      .append('g').attr('transform', 'translate(400,175)')
      .selectAll('text').data(words).enter().append('text')
        .style('font-size', d => d.size + 'px')
        .style('fill', (_, i) => d3.schemeTableau10[i % 10])
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .style('cursor', 'pointer')
        .text(d => d.text)
        .on('click', (_, d) => alert(`"${d.text}" appears ${d.count} times`));
  })
  .start();
```

---

### 3.11 N-gram bar chart — `ngrams.json`

**What it is:** Top 20 bigrams and top 20 trigrams with counts.

**How to use:**
Two toggled bar charts (Chart.js) with a "Bigrams / Trigrams" toggle button. Horizontal bars work better for long text labels.

```js
// ngrams.json shape:
// { "bigrams": [{"ngram":"a person","count":812},...],
//   "trigrams": [{"ngram":"a woman holding","count":134},...] }

const ngrams = await loadJSON('data/ngrams.json');
let showingBigrams = true;

function renderNgrams() {
  const data = showingBigrams ? ngrams.bigrams : ngrams.trigrams;
  ngramChart.data.labels   = data.map(d => d.ngram);
  ngramChart.data.datasets[0].data = data.map(d => d.count);
  ngramChart.update();
}

document.getElementById('ngram-toggle').onclick = () => {
  showingBigrams = !showingBigrams;
  document.getElementById('ngram-toggle').textContent =
    showingBigrams ? 'Switch to trigrams' : 'Switch to bigrams';
  renderNgrams();
};
```

---

### 3.12 POS distribution — `pos_distribution.json`

**What it is:** Universal POS tag counts `[{tag, count}]` (NOUN, VERB, DET, etc.).

**How to use:**
A doughnut chart is clean for this — only ~10 categories. Add a centre label showing the dominant POS.

```js
// pos_distribution.json shape:
// { "tags": [ {"tag":"NOUN","count":82400}, {"tag":"VERB","count":41200}, ...] }

const pos = await loadJSON('data/pos_distribution.json');

new Chart(document.getElementById('pos-donut'), {
  type: 'doughnut',
  data: {
    labels: pos.tags.map(d => d.tag),
    datasets: [{ data: pos.tags.map(d => d.count) }]
  },
  options: {
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
            return ` ${ctx.label}: ${(100*ctx.parsed/total).toFixed(1)}%`;
          }
        }
      }
    }
  }
});
```

---

### 3.13 Jaccard similarity — `jaccard_similarity.json`

**What it is:** Stats and a histogram of mean pairwise Jaccard similarity between the 5 captions for each image.

**How to use:**
A simple histogram with a vertical line at the mean is sufficient. Add a short explanatory paragraph: low Jaccard (< 0.2) means annotators used very different words, which is good for diversity.

```js
const jac = await loadJSON('data/jaccard_similarity.json');
const h   = jac.histogram;
const labels = h.bin_edges.slice(0,-1).map((v,i) => ((v+h.bin_edges[i+1])/2).toFixed(3));

new Chart(document.getElementById('jaccard-hist'), {
  type: 'bar',
  data: { labels, datasets: [{ data: h.counts, backgroundColor: '#7ec8a0', borderWidth: 0 }] },
  options: {
    plugins: {
      annotation: {        // requires chartjs-plugin-annotation
        annotations: { mean: {
          type: 'line', xMin: jac.stats.mean, xMax: jac.stats.mean,
          borderColor: 'red', borderDash: [5,5],
          label: { content: `mean = ${jac.stats.mean.toFixed(3)}`, display: true }
        }}
      }
    }
  }
});
```

---

### 3.14 Object–word alignment — `object_word_align.json`

**What it is:** For each of the top categories: how many images it appears in (`image_count`) versus how many times the category name appears in captions (`caption_freq`).

**How to use:**
A dual-axis grouped bar chart. Left axis = image count; right axis = caption frequency. Divergence between the two bars reveals which objects are visually present but linguistically under-described.

```js
const align = await loadJSON('data/object_word_align.json');
const items = align.items;

new Chart(document.getElementById('align-chart'), {
  type: 'bar',
  data: {
    labels: items.map(d => d.category),
    datasets: [
      { label: 'Images containing object', data: items.map(d => d.image_count),
        backgroundColor: '#4f86c6', yAxisID: 'y' },
      { label: 'Caption word frequency',   data: items.map(d => d.caption_freq),
        backgroundColor: '#e07b39', yAxisID: 'y1' }
    ]
  },
  options: {
    scales: {
      y:  { position: 'left',  title: { display: true, text: 'Image count' } },
      y1: { position: 'right', title: { display: true, text: 'Caption freq' }, grid: { drawOnChartArea: false } }
    }
  }
});
```

---

### 3.15 LDA topic explorer — `lda_topics.json`

**What it is:** 10 topics, each with 12 words and their LDA weights.

**How to use:**
A card grid — one card per topic with a small horizontal bar chart of the top 8 words by weight. Clicking a card expands it to show all 12 words. You don't need a library; a CSS grid with Chart.js inline charts works well.

```js
// lda_topics.json shape:
// { "n_topics": 10,
//   "topics": [ { "topic_id": 0,
//                 "top_words": [ {"word":"man","weight":0.042}, ...] } ] }

const lda = await loadJSON('data/lda_topics.json');
const grid = document.getElementById('topics-grid');

lda.topics.forEach(topic => {
  const top8   = topic.top_words.slice(0, 8);
  const canvas = document.createElement('canvas');
  canvas.width  = 280; canvas.height = 160;

  new Chart(canvas, {
    type: 'bar',
    indexAxis: 'y',
    data: {
      labels: top8.map(w => w.word),
      datasets: [{ data: top8.map(w => w.weight), backgroundColor: '#9b59b6' }]
    },
    options: { plugins: { legend: { display: false } },
               scales: { x: { display: false } } }
  });

  const card = document.createElement('div');
  card.className = 'topic-card';
  card.innerHTML = `<h4>Topic ${topic.topic_id}</h4>`;
  card.appendChild(canvas);
  grid.appendChild(card);
});
```

---

### 3.16 Bias dashboard — `bias.json`

**What it is:** Gender bias counts (male vs female words) and a top-80 object frequency list.

**How to use:**
Split into two sub-sections:

**Gender panel** — a simple two-bar chart plus a large M/F ratio badge. Keep the tone neutral; label it "gender representation in annotations".

**Object frequency** — a horizontal bar chart (top 30) with a long-tail note. The extreme skew towards "person" is visually obvious at a glance.

```js
const bias = await loadJSON('data/bias.json');

// Gender chart
new Chart(document.getElementById('gender-chart'), {
  type: 'bar',
  data: {
    labels: ['Male-gendered words', 'Female-gendered words'],
    datasets: [{ data: [bias.gender.male_count, bias.gender.female_count],
                 backgroundColor: ['#5b8db8', '#e07b8a'] }]
  },
  options: { plugins: { legend: { display: false } } }
});

document.getElementById('gender-ratio').textContent =
  `${bias.gender.ratio_m_f.toFixed(1)}× more male references`;

// Object frequency
const top30objs = bias.object_frequency.slice(0, 30);
new Chart(document.getElementById('obj-freq-chart'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: top30objs.map(d => d.category),
    datasets: [{ data: top30objs.map(d => d.count), backgroundColor: '#f0a500' }]
  }
});
```

---

### 3.17 Text t-SNE — `tsne_text.json`

**What it is:** 5000 caption embeddings in 2D, coloured by `token_len`. Each point carries the full caption text.

**How to use:**
Same Plotly approach as the CLIP t-SNE, but colour by `token_len` instead of category. The hover tooltip shows the actual caption — which is the most revealing part.

```js
const ttext = await loadJSON('data/tsne_text.json');

Plotly.newPlot('tsne-text-div', [{
  type: 'scatter',
  mode: 'markers',
  x: ttext.points.map(p => p.x),
  y: ttext.points.map(p => p.y),
  text: ttext.points.map(p => p.caption),
  marker: {
    size: 5,
    color: ttext.points.map(p => p.token_len),
    colorscale: 'Viridis',
    showscale: true,
    colorbar: { title: 'Token length' }
  },
  hovertemplate: '<i>%{text}</i><extra>%{marker.color} tokens</extra>'
}], {
  title: 'Caption t-SNE (TF-IDF → PCA → t-SNE), coloured by length',
  xaxis: { showticklabels: false }, yaxis: { showticklabels: false }
});
```

---

### 3.18 Difficulty histogram — `difficulty.json`

**What it is:** Per-image difficulty scores (entropy + rare-word ratio), plus top-10 easiest and hardest image IDs.

**How to use:**
A histogram showing the difficulty distribution, plus two side-by-side image strips labelled "Easiest" and "Hardest", loaded from the `category_gallery/` thumbnails using the image IDs.

```js
const diff = await loadJSON('data/difficulty.json');
const h    = diff.difficulty_histogram;
const labels = h.bin_edges.slice(0,-1).map((v,i) => ((v+h.bin_edges[i+1])/2).toFixed(2));

new Chart(document.getElementById('diff-hist'), {
  type: 'bar',
  data: { labels, datasets: [{ data: h.counts, backgroundColor: '#c0392b', borderWidth: 0 }] }
});

// Show easy/hard image strips using gallery manifest lookup
const manifest = await loadJSON('data/gallery_manifest.json');
const allImages = Object.values(manifest.images_by_cat).flat();

function findThumb(imageId) {
  const rec = allImages.find(i => i.image_id === imageId);
  return rec ? `data/${rec.thumb_path}` : null;
}

['easiest', 'hardest'].forEach(type => {
  const strip = document.getElementById(`${type}-strip`);
  diff[`${type}_images`].slice(0, 5).forEach(img => {
    const src = findThumb(img.image_id);
    if (!src) return;
    const el = document.createElement('img');
    el.src   = src;
    el.title = `Score: ${img.score.toFixed(3)}`;
    el.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:4px;';
    strip.appendChild(el);
  });
});
```

---

## 4. Recommended JavaScript libraries

| Library | CDN | Use case |
|---|---|---|
| [Chart.js v4](https://www.chartjs.org/) | `https://cdn.jsdelivr.net/npm/chart.js` | All standard charts (bar, histogram, scatter, donut) |
| [Plotly.js](https://plotly.com/javascript/) | `https://cdn.plot.ly/plotly-2.27.0.min.js` | t-SNE scatter with image hover, heatmaps |
| [d3-cloud](https://github.com/jasondavies/d3-cloud) | `https://cdn.jsdelivr.net/npm/d3-cloud@1.2.5/build/d3.layout.cloud.min.js` | Word cloud |
| [D3 v7](https://d3js.org/) | `https://cdn.jsdelivr.net/npm/d3@7` | Co-occurrence heatmap (optional, Plotly also works) |
| [chartjs-plugin-annotation](https://www.chartjs.org/chartjs-plugin-annotation/) | npm / CDN | Vertical mean line on histograms |

All four can be loaded from CDN with no build step required for a static GitHub Pages site.

---

## 5. Site scaffold (copy-paste starter)

Below is a minimal `index.html` that wires up lazy loading and tab navigation. Replace `<!-- SECTION -->` blocks with the code from section 3 above.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>COCO EDA — Interactive Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f8f8f8; color: #222; }

    nav { background: #1a1a2e; color: #fff; padding: 0 2rem; display: flex; gap: 1rem; }
    nav a { color: #ccc; text-decoration: none; padding: 1rem 0.5rem; font-size: 14px; }
    nav a:hover { color: #fff; }

    .hero { background: #1a1a2e; color: #fff; padding: 3rem 2rem; }
    .hero h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
    .stats-bar { display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; }
    .stat-box { background: rgba(255,255,255,.08); border-radius: 8px; padding: 1rem 1.5rem; }
    .stat-box .val { font-size: 2rem; font-weight: 700; }
    .stat-box .lbl { font-size: 13px; color: #aaa; }

    section { padding: 3rem 2rem; max-width: 1100px; margin: 0 auto; }
    section h2 { font-size: 1.4rem; margin-bottom: 0.4rem; }
    section p.desc { color: #555; font-size: 14px; margin-bottom: 1.5rem; }

    .chart-wrap { background: #fff; border-radius: 10px; padding: 1.5rem;
                  box-shadow: 0 1px 4px rgba(0,0,0,.08); margin-bottom: 1.5rem; }

    .tab-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .tab { padding: 0.4rem 1rem; border: 1px solid #ccc; border-radius: 20px;
           background: #fff; cursor: pointer; font-size: 13px; }
    .tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

    #gallery-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap: 12px; }
    .gallery-card img { width:100%; border-radius:6px; display:block; }
    .gallery-card p { font-size:11px; color:#666; margin-top:4px; line-height:1.3; }
  </style>
</head>
<body>

<nav>
  <a href="#overview">Overview</a>
  <a href="#images">Images</a>
  <a href="#text">Text</a>
  <a href="#tsne">t-SNE</a>
  <a href="#gallery">Gallery</a>
  <a href="#bias">Bias</a>
</nav>

<div class="hero">
  <h1>COCO Image Captioning — EDA</h1>
  <p>MS-COCO 2017 val split · Interactive Exploratory Data Analysis</p>
  <div class="stats-bar">
    <div class="stat-box"><div class="val" data-stat="total_images">—</div><div class="lbl">Images</div></div>
    <div class="stat-box"><div class="val" data-stat="total_captions">—</div><div class="lbl">Captions</div></div>
    <div class="stat-box"><div class="val" data-stat="vocab_size">—</div><div class="lbl">Unique tokens</div></div>
    <div class="stat-box"><div class="val" data-stat="avg_caps_per_image">—</div><div class="lbl">Avg caps / image</div></div>
  </div>
</div>

<section id="overview">
  <h2>Dataset overview</h2>
  <p class="desc">Caption-length distribution and global statistics.</p>
  <div class="chart-wrap"><canvas id="token-hist"></canvas></div>
</section>

<section id="images">
  <h2>Image modality</h2>
  <p class="desc">Width × height scatter, colour profiles, and per-category brightness.</p>
  <div class="chart-wrap"><canvas id="res-scatter"></canvas></div>
  <div class="chart-wrap"><div id="swatches" style="display:flex;flex-wrap:wrap;gap:8px;"></div></div>
  <div class="chart-wrap"><canvas id="brightness-chart"></canvas></div>
</section>

<section id="text">
  <h2>Text modality</h2>
  <p class="desc">Vocabulary frequency, POS distribution, and n-grams.</p>
  <div class="chart-wrap"><canvas id="vocab-bar"></canvas></div>
  <div class="chart-wrap"><canvas id="pos-donut"></canvas></div>
  <div class="chart-wrap">
    <button id="ngram-toggle" class="tab active">Switch to trigrams</button>
    <canvas id="ngram-chart"></canvas>
  </div>
</section>

<section id="tsne">
  <h2>CLIP t-SNE</h2>
  <p class="desc">Each dot is an image. Hover to see the thumbnail. Colour = supercategory.</p>
  <div class="chart-wrap" id="tsne-div" style="height:600px;">
    <p style="color:#999;padding:2rem;text-align:center;">Loading CLIP embeddings…</p>
  </div>
</section>

<section id="gallery">
  <h2>Category gallery</h2>
  <p class="desc">Sample images per COCO supercategory with their annotated captions.</p>
  <div class="tab-bar" id="gallery-tabs"></div>
  <div id="gallery-grid"></div>
</section>

<section id="bias">
  <h2>Bias analysis</h2>
  <p class="desc">Gender representation in captions and object frequency imbalance.</p>
  <div class="chart-wrap">
    <p id="gender-ratio" style="font-size:1.2rem;font-weight:600;margin-bottom:1rem;"></p>
    <canvas id="gender-chart"></canvas>
  </div>
  <div class="chart-wrap"><canvas id="obj-freq-chart"></canvas></div>
</section>

<script>
async function loadJSON(p) { return fetch(p).then(r => r.json()); }

(async () => {
  // ── Hero counters ─────────────────────────────────────────────
  const overview = await loadJSON('data/stats_overview.json');
  document.querySelectorAll('[data-stat]').forEach(el => {
    const v = overview[el.dataset.stat];
    el.textContent = typeof v === 'number' ? v.toLocaleString() : v;
  });

  // ── Token length histogram ────────────────────────────────────
  const dq = await loadJSON('data/data_quality.json');
  const h  = dq.token_len_histogram;
  new Chart(document.getElementById('token-hist'), {
    type: 'bar',
    data: { labels: h.bin_edges.slice(0,-1).map((v,i)=>((v+h.bin_edges[i+1])/2).toFixed(1)),
            datasets: [{ data: h.counts, backgroundColor: '#7ec8a0', borderWidth: 0,
                         label: 'Caption count' }] },
    options: { plugins: { title: { display: true, text: 'Caption token-length distribution' } },
               scales: { x: { title: { display: true, text: 'Tokens' } } } }
  });

  // ── Resolution scatter ────────────────────────────────────────
  const imgStats = await loadJSON('data/image_stats.json');
  new Chart(document.getElementById('res-scatter'), {
    type: 'scatter',
    data: { datasets: [{ data: imgStats.scatter_sample, backgroundColor: 'rgba(79,134,198,0.2)',
                         pointRadius: 3, label: 'Image' }] },
    options: { plugins: { title: { display: true, text: 'Image width × height distribution' } },
               scales: { x: { title: { display: true, text: 'Width px' } },
                         y: { title: { display: true, text: 'Height px' } } } }
  });

  // ── Colour swatches ───────────────────────────────────────────
  const cats = await loadJSON('data/category_color_profiles.json');
  const swatches = document.getElementById('swatches');
  cats.categories.forEach(c => {
    swatches.innerHTML +=
      `<div style="background:${c.hex};padding:10px 14px;border-radius:6px;
        color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5);font-size:12px;">${c.name}</div>`;
  });

  // ── Brightness by category ────────────────────────────────────
  const bData = await loadJSON('data/brightness_by_category.json');
  new Chart(document.getElementById('brightness-chart'), {
    type: 'bar',
    data: { labels: bData.data.map(d => d.supercategory),
            datasets: [
              { label: 'Brightness', data: bData.data.map(d => d.brightness_mean), backgroundColor: '#f5c842' },
              { label: 'Contrast',   data: bData.data.map(d => d.contrast_mean),   backgroundColor: '#e07b39' }
            ] },
    options: { plugins: { title: { display: true, text: 'Mean brightness & contrast per supercategory' } } }
  });

  // ── Vocab bar ─────────────────────────────────────────────────
  const vocab = await loadJSON('data/vocab_freq.json');
  const top30 = vocab.top_200_content_words.slice(0, 30);
  new Chart(document.getElementById('vocab-bar'), {
    type: 'bar', indexAxis: 'y',
    data: { labels: top30.map(d=>d.word),
            datasets: [{ data: top30.map(d=>d.count), backgroundColor:'#5b8db8', label:'Count' }] },
    options: { plugins: { title: { display: true, text: 'Top 30 content words' },
                           legend: { display: false } } }
  });

  // ── POS donut ─────────────────────────────────────────────────
  const pos = await loadJSON('data/pos_distribution.json');
  new Chart(document.getElementById('pos-donut'), {
    type: 'doughnut',
    data: { labels: pos.tags.map(d=>d.tag),
            datasets: [{ data: pos.tags.map(d=>d.count) }] },
    options: { plugins: { title: { display: true, text: 'POS tag distribution' } } }
  });

  // ── N-gram chart ──────────────────────────────────────────────
  const ngrams = await loadJSON('data/ngrams.json');
  let showBi = true;
  const ngramChart = new Chart(document.getElementById('ngram-chart'), {
    type: 'bar', indexAxis: 'y',
    data: { labels: ngrams.bigrams.map(d=>d.ngram),
            datasets: [{ data: ngrams.bigrams.map(d=>d.count), backgroundColor:'#9b59b6', label:'Count' }] },
    options: { plugins: { legend: { display: false },
                           title: { display: true, text: 'Top 20 bigrams' } } }
  });
  document.getElementById('ngram-toggle').onclick = () => {
    showBi = !showBi;
    const d = showBi ? ngrams.bigrams : ngrams.trigrams;
    ngramChart.data.labels = d.map(x=>x.ngram);
    ngramChart.data.datasets[0].data = d.map(x=>x.count);
    ngramChart.options.plugins.title.text = showBi ? 'Top 20 bigrams' : 'Top 20 trigrams';
    ngramChart.update();
    document.getElementById('ngram-toggle').textContent =
      showBi ? 'Switch to trigrams' : 'Switch to bigrams';
  };

  // ── Gallery ───────────────────────────────────────────────────
  const manifest = await loadJSON('data/gallery_manifest.json');
  const tabBar   = document.getElementById('gallery-tabs');
  const grid     = document.getElementById('gallery-grid');
  manifest.categories.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (i===0?' active':'');
    btn.textContent = cat;
    btn.onclick = () => {
      document.querySelectorAll('#gallery-tabs .tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      grid.innerHTML = '';
      manifest.images_by_cat[cat].forEach(img => {
        grid.innerHTML +=
          `<div class="gallery-card">
            <img src="data/${img.thumb_path}" loading="lazy" alt="${img.captions[0]||''}">
            <p>${img.captions[0]||''}</p>
          </div>`;
      });
    };
    tabBar.appendChild(btn);
  });
  document.querySelector('#gallery-tabs .tab').click();

  // ── Bias ──────────────────────────────────────────────────────
  const bias = await loadJSON('data/bias.json');
  document.getElementById('gender-ratio').textContent =
    `Male-to-female word ratio: ${bias.gender.ratio_m_f.toFixed(1)}×`;
  new Chart(document.getElementById('gender-chart'), {
    type: 'bar',
    data: { labels: ['Male-gendered words','Female-gendered words'],
            datasets: [{ data: [bias.gender.male_count, bias.gender.female_count],
                         backgroundColor: ['#5b8db8','#e07b8a'], label: 'Count' }] },
    options: { plugins: { legend: { display: false } } }
  });
  const top30obj = bias.object_frequency.slice(0, 30);
  new Chart(document.getElementById('obj-freq-chart'), {
    type: 'bar', indexAxis: 'y',
    data: { labels: top30obj.map(d=>d.category),
            datasets: [{ data: top30obj.map(d=>d.count), backgroundColor:'#f0a500', label:'Instances' }] },
    options: { plugins: { title: { display: true, text: 'Object frequency (top 30)' } } }
  });

  // ── CLIP t-SNE (lazy load) ────────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    loadJSON('data/tsne_clip.json').then(tsne => {
      const byCat = {};
      tsne.points.forEach(p => {
        if (!byCat[p.supercategory]) byCat[p.supercategory] = {x:[],y:[],text:[],imgs:[]};
        byCat[p.supercategory].x.push(p.x);
        byCat[p.supercategory].y.push(p.y);
        byCat[p.supercategory].text.push(`ID: ${p.image_id}`);
        byCat[p.supercategory].imgs.push(p.thumb || '');
      });
      const traces = Object.entries(byCat).map(([cat,d]) => ({
        type:'scatter', mode:'markers', name: cat, x:d.x, y:d.y, text:d.text,
        customdata:d.imgs, marker:{size:6,opacity:.75},
        hovertemplate:'<b>%{text}</b><br><img src="%{customdata}" width="64"><extra>%{fullData.name}</extra>'
      }));
      document.getElementById('tsne-div').innerHTML = '';
      Plotly.newPlot('tsne-div', traces, {
        title:'CLIP image embeddings — t-SNE',
        xaxis:{showticklabels:false,zeroline:false},
        yaxis:{showticklabels:false,zeroline:false},
        hovermode:'closest', margin:{t:40}
      });
    });
  }, {threshold:0.1});
  observer.observe(document.getElementById('tsne-div'));
})();
</script>
</body>
</html>
```

---

## 6. Deployment checklist

1. **Copy files**
   ```
   cp -r eda_output/web_exports/  your-repo/data/
   ```

2. **Check file sizes**
   ```bash
   du -sh data/*.json | sort -rh | head -10
   ```
   Files over 50 MB should be split or have thumbnails removed.

3. **Enable GitHub Pages**
   - Go to repo → Settings → Pages → Source: `main` branch, `/ (root)` folder → Save.
   - Your site will be at `https://<username>.github.io/<repo>/`.

4. **CORS**
   GitHub Pages serves files with permissive CORS headers by default, so `fetch('data/tsne_clip.json')` from `index.html` will work without any server configuration.

5. **`.gitattributes` for large files (optional)**
   If `tsne_clip.json` or `tsne_text.json` are large, consider [Git LFS](https://git-lfs.com/):
   ```
   data/tsne_clip.json filter=lfs diff=lfs merge=lfs -text
   data/tsne_text.json filter=lfs diff=lfs merge=lfs -text
   ```
   GitHub Pages can serve Git LFS files, but you need LFS enabled on the repo.

6. **Local preview before pushing**
   ```bash
   python3 -m http.server 8080
   # then open http://localhost:8080
   ```
   Do not open `index.html` directly as a `file://` URL — `fetch()` is blocked by the browser's same-origin policy for local files.

7. **Performance budget**
   - Defer all JSON fetches with `IntersectionObserver` as shown in section 3.7.
   - Use `<img loading="lazy">` on all gallery thumbnails.
   - Target < 200 ms to first meaningful paint before any JSON loads.

---

*Generated from `coco_eda_web.ipynb`. Re-run the notebook to regenerate all JSON files after changing dataset splits or sample sizes.*
