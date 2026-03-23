# House Prices EDA — GitHub Pages Integration Guide

> Complete reference for turning every `web_exports/*.json` from `tabular_eda_web.ipynb`
> into an interactive GitHub Pages site — with copy-paste JavaScript for every chart type.

---

## Table of Contents

1. [Repository structure](#1-repository-structure)
2. [Export file reference](#2-export-file-reference)
3. [Section-by-section implementation guide](#3-section-by-section-implementation-guide)
   - 3.1 [Hero stats bar — `dataset_overview.json`](#31-hero-stats-bar--dataset_overviewjson)
   - 3.2 [Feature taxonomy donut — `feature_taxonomy.json`](#32-feature-taxonomy-donut--feature_taxonomyjson)
   - 3.3 [Missing values bar — `missing_values.json`](#33-missing-values-bar--missing_valuesjson)
   - 3.4 [Constant features panel — `constant_features.json`](#34-constant-features-panel--constant_featuresjson)
   - 3.5 [Ordinal correlations bar — `ordinal_correlations.json`](#35-ordinal-correlations-bar--ordinal_correlationsjson)
   - 3.6 [Ordinal box plots — `ordinal_boxplots.json`](#36-ordinal-box-plots--ordinal_boxplotsjson)
   - 3.7 [SalePrice distribution — `saleprice_distribution.json`](#37-saleprice-distribution--saleprice_distributionjson)
   - 3.8 [Numeric distributions explorer — `numeric_distributions.json`](#38-numeric-distributions-explorer--numeric_distributionsjson)
   - 3.9 [All numeric box plots — `numeric_boxplots.json`](#39-all-numeric-box-plots--numeric_boxplotsjson)
   - 3.10 [Correlation heatmap — `correlations.json`](#310-correlation-heatmap--correlationsjson)
   - 3.11 [Category counts explorer — `category_counts.json`](#311-category-counts-explorer--category_countsjson)
   - 3.12 [Neighborhood prices — `neighborhood_prices.json`](#312-neighborhood-prices--neighborhood_pricesjson)
   - 3.13 [SalePrice by categorical — `saleprice_by_categorical.json`](#313-saleprice-by-categorical--saleprice_by_categoricaljson)
   - 3.14 [Scatter plots — `scatter_data.json`](#314-scatter-plots--scatter_datajson)
   - 3.15 [Outlier explorer — `outliers.json`](#315-outlier-explorer--outliersjson)
   - 3.16 [Temporal analysis — `temporal_analysis.json`](#316-temporal-analysis--temporal_analysisjson)
   - 3.17 [Train/test shift — `distribution_shift.json`](#317-traintest-shift--distribution_shiftjson)
   - 3.18 [Engineered features — `engineered_features.json`](#318-engineered-features--engineered_featuresjson)
   - 3.19 [Feature importance — `feature_importance.json`](#319-feature-importance--feature_importancejson)
   - 3.20 [Neighborhood deep-dive — `neighborhood_detail.json`](#320-neighborhood-deep-dive--neighborhood_detailjson)
   - 3.21 [Skewness & rare categories — `skewness_and_rare.json`](#321-skewness--rare-categories--skewness_and_rarejson)
   - 3.22 [Summary card — `eda_summary.json`](#322-summary-card--eda_summaryjson)
4. [Reusable box-plot renderer (vanilla JS)](#4-reusable-box-plot-renderer-vanilla-js)
5. [Recommended libraries](#5-recommended-libraries)
6. [Full site scaffold](#6-full-site-scaffold)
7. [Deployment checklist](#7-deployment-checklist)

---

## 1. Repository structure

After running the notebook, copy `web_exports/` into your GitHub Pages repo:

```
your-repo/
├── index.html
├── assets/
│   ├── js/eda.js
│   └── css/style.css
└── data/                        ← rename from web_exports/
    ├── eda_summary.json
    ├── dataset_overview.json
    ├── feature_taxonomy.json
    ├── missing_values.json
    ├── constant_features.json
    ├── ordinal_correlations.json
    ├── ordinal_boxplots.json
    ├── saleprice_distribution.json
    ├── numeric_distributions.json
    ├── numeric_boxplots.json
    ├── correlations.json
    ├── category_counts.json
    ├── neighborhood_prices.json
    ├── saleprice_by_categorical.json
    ├── scatter_data.json
    ├── outliers.json
    ├── temporal_analysis.json
    ├── distribution_shift.json
    ├── engineered_features.json
    ├── feature_importance.json
    ├── neighborhood_detail.json
    ├── skewness_and_rare.json
    └── eda_summary.json
```

> All JSON files are served as static assets — no server needed. GitHub Pages CORS headers allow `fetch()` from your `index.html` without any configuration.

---

## 2. Export file reference

| # | File | Typical size | Key chart types |
|---|---|---|---|
| 1 | `dataset_overview.json` | ~20 KB | Stat cards, schema table |
| 2 | `feature_taxonomy.json` | ~5 KB | Donut, accordion |
| 3 | `missing_values.json` | ~4 KB | Horizontal bar, heatmap badge |
| 4 | `constant_features.json` | ~1 KB | Warning cards |
| 5 | `ordinal_correlations.json` | ~1 KB | Diverging bar |
| 6 | `ordinal_boxplots.json` | ~15 KB | Box plots per feature |
| 7 | `saleprice_distribution.json` | ~10 KB | Histogram, KDE toggle |
| 8 | `numeric_distributions.json` | ~60 KB | Histogram + box explorer |
| 9 | `numeric_boxplots.json` | ~80 KB | Box plot grid |
| 10 | `correlations.json` | ~200 KB | Heatmap (Plotly) |
| 11 | `category_counts.json` | ~20 KB | Bar charts per category |
| 12 | `neighborhood_prices.json` | ~15 KB | Sorted box plot |
| 13 | `saleprice_by_categorical.json` | ~40 KB | Box plots per feature |
| 14 | `scatter_data.json` | ~200 KB | Scatter + regression line |
| 15 | `outliers.json` | ~50 KB | Scatter with flagged points |
| 16 | `temporal_analysis.json` | ~2 KB | Line charts |
| 17 | `distribution_shift.json` | ~80 KB | Overlapped histograms |
| 18 | `engineered_features.json` | ~200 KB | Scatter + correlation bar |
| 19 | `feature_importance.json` | ~5 KB | Horizontal bar |
| 20 | `neighborhood_detail.json` | ~15 KB | Box plot with labels |
| 21 | `skewness_and_rare.json` | ~8 KB | Bar chart, table |
| 22 | `eda_summary.json` | ~5 KB | Summary card, insights list |

---

## 3. Section-by-section implementation guide

All examples use this helper:

```js
async function loadJSON(path) {
  const r = await fetch(path);
  return r.json();
}
```

---

### 3.1 Hero stats bar — `dataset_overview.json`

**Shape:**
```json
{
  "train_rows": 1460, "test_rows": 1459, "train_cols": 82, "test_cols": 81,
  "schema": [
    {"column":"Id","dtype":"int64","n_unique":1460,"n_missing":0}, ...
  ]
}
```

**Usage:** Four animated counter cards (train rows, test rows, total features, missing count). Below, a searchable/sortable schema table showing dtype, n_unique, and n_missing per column.

```js
const ov = await loadJSON('data/dataset_overview.json');

// Animated counter
function animateCount(el, target, fmt = v => v.toLocaleString()) {
  const dur = 1000, start = performance.now();
  requestAnimationFrame(function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = fmt(Math.floor(t * target));
    if (t < 1) requestAnimationFrame(tick);
  });
}
document.querySelectorAll('[data-stat]').forEach(el => {
  animateCount(el, ov[el.dataset.stat]);
});

// Schema table with search
const tbody = document.querySelector('#schema-table tbody');
const render = (rows) => {
  tbody.innerHTML = rows.map(r =>
    `<tr><td>${r.column}</td><td>${r.dtype}</td>
         <td>${r.n_unique}</td>
         <td class="${r.n_missing > 0 ? 'warn' : ''}">${r.n_missing}</td></tr>`
  ).join('');
};
render(ov.schema);
document.getElementById('schema-search').addEventListener('input', e => {
  render(ov.schema.filter(r => r.column.toLowerCase().includes(e.target.value.toLowerCase())));
});
```

```html
<div class="stats-hero">
  <div class="stat-card"><div class="val" data-stat="train_rows"></div><div class="lbl">Training rows</div></div>
  <div class="stat-card"><div class="val" data-stat="test_rows"></div><div class="lbl">Test rows</div></div>
</div>
<input id="schema-search" placeholder="Search features…">
<table id="schema-table">
  <thead><tr><th>Column</th><th>Dtype</th><th>Unique</th><th>Missing</th></tr></thead>
  <tbody></tbody>
</table>
```

---

### 3.2 Feature taxonomy donut — `feature_taxonomy.json`

**Shape:**
```json
{
  "numeric": ["LotFrontage","LotArea",...],
  "ordinal": ["ExterQual","BsmtQual",...],
  "nominal": ["MSZoning","Street",...],
  "ordinal_maps": { "ExterQual": {"Ex":5,"Gd":4,...}, ... },
  "counts": {"numeric":36,"ordinal":13,"nominal":23}
}
```

**Usage:** A doughnut chart showing the three feature groups. Clicking a segment expands an accordion listing the feature names. The `ordinal_maps` key can power a tooltip showing the ordering on hover.

```js
const tax = await loadJSON('data/feature_taxonomy.json');

new Chart(document.getElementById('taxonomy-donut'), {
  type: 'doughnut',
  data: {
    labels: ['Numeric', 'Ordinal', 'Nominal'],
    datasets: [{
      data: [tax.counts.numeric, tax.counts.ordinal, tax.counts.nominal],
      backgroundColor: ['#4f86c6','#e07b39','#7ec8a0']
    }]
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          afterLabel: ctx => {
            const key = ['numeric','ordinal','nominal'][ctx.dataIndex];
            return tax[key].slice(0,5).join(', ') + (tax[key].length > 5 ? '...' : '');
          }
        }
      }
    }
  }
});
```

---

### 3.3 Missing values bar — `missing_values.json`

**Shape:**
```json
{
  "columns_with_missing": 19,
  "none_cols": ["Alley","PoolQC",...],
  "rows": [
    {"column":"PoolQC","missing_count":1453,"missing_pct":99.52,"nan_means_absence":true}, ...
  ]
}
```

**Usage:** A horizontal bar chart sorted by `missing_pct`, with two colours — orange for absence-encoded columns (NaN is meaningful, not random), blue for genuinely missing data. This distinction is the key data-description insight.

```js
const mv = await loadJSON('data/missing_values.json');

new Chart(document.getElementById('missing-bar'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: mv.rows.map(r => r.column),
    datasets: [{
      label: 'Missing %',
      data : mv.rows.map(r => r.missing_pct),
      backgroundColor: mv.rows.map(r =>
        r.nan_means_absence ? '#e07b54' : '#4f86c6')
    }]
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          afterLabel: ctx => mv.rows[ctx.dataIndex].nan_means_absence
            ? '⚠ NaN = absence (per data description)'
            : 'Genuinely missing'
        }
      },
      legend: { display: false }
    },
    scales: { x: { max: 100, title: { display: true, text: 'Missing %' } } }
  }
});

// Legend
document.getElementById('missing-legend').innerHTML = `
  <span style="color:#e07b54">■</span> NaN encodes absence (fill with 0/None) &nbsp;
  <span style="color:#4f86c6">■</span> Genuinely missing (impute)
`;
```

---

### 3.4 Constant features panel — `constant_features.json`

**Shape:**
```json
{
  "duplicate_rows": 0,
  "constant_features": [],
  "near_constant": [
    {"column":"Utilities","dominant":"AllPub","pct":99.93}
  ]
}
```

**Usage:** A small alert card per near-constant feature. Use yellow/amber styling and recommend dropping these in the modeling section.

```js
const cf = await loadJSON('data/constant_features.json');
const container = document.getElementById('near-constant-cards');

cf.near_constant.forEach(f => {
  container.innerHTML += `
    <div class="alert-card warn">
      <strong>${f.column}</strong>
      <span>${f.pct}% is "${f.dominant}" — near-constant, consider dropping</span>
    </div>`;
});

document.getElementById('dup-count').textContent =
  `Duplicate rows: ${cf.duplicate_rows} (${cf.duplicate_rows === 0 ? '✓ clean' : '⚠ check'})`;
```

---

### 3.5 Ordinal correlations bar — `ordinal_correlations.json`

**Shape:**
```json
{
  "bars": [
    {"feature":"KitchenQual","correlation":0.6671},
    {"feature":"ExterQual","correlation":0.6814}, ...
  ]
}
```

**Usage:** A diverging horizontal bar chart — positive correlations to the right (green), negative to the left (red). Title should note that these were mapped using the data description ordering, not arbitrary label encoding.

```js
const oc = await loadJSON('data/ordinal_correlations.json');
const sorted = [...oc.bars].sort((a,b) => a.correlation - b.correlation);

new Chart(document.getElementById('ordinal-corr'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: sorted.map(d => d.feature),
    datasets: [{
      label: 'Pearson r with SalePrice',
      data : sorted.map(d => d.correlation),
      backgroundColor: sorted.map(d => d.correlation > 0 ? '#7ec8a0' : '#e07b54')
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { x: { min: -1, max: 1, title: { display: true, text: 'Pearson r' } } }
  }
});
```

---

### 3.6 Ordinal box plots — `ordinal_boxplots.json`

**Shape:**
```json
{
  "KitchenQual": {
    "ordinal_map": {"Ex":5,"Gd":4,"TA":3,"Fa":2,"Po":1},
    "boxes": [
      {"label":"Po","ordinal_score":1,"min":39300,"q1":78225,"median":103000,
       "q3":135500,"max":175000,"outliers":[...],"n_outliers":0,"n":3},
      {"label":"TA","ordinal_score":3, ...},
      ...
    ]
  }
}
```

**Usage:** This is the richest visual section. A dropdown lets the user pick any ordinal feature; the chart re-renders box plots ordered by the data-description ordinal score, not alphabetically. This makes the monotonic relationship immediately visible.

Use the [reusable box-plot renderer](#4-reusable-box-plot-renderer-vanilla-js) below.

```js
const ob = await loadJSON('data/ordinal_boxplots.json');
const features = Object.keys(ob);
let currentFeature = features[0];

// Populate dropdown
const sel = document.getElementById('ordinal-select');
features.forEach(f => sel.innerHTML += `<option value="${f}">${f}</option>`);
sel.addEventListener('change', () => {
  currentFeature = sel.value;
  renderOrdinalBox(ob[currentFeature]);
});

function renderOrdinalBox(featureData) {
  // Sort boxes by ordinal score ascending
  const boxes = [...featureData.boxes].sort((a,b) => a.ordinal_score - b.ordinal_score);
  drawBoxPlot('ordinal-canvas', boxes, {
    xLabel: '← worse    better →',
    yLabel: 'SalePrice ($)',
    yFormat: v => `$${(v/1000).toFixed(0)}k`,
    title  : `${currentFeature} vs SalePrice (ordered per data description)`
  });
}
renderOrdinalBox(ob[currentFeature]);
```

---

### 3.7 SalePrice distribution — `saleprice_distribution.json`

**Shape:**
```json
{
  "stats": {"min":34900,"max":755000,"mean":180921,"median":163000,"skew_orig":1.8829,"skew_log1p":0.1213},
  "percentiles": {"5":88000,"25":129975,"50":163000,"75":214000,"95":326100},
  "original_histogram": {"bin_edges":[...],"counts":[...],"stats":{...}},
  "log1p_histogram"   : {"bin_edges":[...],"counts":[...],"stats":{...}},
  "scatter_sample"    : [34900, 78500, ...]
}
```

**Usage:** Two histograms side by side (original vs log1p) with a toggle button. Add a percentile ruler below showing the P5/P25/P50/P75/P95 markers on the x-axis.

```js
const sp = await loadJSON('data/saleprice_distribution.json');

let showLog = false;
const spChart = new Chart(document.getElementById('sp-hist'), {
  type: 'bar',
  data: buildHistDataset(sp.original_histogram, '#4f86c6'),
  options: {
    plugins: {
      title: { display: true, text: `SalePrice — skew = ${sp.stats.skew_orig}` }
    },
    scales: { x: { ticks: { maxTicksLimit: 10 } } }
  }
});

document.getElementById('sp-toggle').onclick = () => {
  showLog = !showLog;
  const h = showLog ? sp.log1p_histogram : sp.original_histogram;
  spChart.data = buildHistDataset(h, showLog ? '#7ec8a0' : '#4f86c6');
  spChart.options.plugins.title.text = showLog
    ? `log1p(SalePrice) — skew = ${sp.stats.skew_log1p}`
    : `SalePrice — skew = ${sp.stats.skew_orig}`;
  spChart.update();
  document.getElementById('sp-toggle').textContent =
    showLog ? 'Show original' : 'Show log1p';
};

function buildHistDataset(h, color) {
  const labels = h.bin_edges.slice(0,-1).map((v,i) =>
    ((v + h.bin_edges[i+1])/2).toFixed(1));
  return { labels, datasets: [{ data: h.counts, backgroundColor: color, borderWidth: 0 }] };
}

// Percentile display
const ruler = document.getElementById('percentile-ruler');
Object.entries(sp.percentiles).forEach(([p, v]) => {
  ruler.innerHTML += `<div class="p-marker">
    <div class="p-label">P${p}</div>
    <div class="p-val">$${(v/1000).toFixed(0)}k</div>
  </div>`;
});
```

---

### 3.8 Numeric distributions explorer — `numeric_distributions.json`

**Shape:**
```json
{
  "key_features": {
    "GrLivArea": {
      "histogram": {"bin_edges":[...],"counts":[...],"stats":{"mean":1515.5,"skew":1.27,...}},
      "box"      : {"min":334,"q1":1129,"median":1464,"q3":1776,"max":4692,"outliers":[...]}
    }, ...
  },
  "all_numeric_stats": [
    {"feature":"LotFrontage","mean":69.3,"median":69.0,"skew":2.16,"n_missing":259,"pct_missing":17.74}, ...
  ]
}
```

**Usage:** Two components:
1. A **feature selector** (dropdown) + linked histogram and box plot that re-renders on selection — covering the 8 key features.
2. A **sortable stats table** covering all numeric features, sortable by skew, missing %, mean, etc.

```js
const nd = await loadJSON('data/numeric_distributions.json');

const featSel = document.getElementById('num-feat-select');
Object.keys(nd.key_features).forEach(f => {
  featSel.innerHTML += `<option value="${f}">${f}</option>`;
});

let numHistChart, numBoxChart;

function renderNumFeature(feat) {
  const d = nd.key_features[feat];

  // Histogram
  const h = d.histogram;
  const labels = h.bin_edges.slice(0,-1).map((v,i)=>
    ((v+h.bin_edges[i+1])/2).toFixed(1));
  if (numHistChart) numHistChart.destroy();
  numHistChart = new Chart(document.getElementById('num-hist'), {
    type: 'bar',
    data: { labels, datasets: [{ data: h.counts, backgroundColor:'#4f86c6', borderWidth:0 }] },
    options: {
      plugins: {
        title: { display: true, text: `${feat}  —  skew=${h.stats.skew}  mean=${h.stats.mean.toFixed(1)}` },
        legend: { display: false }
      }
    }
  });

  // Stats
  document.getElementById('num-stats').innerHTML =
    `<p>Mean: ${d.histogram.stats.mean.toFixed(2)} · Median: ${d.box.median} · 
        IQR: ${(d.box.q3 - d.box.q1).toFixed(0)} · 
        Outliers: ${d.box.n_outliers}</p>`;
}

featSel.addEventListener('change', () => renderNumFeature(featSel.value));
renderNumFeature(Object.keys(nd.key_features)[0]);

// All-features sortable table
const statsTable = document.getElementById('all-num-stats');
let sortKey = 'feature', sortAsc = true;

function renderNumTable() {
  const sorted = [...nd.all_numeric_stats].sort((a,b) =>
    sortAsc ? (a[sortKey] > b[sortKey] ? 1 : -1)
            : (a[sortKey] < b[sortKey] ? 1 : -1));
  statsTable.querySelector('tbody').innerHTML = sorted.map(r =>
    `<tr>
      <td>${r.feature}</td>
      <td>${r.mean.toFixed(2)}</td>
      <td>${r.median.toFixed(2)}</td>
      <td>${r.std.toFixed(2)}</td>
      <td class="${Math.abs(r.skew)>0.75?'warn':''}">${r.skew.toFixed(3)}</td>
      <td class="${r.pct_missing>0?'warn':''}">${r.pct_missing}%</td>
     </tr>`
  ).join('');
}
statsTable.querySelectorAll('th[data-sort]').forEach(th => {
  th.style.cursor = 'pointer';
  th.onclick = () => {
    if (sortKey === th.dataset.sort) sortAsc = !sortAsc;
    else { sortKey = th.dataset.sort; sortAsc = true; }
    renderNumTable();
  };
});
renderNumTable();
```

---

### 3.9 All numeric box plots — `numeric_boxplots.json`

**Shape:**
```json
{
  "LotArea":    {"min":1300,"q1":7553,"median":9478,"q3":11601,"max":56600,"outliers":[...],"n_outliers":113},
  "GrLivArea":  { ... },
  ...
}
```

**Usage:** A paginated box-plot grid. Show 6 features per page with Previous / Next buttons. Each box uses the [reusable box-plot renderer](#4-reusable-box-plot-renderer-vanilla-js).

```js
const allBoxes = await loadJSON('data/numeric_boxplots.json');
const featureNames = Object.keys(allBoxes);
const PAGE_SIZE = 6;
let page = 0;

function renderBoxPage() {
  const slice = featureNames.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE);
  const container = document.getElementById('box-grid');
  container.innerHTML = '';

  slice.forEach(feat => {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 250;
    container.appendChild(canvas);
    drawSingleBox(canvas, allBoxes[feat], feat);   // see §4
  });

  document.getElementById('box-page').textContent =
    `Page ${page+1} / ${Math.ceil(featureNames.length / PAGE_SIZE)}`;
}

document.getElementById('box-prev').onclick = () => { if (page > 0) { page--; renderBoxPage(); } };
document.getElementById('box-next').onclick = () => {
  if ((page+1)*PAGE_SIZE < featureNames.length) { page++; renderBoxPage(); }
};
renderBoxPage();
```

---

### 3.10 Correlation heatmap — `correlations.json`

**Shape:**
```json
{
  "top_vs_saleprice": [
    {"feature":"OverallQual","abs_corr":0.7909,"signed_corr":0.7909}, ...
  ],
  "full_matrix": {"features":[...],"values":[[...],[...]]},
  "top15_matrix": {"features":[...],"values":[[...]]}
}
```

**Usage:** Two views toggled with a button:
1. **Top-30 bar chart** sorted by `abs_corr` — fast to render, always useful.
2. **Top-15 heatmap** using Plotly — the `values` matrix plugs directly into `z`.

```js
const corr = await loadJSON('data/correlations.json');

// Top-30 bar chart (Chart.js)
new Chart(document.getElementById('corr-bar'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: corr.top_vs_saleprice.map(d => d.feature),
    datasets: [{
      label: '|r| with SalePrice',
      data : corr.top_vs_saleprice.map(d => d.signed_corr),
      backgroundColor: corr.top_vs_saleprice.map(d =>
        d.signed_corr > 0 ? '#7ec8a0' : '#e07b54')
    }]
  },
  options: {
    scales: { x: { min: -1, max: 1 } },
    plugins: { legend: { display: false } }
  }
});

// Top-15 heatmap (Plotly) — lazy load
document.getElementById('show-heatmap').onclick = () => {
  Plotly.newPlot('corr-heatmap', [{
    type: 'heatmap',
    z   : corr.top15_matrix.values,
    x   : corr.top15_matrix.features,
    y   : corr.top15_matrix.features,
    colorscale: 'RdYlGn',
    zmid: 0,
    hovertemplate: '<b>%{y}</b> × <b>%{x}</b> = %{z}<extra></extra>'
  }], {
    title : 'Top 15 features — correlation matrix',
    margin: { l: 120, b: 120 }
  });
};
```

---

### 3.11 Category counts explorer — `category_counts.json`

**Shape:**
```json
{
  "focused": {
    "Neighborhood": [{"category":"NAmes","count":225,"pct":15.41}, ...],
    "MSZoning"    : [...]
  },
  "all_nominal": { ... },
  "mssubclass_labels": {"20":"1-Stor 1946+", ...},
  "rare_categories": {"MSSubClass":["45","180","40"], ...}
}
```

**Usage:** A tabbed bar chart — one tab per focused categorical feature. For `MSSubClass`, replace the raw codes with the human-readable `mssubclass_labels`. Rare categories (< 1%) are highlighted in amber.

```js
const cc = await loadJSON('data/category_counts.json');
const features = Object.keys(cc.focused);
let ccChart;

function renderCatCount(feat) {
  const data = cc.focused[feat];
  const rareCats = cc.rare_categories[feat] || [];
  const labels = data.map(d => {
    let lbl = d.category;
    if (feat === 'MSSubClass') lbl = cc.mssubclass_labels[lbl] || lbl;
    return lbl;
  });

  const colors = data.map(d =>
    rareCats.includes(d.category) ? '#f0a500' : '#4f86c6');

  if (ccChart) ccChart.destroy();
  ccChart = new Chart(document.getElementById('cat-chart'), {
    type: 'bar',
    data: { labels, datasets: [{ data: data.map(d=>d.count), backgroundColor: colors }] },
    options: {
      plugins: {
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} (${data[ctx.dataIndex].pct}%)` } },
        legend: { display: false },
        title: { display: true, text: feat }
      }
    }
  });
}

const tabs = document.getElementById('cat-tabs');
features.forEach((f,i) => {
  const btn = document.createElement('button');
  btn.className = 'tab' + (i===0?' active':'');
  btn.textContent = f;
  btn.onclick = () => {
    document.querySelectorAll('#cat-tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCatCount(f);
  };
  tabs.appendChild(btn);
});
renderCatCount(features[0]);
```

---

### 3.12 Neighborhood prices — `neighborhood_prices.json`

**Shape:**
```json
{
  "box_by_neighborhood": [
    {"category":"StoneBr","full_name":"Stone Brook","n":25,
     "min":230000,"q1":275000,"median":306950,"q3":356250,"max":415000,"outliers":[]}, ...
  ],
  "summary": [{"neighborhood":"StoneBr","full_name":"Stone Brook","count":25,"median":306950,...}]
}
```

**Usage:** A horizontal sorted box plot is the gold standard here. Sort by median descending. Use the `full_name` field as the label. This is the most impactful visual in the notebook — it directly shows property value stratification.

```js
const nb = await loadJSON('data/neighborhood_prices.json');
// Already sorted by median descending from the notebook
drawBoxPlot('neighborhood-canvas', nb.box_by_neighborhood, {
  labelKey : 'full_name',
  yFormat  : v => `$${(v/1000).toFixed(0)}k`,
  yLabel   : 'SalePrice',
  title    : 'SalePrice by Neighborhood (sorted by median)',
  horizontal: true
});
```

---

### 3.13 SalePrice by categorical — `saleprice_by_categorical.json`

**Shape:**
```json
{
  "HouseStyle": [
    {"category":"2Story","n":445,"min":67000,"q1":161000,"median":217000,...},
    ...
  ],
  "GarageType": [...],
  "SaleCondition": [...], ...
}
```

**Usage:** Same tabbed box-plot approach as neighborhood prices, but for `HouseStyle`, `GarageType`, `SaleCondition`, `MSZoning`, etc. Each tab title shows the feature name.

```js
const sbc = await loadJSON('data/saleprice_by_categorical.json');
const features = Object.keys(sbc);
let activeFeature = features[0];

function renderCatBox(feat) {
  drawBoxPlot('cat-box-canvas', sbc[feat], {
    yFormat: v => `$${(v/1000).toFixed(0)}k`,
    title  : `SalePrice by ${feat}`
  });
}

const tabBar = document.getElementById('cat-box-tabs');
features.forEach((f,i) => {
  const btn = document.createElement('button');
  btn.className = 'tab' + (i===0?' active':'');
  btn.textContent = f;
  btn.onclick = () => {
    document.querySelectorAll('#cat-box-tabs .tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderCatBox(f);
  };
  tabBar.appendChild(btn);
});
renderCatBox(features[0]);
```

---

### 3.14 Scatter plots — `scatter_data.json`

**Shape:**
```json
{
  "GrLivArea": {
    "pearson_r": 0.7086,
    "p_value"  : 0.0,
    "points"   : [{"x":1656,"y":181500}, ...]
  },
  "GarageArea": {...}, ...
}
```

**Usage:** A feature selector + Plotly scatter with an OLS regression line drawn from the `pearson_r`. Show the r-value and p-value as badges above the chart.

```js
const sd = await loadJSON('data/scatter_data.json');
const features = Object.keys(sd);

function renderScatter(feat) {
  const d = sd[feat];
  const xs = d.points.map(p=>p.x), ys = d.points.map(p=>p.y);

  // Regression line endpoints
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMean = ys.reduce((a,b)=>a+b,0)/ys.length;
  const xMean = xs.reduce((a,b)=>a+b,0)/xs.length;
  const slope = d.pearson_r * (Math.sqrt(ys.map(y=>(y-yMean)**2).reduce((a,b)=>a+b,0)/ys.length) /
                               Math.sqrt(xs.map(x=>(x-xMean)**2).reduce((a,b)=>a+b,0)/xs.length));
  const intercept = yMean - slope * xMean;
  const rLine = [{x:xMin,y:slope*xMin+intercept},{x:xMax,y:slope*xMax+intercept}];

  Plotly.newPlot('scatter-div', [
    { type:'scatter', mode:'markers', x:xs, y:ys,
      marker:{size:5, opacity:0.4, color:'#4f86c6'},
      hovertemplate: `${feat}: %{x}<br>SalePrice: $%{y:,.0f}<extra></extra>` },
    { type:'scatter', mode:'lines',
      x:rLine.map(p=>p.x), y:rLine.map(p=>p.y),
      line:{color:'crimson', width:2}, name:'OLS', showlegend:false }
  ], {
    title: `${feat} vs SalePrice  (r = ${d.pearson_r.toFixed(3)})`,
    xaxis: { title: feat },
    yaxis: { title: 'SalePrice ($)', tickformat: '$,.0f' },
    margin: { t:50 }
  });

  document.getElementById('scatter-stats').innerHTML =
    `<span class="badge">r = ${d.pearson_r.toFixed(3)}</span>
     <span class="badge ${d.p_value < 0.05 ? 'sig':''}">p = ${d.p_value < 1e-4 ? '<0.0001' : d.p_value.toFixed(4)}</span>`;
}

const scatterSel = document.getElementById('scatter-select');
features.forEach(f => scatterSel.innerHTML += `<option>${f}</option>`);
scatterSel.onchange = () => renderScatter(scatterSel.value);
renderScatter(features[0]);
```

---

### 3.15 Outlier explorer — `outliers.json`

**Shape:**
```json
{
  "zscore_outlier_count": 5,
  "suspicious_count": 2,
  "saleprice_3std_upper": 443082,
  "suspicious_rows": [
    {"Id":524,"GrLivArea":4676,"SalePrice":184750,"Neighborhood":"Edwards"}
  ],
  "scatter_points": [
    {"x":1710,"y":160000,"outlier":false,"suspicious":false}, ...
  ]
}
```

**Usage:** A Plotly scatter with three point colours — normal (blue), large-area outlier (amber), and suspicious (large area + low price, red). A small table below lists the suspicious rows with their IDs.

```js
const out = await loadJSON('data/outliers.json');

Plotly.newPlot('outlier-div', [{
  type: 'scatter',
  mode: 'markers',
  x: out.scatter_points.map(p=>p.x),
  y: out.scatter_points.map(p=>p.y),
  marker: {
    size : 6,
    opacity: 0.6,
    color: out.scatter_points.map(p =>
      p.suspicious ? '#c0392b' : p.outlier ? '#f0a500' : '#4f86c6')
  },
  hovertemplate: 'GrLivArea: %{x}<br>SalePrice: $%{y:,.0f}<extra></extra>'
}], {
  title: `GrLivArea vs SalePrice — outliers flagged`,
  xaxis: { title: 'GrLivArea (sqft)' },
  yaxis: { title: 'SalePrice ($)', tickformat: '$,.0f' },
  shapes: [{  // vertical line at 4000
    type:'line', x0:4000, x1:4000, y0:0, y1:1, yref:'paper',
    line: { color:'crimson', dash:'dash', width:1.5 }
  }]
});

// Suspicious rows table
const tbl = document.getElementById('suspicious-table');
out.suspicious_rows.forEach(r => {
  tbl.innerHTML += `<tr>
    <td>${r.Id}</td><td>${r.GrLivArea.toLocaleString()} sqft</td>
    <td>$${r.SalePrice.toLocaleString()}</td><td>${r.Neighborhood}</td>
  </tr>`;
});
```

---

### 3.16 Temporal analysis — `temporal_analysis.json`

**Shape:**
```json
{
  "by_year" : [{"year":2006,"mean":180871,"median":163500,"count":314}, ...],
  "by_month": [{"month":1,"month_name":"Jan","mean":171196,"median":145000,"count":60}, ...]
}
```

**Usage:** Two line charts side by side — one for year (2006–2010), one for month. Plot both `mean` and `median` as separate lines. The dip in 2008–2009 tells the housing-crisis story visually.

```js
const ta = await loadJSON('data/temporal_analysis.json');

new Chart(document.getElementById('yr-chart'), {
  type: 'line',
  data: {
    labels: ta.by_year.map(d=>d.year),
    datasets: [
      { label:'Mean',   data:ta.by_year.map(d=>d.mean),   borderColor:'#4f86c6', fill:false, tension:0.3 },
      { label:'Median', data:ta.by_year.map(d=>d.median), borderColor:'#7ec8a0', fill:false, tension:0.3 }
    ]
  },
  options: {
    scales: { y: { ticks: { callback: v => `$${(v/1000).toFixed(0)}k` } } },
    plugins: { title: { display:true, text:'SalePrice by Year Sold' } }
  }
});

new Chart(document.getElementById('mo-chart'), {
  type: 'line',
  data: {
    labels: ta.by_month.map(d=>d.month_name),
    datasets: [
      { label:'Mean',   data:ta.by_month.map(d=>d.mean),   borderColor:'#4f86c6', fill:false, tension:0.3 },
      { label:'Median', data:ta.by_month.map(d=>d.median), borderColor:'#7ec8a0', fill:false, tension:0.3 }
    ]
  },
  options: {
    scales: { y: { ticks: { callback: v => `$${(v/1000).toFixed(0)}k` } } },
    plugins: { title: { display:true, text:'SalePrice by Month Sold' } }
  }
});
```

---

### 3.17 Train/test shift — `distribution_shift.json`

**Shape:**
```json
{
  "n_significant": 2,
  "features": {
    "LotArea": {
      "ks_stat": 0.032, "p_value": 0.621, "significant": false,
      "train_hist": {"bin_edges":[...],"counts":[...],"stats":{...}},
      "test_hist" : {"bin_edges":[...],"counts":[...],"stats":{...}}
    }, ...
  }
}
```

**Usage:** A feature selector. When the user picks a feature, render two overlapped semi-transparent histograms (train = blue, test = orange). Show the KS statistic and p-value as badges — red if significant.

```js
const ds = await loadJSON('data/distribution_shift.json');
const dsFeatures = Object.keys(ds.features);
let dsChart;

document.getElementById('ds-badge').textContent =
  `${ds.n_significant} / ${dsFeatures.length} features show significant shift (p < 0.05)`;

function renderShift(feat) {
  const d = ds.features[feat];
  const trainH = d.train_hist, testH = d.test_hist;

  const trainLabels = trainH.bin_edges.slice(0,-1).map((v,i)=>
    ((v+trainH.bin_edges[i+1])/2).toFixed(2));

  if (dsChart) dsChart.destroy();
  dsChart = new Chart(document.getElementById('ds-hist'), {
    type: 'bar',
    data: {
      labels: trainLabels,
      datasets: [
        { label:'Train', data:trainH.counts, backgroundColor:'rgba(79,134,198,0.6)', borderWidth:0 },
        { label:'Test',  data:testH.counts,  backgroundColor:'rgba(224,123,84,0.6)',  borderWidth:0 }
      ]
    },
    options: {
      plugins: {
        title: { display:true,
          text: `${feat} — KS=${d.ks_stat}  p=${d.p_value}${d.significant?' ⚠ SHIFT':''}`,
          color: d.significant ? '#c0392b' : '#222' }
      },
      scales: { x: { stacked: false } }
    }
  });
}

const dsSel = document.getElementById('ds-select');
dsFeatures.forEach(f => dsSel.innerHTML += `<option value="${f}">${f}${ds.features[f].significant?' ⚠':''}</option>`);
dsSel.onchange = () => renderShift(dsSel.value);
renderShift(dsFeatures[0]);
```

---

### 3.18 Engineered features — `engineered_features.json`

**Shape:**
```json
{
  "correlations": [
    {"feature":"TotalSF","pearson_r":0.8225,"definition":"TotalBsmtSF + 1stFlrSF + 2ndFlrSF"},
    ...
  ],
  "scatter_by_feature": {
    "TotalSF": {
      "pearson_r": 0.8225,
      "histogram": {...}, "box": {...},
      "scatter"  : [{"x":2566,"y":325000}, ...]
    }, ...
  }
}
```

**Usage:** A ranked bar chart of correlations (showing engineered features beat raw ones). Clicking a bar renders the scatter plot for that feature below, with the `definition` shown as a formula tooltip.

```js
const ef = await loadJSON('data/engineered_features.json');
const sorted = [...ef.correlations].sort((a,b)=>Math.abs(b.pearson_r)-Math.abs(a.pearson_r));

const efBar = new Chart(document.getElementById('ef-bar'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: sorted.map(d=>d.feature),
    datasets: [{
      data: sorted.map(d=>d.pearson_r),
      backgroundColor: sorted.map(d=>d.pearson_r>0?'#7ec8a0':'#e07b54'),
      label: 'Pearson r'
    }]
  },
  options: {
    onClick: (_, elements) => {
      if (elements.length) {
        const feat = sorted[elements[0].index].feature;
        const def  = sorted[elements[0].index].definition;
        renderEFScatter(feat, def);
      }
    }
  }
});

function renderEFScatter(feat, def) {
  const d = ef.scatter_by_feature[feat];
  document.getElementById('ef-formula').textContent = `${feat} = ${def}`;
  Plotly.newPlot('ef-scatter', [{
    type:'scatter', mode:'markers',
    x: d.scatter.map(p=>p.x), y: d.scatter.map(p=>p.y),
    marker:{size:5,opacity:0.4,color:'#9b59b6'},
    hovertemplate:`${feat}: %{x:.1f}<br>SalePrice: $%{y:,.0f}<extra></extra>`
  }], {
    title:`${feat} vs SalePrice  (r=${d.pearson_r.toFixed(3)})`,
    yaxis:{ tickformat:'$,.0f' }
  });
}
renderEFScatter(sorted[0].feature, sorted[0].definition);
```

---

### 3.19 Feature importance — `feature_importance.json`

**Shape:**
```json
{
  "model": "RandomForest(n_estimators=200)",
  "top_features": [
    {"feature":"OverallQual","importance":0.124},
    {"feature":"GrLivArea", "importance":0.098}, ...
  ]
}
```

**Usage:** A horizontal bar chart sorted by importance, top 20. Colour the top bar differently to call out the dominant feature.

```js
const fi = await loadJSON('data/feature_importance.json');
const top20 = fi.top_features.slice(0,20).reverse(); // reverse for horizontal bars

new Chart(document.getElementById('fi-bar'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: top20.map(d=>d.feature),
    datasets: [{
      data: top20.map(d=>d.importance),
      backgroundColor: top20.map((d,i) => i===top20.length-1 ? '#e07b39':'#4f86c6'),
      label: 'Importance'
    }]
  },
  options: {
    plugins: {
      title: { display:true, text:`Feature Importance — ${fi.model}` },
      tooltip: { callbacks: { label: ctx => `${(ctx.parsed.x*100).toFixed(2)}%` } }
    }
  }
});
```

---

### 3.20 Neighborhood deep-dive — `neighborhood_detail.json`

**Shape:**
```json
{
  "neighborhoods": [
    {"code":"StoneBr","full_name":"Stone Brook","count":25,
     "min":230000,"q1":275000,"median":306950,"q3":356250,"max":415000,
     "mean":310790,"outliers":[]}, ...
  ],
  "price_range_usd": {"min_median":74300,"max_median":306950}
}
```

**Usage:** Two views:
1. A horizontal sorted box plot (using the reusable renderer) showing all neighborhoods — the most information-dense chart.
2. A summary card grid — one card per neighborhood showing median, count, and a mini price-range bar.

```js
const nbhd = await loadJSON('data/neighborhood_detail.json');

// Box plot
drawBoxPlot('nbhd-canvas', nbhd.neighborhoods, {
  labelKey  : 'full_name',
  yFormat   : v => `$${(v/1000).toFixed(0)}k`,
  horizontal: true,
  title     : 'SalePrice distribution by Neighborhood'
});

// Card grid
const priceMin = nbhd.price_range_usd.min_median;
const priceMax = nbhd.price_range_usd.max_median;
const grid = document.getElementById('nbhd-grid');

nbhd.neighborhoods.forEach(n => {
  const pct = ((n.median - priceMin)/(priceMax - priceMin)*100).toFixed(0);
  grid.innerHTML += `
    <div class="nbhd-card">
      <div class="nbhd-name">${n.full_name}</div>
      <div class="nbhd-median">$${(n.median/1000).toFixed(0)}k</div>
      <div class="nbhd-bar-wrap">
        <div class="nbhd-bar" style="width:${pct}%;background:hsl(${pct*1.2},60%,50%)"></div>
      </div>
      <div class="nbhd-count">${n.count} homes</div>
    </div>`;
});
```

---

### 3.21 Skewness & rare categories — `skewness_and_rare.json`

**Shape:**
```json
{
  "skewness": [
    {"feature":"MiscVal","skew":24.45,"abs_skew":24.45,"high_skew":true}, ...
  ],
  "n_high_skew": 20,
  "rare_categories": {
    "MSSubClass":["45","180","40"],
    "Neighborhood":["Veenker","NPkVill","Blueste"], ...
  }
}
```

**Usage:**
1. A horizontal bar chart of the top-20 most skewed features, colour-coded by severity (red > 10, orange 2–10, yellow 0.75–2).
2. A searchable table of rare categories per feature, with counts.

```js
const sr = await loadJSON('data/skewness_and_rare.json');
const top20sk = sr.skewness.slice(0,20);

function skewColor(s) {
  const a = Math.abs(s);
  if (a > 10) return '#c0392b';
  if (a > 2)  return '#e07b39';
  if (a > 0.75) return '#f0c30f';
  return '#7ec8a0';
}

new Chart(document.getElementById('skew-bar'), {
  type: 'bar',
  indexAxis: 'y',
  data: {
    labels: [...top20sk].reverse().map(d=>d.feature),
    datasets: [{
      data : [...top20sk].reverse().map(d=>d.abs_skew),
      backgroundColor: [...top20sk].reverse().map(d=>skewColor(d.skew)),
      label: '|skew|'
    }]
  },
  options: {
    plugins: {
      title: { display:true, text:'Top 20 most skewed numeric features' },
      tooltip: { callbacks: { label: ctx => `skew = ${top20sk[top20sk.length-1-ctx.dataIndex].skew.toFixed(3)}` } }
    },
    scales: { x: { title: { display:true, text:'|skew|' } } }
  }
});

// Rare categories table
const rareTable = document.getElementById('rare-table');
Object.entries(sr.rare_categories).forEach(([col, cats]) => {
  rareTable.innerHTML += `<tr>
    <td><strong>${col}</strong></td>
    <td>${cats.map(c=>`<code>${c}</code>`).join(' ')}</td>
    <td>${cats.length}</td>
  </tr>`;
});
```

---

### 3.22 Summary card — `eda_summary.json`

**Shape:**
```json
{
  "dataset":  {"train_rows":1460,"test_rows":1459,"features":80,...},
  "target":   {"mean":180921,"median":163000,"skew_original":1.8829,...},
  "missing_values": {...},
  "top_correlated_features": {"OverallQual":0.7909,"GrLivArea":0.7086,...},
  "top_rf_features":         {"OverallQual":0.124,...},
  "highly_skewed_features":  {"MiscVal":24.45,...},
  "key_insights": [...],
  "web_exports": [...]
}
```

**Usage:** A sticky summary panel at the bottom of the page, or a collapsible "Key Findings" section. Render `key_insights` as a bullet list, `top_correlated_features` as a mini bar chart.

```js
const summary = await loadJSON('data/eda_summary.json');

// Key insights list
const ul = document.getElementById('insights-list');
summary.key_insights.forEach(ins => {
  ul.innerHTML += `<li>${ins}</li>`;
});

// Mini top-10 correlation bar
const topCorr = Object.entries(summary.top_correlated_features).slice(0,10);
new Chart(document.getElementById('top-corr-mini'), {
  type:'bar', indexAxis:'y',
  data: {
    labels: topCorr.map(([k])=>k),
    datasets: [{ data: topCorr.map(([,v])=>v), backgroundColor:'#4f86c6' }]
  },
  options: { plugins: { legend:{display:false} }, scales:{x:{max:1}} }
});
```

---

## 4. Reusable box-plot renderer (vanilla JS)

The exported box data (`min`, `q1`, `median`, `q3`, `max`, `outliers`) can be rendered with a Canvas 2D box-plot — no library required. This function is referenced throughout section 3.

```js
/**
 * drawBoxPlot(canvasId, data, opts)
 * data: array of { min, q1, median, q3, max, outliers, category/label }
 * opts.labelKey: key in each data object to use as label (default 'category')
 * opts.yFormat: function(value) -> string
 * opts.horizontal: bool (default false — vertical boxes)
 * opts.title: string
 */
function drawBoxPlot(canvasId, data, opts = {}) {
  const canvas = typeof canvasId === 'string'
    ? document.getElementById(canvasId) : canvasId;
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const labelKey  = opts.labelKey  || 'category';
  const yFmt      = opts.yFormat   || (v => v.toFixed(0));
  const PAD_L     = opts.horizontal ? 150 : 40;
  const PAD_R     = 20, PAD_T = 30, PAD_B = opts.horizontal ? 20 : 80;

  const allVals = data.flatMap(d => [d.min, d.max, ...d.outliers]);
  const vMin = Math.min(...allVals) * 0.97;
  const vMax = Math.max(...allVals) * 1.03;

  function scaleV(v) {
    if (opts.horizontal)
      return PAD_L + (v - vMin) / (vMax - vMin) * (W - PAD_L - PAD_R);
    else
      return H - PAD_B - (v - vMin) / (vMax - vMin) * (H - PAD_T - PAD_B);
  }

  // Title
  if (opts.title) {
    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(opts.title, W/2, 18);
  }

  const n     = data.length;
  const step  = opts.horizontal
    ? (H - PAD_T - PAD_B) / n
    : (W - PAD_L - PAD_R) / n;
  const bw    = step * 0.5;  // box width

  data.forEach((d, i) => {
    const centre = opts.horizontal
      ? PAD_T + step * i + step/2
      : PAD_L + step * i + step/2;

    const lo = scaleV(d.min), hi = scaleV(d.max);
    const q1 = scaleV(d.q1), q3 = scaleV(d.q3), med = scaleV(d.median);

    ctx.strokeStyle = '#4f86c6';
    ctx.fillStyle   = 'rgba(79,134,198,0.25)';
    ctx.lineWidth   = 1.5;

    if (opts.horizontal) {
      // Whiskers
      ctx.beginPath(); ctx.moveTo(lo, centre); ctx.lineTo(q1, centre); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(q3, centre); ctx.lineTo(hi, centre); ctx.stroke();
      // Box
      ctx.fillRect(q1, centre - bw/2, q3-q1, bw);
      ctx.strokeRect(q1, centre - bw/2, q3-q1, bw);
      // Median
      ctx.beginPath(); ctx.strokeStyle='#c0392b'; ctx.lineWidth=2;
      ctx.moveTo(med, centre-bw/2); ctx.lineTo(med, centre+bw/2); ctx.stroke();
      // Whisker caps
      ctx.strokeStyle='#4f86c6'; ctx.lineWidth=1.5;
      [[lo],[hi]].forEach(([x]) => {
        ctx.beginPath(); ctx.moveTo(x,centre-bw/4); ctx.lineTo(x,centre+bw/4); ctx.stroke();
      });
      // Label
      ctx.fillStyle='#333'; ctx.font='11px system-ui'; ctx.textAlign='right';
      ctx.fillText(d[labelKey] || '', q1 - 6, centre + 4);
    } else {
      // Whiskers
      ctx.beginPath(); ctx.moveTo(centre,hi); ctx.lineTo(centre,q3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centre,q1); ctx.lineTo(centre,lo); ctx.stroke();
      // Box
      ctx.fillRect(centre-bw/2, q3, bw, q1-q3);
      ctx.strokeRect(centre-bw/2, q3, bw, q1-q3);
      // Median
      ctx.beginPath(); ctx.strokeStyle='#c0392b'; ctx.lineWidth=2;
      ctx.moveTo(centre-bw/2,med); ctx.lineTo(centre+bw/2,med); ctx.stroke();
      // Label
      ctx.fillStyle='#333'; ctx.font='10px system-ui'; ctx.textAlign='center';
      ctx.save(); ctx.translate(centre, H-PAD_B+8);
      ctx.rotate(-0.5); ctx.fillText(d[labelKey]||'', 0, 0); ctx.restore();
    }

    // Outliers
    ctx.fillStyle='rgba(192,57,43,0.5)';
    d.outliers.forEach(ov => {
      const vv = scaleV(ov);
      ctx.beginPath();
      if (opts.horizontal) ctx.arc(vv, centre, 3, 0, 2*Math.PI);
      else ctx.arc(centre, vv, 3, 0, 2*Math.PI);
      ctx.fill();
    });
  });

  // Y-axis ticks (or x-axis for horizontal)
  ctx.fillStyle='#666'; ctx.font='10px system-ui';
  const nTicks = 5;
  for (let t = 0; t <= nTicks; t++) {
    const v   = vMin + t * (vMax-vMin)/nTicks;
    const pos = scaleV(v);
    if (opts.horizontal) {
      ctx.textAlign='center'; ctx.fillText(yFmt(v), pos, H-4);
    } else {
      ctx.textAlign='right'; ctx.fillText(yFmt(v), PAD_L-4, pos+4);
    }
  }
}

// Convenience wrapper for a single box (used in paginated grid)
function drawSingleBox(canvas, d, title) {
  drawBoxPlot(canvas, [{ ...d, category: '' }], {
    horizontal: false,
    title,
    yFormat: v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toFixed(0)
  });
}
```

---

## 5. Recommended libraries

| Library | CDN | Use |
|---|---|---|
| [Chart.js v4](https://www.chartjs.org/) | `https://cdn.jsdelivr.net/npm/chart.js` | Histograms, bar charts, line charts, donuts |
| [Plotly.js](https://plotly.com/javascript/) | `https://cdn.plot.ly/plotly-2.27.0.min.js` | Scatter plots, correlation heatmap, KDE |
| [chartjs-plugin-annotation](https://www.chartjs.org/chartjs-plugin-annotation/) | CDN | Vertical/horizontal reference lines |

All three can be loaded from CDN — no build step needed for a static GitHub Pages site. The custom `drawBoxPlot` function above handles all box-plot rendering natively.

---

## 6. Full site scaffold

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>House Prices EDA</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f4f5f7; color: #222; }

    /* ── Nav ── */
    nav { background: #1a1a2e; padding: 0 2rem; display: flex; gap: 1rem; flex-wrap: wrap; }
    nav a { color: #aaa; text-decoration: none; padding: 0.9rem 0.4rem; font-size: 13px; white-space: nowrap; }
    nav a:hover { color: #fff; }

    /* ── Hero ── */
    .hero { background: linear-gradient(135deg,#1a1a2e,#2c3e6b); color:#fff; padding:3rem 2rem; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.3rem; }
    .hero p  { color: #aaa; font-size: 14px; margin-bottom: 1.5rem; }
    .stats-bar { display: flex; gap: 1rem; flex-wrap: wrap; }
    .stat-card { background: rgba(255,255,255,.08); border-radius: 10px; padding: 1rem 1.5rem; min-width: 140px; }
    .stat-card .val { font-size: 2rem; font-weight: 700; }
    .stat-card .lbl { font-size: 12px; color: #aaa; margin-top: 2px; }

    /* ── Sections ── */
    section { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    section h2 { font-size: 1.3rem; margin-bottom: 0.3rem; }
    section p.desc { color: #666; font-size: 13px; margin-bottom: 1.2rem; }

    /* ── Cards ── */
    .card { background: #fff; border-radius: 12px; padding: 1.5rem;
            box-shadow: 0 1px 4px rgba(0,0,0,.07); margin-bottom: 1.2rem; }

    /* ── Tabs ── */
    .tab-bar { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .tab { padding: 0.35rem 0.9rem; border: 1px solid #ccc; border-radius: 20px;
           background: #fff; cursor: pointer; font-size: 12px; }
    .tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

    /* ── Tables ── */
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f4f5f7; font-weight: 600; cursor: pointer; }
    td.warn { color: #c0392b; font-weight: 600; }

    /* ── Misc ── */
    .badge { display:inline-block; padding:3px 8px; border-radius:12px;
             font-size:12px; background:#e8f0fe; color:#1a1a2e; margin-right:4px; }
    .badge.sig { background:#fde8e8; color:#c0392b; }
    .alert-card { border-left:4px solid #f0c30f; background:#fffbe6;
                  padding:10px 14px; border-radius:6px; margin-bottom:8px; font-size:13px; }
    input[type=text], select { width:100%; padding:8px 10px; border:1px solid #ccc;
                               border-radius:6px; font-size:13px; margin-bottom:1rem; }
    .grid-2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1.2rem; }
    .grid-3 { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }
    .nbhd-card { background:#fff; border-radius:8px; padding:10px 12px;
                 box-shadow:0 1px 3px rgba(0,0,0,.06); }
    .nbhd-name { font-size:12px; font-weight:600; margin-bottom:4px; }
    .nbhd-median { font-size:18px; font-weight:700; color:#1a1a2e; }
    .nbhd-bar-wrap { height:6px; background:#eee; border-radius:3px; margin:6px 0; }
    .nbhd-bar { height:100%; border-radius:3px; }
    .nbhd-count { font-size:11px; color:#888; }
    #schema-search { max-width: 320px; }
  </style>
</head>
<body>

<nav>
  <a href="#overview">Overview</a>
  <a href="#missing">Missing</a>
  <a href="#saleprice">SalePrice</a>
  <a href="#numeric">Numeric</a>
  <a href="#correlations">Correlations</a>
  <a href="#categorical">Categorical</a>
  <a href="#neighborhood">Neighborhoods</a>
  <a href="#scatter">Scatter</a>
  <a href="#outliers">Outliers</a>
  <a href="#temporal">Temporal</a>
  <a href="#shift">Train/Test Shift</a>
  <a href="#engineering">Feature Eng.</a>
  <a href="#importance">Importance</a>
  <a href="#skewness">Skewness</a>
  <a href="#insights">Insights</a>
</nav>

<!-- ── Hero ── -->
<div class="hero">
  <h1>🏠 House Prices — Interactive EDA</h1>
  <p>Ames, Iowa · Kaggle House Prices Advanced Regression</p>
  <div class="stats-bar">
    <div class="stat-card"><div class="val" data-stat="train_rows">—</div><div class="lbl">Training rows</div></div>
    <div class="stat-card"><div class="val" data-stat="test_rows">—</div><div class="lbl">Test rows</div></div>
    <div class="stat-card"><div class="val" data-stat="train_cols">—</div><div class="lbl">Total features</div></div>
  </div>
</div>

<!-- ── 1. Overview ── -->
<section id="overview">
  <h2>Dataset overview</h2>
  <p class="desc">Schema: column types, unique values, and missing counts. Click any header to sort.</p>
  <div class="card">
    <input type="text" id="schema-search" placeholder="Search feature name…">
    <table id="schema-table">
      <thead><tr>
        <th data-sort="column">Column</th>
        <th data-sort="dtype">Dtype</th>
        <th data-sort="n_unique">Unique</th>
        <th data-sort="n_missing">Missing</th>
      </tr></thead>
      <tbody></tbody>
    </table>
  </div>
</section>

<!-- ── 2. Missing ── -->
<section id="missing">
  <h2>Missing values</h2>
  <p class="desc">Orange = NaN encodes absence (per data description, fill with 0/None). Blue = genuinely missing (impute).</p>
  <div id="missing-legend" class="card" style="padding:0.75rem 1rem;font-size:13px;margin-bottom:0.5rem;"></div>
  <div class="card"><canvas id="missing-bar" height="300"></canvas></div>
  <div id="near-constant-cards"></div>
</section>

<!-- ── 3. SalePrice ── -->
<section id="saleprice">
  <h2>Target variable — SalePrice</h2>
  <p class="desc">Distribution before and after log1p transform. Use the toggle to compare skewness.</p>
  <div class="card">
    <button id="sp-toggle" class="tab active">Show log1p</button>
    <canvas id="sp-hist"></canvas>
    <div id="percentile-ruler" style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;font-size:12px;"></div>
  </div>
</section>

<!-- ── 4. Numeric ── -->
<section id="numeric">
  <h2>Numeric feature distributions</h2>
  <p class="desc">Select a feature to see its histogram and summary stats. Table below covers all numeric features — click headers to sort by skew, missing %, etc.</p>
  <div class="grid-2">
    <div class="card">
      <select id="num-feat-select"></select>
      <canvas id="num-hist"></canvas>
      <div id="num-stats" style="font-size:13px;color:#666;margin-top:0.5rem;"></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:0.75rem;font-size:14px;">Ordinal feature vs SalePrice</h3>
      <select id="ordinal-select"></select>
      <canvas id="ordinal-canvas" width="400" height="280"></canvas>
    </div>
  </div>
  <div class="card">
    <h3 style="margin-bottom:0.75rem;font-size:14px;">All numeric feature stats</h3>
    <table id="all-num-stats">
      <thead><tr>
        <th data-sort="feature">Feature</th>
        <th data-sort="mean">Mean</th>
        <th data-sort="median">Median</th>
        <th data-sort="std">Std</th>
        <th data-sort="skew">Skew</th>
        <th data-sort="pct_missing">Missing %</th>
      </tr></thead>
      <tbody></tbody>
    </table>
  </div>
</section>

<!-- ── 5. Correlations ── -->
<section id="correlations">
  <h2>Correlations</h2>
  <p class="desc">Pearson r with SalePrice for all numeric + ordinal features. Click "Show heatmap" for the full top-15 matrix.</p>
  <div class="grid-2">
    <div class="card"><canvas id="corr-bar" height="350"></canvas></div>
    <div class="card"><canvas id="ordinal-corr" height="350"></canvas></div>
  </div>
  <div class="card">
    <button id="show-heatmap" class="tab">Show top-15 heatmap</button>
    <div id="corr-heatmap" style="height:500px;margin-top:1rem;"></div>
  </div>
</section>

<!-- ── 6. Categorical ── -->
<section id="categorical">
  <h2>Categorical features</h2>
  <p class="desc">Category counts and SalePrice distributions. Orange bars = rare categories (< 1%).</p>
  <div class="card">
    <div class="tab-bar" id="cat-tabs"></div>
    <canvas id="cat-chart" height="200"></canvas>
  </div>
  <div class="card">
    <h3 style="margin-bottom:0.75rem;font-size:14px;">SalePrice by categorical feature</h3>
    <div class="tab-bar" id="cat-box-tabs"></div>
    <canvas id="cat-box-canvas" width="900" height="320"></canvas>
  </div>
</section>

<!-- ── 7. Neighborhood ── -->
<section id="neighborhood">
  <h2>Neighborhood analysis</h2>
  <p class="desc">All 25 Ames neighborhoods sorted by median SalePrice, with full names from the data description.</p>
  <div class="card"><canvas id="neighborhood-canvas" width="900" height="560"></canvas></div>
  <div id="nbhd-grid" class="grid-3" style="margin-top:1rem;"></div>
</section>

<!-- ── 8. Scatter ── -->
<section id="scatter">
  <h2>Feature vs SalePrice</h2>
  <p class="desc">Scatter plots with OLS regression line. Select a feature to explore the relationship.</p>
  <div class="card">
    <select id="scatter-select" style="max-width:300px;"></select>
    <div id="scatter-stats" style="margin:0.5rem 0;"></div>
    <div id="scatter-div" style="height:450px;"></div>
  </div>
</section>

<!-- ── 9. Outliers ── -->
<section id="outliers">
  <h2>Outlier detection</h2>
  <p class="desc">Red = large area + low price (suspicious); amber = GrLivArea > 4000.</p>
  <div class="card"><div id="outlier-div" style="height:420px;"></div></div>
  <div class="card">
    <h3 style="margin-bottom:0.5rem;font-size:14px;">Suspicious rows</h3>
    <table><thead><tr><th>Id</th><th>GrLivArea</th><th>SalePrice</th><th>Neighborhood</th></tr></thead>
      <tbody id="suspicious-table"></tbody></table>
  </div>
</section>

<!-- ── 10. Temporal ── -->
<section id="temporal">
  <h2>Temporal analysis</h2>
  <p class="desc">Sale price trends by year (2006–2010) and month sold.</p>
  <div class="grid-2">
    <div class="card"><canvas id="yr-chart"></canvas></div>
    <div class="card"><canvas id="mo-chart"></canvas></div>
  </div>
</section>

<!-- ── 11. Train/test shift ── -->
<section id="shift">
  <h2>Train vs test distribution shift</h2>
  <p class="desc">KS test per feature. Red = statistically significant shift (p&lt;0.05).</p>
  <div class="card">
    <p id="ds-badge" class="badge" style="margin-bottom:1rem;font-size:13px;"></p>
    <select id="ds-select" style="max-width:280px;"></select>
    <canvas id="ds-hist" height="220" style="margin-top:1rem;"></canvas>
  </div>
</section>

<!-- ── 12. Feature engineering ── -->
<section id="engineering">
  <h2>Engineered features</h2>
  <p class="desc">Click a bar to see the scatter plot and formula for that feature.</p>
  <div class="grid-2">
    <div class="card"><canvas id="ef-bar" height="300"></canvas></div>
    <div class="card">
      <p id="ef-formula" style="font-size:12px;color:#666;font-family:monospace;margin-bottom:0.5rem;"></p>
      <div id="ef-scatter" style="height:300px;"></div>
    </div>
  </div>
</section>

<!-- ── 13. Feature importance ── -->
<section id="importance">
  <h2>Random Forest feature importance</h2>
  <p class="desc">Top 20 features by RF importance — encoded using data-description ordinal maps.</p>
  <div class="card"><canvas id="fi-bar" height="350"></canvas></div>
</section>

<!-- ── 14. Skewness ── -->
<section id="skewness">
  <h2>Skewness & rare categories</h2>
  <p class="desc">Red > 10 | Orange 2–10 | Yellow 0.75–2. Features above 0.75 benefit from log1p or Box-Cox.</p>
  <div class="card"><canvas id="skew-bar" height="350"></canvas></div>
  <div class="card">
    <h3 style="margin-bottom:0.75rem;font-size:14px;">Rare categories (< 1% frequency)</h3>
    <table><thead><tr><th>Feature</th><th>Rare categories</th><th>Count</th></tr></thead>
      <tbody id="rare-table"></tbody></table>
  </div>
</section>

<!-- ── 15. Insights ── -->
<section id="insights">
  <h2>Key findings & modeling recommendations</h2>
  <div class="card">
    <ul id="insights-list" style="padding-left:1.2rem;line-height:2;font-size:14px;"></ul>
  </div>
  <div class="card">
    <h3 style="margin-bottom:0.75rem;font-size:14px;">Top correlations (Pearson r with SalePrice)</h3>
    <canvas id="top-corr-mini" height="180"></canvas>
  </div>
</section>

<script>
/* ─── Utilities ──────────────────────────────────────────────────────────── */
async function loadJSON(p) { return fetch(p).then(r => r.json()); }

function animateCount(el, target, fmt = v => Math.round(v).toLocaleString()) {
  const dur = 1000, start = performance.now();
  requestAnimationFrame(function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = fmt(t * target);
    if (t < 1) requestAnimationFrame(tick);
  });
}

function buildHistChart(canvasId, hData, color, label) {
  const labels = hData.bin_edges.slice(0,-1).map((v,i)=>
    ((v+hData.bin_edges[i+1])/2).toFixed(1));
  return new Chart(document.getElementById(canvasId), {
    type:'bar',
    data:{ labels, datasets:[{data:hData.counts, backgroundColor:color, borderWidth:0, label}] },
    options:{ plugins:{ legend:{display:false} }, scales:{ x:{ticks:{maxTicksLimit:10}} } }
  });
}

/* ── Box-plot renderer (see §4 in guide) ─────────────────────────────────── */
function drawBoxPlot(canvasId, data, opts={}) {
  const canvas = typeof canvasId==='string' ? document.getElementById(canvasId) : canvasId;
  if (!canvas) return;
  const ctx=canvas.getContext('2d'), W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const labelKey=opts.labelKey||'category';
  const yFmt=opts.yFormat||(v=>v.toFixed(0));
  const PAD_L=opts.horizontal?160:50, PAD_R=20, PAD_T=35, PAD_B=opts.horizontal?20:70;
  const allV=data.flatMap(d=>[d.min,d.max,...(d.outliers||[])]);
  const vMin=Math.min(...allV)*0.97, vMax=Math.max(...allV)*1.03;
  const sv=v=>opts.horizontal
    ? PAD_L+(v-vMin)/(vMax-vMin)*(W-PAD_L-PAD_R)
    : H-PAD_B-(v-vMin)/(vMax-vMin)*(H-PAD_T-PAD_B);
  if(opts.title){ctx.fillStyle='#333';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText(opts.title,W/2,18);}
  const n=data.length, step=opts.horizontal?(H-PAD_T-PAD_B)/n:(W-PAD_L-PAD_R)/n, bw=step*0.5;
  data.forEach((d,i)=>{
    const c=opts.horizontal?PAD_T+step*i+step/2:PAD_L+step*i+step/2;
    const lo=sv(d.min),hi=sv(d.max),q1=sv(d.q1),q3=sv(d.q3),med=sv(d.median);
    ctx.strokeStyle='#4f86c6';ctx.fillStyle='rgba(79,134,198,0.25)';ctx.lineWidth=1.5;
    if(opts.horizontal){
      ctx.beginPath();ctx.moveTo(lo,c);ctx.lineTo(q1,c);ctx.stroke();
      ctx.beginPath();ctx.moveTo(q3,c);ctx.lineTo(hi,c);ctx.stroke();
      ctx.fillRect(q1,c-bw/2,q3-q1,bw);ctx.strokeRect(q1,c-bw/2,q3-q1,bw);
      ctx.beginPath();ctx.strokeStyle='#c0392b';ctx.lineWidth=2;ctx.moveTo(med,c-bw/2);ctx.lineTo(med,c+bw/2);ctx.stroke();
      ctx.strokeStyle='#4f86c6';ctx.lineWidth=1.5;
      [lo,hi].forEach(x=>{ctx.beginPath();ctx.moveTo(x,c-bw/4);ctx.lineTo(x,c+bw/4);ctx.stroke();});
      ctx.fillStyle='#333';ctx.font='11px system-ui';ctx.textAlign='right';
      ctx.fillText(d[labelKey]||'',q1-6,c+4);
    } else {
      ctx.beginPath();ctx.moveTo(c,hi);ctx.lineTo(c,q3);ctx.stroke();
      ctx.beginPath();ctx.moveTo(c,q1);ctx.lineTo(c,lo);ctx.stroke();
      ctx.fillRect(c-bw/2,q3,bw,q1-q3);ctx.strokeRect(c-bw/2,q3,bw,q1-q3);
      ctx.beginPath();ctx.strokeStyle='#c0392b';ctx.lineWidth=2;ctx.moveTo(c-bw/2,med);ctx.lineTo(c+bw/2,med);ctx.stroke();
      ctx.fillStyle='#333';ctx.font='10px system-ui';ctx.textAlign='center';
      ctx.save();ctx.translate(c,H-PAD_B+8);ctx.rotate(-0.5);ctx.fillText(d[labelKey]||'',0,0);ctx.restore();
    }
    ctx.fillStyle='rgba(192,57,43,0.5)';
    (d.outliers||[]).forEach(ov=>{
      const vv=sv(ov);ctx.beginPath();
      if(opts.horizontal)ctx.arc(vv,c,3,0,2*Math.PI);else ctx.arc(c,vv,3,0,2*Math.PI);
      ctx.fill();
    });
  });
  const nT=5;
  for(let t=0;t<=nT;t++){
    const v=vMin+t*(vMax-vMin)/nT,pos=sv(v);
    ctx.fillStyle='#666';ctx.font='10px system-ui';
    if(opts.horizontal){ctx.textAlign='center';ctx.fillText(yFmt(v),pos,H-4);}
    else{ctx.textAlign='right';ctx.fillText(yFmt(v),PAD_L-4,pos+4);}
  }
}

/* ─── Main init ──────────────────────────────────────────────────────────── */
(async () => {
  /* 1. Overview */
  const ov = await loadJSON('data/dataset_overview.json');
  animateCount(document.querySelector('[data-stat="train_rows"]'), ov.train_rows);
  animateCount(document.querySelector('[data-stat="test_rows"]'), ov.test_rows);
  animateCount(document.querySelector('[data-stat="train_cols"]'), ov.train_cols);
  let schemaSort = 'column', schemaAsc = true;
  const renderSchema = rows => {
    document.querySelector('#schema-table tbody').innerHTML = rows.map(r =>
      `<tr><td>${r.column}</td><td>${r.dtype}</td><td>${r.n_unique}</td>
       <td class="${r.n_missing>0?'warn':''}">${r.n_missing}</td></tr>`).join('');
  };
  document.querySelectorAll('#schema-table th[data-sort]').forEach(th => {
    th.onclick = () => {
      if (schemaSort === th.dataset.sort) schemaAsc = !schemaAsc;
      else { schemaSort = th.dataset.sort; schemaAsc = true; }
      renderSchema([...ov.schema].sort((a,b) =>
        schemaAsc ? (a[schemaSort]>b[schemaSort]?1:-1) : (a[schemaSort]<b[schemaSort]?1:-1)));
    };
  });
  document.getElementById('schema-search').oninput = e =>
    renderSchema(ov.schema.filter(r => r.column.toLowerCase().includes(e.target.value.toLowerCase())));
  renderSchema(ov.schema);

  /* 2. Missing values */
  const mv = await loadJSON('data/missing_values.json');
  new Chart(document.getElementById('missing-bar'), {
    type:'bar', indexAxis:'y',
    data:{ labels:mv.rows.map(r=>r.column),
           datasets:[{label:'Missing %', data:mv.rows.map(r=>r.missing_pct),
                      backgroundColor:mv.rows.map(r=>r.nan_means_absence?'#e07b54':'#4f86c6')}] },
    options:{ plugins:{legend:{display:false},tooltip:{callbacks:{afterLabel:ctx=>mv.rows[ctx.dataIndex].nan_means_absence?'NaN = absence':'Genuinely missing'}}},
              scales:{x:{max:100,title:{display:true,text:'Missing %'}}} }
  });
  document.getElementById('missing-legend').innerHTML =
    '<span style="color:#e07b54">■</span> NaN = absence (fill 0/None) &nbsp; <span style="color:#4f86c6">■</span> Genuinely missing (impute)';
  const cf = await loadJSON('data/constant_features.json');
  cf.near_constant.forEach(f => {
    document.getElementById('near-constant-cards').innerHTML +=
      `<div class="alert-card"><strong>${f.column}</strong> — ${f.pct}% is "${f.dominant}" (near-constant)</div>`;
  });

  /* 3. SalePrice */
  const sp = await loadJSON('data/saleprice_distribution.json');
  let showLog = false;
  const spChart = buildHistChart('sp-hist', sp.original_histogram, '#4f86c6', 'SalePrice');
  spChart.options.plugins.title = {display:true, text:`SalePrice — skew = ${sp.stats.skew_orig}`};
  spChart.update();
  document.getElementById('sp-toggle').onclick = () => {
    showLog = !showLog;
    const h = showLog ? sp.log1p_histogram : sp.original_histogram;
    const labels = h.bin_edges.slice(0,-1).map((v,i)=>((v+h.bin_edges[i+1])/2).toFixed(1));
    spChart.data.labels = labels;
    spChart.data.datasets[0].data = h.counts;
    spChart.data.datasets[0].backgroundColor = showLog ? '#7ec8a0' : '#4f86c6';
    spChart.options.plugins.title.text = showLog
      ? `log1p(SalePrice) — skew = ${sp.stats.skew_log1p}`
      : `SalePrice — skew = ${sp.stats.skew_orig}`;
    spChart.update();
    document.getElementById('sp-toggle').textContent = showLog ? 'Show original' : 'Show log1p';
  };
  Object.entries(sp.percentiles).forEach(([p,v]) => {
    document.getElementById('percentile-ruler').innerHTML +=
      `<div><span class="badge">P${p}</span> $${(v/1000).toFixed(0)}k</div>`;
  });

  /* 4. Numeric distributions */
  const nd = await loadJSON('data/numeric_distributions.json');
  let numHistChart;
  const featSel = document.getElementById('num-feat-select');
  Object.keys(nd.key_features).forEach(f => featSel.innerHTML += `<option>${f}</option>`);
  function renderNumFeat(f) {
    const d = nd.key_features[f];
    const h = d.histogram;
    const labels = h.bin_edges.slice(0,-1).map((v,i)=>((v+h.bin_edges[i+1])/2).toFixed(1));
    if (numHistChart) numHistChart.destroy();
    numHistChart = new Chart(document.getElementById('num-hist'), {
      type:'bar',
      data:{labels,datasets:[{data:h.counts,backgroundColor:'#4f86c6',borderWidth:0}]},
      options:{plugins:{legend:{display:false},title:{display:true,text:`${f} — skew=${h.stats.skew} mean=${h.stats.mean.toFixed(1)}`}}}
    });
    document.getElementById('num-stats').textContent =
      `Mean: ${d.histogram.stats.mean.toFixed(2)} · Median: ${d.box.median} · IQR: ${(d.box.q3-d.box.q1).toFixed(0)} · Outliers: ${d.box.n_outliers}`;
  }
  featSel.onchange = () => renderNumFeat(featSel.value);
  renderNumFeat(Object.keys(nd.key_features)[0]);
  let nsSort = 'feature', nsAsc = true;
  const renderNumTable = () => {
    const sorted = [...nd.all_numeric_stats].sort((a,b)=>
      nsAsc?(a[nsSort]>b[nsSort]?1:-1):(a[nsSort]<b[nsSort]?1:-1));
    document.querySelector('#all-num-stats tbody').innerHTML = sorted.map(r=>
      `<tr><td>${r.feature}</td><td>${r.mean.toFixed(2)}</td><td>${r.median.toFixed(2)}</td>
           <td>${r.std.toFixed(2)}</td>
           <td class="${Math.abs(r.skew)>0.75?'warn':''}">${r.skew.toFixed(3)}</td>
           <td class="${r.pct_missing>0?'warn':''}">${r.pct_missing}%</td></tr>`).join('');
  };
  document.querySelectorAll('#all-num-stats th[data-sort]').forEach(th=>{
    th.onclick=()=>{if(nsSort===th.dataset.sort)nsAsc=!nsAsc;else{nsSort=th.dataset.sort;nsAsc=true;}renderNumTable();};
  });
  renderNumTable();

  /* Ordinal box plots */
  const ob = await loadJSON('data/ordinal_boxplots.json');
  const obFeats = Object.keys(ob);
  const obSel = document.getElementById('ordinal-select');
  obFeats.forEach(f => obSel.innerHTML += `<option>${f}</option>`);
  function renderOrdBox(f) {
    const canvas = document.getElementById('ordinal-canvas');
    const boxes = [...ob[f].boxes].sort((a,b)=>a.ordinal_score-b.ordinal_score);
    drawBoxPlot(canvas, boxes, {
      labelKey:'label',
      yFormat: v=>`$${(v/1000).toFixed(0)}k`,
      title:`${f} vs SalePrice`
    });
  }
  obSel.onchange = () => renderOrdBox(obSel.value);
  renderOrdBox(obFeats[0]);

  /* 5. Correlations */
  const corr = await loadJSON('data/correlations.json');
  new Chart(document.getElementById('corr-bar'), {
    type:'bar', indexAxis:'y',
    data:{ labels:corr.top_vs_saleprice.map(d=>d.feature),
           datasets:[{data:corr.top_vs_saleprice.map(d=>d.signed_corr),
                      backgroundColor:corr.top_vs_saleprice.map(d=>d.signed_corr>0?'#7ec8a0':'#e07b54')}] },
    options:{plugins:{legend:{display:false},title:{display:true,text:'Numeric + ordinal correlation with SalePrice'}},
             scales:{x:{min:-1,max:1}}}
  });
  const oc = await loadJSON('data/ordinal_correlations.json');
  const ocSorted = [...oc.bars].sort((a,b)=>a.correlation-b.correlation);
  new Chart(document.getElementById('ordinal-corr'), {
    type:'bar', indexAxis:'y',
    data:{ labels:ocSorted.map(d=>d.feature),
           datasets:[{data:ocSorted.map(d=>d.correlation),
                      backgroundColor:ocSorted.map(d=>d.correlation>0?'#7ec8a0':'#e07b54')}] },
    options:{plugins:{legend:{display:false},title:{display:true,text:'Ordinal features correlation with SalePrice'}},
             scales:{x:{min:-1,max:1}}}
  });
  document.getElementById('show-heatmap').onclick = () => {
    Plotly.newPlot('corr-heatmap',[{type:'heatmap',z:corr.top15_matrix.values,
      x:corr.top15_matrix.features,y:corr.top15_matrix.features,
      colorscale:'RdYlGn',zmid:0,
      hovertemplate:'<b>%{y}</b> × <b>%{x}</b> = %{z}<extra></extra>'}],
      {title:'Top 15 features — correlation matrix',margin:{l:120,b:120}});
  };

  /* 6. Categorical */
  const cc = await loadJSON('data/category_counts.json');
  let ccChart;
  const catFeats = Object.keys(cc.focused);
  const catTabs = document.getElementById('cat-tabs');
  catFeats.forEach((f,i)=>{
    const btn=document.createElement('button'); btn.className='tab'+(i===0?' active':'');
    btn.textContent=f; btn.onclick=()=>{
      catTabs.querySelectorAll('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      renderCatCount(f);
    };
    catTabs.appendChild(btn);
  });
  function renderCatCount(f){
    const data=cc.focused[f]; const rare=cc.rare_categories[f]||[];
    const labels=data.map(d=>f==='MSSubClass'?(cc.mssubclass_labels[d.category]||d.category):d.category);
    if(ccChart)ccChart.destroy();
    ccChart=new Chart(document.getElementById('cat-chart'),{type:'bar',
      data:{labels,datasets:[{data:data.map(d=>d.count),backgroundColor:data.map(d=>rare.includes(d.category)?'#f0a500':'#4f86c6'),label:'Count'}]},
      options:{plugins:{legend:{display:false},title:{display:true,text:f},tooltip:{callbacks:{label:ctx=>`${ctx.parsed.y} (${data[ctx.dataIndex].pct}%)`}}}}
    });
  }
  renderCatCount(catFeats[0]);

  const sbc = await loadJSON('data/saleprice_by_categorical.json');
  const catBoxFeats=Object.keys(sbc);
  const catBoxTabs=document.getElementById('cat-box-tabs');
  catBoxFeats.forEach((f,i)=>{
    const btn=document.createElement('button'); btn.className='tab'+(i===0?' active':'');
    btn.textContent=f; btn.onclick=()=>{
      catBoxTabs.querySelectorAll('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      drawBoxPlot('cat-box-canvas',sbc[f],{yFormat:v=>`$${(v/1000).toFixed(0)}k`,title:`SalePrice by ${f}`});
    };
    catBoxTabs.appendChild(btn);
  });
  drawBoxPlot('cat-box-canvas',sbc[catBoxFeats[0]],{yFormat:v=>`$${(v/1000).toFixed(0)}k`,title:`SalePrice by ${catBoxFeats[0]}`});

  /* 7. Neighborhoods */
  const nbhd = await loadJSON('data/neighborhood_detail.json');
  drawBoxPlot('neighborhood-canvas', nbhd.neighborhoods, {
    labelKey:'full_name', yFormat:v=>`$${(v/1000).toFixed(0)}k`,
    horizontal:true, title:'SalePrice by Neighborhood'
  });
  const prMin=nbhd.price_range_usd.min_median, prMax=nbhd.price_range_usd.max_median;
  nbhd.neighborhoods.forEach(n=>{
    const pct=((n.median-prMin)/(prMax-prMin)*100).toFixed(0);
    document.getElementById('nbhd-grid').innerHTML+=`
      <div class="nbhd-card">
        <div class="nbhd-name">${n.full_name}</div>
        <div class="nbhd-median">$${(n.median/1000).toFixed(0)}k</div>
        <div class="nbhd-bar-wrap"><div class="nbhd-bar" style="width:${pct}%;background:hsl(${pct*1.2},60%,50%)"></div></div>
        <div class="nbhd-count">${n.count} homes</div>
      </div>`;
  });

  /* 8. Scatter */
  const sd = await loadJSON('data/scatter_data.json');
  const sdFeats = Object.keys(sd);
  const scSel=document.getElementById('scatter-select');
  sdFeats.forEach(f=>scSel.innerHTML+=`<option>${f}</option>`);
  function renderScatter(f){
    const d=sd[f]; const xs=d.points.map(p=>p.x), ys=d.points.map(p=>p.y);
    const xMn=Math.min(...xs),xMx=Math.max(...xs),yM=ys.reduce((a,b)=>a+b)/ys.length,xM=xs.reduce((a,b)=>a+b)/xs.length;
    const sy=Math.sqrt(ys.map(y=>(y-yM)**2).reduce((a,b)=>a+b)/ys.length);
    const sx=Math.sqrt(xs.map(x=>(x-xM)**2).reduce((a,b)=>a+b)/xs.length);
    const sl=d.pearson_r*(sy/sx), ic=yM-sl*xM;
    Plotly.newPlot('scatter-div',[
      {type:'scatter',mode:'markers',x:xs,y:ys,marker:{size:5,opacity:0.4,color:'#4f86c6'},
       hovertemplate:`${f}: %{x}<br>SalePrice: $%{y:,.0f}<extra></extra>`},
      {type:'scatter',mode:'lines',x:[xMn,xMx],y:[sl*xMn+ic,sl*xMx+ic],line:{color:'crimson',width:2},showlegend:false}
    ],{title:`${f} vs SalePrice  (r = ${d.pearson_r.toFixed(3)})`,
       xaxis:{title:f},yaxis:{title:'SalePrice ($)',tickformat:'$,.0f'},margin:{t:50}});
    document.getElementById('scatter-stats').innerHTML=
      `<span class="badge">r = ${d.pearson_r.toFixed(3)}</span>
       <span class="badge ${d.p_value<0.05?'sig':''}">p ${d.p_value<1e-4?'< 0.0001':'= '+d.p_value.toFixed(4)}</span>`;
  }
  scSel.onchange=()=>renderScatter(scSel.value);
  renderScatter(sdFeats[0]);

  /* 9. Outliers */
  const out = await loadJSON('data/outliers.json');
  Plotly.newPlot('outlier-div',[{type:'scatter',mode:'markers',
    x:out.scatter_points.map(p=>p.x),y:out.scatter_points.map(p=>p.y),
    marker:{size:6,opacity:0.6,color:out.scatter_points.map(p=>p.suspicious?'#c0392b':p.outlier?'#f0a500':'#4f86c6')},
    hovertemplate:'GrLivArea: %{x}<br>SalePrice: $%{y:,.0f}<extra></extra>'}],
    {title:'GrLivArea vs SalePrice — outliers flagged',
     xaxis:{title:'GrLivArea (sqft)'},yaxis:{title:'SalePrice ($)',tickformat:'$,.0f'},
     shapes:[{type:'line',x0:4000,x1:4000,y0:0,y1:1,yref:'paper',line:{color:'crimson',dash:'dash',width:1.5}}],
     margin:{t:50}});
  out.suspicious_rows.forEach(r=>{
    document.getElementById('suspicious-table').innerHTML+=
      `<tr><td>${r.Id}</td><td>${r.GrLivArea.toLocaleString()} sqft</td><td>$${r.SalePrice.toLocaleString()}</td><td>${r.Neighborhood}</td></tr>`;
  });

  /* 10. Temporal */
  const ta = await loadJSON('data/temporal_analysis.json');
  new Chart(document.getElementById('yr-chart'),{type:'line',
    data:{labels:ta.by_year.map(d=>d.year),datasets:[
      {label:'Mean',data:ta.by_year.map(d=>d.mean),borderColor:'#4f86c6',fill:false,tension:0.3},
      {label:'Median',data:ta.by_year.map(d=>d.median),borderColor:'#7ec8a0',fill:false,tension:0.3}]},
    options:{scales:{y:{ticks:{callback:v=>`$${(v/1000).toFixed(0)}k`}}},plugins:{title:{display:true,text:'SalePrice by Year Sold'}}}});
  new Chart(document.getElementById('mo-chart'),{type:'line',
    data:{labels:ta.by_month.map(d=>d.month_name),datasets:[
      {label:'Mean',data:ta.by_month.map(d=>d.mean),borderColor:'#4f86c6',fill:false,tension:0.3},
      {label:'Median',data:ta.by_month.map(d=>d.median),borderColor:'#7ec8a0',fill:false,tension:0.3}]},
    options:{scales:{y:{ticks:{callback:v=>`$${(v/1000).toFixed(0)}k`}}},plugins:{title:{display:true,text:'SalePrice by Month Sold'}}}});

  /* 11. Distribution shift */
  const ds = await loadJSON('data/distribution_shift.json');
  const dsFeats=Object.keys(ds.features);
  document.getElementById('ds-badge').textContent=`${ds.n_significant} / ${dsFeats.length} features show significant shift (p < 0.05)`;
  let dsChart;
  const dsSel=document.getElementById('ds-select');
  dsFeats.forEach(f=>dsSel.innerHTML+=`<option value="${f}">${f}${ds.features[f].significant?' ⚠':''}</option>`);
  function renderShift(f){
    const d=ds.features[f];
    const h=d.train_hist,labels=h.bin_edges.slice(0,-1).map((v,i)=>((v+h.bin_edges[i+1])/2).toFixed(2));
    if(dsChart)dsChart.destroy();
    dsChart=new Chart(document.getElementById('ds-hist'),{type:'bar',
      data:{labels,datasets:[
        {label:'Train',data:h.counts,backgroundColor:'rgba(79,134,198,0.6)',borderWidth:0},
        {label:'Test', data:d.test_hist.counts,backgroundColor:'rgba(224,123,84,0.6)',borderWidth:0}]},
      options:{plugins:{title:{display:true,text:`${f} — KS=${d.ks_stat}  p=${d.p_value}${d.significant?' ⚠ SHIFT':''}`,color:d.significant?'#c0392b':'#222'}}}
    });
  }
  dsSel.onchange=()=>renderShift(dsSel.value);
  renderShift(dsFeats[0]);

  /* 12. Engineered features */
  const ef = await loadJSON('data/engineered_features.json');
  const efSorted=[...ef.correlations].sort((a,b)=>Math.abs(b.pearson_r)-Math.abs(a.pearson_r));
  const efBar=new Chart(document.getElementById('ef-bar'),{type:'bar',indexAxis:'y',
    data:{labels:efSorted.map(d=>d.feature),datasets:[{data:efSorted.map(d=>d.pearson_r),
      backgroundColor:efSorted.map(d=>d.pearson_r>0?'#7ec8a0':'#e07b54')}]},
    options:{onClick:(_,els)=>{if(els.length)renderEFScatter(efSorted[els[0].index]);},
             plugins:{legend:{display:false},title:{display:true,text:'Engineered features vs SalePrice'}}}});
  function renderEFScatter(d){
    document.getElementById('ef-formula').textContent=`${d.feature} = ${d.definition}`;
    const sc=ef.scatter_by_feature[d.feature];
    Plotly.newPlot('ef-scatter',[{type:'scatter',mode:'markers',
      x:sc.scatter.map(p=>p.x),y:sc.scatter.map(p=>p.y),
      marker:{size:5,opacity:0.4,color:'#9b59b6'},
      hovertemplate:`${d.feature}: %{x:.1f}<br>SalePrice: $%{y:,.0f}<extra></extra>`}],
      {title:`${d.feature} vs SalePrice  (r=${sc.pearson_r.toFixed(3)})`,
       yaxis:{tickformat:'$,.0f'},margin:{t:50}});
  }
  renderEFScatter(efSorted[0]);

  /* 13. Feature importance */
  const fi = await loadJSON('data/feature_importance.json');
  const top20=[...fi.top_features].slice(0,20).reverse();
  new Chart(document.getElementById('fi-bar'),{type:'bar',indexAxis:'y',
    data:{labels:top20.map(d=>d.feature),datasets:[{data:top20.map(d=>d.importance),
      backgroundColor:top20.map((_,i)=>i===top20.length-1?'#e07b39':'#4f86c6'),label:'Importance'}]},
    options:{plugins:{legend:{display:false},title:{display:true,text:`Feature Importance — ${fi.model}`},
      tooltip:{callbacks:{label:ctx=>`${(ctx.parsed.x*100).toFixed(2)}%`}}}}});

  /* 14. Skewness */
  const sr = await loadJSON('data/skewness_and_rare.json');
  const skC=v=>{const a=Math.abs(v);return a>10?'#c0392b':a>2?'#e07b39':a>0.75?'#f0c30f':'#7ec8a0';};
  const top20sk=[...sr.skewness].slice(0,20).reverse();
  new Chart(document.getElementById('skew-bar'),{type:'bar',indexAxis:'y',
    data:{labels:top20sk.map(d=>d.feature),datasets:[{data:top20sk.map(d=>d.abs_skew),
      backgroundColor:top20sk.map(d=>skC(d.skew)),label:'|skew|'}]},
    options:{plugins:{legend:{display:false},title:{display:true,text:'Top 20 most skewed features'},
      tooltip:{callbacks:{label:ctx=>`skew = ${top20sk[ctx.dataIndex].skew.toFixed(3)}`}}},
      scales:{x:{title:{display:true,text:'|skew|'}}}}});
  Object.entries(sr.rare_categories).forEach(([col,cats])=>{
    document.getElementById('rare-table').innerHTML+=
      `<tr><td><strong>${col}</strong></td><td>${cats.map(c=>`<code>${c}</code>`).join(' ')}</td><td>${cats.length}</td></tr>`;
  });

  /* 15. Insights */
  const s = await loadJSON('data/eda_summary.json');
  s.key_insights.forEach(ins=>document.getElementById('insights-list').innerHTML+=`<li>${ins}</li>`);
  const topCorr=Object.entries(s.top_correlated_features).slice(0,10);
  new Chart(document.getElementById('top-corr-mini'),{type:'bar',indexAxis:'y',
    data:{labels:topCorr.map(([k])=>k),datasets:[{data:topCorr.map(([,v])=>v),backgroundColor:'#4f86c6'}]},
    options:{plugins:{legend:{display:false}},scales:{x:{max:1}}}});

})();
</script>
</body>
</html>
```

---

## 7. Deployment checklist

```bash
# 1. Copy exports
cp -r web_exports/ your-repo/data/

# 2. Verify file sizes
du -sh data/*.json | sort -rh | head -10

# 3. Local preview (required — file:// blocks fetch())
python3 -m http.server 8080
# open http://localhost:8080

# 4. Commit and push
git add data/ index.html
git commit -m "Add interactive EDA site"
git push origin main

# 5. Enable GitHub Pages
# Repo → Settings → Pages → Source: main / root → Save
# Site at: https://<username>.github.io/<repo>/
```

**File size check:** `correlations.json` (full matrix, ~80 cols × 80 cols) and `engineered_features.json` (scatter points) can be 150–250 KB. Both load lazily via click/scroll triggers in the scaffold above, so initial page load stays fast.

---

*Generated from `tabular_eda_web.ipynb`. Re-run the notebook to regenerate all JSON files after changing datasets or analysis parameters.*
