# Image and Video Loading Fixes

## Issues Fixed

### 1. Homepage Video (✅ FIXED)
- **Problem**: Video `/HOMEPAGELOOP.mp4` was trying to load from R2 bucket without public access
- **Solution**:
  - Uploaded video to R2
  - Configured FastAPI backend to serve video from `/media` endpoint using StaticFiles
  - Updated database to use relative path `/media/HOMEPAGELOOP.mp4`
  - MediaService automatically prepends backend URL when resolving media paths
- **Result**: Video now loads from `http://localhost:8000/media/HOMEPAGELOOP.mp4` locally and will use production backend URL on Vercel

### 2. FAQ Page Images (✅ FIXED)
- **Problem**: FAQ component had hardcoded image paths instead of fetching from API
- **Solution**:
  - Updated `src/components/faq/FAQ.tsx` to fetch from `/api/faqs/gallery`
  - Backend serves Cloudflare CDN URLs from `media_assets` table
  - All 8 gallery images + banner image now load from Cloudflare Images CDN
- **Result**: No more 404s on FAQ page images

### 3. Membership Page Images (⚠️ TODO)
- **Problem**: Hardcoded paths: `/vector.png`, `/vector1.png`, `/vector2.png`, `/FrameDevices.png`
- **Files**: `src/components/membership/MembershipHero.tsx`
- **Solution Needed**: Either:
  1. Upload these images to Cloudflare and update component to use CDN URLs, OR
  2. Create placeholder images in `public/` folder

### 4. Courses Page Images (⚠️ TODO)
- **Problem**: Hardcoded paths: `/illustrations.png`, `/courseslanding.jpg`
- **Files**: `src/components/courses/CoursesPage.tsx`
- **Solution Needed**: Same as membership - upload to Cloudflare or create placeholders

### 5. Teachings Page Image (⚠️ TODO)
- **Problem**: Hardcoded path: `/bgteachings.png`
- **Files**: Need to find which component uses this
- **Solution Needed**: Same as above

## Database Structure

All images are tracked in the `media_assets` table with:
- `original_path`: The original file path (e.g., `/HOMEPAGELOOP.mp4`)
- `cdn_url`: The Cloudflare CDN URL or backend media URL
- `storage_type`: Either `cloudflare_images` or `r2`
- `is_active`: Boolean to enable/disable assets

## Cloudflare Configuration

- **Images**: Using Cloudflare Images API - already set up and working
- **Videos**: Uploaded to R2 bucket `videos` but serving through backend due to R2 public access configuration

## For Production (Vercel)

### Environment Variables Needed:
```bash
# Frontend (.env)
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app

# Backend (.env)
CLOUDFLARE_ACCOUNT_ID=6ff5acb9f54ba5e1132b12c7a7732ab8
CLOUDFLARE_IMAGES_TOKEN=<already set>
CLOUDFLARE_R2_ACCESS_KEY_ID=<already set>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<already set>
R2_BUCKET_NAME=videos
R2_ENDPOINT_URL=https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com/videos
```

### Deployment Notes:
1. The backend `/media` endpoint serves files from `backend/public/`
2. For Vercel, make sure `backend/public/` is included in the deployment
3. Alternatively, enable R2 public access through Cloudflare dashboard and update `media_assets.cdn_url` to use public R2 URL

## Testing

Run Playwright tests to verify no 404s:
```bash
npx playwright test e2e/check-404s.spec.ts --project=chromium
```

Current status:
- ✅ Homepage: Video loads correctly
- ✅ FAQ: All images load from Cloudflare CDN
- ❌ Membership: 4 images missing (404)
- ❌ Courses: 2 images missing (404)
- ❌ Teachings: 1 image missing (404)
- ⚠️ Donate: Need to verify

## Next Steps

1. **Option A - Upload Missing Images to Cloudflare**:
   ```bash
   cd backend
   python scripts/upload_to_cloudflare.py
   ```
   Then update components to fetch from API or use CDN URLs directly

2. **Option B - Create Placeholders**:
   Create placeholder images in `public/` folder for local development

3. **Update Components**:
   - Fix `src/components/membership/MembershipHero.tsx`
   - Fix `src/components/courses/CoursesPage.tsx`
   - Fix teachings background image

4. **Verify on Vercel**:
   - Test video loads from production backend
   - Test all images load from Cloudflare CDN
   - No 404 errors in browser console
