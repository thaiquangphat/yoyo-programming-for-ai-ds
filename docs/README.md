# Programming for AI & Data Science — GitHub Pages Site

## Overview

This is a GitHub Pages site for the course **"Programming for AI & Data Science"**. It features interactive exploratory data analysis (EDA) reports with visualizations and statistical insights.

## Folder Structure

```
docs/
├── index.html                          # Main landing page
├── assignment1.html                    # Assignment 1 hub page
├── multimodal.html                     # Multi-modal EDA report (COMPLETE)
├── assets/
│   └── css/
│       └── style.css                   # Global styles
└── data/                               # EDA output data
    ├── stats_overview.json
    ├── data_quality.json
    ├── image_stats.json
    ├── color_profiles.json
    ├── category_color_profiles.json
    ├── brightness_by_category.json
    ├── bbox_area_by_category.json
    ├── vocab_freq.json
    ├── ngrams.json
    ├── pos_distribution.json
    ├── jaccard_similarity.json
    ├── object_word_align.json
    ├── bias.json
    ├── difficulty.json
    ├── cooccurrence.json
    ├── lda_topics.json
    ├── eda_summary.json
    ├── gallery_manifest.json
    ├── tsne_clip.json
    ├── tsne_text.json
    └── category_gallery/                # Image thumbnails by category
        ├── animal/
        ├── electronic/
        ├── food/
        ├── furniture/
        ├── indoor/
        ├── kitchen/
        ├── person/
        └── vehicle/
```

## Implementation Status

### ✅ Completed
- **Main Landing Page** (`index.html`) — Hub with links to all assignments
- **Assignment 1 Hub** (`assignment1.html`) — Section overview with status indicators
- **Multi-modal EDA Page** (`multimodal.html`) — Full interactive report with all 21 sections:
  1. Dataset Overview & Hero Stats
  2. Data Quality Metrics
  3. Image Resolution Analysis
  4. Aspect Ratio Distribution
  5. Colour Profile Swatches
  6. Brightness & Contrast Analysis
  7. Bounding Box Distribution
  8. Top Content Words
  9. POS Tag Distribution
  10. N-gram Analysis (Bigrams/Trigrams toggle)
  11. Caption Similarity (Jaccard)
  12. Object–Word Alignment
  13. CLIP Image Embeddings (t-SNE)
  14. Text Embeddings (t-SNE)
  15. Category Gallery with Tabs
  16. Gender Representation
  17. Object Frequency Distribution
  18. Caption Difficulty Histogram
  19. Easiest/Hardest Examples
  20. Category Co-occurrence Heatmap
  21. LDA Topic Modeling

### ⧗ Not Yet Implemented
- Assignment 2 (Coming Soon)
- Assignment 3 (Coming Soon)
- Image-specific EDA page
- Text-specific EDA page
- Tabular data analysis page

## Features

### Multi-modal EDA Report
The Multi-modal page includes:

- **Interactive Charts** — Using Chart.js and Plotly.js for responsive visualizations
- **Lazy Loading** — Large t-SNE embeddings load only when scrolled into view for performance
- **Tabbed Navigation** — Switch between data categories without page reload
- **Responsive Design** — Works on desktop, tablet, and mobile devices
- **Clean UI** — Minimal, readable design with proper spacing and typography
- **Hover Interactions** — Tooltips, image previews, and dynamic chart updates

### Libraries Used
- **Chart.js** — Bar charts, scatter plots, histograms, doughnuts, and more
- **Plotly.js** — Advanced t-SNE scatter plots with image hover previews and heatmaps
- **Vanilla JavaScript** — No complex frameworks; clean, maintainable code

## Deployment

This site is designed for GitHub Pages. To deploy:

1. Push the `docs/` folder to your GitHub repository
2. Go to **Settings** → **Pages**
3. Set the source to `main` branch, `/docs` folder
4. Your site will be available at `https://<username>.github.io/<repo-name>/`

## File Sizes

Key data files:
- Largest: `tsne_clip.json` (~20-80 MB with base64 thumbnails)
- Text embeddings: `tsne_text.json` (~5 MB)
- Images: `image_stats.json` (~200 KB)
- Most others: < 1 MB

All files are under the 100 MB GitHub Pages limit when stored individually.

## Navigation

**Landing Page** (`/`) 
→ **Assignment 1** (`/assignment1.html`)
→ **Multi-modal EDA** (`/multimodal.html`)

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ IE 11 — Not supported

## Development Notes

### Adding New Sections
To add more visualizations to the Multi-modal page:
1. Load the corresponding JSON file with `loadJSON('../data/filename.json')`
2. Create a new Chart or Plotly visualization
3. Add an HTML section with appropriate container ID
4. Update the navigation links

### Performance Tips
- Lazy loading is already implemented for large t-SNE plots
- Consider reducing the number of points in scatter plots for slower devices
- Use IntersectionObserver for other heavy sections if needed

### Styling
Global styles are in `assets/css/style.css`:
- Colors: Uses gradients (#667eea → #764ba2)
- Typography: System fonts for fast loading
- Spacing: Consistent padding/margin scale
- Responsive: Breakpoints at 768px and 480px

## Credits

**Data**: Multi-modal dataset with images and captions
**Visualizations**: Generated by `coco_eda_web.ipynb` notebook
**Site**: GitHub Pages with Chart.js and Plotly.js

---

**Course**: Programming for AI & Data Science
**Last Updated**: 2024
