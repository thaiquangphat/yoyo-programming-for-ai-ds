/**
 * Main JavaScript Utilities
 * ============================================================================
 * Shared utilities for data loading, chart initialization, and interactions
 */

// ============================================================================
// Data Loading & JSON Utilities
// ============================================================================

/**
 * Load JSON data from a file
 * @param {string} path - Path to JSON file (relative to root)
 * @returns {Promise<object>} Parsed JSON data
 */
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading JSON from ${path}:`, error);
    return null;
  }
}

// ============================================================================
// Animation Utilities
// ============================================================================

/**
 * Animate counter from 0 to target number
 * @param {HTMLElement} element - Target element
 * @param {number} target - Target number to animate to
 * @param {number} duration - Animation duration in milliseconds
 * @param {boolean} useCommas - Whether to add comma separators
 */
function animateCounter(element, target, duration = 1200, useCommas = true) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.floor(progress * target);
    element.textContent = useCommas 
      ? current.toLocaleString() 
      : current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  requestAnimationFrame(update);
}

/**
 * Trigger on-scroll animations for elements
 * @param {string} selector - CSS selector for elements to animate
 * @param {string} animationClass - CSS class to apply on scroll
 * @param {object} options - IntersectionObserver options
 */
function initScrollAnimations(selector, animationClass = 'animated', options = {}) {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  document.querySelectorAll(selector).forEach(el => {
    observer.observe(el);
  });
}

// ============================================================================
// Chart.js Utilities
// ============================================================================

/**
 * Chart.js default configuration for consistent styling
 */
const chartDefaults = {
  colors: {
    primary: '#4f86c6',
    secondary: '#7ec8a0',
    accent: '#f39c12',
    danger: '#e74c3c',
    success: '#27ae60',
    neutral: '#ecf0f1'
  },
  fonts: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: 12,
    weight: 500
  },
  padding: 20
};

/**
 * Create a responsive bar chart
 * @param {string} canvasId - Canvas element ID
 * @param {array} labels - Category labels
 * @param {array} values - Data values
 * @param {object} options - Additional Chart.js options
 */
function createBarChart(canvasId, labels, values, options = {}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas element with id "${canvasId}" not found`);
    return null;
  }

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: chartDefaults.colors.primary,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: options.horizontal ? 'y' : 'x',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12 }
        }
      },
      scales: {
        x: {
          ticks: { font: chartDefaults.fonts },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        y: {
          beginAtZero: true,
          ticks: { font: chartDefaults.fonts },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        }
      },
      ...options
    }
  });
}

/**
 * Create a responsive histogram (bar chart for distributions)
 * @param {string} canvasId - Canvas element ID
 * @param {array} binEdges - Array of bin edges
 * @param {array} counts - Array of counts
 * @param {object} options - Additional options
 */
function createHistogram(canvasId, binEdges, counts, options = {}) {
  // Calculate bin centers for labels
  const labels = [];
  for (let i = 0; i < binEdges.length - 1; i++) {
    const center = ((binEdges[i] + binEdges[i + 1]) / 2).toFixed(1);
    labels.push(center);
  }

  return createBarChart(canvasId, labels, counts, {
    scales: {
      x: {
        title: { display: true, text: options.xLabel || 'Value' },
        ticks: { font: chartDefaults.fonts }
      },
      y: {
        title: { display: true, text: 'Frequency' },
        beginAtZero: true
      }
    },
    ...options
  });
}

/**
 * Create a scatter plot
 * @param {string} canvasId - Canvas element ID
 * @param {array} data - Array of {x, y} points
 * @param {object} options - Additional options
 */
function createScatterPlot(canvasId, data, options = {}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas element with id "${canvasId}" not found`);
    return null;
  }

  return new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        data,
        backgroundColor: `${chartDefaults.colors.primary}40`,
        borderColor: chartDefaults.colors.primary,
        borderWidth: 0,
        pointRadius: options.pointRadius || 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          callbacks: {
            label: ctx => {
              if (options.tooltipLabel) {
                return options.tooltipLabel(ctx.parsed);
              }
              return `(${ctx.parsed.x.toFixed(1)}, ${ctx.parsed.y.toFixed(1)})`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: options.xLabel || 'X Axis' },
          ticks: { font: chartDefaults.fonts },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        y: {
          title: { display: true, text: options.yLabel || 'Y Axis' },
          ticks: { font: chartDefaults.fonts },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        }
      },
      ...options
    }
  });
}

/**
 * Create a pie/doughnut chart
 * @param {string} canvasId - Canvas element ID
 * @param {array} labels - Category labels
 * @param {array} values - Data values
 * @param {object} options - Additional options
 */
function createPieChart(canvasId, labels, values, options = {}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas element with id "${canvasId}" not found`);
    return null;
  }

  const colors = [
    chartDefaults.colors.primary,
    chartDefaults.colors.secondary,
    chartDefaults.colors.accent,
    chartDefaults.colors.success,
    '#9b59b6',
    '#e74c3c',
    '#16a085',
    '#d35400'
  ];

  return new Chart(ctx, {
    type: options.doughnut ? 'doughnut' : 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: chartDefaults.fonts,
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((ctx.parsed / total) * 100).toFixed(1);
              return `${ctx.label}: ${ctx.parsed} (${percentage}%)`;
            }
          }
        }
      },
      ...options
    }
  });
}

// ============================================================================
// Color & Formatting Utilities
// ============================================================================

/**
 * Generate a color palette from hex colors
 * @param {string} hex - Hex color string
 * @returns {object} Object containing primary, light, and dark variants
 */
function generateColorVariants(hex) {
  return {
    primary: hex,
    light: lightenColor(hex, 20),
    dark: darkenColor(hex, 20),
    alpha30: hex + '4d',
    alpha50: hex + '80'
  };
}

/**
 * Lighten a hex color
 * @param {string} hex - Hex color string
 * @param {number} percent - Percentage to lighten
 */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

/**
 * Darken a hex color
 * @param {string} hex - Hex color string
 * @param {number} percent - Percentage to darken
 */
function darkenColor(hex, percent) {
  return lightenColor(hex, -percent);
}

/**
 * Format large numbers with abbreviations
 * @param {number} num - Number to format
 * @returns {string} Formatted string (e.g., "1.2K", "1.5M")
 */
function formatLargeNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Convert RGB to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert hex to RGB
 * @param {string} hex - Hex color string
 * @returns {object} Object with r, g, b properties
 */
function hexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Create and append multiple elements
 * @param {HTMLElement} container - Parent element
 * @param {array} elements - Array of elements to create
 */
function appendElements(container, elements) {
  elements.forEach(el => {
    if (typeof el === 'string') {
      container.insertAdjacentHTML('beforeend', el);
    } else {
      container.appendChild(el);
    }
  });
}

/**
 * Show/hide element
 * @param {HTMLElement} element - Element to toggle
 * @param {boolean} show - Whether to show the element
 */
function toggleElement(element, show = null) {
  if (show === null) {
    element.style.display = element.style.display === 'none' ? '' : 'none';
  } else {
    element.style.display = show ? '' : 'none';
  }
}

/**
 * Clear element's children
 * @param {HTMLElement} element - Element to clear
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Create element with attributes
 * @param {string} tag - HTML tag name
 * @param {object} attrs - Attributes object
 * @param {string} content - Inner text content
 * @returns {HTMLElement}
 */
function createElement(tag, attrs = {}, content = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('data-')) {
      el.dataset[key.slice(5)] = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  if (content) {
    el.textContent = content;
  }
  return el;
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Set active navigation tab
 * @param {string} selector - CSS selector for tabs
 * @param {number} index - Index of tab to activate
 */
function setActiveTab(selector, index) {
  const tabs = document.querySelectorAll(selector);
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
}

/**
 * Auto-set active nav link based on current page
 */
function autoSetActiveNav() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.includes(href) || (currentPath === '/' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ============================================================================
// Initialization
// ============================================================================

// Set active nav on page load
document.addEventListener('DOMContentLoaded', () => {
  autoSetActiveNav();
});
