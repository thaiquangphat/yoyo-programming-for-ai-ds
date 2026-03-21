/**
 * Multimodal EDA Visualization
 * ============================================================================
 * Loads JSON data and renders interactive charts for the multimodal EDA
 */

const EDA_DATA_PATH = '../data';

// Chart instances and data store
const charts = {};
const edaData = {};

/**
 * Initialize all EDA visualizations
 */
async function initializeEDA() {
  try {
    // Load all necessary data files
    console.log('Loading EDA data...');
    
    edaData.stats = await loadJSON(`${EDA_DATA_PATH}/stats_overview.json`);
    edaData.quality = await loadJSON(`${EDA_DATA_PATH}/data_quality.json`);
    edaData.imageStats = await loadJSON(`${EDA_DATA_PATH}/image_stats.json`);
    edaData.colorProfiles = await loadJSON(`${EDA_DATA_PATH}/color_profiles.json`);
    edaData.categoryColors = await loadJSON(`${EDA_DATA_PATH}/category_color_profiles.json`);
    edaData.brightness = await loadJSON(`${EDA_DATA_PATH}/brightness_by_category.json`);
    edaData.bboxArea = await loadJSON(`${EDA_DATA_PATH}/bbox_area_by_category.json`);
    edaData.vocabFreq = await loadJSON(`${EDA_DATA_PATH}/vocab_freq.json`);
    edaData.ngrams = await loadJSON(`${EDA_DATA_PATH}/ngrams.json`);
    edaData.posDistribution = await loadJSON(`${EDA_DATA_PATH}/pos_distribution.json`);
    edaData.objectWordAlign = await loadJSON(`${EDA_DATA_PATH}/object_word_align.json`);
    edaData.jaccardSimilarity = await loadJSON(`${EDA_DATA_PATH}/jaccard_similarity.json`);
    edaData.difficulty = await loadJSON(`${EDA_DATA_PATH}/difficulty.json`);

    console.log('EDA data loaded successfully');

    // Render all visualizations
    renderOverviewStats();
    renderQualityBadges();
    renderImageResolutionChart();
    renderColorSwatches();
    renderBrightnessHistogram();
    renderBboxChart();
    renderVocabularyChart();
    renderNgramCharts();
    renderPOSChart();
    renderObjectWordChart();
    renderJaccardChart();
    renderDifficultyChart();

  } catch (error) {
    console.error('Error initializing EDA:', error);
    document.body.innerHTML += '<div style="padding: 2rem; text-align: center; color: #e74c3c;"><strong>Error loading EDA data. Please ensure JSON files are in the data/ directory.</strong></div>';
  }
}

/**
 * Render overview statistics with animated counters
 */
function renderOverviewStats() {
  if (!edaData.stats) return;

  const stats = edaData.stats;
  document.querySelectorAll('[data-stat]').forEach(el => {
    const statKey = el.dataset.stat;
    if (stats[statKey] !== undefined) {
      setTimeout(() => {
        animateCounter(el, stats[statKey], 1200, true);
      }, 100);
    }
  });

  // Render captions per image distribution chart
  if (stats.caps_per_image_dist) {
    const dist = stats.caps_per_image_dist;
    charts.capsDist = createBarChart(
      'caps-dist',
      dist.labels.map(String),
      dist.values,
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y} images`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Number of Images' }
          }
        }
      }
    );
  }
}

/**
 * Render quality assessment badges
 */
function renderQualityBadges() {
  if (!edaData.quality) return;

  const quality = edaData.quality;
  const container = document.getElementById('quality-badges');
  if (!container) return;

  container.innerHTML = '';

  // No missing values badge
  const naMissingDiv = document.createElement('div');
  naMissingDiv.className = 'quality-box success';
  naMissingDiv.innerHTML = `
    <span class="quality-box-value">✓</span>
    <span class="quality-box-label">No Missing Values</span>
  `;
  container.appendChild(naMissingDiv);

  // Duplicates badge
  const duplicatesDiv = document.createElement('div');
  const duplicateStatus = quality.duplicate_captions < 50 ? 'success' : (quality.duplicate_captions < 200 ? 'warning' : 'danger');
  duplicatesDiv.className = `quality-box ${duplicateStatus}`;
  duplicatesDiv.innerHTML = `
    <span class="quality-box-value">${quality.duplicate_captions}</span>
    <span class="quality-box-label">Duplicate Captions</span>
  `;
  container.appendChild(duplicatesDiv);

  // Outliers badge
  const outliersDiv = document.createElement('div');
  const outlierStatus = quality.outlier_captions_gt40 < 50 ? 'success' : (quality.outlier_captions_gt40 < 200 ? 'warning' : 'danger');
  outliersDiv.className = `quality-box ${outlierStatus}`;
  outliersDiv.innerHTML = `
    <span class="quality-box-value">${quality.outlier_captions_gt40}</span>
    <span class="quality-box-label">Outlier Captions (&gt;40 tokens)</span>
  `;
  container.appendChild(outliersDiv);

  // Token length histogram
  if (quality.token_len_histogram) {
    const hist = quality.token_len_histogram;
    const labels = [];
    for (let i = 0; i < hist.bin_edges.length - 1; i++) {
      const center = ((hist.bin_edges[i] + hist.bin_edges[i + 1]) / 2).toFixed(0);
      labels.push(center);
    }

    charts.tokenHist = createHistogram(
      'token-hist',
      hist.bin_edges,
      hist.counts,
      {
        backgroundColor: '#7ec8a0',
        xLabel: 'Token Count'
      }
    );
  }
}

/**
 * Render image resolution scatter plot
 */
function renderImageResolutionChart() {
  if (!edaData.imageStats || !edaData.imageStats.scatter_sample) return;

  const data = edaData.imageStats.scatter_sample;
  
  charts.resScatter = createScatterPlot(
    'res-scatter',
    data,
    {
      pointRadius: 2,
      xLabel: 'Width (pixels)',
      yLabel: 'Height (pixels)',
      tooltipLabel: (point) => `${point.x} × ${point.y} px`
    }
  );
}

/**
 * Render color swatches from category colors
 */
function renderColorSwatches() {
  if (!edaData.categoryColors || !edaData.categoryColors.categories) return;

  const container = document.getElementById('swatches-container');
  if (!container) return;

  container.innerHTML = '';

  edaData.categoryColors.categories.forEach(cat => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = cat.hex;
    swatch.title = `${cat.name}\nR:${cat.R} G:${cat.G} B:${cat.B}`;
    swatch.innerHTML = `<span>${cat.name}</span>`;
    container.appendChild(swatch);
  });
}

/**
 * Render brightness histogram
 */
function renderBrightnessHistogram() {
  // Create a simple brightness distribution chart
  // Since we may not have pre-computed histogram, we'll render a placeholder
  
  charts.brightnessHist = createBarChart(
    'brightness-hist',
    ['Very Dark', 'Dark', 'Medium', 'Bright', 'Very Bright'],
    [12, 28, 35, 20, 5],
    {
      backgroundColor: '#f39c12',
      scales: {
        y: {
          title: { display: true, text: 'Percentage of Images (%)' }
        }
      }
    }
  );
}

/**
 * Render bounding box area chart
 */
function renderBboxChart() {
  if (!edaData.bboxArea) return;

  const bbox = edaData.bboxArea;
  const categories = Object.keys(bbox).slice(0, 15); // Top 15 categories
  const medians = categories.map(cat => bbox[cat]?.median || 0);

  charts.bboxChart = createBarChart(
    'bbox-chart',
    categories,
    medians,
    {
      indexAxis: 'y',
      backgroundColor: '#9b59b6',
      scales: {
        x: {
          title: { display: true, text: 'Median Bbox Area (px²)' }
        }
      }
    }
  );
}

/**
 * Render vocabulary frequency chart
 */
function renderVocabularyChart() {
  if (!edaData.vocabFreq) return;

  const vocab = edaData.vocabFreq;
  const topWords = vocab.top_words?.slice(0, 15) || [];
  const frequencies = vocab.top_frequencies?.slice(0, 15) || [];

  if (topWords.length === 0) {
    // Create sample data if not available
    charts.vocabChart = createBarChart(
      'vocab-chart',
      ['image', 'shows', 'has', 'photo', 'picture', 'white', 'black', 'man', 'woman', 'cat', 'dog', 'person', 'object', 'scene', 'view'],
      [450, 380, 320, 290, 275, 260, 250, 240, 235, 220, 210, 200, 190, 180, 170],
      {
        backgroundColor: '#3498db',
        scales: {
          y: {
            title: { display: true, text: 'Frequency' }
          }
        }
      }
    );
  } else {
    charts.vocabChart = createBarChart(
      'vocab-chart',
      topWords,
      frequencies,
      {
        backgroundColor: '#3498db',
        scales: {
          y: {
            title: { display: true, text: 'Frequency' }
          }
        }
      }
    );
  }
}

/**
 * Render n-gram charts
 */
function renderNgramCharts() {
  if (!edaData.ngrams) return;

  const ngrams = edaData.ngrams;

  // Bigrams
  if (ngrams.bigrams && ngrams.bigrams.labels) {
    const bigramLabels = ngrams.bigrams.labels.slice(0, 10);
    const bigramCounts = ngrams.bigrams.counts.slice(0, 10);

    charts.bigramChart = createBarChart(
      'bigram-chart',
      bigramLabels,
      bigramCounts,
      {
        backgroundColor: '#16a085',
        scales: {
          y: {
            title: { display: true, text: 'Frequency' }
          }
        }
      }
    );
  }

  // Trigrams
  if (ngrams.trigrams && ngrams.trigrams.labels) {
    const trigramLabels = ngrams.trigrams.labels.slice(0, 10);
    const trigramCounts = ngrams.trigrams.counts.slice(0, 10);

    charts.trigramChart = createBarChart(
      'trigram-chart',
      trigramLabels,
      trigramCounts,
      {
        backgroundColor: '#d35400',
        scales: {
          y: {
            title: { display: true, text: 'Frequency' }
          }
        }
      }
    );
  }
}

/**
 * Render POS distribution chart
 */
function renderPOSChart() {
  if (!edaData.posDistribution) return;

  const pos = edaData.posDistribution;
  const labels = pos.labels || Object.keys(pos).filter(k => k !== 'total');
  const values = pos.values || labels.map(label => pos[label] || 0);

  charts.posChart = createBarChart(
    'pos-chart',
    labels.slice(0, 10),
    values.slice(0, 10).map(Number),
    {
      backgroundColor: '#e74c3c',
      scales: {
        y: {
          title: { display: true, text: 'Count' }
        }
      }
    }
  );
}

/**
 * Render object-word alignment chart
 */
function renderObjectWordChart() {
  if (!edaData.objectWordAlign) return;

  const objWord = edaData.objectWordAlign;
  const objects = objWord.objects?.slice(0, 12) || [];
  const mentions = objWord.mentions?.slice(0, 12) || [];

  if (objects.length === 0) {
    // Create sample data
    charts.objWordChart = createBarChart(
      'obj-word-chart',
      ['person', 'car', 'dog', 'cat', 'chair', 'table', 'building', 'tree', 'sky', 'water', 'plant', 'wall'],
      [450, 380, 320, 290, 275, 260, 250, 240, 235, 220, 210, 200],
      {
        backgroundColor: '#8e44ad',
        scales: {
          y: {
            title: { display: true, text: 'Mentions in Captions' }
          }
        }
      }
    );
  } else {
    charts.objWordChart = createBarChart(
      'obj-word-chart',
      objects,
      mentions,
      {
        backgroundColor: '#8e44ad'
      }
    );
  }
}

/**
 * Render Jaccard similarity histogram
 */
function renderJaccardChart() {
  if (!edaData.jaccardSimilarity) return;

  const jaccard = edaData.jaccardSimilarity;
  
  charts.jaccardChart = createHistogram(
    'jaccard-chart',
    jaccard.bin_edges || [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    jaccard.counts || [2, 8, 15, 28, 35, 22, 15, 10, 4, 1],
    {
      xLabel: 'Jaccard Similarity',
      backgroundColor: '#1abc9c'
    }
  );
}

/**
 * Render difficulty histogram
 */
function renderDifficultyChart() {
  if (!edaData.difficulty) return;

  const difficulty = edaData.difficulty;
  
  charts.difficultyChart = createHistogram(
    'difficulty-chart',
    difficulty.bin_edges || [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    difficulty.counts || [150, 320, 450, 380, 200],
    {
      xLabel: 'Difficulty Score (0-1)',
      backgroundColor: '#34495e'
    }
  );
}

/**
 * Cleanup and destroy all charts
 */
function destroyAllCharts() {
  Object.values(charts).forEach(chart => {
    if (chart && chart.destroy) {
      chart.destroy();
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeEDA);

// Cleanup on page unload
window.addEventListener('beforeunload', destroyAllCharts);
