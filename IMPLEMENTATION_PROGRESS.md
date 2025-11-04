# Teaching Platform Implementation Progress
**Date**: 2025-10-27
**Status**: 🚧 Phase 1 Complete, Ready for Testing

---

## ✅ Completed Features

### 1. Preview Duration Bug Fix
**Critical Bug Fixed**:
- **Problem**: Preview was showing 0.5 seconds instead of 30 minutes
- **Root Cause**: Code was dividing by 60 instead of multiplying (30 / 60 = 0.5)
- **Fix**: Changed `data.preview_duration/60` to `(data.preview_duration || 30) * 60`
- **File**: `src/components/teachings/TeachingDetail.tsx:66`

### 2. Dashboard Preview Duration (dash_preview_duration)
**New Field Added**:
- Database: Added `dash_preview_duration` INTEGER column to `teachings` table
- Model: Updated `backend/app/models/teaching.py` (line 37)
- Schema: Updated `backend/app/schemas/teaching.py` (lines 17, 44)
- Types: Updated `src/types/Teachings.ts` (line 132)

**Logic**:
```typescript
const isDashboard = window.location.pathname.includes('/dashboard');
const effectivePreviewDuration = isDashboard && isAuthenticated
  ? dashPreviewDuration  // 60 minutes for logged-in dashboard users
  : previewDuration;     // 30 minutes for public site
```

### 3. YouTube Video Support
**New Component**: `src/components/teachings/YouTubePlayer.tsx`
- Embedded YouTube iframe player
- Preview duration tracking (same as Cloudflare)
- Preview end overlay
- Progress bar showing time remaining
- Dashboard vs public preview support

### 4. Multi-Video Selector
**New Component**: `src/components/teachings/VideoSelector.tsx`
- Tab layout for 2-5 videos
- Dropdown for 6+ videos
- Icons: YouTube (🎬) and Cloudflare (▶️)
- Active video highlighting

### 5. WordPress Media Extraction
**Script**: `backend/scripts/extract_media_ids.py`
**Results** (from 50-teaching test batch):
- ✅ Processed: 50/50 (100%)
- 🎥 Cloudflare: 41 teachings
- 📺 YouTube: 9 teachings
- 🔊 Podbean: 43 teachings
- ⭐ Multiple videos: 2 teachings

**Notable Examples**:
- "Kali Yuga Is Now Reaching Its Climax": 3 YouTube videos + 1 Cloudflare + 1 Podbean
- "The Eternal Return of Spiritual Anarchy": 1 Cloudflare + 1 YouTube + 1 Podbean

**Full Extraction**: Script ran on all 483 teachings (status: running/completed)

### 6. Favorites & Watch Later Database Models
**Models Created**:
- `TeachingFavorite` (already existed)
- `TeachingWatchLater` (newly created)
- Database table `teaching_watch_later` with indexes

**Relationships**:
- User → teaching_favorites (one-to-many)
- User → teaching_watch_later (one-to-many)
- Teaching → favorites (one-to-many)
- Teaching → watch_later (one-to-many)

### 7. UI Updates
**Heart Icon for Favorites** (was Bookmark):
- File: `src/components/teachings/TeachingDetail.tsx:157-163`
- Icon: `Heart` from lucide-react
- Shows login overlay if not authenticated
- Fills with color (#7D1A13) when favorited

**Watch Later Button**:
- File: `src/components/teachings/TeachingDetail.tsx:164-170`
- Icon: `Clock` from lucide-react
- Shows login overlay if not authenticated
- Fills with color when added to watch later

### 8. Updated TeachingDetail Component
**Key Changes**:
```typescript
// Unified video array
const allVideos: MediaItem[] = [
  ...(data.youtube_ids || []).map(id => ({ type: 'youtube', id })),
  ...(data.cloudflare_ids || []).map(id => ({ type: 'cloudflare', id }))
];

// Video selection
const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
const currentVideo = allVideos[selectedVideoIndex];

// Conditional rendering
{currentVideo.type === 'youtube' ? (
  <YouTubePlayer videoId={currentVideo.id} ... />
) : (
  <VideoPlayer videoId={currentVideo.id} ... />
)}
```

**Audio Player Logic**:
- Now shows alongside video (not just when no video exists)
- Added `mt-4` spacing when video present

---

## 🚧 Pending Features

### 1. Favorites/Watch Later API Endpoints
**Need to Create**:
```python
POST   /api/teachings/{id}/favorite
DELETE /api/teachings/{id}/favorite
GET    /api/user/favorites

POST   /api/teachings/{id}/watch-later
DELETE /api/teachings/{id}/watch-later
GET    /api/user/watch-later
```

**Connect to UI**:
- Call API when heart/clock buttons clicked
- Load initial favorite/watch-later status on page load
- Update UI optimistically

### 2. Smart Back Button Navigation
**Implementation**:
```typescript
const referrer = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('ref')
  : null;

const backUrl = referrer === 'dashboard'
  ? '/dashboard/user/teachings'
  : '/teachings';
```

**Update Link Component**:
```typescript
<Link href={backUrl} className="...">
  <ArrowLeft size={16} />
  Back to {referrer === 'dashboard' ? 'Dashboard' : 'Teachings'}
</Link>
```

### 3. Configure 3 Free Teachings + Access Levels
**SQL to Run**:
```sql
-- Set 3 teachings as completely FREE
UPDATE teachings
SET access_level = 'FREE',
    preview_duration = NULL,
    dash_preview_duration = NULL
WHERE slug IN ('welcome', 'intro-to-meditation', 'path-to-enlightenment');

-- Set remaining teachings to have previews
UPDATE teachings
SET access_level = 'PREVIEW',
    preview_duration = 30,  -- 30 minutes public
    dash_preview_duration = 60  -- 60 minutes dashboard
WHERE access_level != 'FREE';

-- Restricted teachings with no preview
UPDATE teachings
SET access_level = 'GYANI',
    preview_duration = 0,
    dash_preview_duration = 0
WHERE slug IN ('advanced-teaching-1', 'advanced-teaching-2');
```

### 4. Testing (Critical!)
**Playwright Tests to Add**:
```typescript
test('teaching with multiple YouTube videos shows selector', async ({ page }) => {
  await page.goto('http://localhost:3000/teachings/kali-yuga-is-now-reaching-its-climax');

  // Video selector should be visible
  const selector = page.locator('[data-testid="video-selector"]');
  await expect(selector).toBeVisible();

  // Should show 3 video options (3 YouTube)
  const tabs = selector.locator('button');
  await expect(tabs).toHaveCount(3);

  // Click second video
  await tabs.nth(1).click();

  // YouTube player should load different video
  const iframe = page.locator('iframe[src*="youtube"]');
  await expect(iframe).toBeVisible();
});

test('preview duration shows 30 minutes correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/teachings/some-teaching');

  // Preview bar should show 30:00
  const previewText = page.locator('text=/30:00/');
  await expect(previewText).toBeVisible();
});

test('heart icon adds to favorites when logged in', async ({ page }) => {
  // Login first
  await loginAsTestUser(page);

  await page.goto('http://localhost:3000/teachings/some-teaching');

  // Click heart icon
  const heartButton = page.locator('[title="Add to favorites"]');
  await heartButton.click();

  // Should be filled
  const heartIcon = heartButton.locator('svg');
  await expect(heartIcon).toHaveAttribute('fill', '#7D1A13');
});

test('watch later button shows login overlay when not logged in', async ({ page }) => {
  await page.goto('http://localhost:3000/teachings/some-teaching');

  // Click watch later button
  const watchLaterButton = page.locator('[title="Watch later"]');
  await watchLaterButton.click();

  // Login modal should appear
  const loginModal = page.locator('text=/log in/i');
  await expect(loginModal).toBeVisible();
});
```

---

## 📊 Database Schema Updates

### teachings Table
```sql
-- New columns
dash_preview_duration INTEGER DEFAULT NULL  -- minutes for dashboard preview

-- Updated columns (comments)
preview_duration INTEGER DEFAULT NULL  -- minutes for public preview (was: seconds)

-- Existing YouTube support
youtube_ids JSONB DEFAULT '[]'
```

### teaching_watch_later Table (New)
```sql
CREATE TABLE teaching_watch_later (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teaching_id UUID NOT NULL REFERENCES teachings(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_teaching_watch_later UNIQUE(user_id, teaching_id)
);
CREATE INDEX idx_watch_later_user ON teaching_watch_later(user_id);
CREATE INDEX idx_watch_later_teaching ON teaching_watch_later(teaching_id);
```

---

## 🎯 Testing Plan

### Manual Testing Checklist
1. **Basic Teaching Page**
   - [ ] List page loads (/teachings)
   - [ ] Teaching cards display correctly
   - [ ] Click teaching navigates to detail page

2. **Single Video Teaching**
   - [ ] Cloudflare video loads and plays
   - [ ] YouTube video loads and plays
   - [ ] Preview bar shows correct duration (30:00)
   - [ ] Preview overlay appears after 30 minutes

3. **Multi-Video Teaching**
   - [ ] Video selector appears
   - [ ] Can switch between videos
   - [ ] YouTube and Cloudflare videos both work
   - [ ] Selected video highlights correctly

4. **Audio + Video Teaching**
   - [ ] Video player shows
   - [ ] Audio player shows below video
   - [ ] Both players work simultaneously

5. **Favorites & Watch Later**
   - [ ] Heart icon works when logged in
   - [ ] Clock icon works when logged in
   - [ ] Login overlay shows when not logged in
   - [ ] Icons fill with color when activated

6. **Dashboard vs Public Preview**
   - [ ] Public site: 30 minute preview
   - [ ] Dashboard (logged in): 60 minute preview
   - [ ] Preview duration shows correctly in UI

---

## 📁 Files Modified/Created

### Created Files
- `src/components/teachings/YouTubePlayer.tsx` (213 lines)
- `src/components/teachings/VideoSelector.tsx` (92 lines)
- `backend/scripts/extract_media_ids.py` (396 lines)

### Modified Files
- `src/components/teachings/TeachingDetail.tsx` (updated media player section)
- `backend/app/models/teaching.py` (added dash_preview_duration, TeachingWatchLater)
- `backend/app/models/user.py` (added teaching_watch_later relationship)
- `backend/app/schemas/teaching.py` (added dash_preview_duration, TeachingWatchLaterToggle)
- `src/types/Teachings.ts` (added dash_preview_duration)

### Database Changes
- Added column: `teachings.dash_preview_duration`
- Added column: `teachings.youtube_ids` (already existed from earlier)
- Created table: `teaching_watch_later`

---

## 🐛 Known Issues

1. ⚠️ **Favorites/Watch Later not connected to API** - Buttons exist but don't persist
2. ⚠️ **Back button always goes to /teachings** - Needs referrer tracking
3. ⚠️ **Access levels not configured** - All teachings still marked as FREE
4. ⚠️ **No Playwright tests** - Need to add comprehensive E2E tests

---

## 🚀 Next Steps (Priority Order)

1. **Clean restart and test** (IN PROGRESS)
   - Kill all processes
   - Start backend on port 8000
   - Start frontend on port 3000
   - Test manually with console logs

2. **Add API endpoints** for favorites/watch-later
   - Create routes in `backend/app/routers/teachings.py`
   - Connect UI buttons to API calls
   - Test with curl/Postman

3. **Implement smart back button**
   - Add referrer query param
   - Update Link href logic
   - Test navigation flows

4. **Configure access levels**
   - Run SQL to set 3 free teachings
   - Set preview durations
   - Test preview mechanism

5. **Add Playwright tests**
   - Multi-video selector
   - YouTube player
   - Favorites/watch later
   - Preview duration
   - Back button navigation

6. **Create CHECKPOINT.md**
   - Consolidate all documentation
   - Delete old PHASE* docs
   - Add testing results

---

## 💡 Technical Notes

### Preview Duration Conversion
```typescript
// Database stores MINUTES
// Player expects SECONDS
const previewDuration = (data.preview_duration || 30) * 60;
```

### Media Type Detection
```typescript
const hasYouTube = data.youtube_ids && data.youtube_ids.length > 0;
const hasCloudflare = data.cloudflare_ids && data.cloudflare_ids.length > 0;
const hasVideo = allVideos.length > 0;
const hasMultipleVideos = allVideos.length > 1;
```

### Conditional Player Rendering
```typescript
{currentVideo.type === 'youtube' ? (
  <YouTubePlayer videoId={currentVideo.id} ... />
) : (
  <VideoPlayer videoId={currentVideo.id} ... />
)}
```

---

## 📝 User Requirements Checklist

- [x] Fix preview duration bug (5 sec → 30 min)
- [x] Add YouTube video support
- [x] Multi-video selector
- [x] Change bookmark → heart icon
- [x] Add watch later button
- [x] Add dash_preview_duration field
- [x] Extract media IDs from WordPress
- [x] Create YouTubePlayer component
- [x] Create VideoSelector component
- [x] Update TeachingDetail for multi-video
- [x] Add WatchLater database model
- [ ] Add favorites/watch-later API endpoints
- [ ] Connect UI to API (favorites/watch-later)
- [ ] Smart back button navigation
- [ ] Configure 3 free teachings
- [ ] Set preview durations for all teachings
- [ ] Test thoroughly with Playwright
- [ ] Create CHECKPOINT.md
- [ ] Delete old documentation files

---

**Ready for Testing!** 🎉

All core features are implemented. Need to:
1. Clean restart services
2. Test manually
3. Add API endpoints
4. Run Playwright tests
5. Fix any bugs found
6. Document final state
