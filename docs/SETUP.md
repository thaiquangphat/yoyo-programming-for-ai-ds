# Setup Guide for P4AI&DS Website

## 📋 Overview

This guide walks through setting up the **"Programming for AI & Data Science"** GitHub Pages website with your actual EDA data.

## 🚀 Quick Start (5 Minutes)

### Step 1: Understand Your Current Data

Your existing EDA output is located at:
```
assignment-1/multimodal/eda_output/eda_output/web_exports/
```

This folder contains all the JSON files needed for visualizations:
- `stats_overview.json` – Dataset statistics
- `data_quality.json` – Quality metrics
- `image_stats.json` – Image properties
- `color_profiles.json` – Color analysis
- `category_color_profiles.json` – Category colors
- `brightness_by_category.json` – Brightness data
- `bbox_area_by_category.json` – Bounding box analysis
- `vocab_freq.json` – Word frequencies
- `ngrams.json` – N-gram analysis
- `pos_distribution.json` – Grammar analysis
- `object_word_align.json` – Object mentions
- `jaccard_similarity.json` – Caption similarity
- `difficulty.json` – Image difficulty
- Plus many more...

### Step 2: Copy Data to Website

Copy the JSON files from the EDA output to the website:

```bash
# From your project root directory
cd assignment-1/multimodal/eda_output/eda_output/web_exports/

# Copy all JSON files to the website data folder
cp *.json ../../../../../docs/data/

# If you have image galleries, copy those too
cp -r category_gallery/ ../../../../../docs/data/
```

Or manually:
1. Open `docs/data/` folder
2. Delete the sample JSON files
3. Copy actual JSON files from `assignment-1/multimodal/eda_output/eda_output/web_exports/`
4. Done!

### Step 3: Deploy to GitHub Pages

```bash
# Commit and push the data
git add docs/data/
git commit -m "Add EDA data to GitHub Pages"
git push origin main

# Go to repository Settings → Pages
# Set source to: main branch, /docs folder
# Your site will be live in ~2 minutes at: 
# https://yourusername.github.io/your-repo/docs
```

## 📊 Data File Mapping

| Website Page | Required JSON Files |
|---|---|
| Multimodal EDA | stats_overview, data_quality, image_stats, color_profiles, category_color_profiles, brightness_by_category, bbox_area_by_category, vocab_freq, ngrams, pos_distribution, object_word_align, jaccard_similarity, difficulty |
| Tabular Page | (Placeholder - add your own data) |
| Image Page | image_stats, category_color_profiles, (Add more as needed) |
| Text Page | vocab_freq, ngrams, pos_distribution, (Add more as needed) |

## 🔄 Updating the Website with New EDA Results

Whenever you re-run the EDA notebook:

1. **Copy new JSON files** to `docs/data/`
   ```bash
   cp assignment-1/multimodal/eda_output/eda_output/web_exports/*.json docs/data/
   ```

2. **Commit changes**
   ```bash
   git add docs/data/
   git commit -m "Update EDA results"
   git push origin main
   ```

3. **Website updates automatically** (GitHub Pages rebuilds in ~1-2 minutes)

## 🎨 Customizing the Website

### Change Colors

Edit `docs/assets/css/style.css`:

```css
:root {
  --primary: #4f86c6;        /* Main blue */
  --secondary: #7ec8a0;      /* Green accent */
  --accent: #f39c12;         /* Orange accent */
  /* ... More colors ... */
}
```

### Add More Visualizations

Edit `docs/assets/js/multimodal-eda.js` to add new charts:

```javascript
// Add new chart data loader
edaData.yourNewData = await loadJSON(`${EDA_DATA_PATH}/your_new_file.json`);

// Add rendering function
function renderYourNewChart() {
  if (!edaData.yourNewData) return;
  
  charts.yourChart = createBarChart(
    'your-canvas-id',
    edaData.yourNewData.labels,
    edaData.yourNewData.values
  );
}

// Call in initializeEDA()
renderYourNewChart();
```

Then add HTML canvas element in `docs/assignment1/multimodal.html`:

```html
<div class="chart-section">
  <div class="chart-header">
    <h2>Your Chart Title</h2>
  </div>
  <canvas id="your-canvas-id"></canvas>
</div>
```

### Update Assignment Descriptions

Edit the `.html` files to update course content:
- `docs/index.html` – Landing page
- `docs/assignment1.html` – Assignment overview
- `docs/assignment1/multimodal.html` – Multimodal page
- `docs/assignment1/tabular.html` – Tabular page
- `docs/assignment1/image.html` – Image page
- `docs/assignment1/text.html` – Text page

## 📱 Responsive Design

The website automatically adapts to:
- **Desktop** (1200px+ width)
- **Tablet** (768px-1199px)
- **Mobile** (<768px)

Test locally:
```bash
# Open devtools (F12) → Device Toolbar (Ctrl+Shift+M)
```

## 🔍 Troubleshooting

### JSON files not loading?

1. **Check file paths** in `docs/assets/js/multimodal-eda.js`
2. **Verify file names** match exactly (case-sensitive on Linux/Mac)
3. **Check browser console** (F12 → Console tab) for errors
4. **Validate JSON** using https://jsonlint.com/

### Charts not displaying?

1. Check that Chart.js CDN is accessible
2. Open browser console and look for errors
3. Verify canvas element IDs in HTML match JavaScript
4. Ensure JSON data is valid format

### Navigation not working?

1. Verify file paths are correct (use relative paths)
2. Check file extensions are `.html`
3. Clear browser cache (Ctrl+Shift+Delete)

## 📦 File Structure Reference

After setup, your `docs/` folder should look like:

```
docs/
├── index.html
├── assignment1.html
├── assignment2.html
├── assignment3.html
├── README.md
├── SETUP.md (this file)
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── assignment1.css
│   └── js/
│       ├── main.js
│       └── multimodal-eda.js
├── assignment1/
│   ├── multimodal.html
│   ├── tabular.html
│   ├── image.html
│   └── text.html
└── data/
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
    ├── gallery_manifest.json (if available)
    └── category_gallery/
        ├── animal/
        ├── electronic/
        └── ...
```

## 🎯 Next Steps

1. ✅ Copy EDA JSON files to `docs/data/`
2. ✅ Push to GitHub
3. ✅ Enable GitHub Pages in repository settings
4. ✅ Visit your website at `https://user.github.io/repo/docs`
5. ✅ Share with classmates and instructors!

## 📚 Additional Resources

- **Chart.js Documentation**: https://www.chartjs.org/docs/latest/
- **GitHub Pages Guide**: https://pages.github.com/
- **JSON Validation**: https://jsonlint.com/

## ❓ Questions?

If you have issues:
1. Check the troubleshooting section above
2. Review the JSON data schemas in README.md
3. Inspect browser console (F12) for errors
4. Check that all file paths are correct

---

**Happy Data Exploring! 🚀**

Last Updated: March 2026
