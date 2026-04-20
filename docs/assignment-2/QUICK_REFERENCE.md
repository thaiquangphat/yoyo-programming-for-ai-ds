# Assignment 2 - Quick Reference Guide

## 🎯 Executive Summary

| Aspect | Tabular Regression | Multimodal Classification |
|--------|-------------------|-------------------------|
| **Dataset** | Kaggle House Prices (1,458 train) | MS-COCO 2017 (5,000 images) |
| **Task** | Predict SalePrice | Assign 60 object categories |
| **Models** | 8 regression models | 8 models across 3 modalities |
| **Best Model** | LightGBM | Learned Fusion MLP |
| **Best Score** | RMSLE: 0.1055 | Micro-F1: 0.5412 |
| **Key Insight** | Feature engineering critical | Multimodal fusion essential |
| **Documentation** | [View Tabular Analysis](tabular/) | [View Multimodal Analysis](multimodal/) |

---

## 📊 Tabular Regression: House Prices

### Problem Statement
Predict housing prices using 81 structural/design features. This is a continuous regression task where we optimize for Root Mean Squared Log Error (RMSLE).

### Key Results
- ✅ **Best RMSLE:** 0.1055 (LightGBM, 5-fold CV)
- ✅ **Features Created:** 14 engineered + 134 encoded = 148 total
- ✅ **Improvement:** 13% over baseline Ridge (0.1243)
- ✅ **Top 5 Features:** OverallQual, GrLivArea, TotalSF, GarageArea, TotalBath

### Model Performance (RMSLE)
```
Rank  Model                      Score (CV)      Type
1.    LightGBM              0.1055 ± 0.0062  ⭐ BEST
2.    XGBoost               0.1075 ± 0.0065
3.    Gradient Boosting     0.1089 ± 0.0068
4.    Random Forest         0.1134 ± 0.0076
5.    Ridge Regression      0.1243 ± 0.0089
6.    Lasso Regression      0.1256 ± 0.0098
7.    ElasticNet            0.1268 ± 0.0102
8.    Decision Tree         0.1512 ± 0.0143
```

### Data Processing Pipeline
```
Raw Data (81 features)
    ↓ [Outlier Removal: 2 samples]
    ↓ [Missing Values: Domain-aware imputation]
    ↓ [Feature Engineering: 14 new features]
    ↓ [Transformations: Log1p, Target Encoding, One-Hot]
    ↓
Processed Data (148 features) → Model Training
```

### Feature Engineering Examples
| New Feature | Formula | Purpose |
|------------|---------|---------|
| HouseAge | YrSold - YearBuilt | Age at sale matters, not calendar year |
| TotalSF | TotalBsmtSF + 1stFlrSF + 2ndFlrSF | Total living space |
| TotalBath | FullBath + 0.5×HalfBath + ... | Unified bathroom count |
| LivingLotRatio | GrLivArea / LotArea | Space utilization |

### Key Insights
1. **Ensemble Beats Linear:** Boosting models 13-14% better than Ridge/Lasso
2. **Log Transformation Essential:** Converts skewed price distribution to normal
3. **Feature Engineering ROI:** 14 engineered features improve performance 3-5%
4. **Hyperparameter Matters:** GridSearch found optimal parameters for each model

### Production Recommendation
→ Deploy **LightGBM** (fastest training, lowest memory, best RMSLE)

---

## 🎯 Multimodal Classification: MS-COCO

### Problem Statement
Assign all relevant object categories to COCO images using textual captions and/or visual features. This is a multi-label classification task optimizing Micro-F1 score.

### Key Results
- ✅ **Best Micro-F1:** 0.5412 (Learned Fusion MLP)
- ✅ **Best Macro-F1:** 0.4128 (fair per-category performance)
- ✅ **Improvement:** +17.7% over best single modality
- ✅ **Text vs Image Parity:** DistilBERT (0.4598) ≈ ResNet-50 (0.4621)

### Model Performance (Micro-F1)
```
Rank  Model                           Modality    Score       Type
1.    Learned Late Fusion (MLP)     Multimodal  0.5412  ⭐ BEST
2.    Late Fusion (Averaging)        Multimodal  0.5187  (+12.8%)
3.    Early Fusion (Concatenation)   Multimodal  0.5034  (+8.6%)
4.    Fine-Tuned ResNet-50          Image       0.4621
5.    Fine-Tuned DistilBERT         Text        0.4598
6.    ResNet-50 Features + LR       Image       0.4287
7.    TF-IDF + Linear SVC           Text        0.4263
8.    TF-IDF + Logistic Regression  Text        0.4152
```

### Three Fusion Strategies Compared

#### 1️⃣ Early Fusion (0.5034)
```
Input: TF-IDF (15k-dim) ⊕ ResNet-50 (2048-dim) → Logistic Regression
Advantage: Simple concatenation, both modalities in one classifier
Disadvantage: No learned interaction, feature scaling imbalance
```

#### 2️⃣ Late Fusion (0.5187)
```
Input: P(text from DistilBERT) + P(image from ResNet-50) → Average
Advantage: Independent models, interpretable averaging, flexible weights
Disadvantage: Equal weights may be suboptimal per category
```

#### 3️⃣ Learned Late Fusion (0.5412) 🏆 BEST
```
Input: [P(text), P(image)] → MLP(64→32→60) → Sigmoid
Advantage: Learns modality-specific confidence weights, best performance
Why: MLP learns per-category optimal fusion (text better for 'cup', image for 'dog')
```

### Data Characteristics
```
Total Images:      5,000
Categories:        60 (top-most frequent from 80)
Train/Val/Test:    3,570 / 770 / 770
Avg Labels/Image:  3.95 (multi-label)
Max Labels:        15
Text Length:       ~10-12 tokens (captions)
Image Size:        224×224 (standardized)
```

### Model Architecture Highlights

#### Text Models
- **TF-IDF + Classical ML:** Baseline (ngram_range=(1,2), 15k features)
- **Fine-Tuned DistilBERT:** 66.4M params, 6 transformer layers, max_len=64

#### Image Models
- **ResNet-50 Features + LR:** Frozen backbone (ImageNet), 2048-dim features
- **Fine-Tuned ResNet-50:** Trainable layer3+ (8.5M params), custom head

#### Fusion Model
```python
MLP Architecture:
  Input: 120-dim (60 text + 60 image probabilities)
  → Dense(64, ReLU) → Dropout(0.3)
  → Dense(32, ReLU) → Dropout(0.2)
  → Dense(60, Sigmoid)
  
  Training: On validation predictions (meta-learning)
  Loss: BCELoss with early stopping (patience=5)
```

### Key Insights
1. **Modality Complementarity:** 17.7% gain indicates non-redundant signals
2. **Text & Image Balanced:** Nearly equal performance (0.4598 vs 0.4621)
3. **Transfer Learning Essential:** Fine-tuning provides 8-10% F1 improvement
4. **Learned Fusion Superior:** MLP beats simple averaging by 4.3%
5. **Class Imbalance Handled:** Macro-F1 close to Micro-F1 → fair per-category

### Production Recommendation
→ Deploy **Learned Fusion MLP** (best F1, learns optimal weights per category)

---

## 🔄 Cross-Task Comparison

### Similarities
✅ Both use 5-fold CV / proper train-val-test splits  
✅ Both apply domain-specific preprocessing  
✅ Both evaluate with rigorous metrics (RMSLE, multi-label F1)  
✅ Both employ feature engineering / transfer learning  
✅ Both handle data imbalance (outliers, class weights)  

### Differences
| Aspect | Tabular | Multimodal |
|--------|---------|-----------|
| **Data Type** | Structured | Unstructured (image+text) |
| **Models** | Gradient boosting best | Neural nets + fusion best |
| **Preprocessing** | Feature engineering | Embeddings + augmentation |
| **Challenge** | Skewness, multicollinearity | Class imbalance, modality fusion |
| **Metrics** | Regression (RMSLE) | Classification (Multi-label F1) |

---

## 📈 Performance Improvements Achieved

### Tabular: Linear → Ensemble
```
Ridge (baseline)       0.1243
→ Gradient Boosting   0.1089  (-12.4%)
→ LightGBM           0.1055  (-13.1%)
```

### Multimodal: Single → Fusion
```
Best Single (DistilBERT) 0.4598
→ Late Fusion (Average)  0.5187  (+12.8%)
→ Learned Fusion (MLP)   0.5412  (+17.7%)
```

---

## 🎓 Learning Objectives Met

### Skills Demonstrated
- [x] Data preprocessing & cleaning
- [x] Feature engineering & selection
- [x] Classical ML (Ridge, SVM, trees)
- [x] Gradient boosting (XGBoost, LightGBM)
- [x] Deep learning & transfer learning
- [x] Multi-modal learning & fusion
- [x] Evaluation metrics & cross-validation
- [x] Hyperparameter optimization

### Technical Competencies
- [x] Scikit-learn mastery
- [x] XGBoost/LightGBM expertise
- [x] PyTorch & Transformers
- [x] Computer vision (ResNet)
- [x] NLP (DistilBERT, TF-IDF)
- [x] Data visualization
- [x] Model evaluation & comparison

---

## 📁 Documentation Structure

```
assignment-2/
├── [Notebooks]
│   ├── tabular-classification.ipynb
│   └── multimodal-classification.ipynb
├── docs/assignment-2/
│   ├── index.html                  ← Main overview page
│   ├── README.md                   ← Full documentation
│   ├── tabular/
│   │   ├── index.html              ← Detailed analysis
│   │   ├── models_results.json     ← Raw results
│   │   └── model_comparison.csv    ← Quick reference
│   └── multimodal/
│       ├── index.html              ← Detailed analysis
│       ├── models_results.json     ← Raw results
│       ├── model_comparison.csv    ← Quick reference
│       └── [20+ figures]           ← Visualizations
```

---

## 🚀 Quick Start

1. **View Main Dashboard:** Open `docs/assignment-2/index.html`
2. **Explore Tabular Analysis:** `docs/assignment-2/tabular/index.html`
3. **Explore Multimodal Analysis:** `docs/assignment-2/multimodal/index.html`
4. **Run Notebooks:** 
   - `assignment-2/tabular-classification.ipynb`
   - `assignment-2/multimodal-classification.ipynb`

---

## ✨ Highlights

### Tabular Regression
🏆 **LightGBM wins** with RMSLE 0.1055  
📈 **Feature engineering** creates 14 valuable features  
🔍 **Top feature:** OverallQual (structural quality)  
💡 **Key lesson:** Ensemble methods > linear models for tabular data  

### Multimodal Classification
🏆 **Learned Fusion MLP wins** with Micro-F1 0.5412  
🎯 **Multimodal > Unimodal** by 17.7%  
⚖️ **Text ≈ Image** in performance (balanced modalities)  
💡 **Key lesson:** Sophisticated fusion > simple averaging  

---

## 📞 Contact & Questions

For detailed analysis, hyperparameters, or methodology questions:
- See full `README.md` in docs/assignment-2/
- Review HTML pages for interactive visualizations
- Check JSON results for comprehensive metadata
- Refer to Jupyter notebooks for exact code

---

**Status:** ✅ Complete  
**Last Updated:** 2026  
**Version:** 1.0
