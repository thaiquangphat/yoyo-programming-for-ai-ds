# P4AI&DS - GitHub Pages Website

A professional GitHub Pages website for the course **"Programming for AI & Data Science"**, featuring interactive EDA visualizations and multimodal data exploration.

## 🎯 Features

- **Clean, Modern Design**: Professional academic portfolio aesthetic
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Interactive Visualizations**: Chart.js and Plotly.js for dynamic data exploration
- **Multiple Data Modalities**: Multimodal, Tabular, Image, and Text analysis pages
- **EDA Focused**: Comprehensive exploratory data analysis visualizations
- **GitHub Pages Ready**: Pure HTML/CSS/JS stack, no build required

## 📁 Directory Structure

```
docs/
├── index.html                    # Landing page
├── assignment1.html              # Assignment 1 overview
├── assignment2.html              # Assignment 2 (placeholder)
├── assignment3.html              # Assignment 3 (placeholder)
├── assignment1/
│   ├── multimodal.html          # Multimodal EDA (MAIN)
│   ├── tabular.html             # Tabular data analysis
│   ├── image.html               # Image analysis
│   └── text.html                # Text analysis
├── assets/
│   ├── css/
│   │   ├── style.css            # Main stylesheet
│   │   └── assignment1.css      # Assignment-specific styles
│   └── js/
│       ├── main.js              # Shared utilities, Chart.js helpers
│       └── multimodal-eda.js    # Multimodal EDA visualization logic
└── data/                        # EDA output JSON files (to be added)
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
    ├── object_word_align.json
    ├── jaccard_similarity.json
    ├── difficulty.json
    └── category_gallery/         # Image thumbnails (optional)
```

## 🚀 Getting Started

### Option 1: Copy Data Files from Python Output

1. **Run the EDA notebook** that generates JSON exports
2. **Copy the data files** from `eda_output/web_exports/` to `docs/data/`
3. **Deploy to GitHub Pages** by pushing the `docs` folder to your repository
4. **Enable GitHub Pages** in repository settings (set source to `main` branch `/docs` folder)

### Option 2: Using Sample Data

Sample JSON files are provided in the examples below. Create them as follows:

```bash
# In the docs/data/ directory, create the required JSON files
# See "JSON Data Schema" section below
```

### Option 3: Local Development

1. Clone/download the website files
2. Run a local HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if installed)
   npx serve docs
   ```
3. Open `http://localhost:8000/docs` in your browser

## 📊 JSON Data Schema

### `stats_overview.json`
```json
{
  "total_images": 5000,
  "total_captions": 25014,
  "avg_caps_per_image": 5.003,
  "vocab_size": 10007,
  "total_tokens": 264832,
  "caps_per_image_dist": {
    "labels": [4, 5, 6],
    "values": [12, 4982, 6]
  }
}
```

### `data_quality.json`
```json
{
  "duplicate_captions": 47,
  "outlier_captions_gt40": 12,
  "token_len_stats": {
    "mean": 10.57,
    "median": 10,
    "std": 2.34
  },
  "token_len_histogram": {
    "bin_edges": [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 40],
    "counts": [8, 24, 68, 156, 1240, 2180, 900, 320, 98, 20]
  }
}
```

### `image_stats.json`
```json
{
  "width_stats": {
    "mean": 594.0,
    "median": 640,
    "std": 56.2
  },
  "height_stats": {
    "mean": 442.0,
    "median": 427,
    "std": 34.8
  },
  "scatter_sample": [
    {"x": 640, "y": 427},
    {"x": 640, "y": 480},
    {"x": 600, "y": 450}
  ],
  "aspect_histogram": {
    "bin_edges": [0.5, 1.0, 1.5, 2.0, 2.5],
    "counts": [120, 4500, 350, 30]
  }
}
```

### `category_color_profiles.json`
```json
{
  "categories": [
    {
      "name": "outdoor",
      "R": 118,
      "G": 112,
      "B": 98,
      "hex": "#76706e"
    },
    {
      "name": "food",
      "R": 139,
      "G": 134,
      "B": 128,
      "hex": "#8b8680"
    }
  ]
}
```

### `vocab_freq.json`
```json
{
  "top_words": [
    "image", "shows", "has", "photo", "picture", 
    "white", "black", "man", "woman", "cat"
  ],
  "top_frequencies": [450, 380, 320, 290, 275, 260, 250, 240, 235, 220]
}
```

### `ngrams.json`
```json
{
  "bigrams": {
    "labels": ["white cat", "young man", "wooden table", "sitting on"],
    "counts": [145, 128, 95, 87]
  },
  "trigrams": {
    "labels": ["a white cat", "is standing on", "next to the", "on a table"],
    "counts": [67, 54, 48, 42]
  }
}
```

### `pos_distribution.json`
```json
{
  "labels": ["NN", "VB", "JJ", "IN", "DT", "RB", "PRP", "CD"],
  "values": [3500, 1800, 1200, 1000, 950, 600, 450, 300]
}
```

### `bbox_area_by_category.json`
```json
{
  "outdoor": {
    "mean": 45000,
    "median": 42000,
    "std": 12000
  },
  "food": {
    "mean": 35000,
    "median": 33000,
    "std": 9000
  }
}
```

### `object_word_align.json`
```json
{
  "objects": ["person", "car", "dog", "cat"],
  "mentions": [450, 380, 320, 290]
}
```

### `jaccard_similarity.json`
```json
{
  "bin_edges": [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  "counts": [2, 8, 15, 28, 35, 22, 15, 10, 4, 1]
}
```

### `difficulty.json`
```json
{
  "bin_edges": [0, 0.2, 0.4, 0.6, 0.8, 1.0],
  "counts": [150, 320, 450, 380, 200]
}
```

## 🎨 Customization

### Colors
Edit CSS variables in `assets/css/style.css`:
```css
:root {
  --primary: #4f86c6;
  --secondary: #7ec8a0;
  --accent: #f39c12;
  /* ... more colors ... */
}
```

### Add Custom Charts
In `assets/js/multimodal-eda.js`, add new chart functions:
```javascript
function renderCustomChart() {
  const data = edaData.yourDataKey;
  charts.custom = createBarChart(
    'canvas-id',
    data.labels,
    data.values
  );
}
```

### Modify Navigation
Edit navigation links in:
- `index.html`
- `assignment1.html` 
- `assignment1/*.html` (subpages)

## 📦 Dependencies

- **Chart.js 4.4.0** - Data visualization
- **Plotly.js 2.26.0** - Advanced interactive plots
- **Pure CSS/JS** - No build tools required ✨

All external libraries are loaded via CDN, making the site truly static.

## 🌐 Deployment

### GitHub Pages

1. **Push to repository**
   ```bash
   git add docs/
   git commit -m "Add course website"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: `main` branch
   - Folder: `/docs`
   - Save

3. **Access at**
   ```
   https://yourusername.github.io/your-repo/docs
   ```

### Other Hosting

The `docs` folder is a complete static website. Copy to any web server:
- **Netlify**: Drag & drop the `docs` folder
- **Vercel**: Import repository, set root to `docs`
- **AWS S3**: Upload files to S3 bucket with static hosting enabled
- **Google Drive**: Share folder as public website

## 🔧 Troubleshooting

### JSON Files Not Loading
- Check that `data/` folder path is correct in `multimodal-eda.js`
- Ensure JSON files are valid (use JSONLint to validate)
- Open browser DevTools Console (F12) to see loading errors

### Charts Not Displaying
- Verify Chart.js CDN link is accessible
- Check that canvas elements have the correct IDs in HTML
- Ensure data arrays are not empty

### Navigation Issues
- Verify file paths in links (use relative paths)
- Check that all HTML files exist in correct directories
- Clear browser cache (Ctrl+Shift+Delete)

## 📱 Responsive Design

The website is optimized for:
- **Desktop**: 1200px+ width
- **Tablet**: 768px-1199px width
- **Mobile**: <768px width

Media queries adjust layout automatically. Test with browser DevTools.

## ✨ Features Showcase

### Multimodal EDA Page Includes:
- ✅ Dataset overview statistics with animated counters
- ✅ Data quality assessment badges
- ✅ Image resolution scatter plot
- ✅ Color profile swatches by category
- ✅ Brightness histogram
- ✅ Bounding box analysis
- ✅ Vocabulary frequency charts
- ✅ N-gram (bigram/trigram) analysis
- ✅ Part-of-speech distribution
- ✅ Object-word alignment
- ✅ Caption similarity metrics
- ✅ Image difficulty distribution

### Other Pages Include:
- Assignment overview pages
- Tabular data analysis framework
- Image analysis with category breakdowns
- Comprehensive text/linguistic analysis
- Responsive navigation between sections
- Professional footer and branding

## 📄 License

This project is part of the "Programming for AI & Data Science" course.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review JSON data schemas to ensure valid format
3. Inspect browser console for error messages
4. Verify all file paths are correct

---

**Built with ❤️ for Data Science Education**

Last Updated: March 2026
