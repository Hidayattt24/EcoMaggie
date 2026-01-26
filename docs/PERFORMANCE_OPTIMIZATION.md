# 🚀 Performance Optimization Guide - EcoMaggie

## 📊 Current Performance Issues

Based on PageSpeed Insights (Jan 6, 2026):
- **Performance Score: 60%**
- **LCP (Largest Contentful Paint): 13.4s** ❌ (Target: <2.5s)
- **FCP (First Contentful Paint): 1.4s** ⚠️ (Target: <1.8s)
- **Speed Index: 11.1s** ❌ (Target: <3.4s)
- **TBT (Total Blocking Time): 60ms** ✅ (Target: <200ms)
- **CLS (Cumulative Layout Shift): 0** ✅ (Target: <0.1)

---

## 🔴 CRITICAL: Optimize SVG Files (MOST IMPORTANT!)

**Problem:** SVG files are TOO LARGE!
- `logo.svg`: **2.7 MB** ❌ (Should be <50 KB)
- `beranda.svg`: **2.9 MB** ❌ (Should be <500 KB or convert to WebP)
- `beranda-mobile.svg`: **2.8 MB** ❌ (Should be <500 KB or convert to WebP)

**Total: 8.4 MB for 3 images!** This is causing the slow LCP.

### ✅ Solution 1: Compress SVG Files (RECOMMENDED)

Use online tools to compress SVGs:

**Option A: SVGOMG (Best for Logo)**
1. Go to https://jakearchibald.github.io/svgomg/
2. Upload `public/assets/logo.svg`
3. Settings to enable:
   - ✅ Prettify code
   - ✅ Remove unknown tags
   - ✅ Remove comments
   - ✅ Remove hidden elements
   - ✅ Remove metadata
   - ✅ Minify colors
   - ✅ Remove unnecessary code
4. Download optimized file
5. Replace original file

**Expected result:** 2.7MB → <50KB (98% reduction!)

**Option B: Compressor.io**
1. Go to https://compressor.io/
2. Upload SVG files
3. Download compressed versions

**Option C: Use CLI Tools**
```bash
# Install SVGO globally
npm install -g svgo

# Optimize logo
svgo public/assets/logo.svg -o public/assets/logo.svg

# Optimize hero images
svgo public/assets/landing/beranda.svg -o public/assets/landing/beranda.svg
svgo public/assets/landing/beranda-mobile.svg -o public/assets/landing/beranda-mobile.svg
```

### ✅ Solution 2: Convert to WebP/AVIF (For Hero Images)

Since hero images are likely photos/illustrations with complex details, converting to WebP is better:

**Option A: Use Squoosh.app**
1. Go to https://squoosh.app/
2. Upload `beranda.svg` and `beranda-mobile.svg`
3. Settings:
   - Format: WebP
   - Quality: 85%
   - Resize to actual display size if needed
4. Download and save as:
   - `public/assets/landing/beranda.webp`
   - `public/assets/landing/beranda-mobile.webp`

**Option B: Use Sharp CLI**
```bash
# Install sharp-cli
npm install -g sharp-cli

# Convert to WebP (85% quality)
sharp -i public/assets/landing/beranda.svg -o public/assets/landing/beranda.webp -f webp -q 85
sharp -i public/assets/landing/beranda-mobile.svg -o public/assets/landing/beranda-mobile.webp -f webp -q 85
```

**Then update HeroSection.tsx:**
```tsx
{/* Desktop Image */}
<Image
  src="/assets/landing/beranda.webp"  // Changed from .svg to .webp
  alt="..."
  fill
  className="hidden lg:block object-cover brightness-75"
  priority
  fetchPriority="high"
  quality={85}
/>

{/* Mobile Image */}
<Image
  src="/assets/landing/beranda-mobile.webp"  // Changed from .svg to .webp
  alt="..."
  fill
  className="lg:hidden object-cover brightness-75"
  priority
  fetchPriority="high"
  quality={85}
/>
```

**Expected result:**
- 2.9MB SVG → ~300KB WebP (90% reduction!)
- 2.8MB SVG → ~250KB WebP (91% reduction!)

---

## ✅ What We've Already Optimized

### 1. Image Loading Priority
- ✅ Added `priority` prop to logo and hero images
- ✅ Added `fetchPriority="high"` to LCP elements
- ✅ Added `quality={90}` to hero images

### 2. Resource Preloading
- ✅ Added `<link rel="preload">` for critical images
- ✅ Added `<link rel="dns-prefetch">` for external domains
- ✅ Media queries for responsive preloading

### 3. Next.js Configuration
- ✅ Enabled WebP and AVIF formats
- ✅ Added SWC minification
- ✅ Removed console.log in production
- ✅ Optimized package imports (lucide-react)
- ✅ Enabled React Strict Mode
- ✅ Disabled X-Powered-By header

### 4. Font Optimization
- ✅ Using next/font/google (automatic optimization)
- ✅ Font display swap for faster rendering
- ✅ Self-hosted fonts (no external request)

---

## 📈 Expected Performance Improvements

**After SVG Optimization:**
- **LCP:** 13.4s → **1.5-2.5s** ✅ (85% improvement!)
- **Speed Index:** 11.1s → **2.5-3.5s** ✅ (75% improvement!)
- **FCP:** 1.4s → **0.8-1.2s** ✅ (30% improvement!)
- **Overall Score:** 60% → **90-95%** ✅

---

## 🛠️ Additional Optimizations (Optional)

### 1. Enable Lazy Loading for Below-the-Fold Images

Images outside the initial viewport should use lazy loading:

```tsx
// In StatisticsSection.tsx, TentangSection.tsx, etc.
<Image
  src="..."
  alt="..."
  width={...}
  height={...}
  loading="lazy"  // Add this
/>
```

### 2. Reduce Animation Complexity

From PageSpeed: "Avoid non-composited animations"

**Current issue:** CSS animations using `opacity` and `translate` are not composited.

**Solution:** Use `transform` and `opacity` only (already GPU-accelerated).

**In HeroSection.tsx and other sections:**
```tsx
// ✅ Good (composited)
className="transition-all duration-1000"  // OK if using transform/opacity

// ❌ Avoid
className="transition-all duration-1000"  // if animating width, height, etc.
```

### 3. Code Splitting

Next.js already does this automatically, but verify:

```bash
# Build and check bundle size
npm run build

# Look for large chunks
# Ideally, each chunk should be <100KB
```

### 4. Reduce Third-Party Scripts

Currently minimal third-party scripts. Keep it that way!

### 5. Enable Caching Headers

**In `vercel.json`:**
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing Performance

### 1. PageSpeed Insights
```
https://pagespeed.web.dev/
Test URL: https://www.ecomaggie.com
```

### 2. Lighthouse (Chrome DevTools)
```
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance"
4. Click "Analyze page load"
```

### 3. WebPageTest
```
https://www.webpagetest.org/
Test URL: https://www.ecomaggie.com
Location: Tokyo, Japan (closest to Indonesia)
Connection: 4G LTE
```

### 4. GTmetrix
```
https://gtmetrix.com/
Test URL: https://www.ecomaggie.com
```

---

## 🎯 Action Plan (Priority Order)

### Phase 1: CRITICAL (Do This First!) ⚠️
1. ✅ **Compress logo.svg** using SVGOMG
   - Target: <50KB (from 2.7MB)

2. ✅ **Convert hero images to WebP**
   - beranda.svg → beranda.webp (~300KB)
   - beranda-mobile.svg → beranda-mobile.webp (~250KB)

3. ✅ **Update HeroSection.tsx** to use .webp files

**Expected time:** 30 minutes
**Expected improvement:** LCP from 13.4s → 2.0s

---

### Phase 2: Important (After Phase 1)
1. Test performance on PageSpeed Insights
2. Verify LCP element is now <2.5s
3. Deploy to Vercel
4. Re-test after deployment

---

### Phase 3: Optimization (If needed)
1. Add lazy loading to below-fold images
2. Review and optimize animations
3. Add caching headers in vercel.json
4. Monitor performance weekly

---

## 📊 Performance Checklist

Use this checklist after optimization:

### Images ✅
- [ ] Logo.svg is <50KB
- [ ] Hero images are <500KB each (WebP format)
- [ ] All above-fold images have `priority`
- [ ] All below-fold images have `loading="lazy"`
- [ ] All images have descriptive `alt` text

### Loading ✅
- [ ] Critical resources are preloaded
- [ ] Fonts are optimized with next/font
- [ ] DNS prefetch for external domains
- [ ] No render-blocking resources

### Code ✅
- [ ] Build output shows reasonable chunk sizes
- [ ] No unused JavaScript (checked in DevTools)
- [ ] Console.logs removed in production
- [ ] React components are memoized where needed

### Performance Metrics ✅
- [ ] LCP < 2.5s
- [ ] FCP < 1.8s
- [ ] TBT < 200ms
- [ ] CLS < 0.1
- [ ] Speed Index < 3.4s

---

## 🤝 Need Help?

If you encounter issues:

1. **Check Vercel deployment logs** for build errors
2. **Use Chrome DevTools** to debug network requests
3. **Test locally first** before deploying
4. **Compare before/after** using PageSpeed Insights

---

## 📝 Notes

- Next.js Image component automatically optimizes images
- WebP format is 25-35% smaller than PNG
- AVIF format is 50% smaller than JPEG (but less browser support)
- Vercel automatically handles caching and CDN
- Performance varies by user's device and network speed

**Remember:** The goal is 90%+ performance score with LCP <2.5s!

---

Generated: January 6, 2026
Last Updated: January 6, 2026
Version: 1.0
