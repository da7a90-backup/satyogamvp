# LAST_TOUCHED - Most Recent Critical Changes

**Last Updated**: 2025-01-27 (Context refresh document)

---

## 🎯 Most Recent Changes (Last 10% of Work)

### 1. **Dashboard Sidebar - Complete Figma Rebuild** ✅
**File**: `src/components/dashboard/UserSidebar.tsx` (318 lines)

**What Changed**:
- Completely rebuilt to match Figma screenshots pixel-perfect
- Removed Heroicons, used inline SVGs matching Figma
- Exact colors: `#7D1A13` (active teaching red), `#374151`, `#737373`, `#F3F4F6`
- Exact fonts: `Avenir Next, sans-serif` throughout
- Width: `224px`, proper spacing with `gap: 23px`, `padding: 20px 16px`

**Structure** (top to bottom):
1. Logo (224x45px)
2. Dashboard link
3. Quick Access: Online Retreats, Courses
4. My Space: Purchases, Favourites, History, Calendar
5. **Pragyani Membership** with expandable Library:
   - **Teachings** (selected - dark red `#7D1A13` background) ⭐
   - Guided Meditations, Q&A's, Essays
   - Shunyamurti Recommends, Book Group
   - Study Group (with "Live" badge), Discussion, Forum
6. Store: The Dharma Bandhara, Saved For Later
7. Resources: Blog, Dashboard Tour, Telegram Group
8. Spotify widget (closeable, green `#42D745` icon)
9. Help Us Improve, Settings
10. User profile (avatar, name, email, green online indicator)

**Critical Pattern**:
```typescript
// Active state for Teachings
className={`... ${
  isActive('/dashboard/user/teachings')
    ? 'bg-[#7D1A13] text-white'  // Dark red when active
    : 'bg-white text-[#374151] hover:bg-gray-50'
}`}
```

---

### 2. **Teaching Video/Audio Missing IDs - Database Issue** 🚨

**Problem Discovered**:
- Teaching `you-cant-trust-the-science-or-religion-or-your-mind` in WordPress has BOTH video AND audio
- WordPress meta fields return empty: `cloudflare_ids: []`, `podbean_ids: []`
- BUT HTML content has embedded iframe: `8f92c26dc5e0977531408c5e0ca7764d`
- Our `data.ts` and database copied this error

**What Was Fixed**:
```sql
-- Updated database directly
UPDATE teachings
SET cloudflare_ids = '["8f92c26dc5e0977531408c5e0ca7764d"]'::jsonb
WHERE slug = 'you-cant-trust-the-science-or-religion-or-your-mind';
```

**Scope of Issue**:
- **483 teachings** have NO cloudflare/youtube IDs in database
- Many likely have embedded iframes in WordPress HTML
- Need script to parse WordPress HTML content to extract video IDs

**File Locations**:
- Database: PostgreSQL `satyoga_db` (port 5432)
- Seed data: `backend/scripts/all_teachings_data.json`
- Original: `src/lib/data.ts` (main branch)

---

### 3. **Related Teachings Implementation** ✅

**Files Modified**:
1. `/src/app/teachings/[slug]/page.tsx`
2. `/src/app/dashboard/user/teachings/[slug]/page.tsx`
3. `/src/app/dashboard/user/teachings/[slug]/DashboardTeachingDetailClient.tsx`

**New Function** (added to both page.tsx files):
```typescript
async function getRelatedTeachings(category: string, currentSlug: string) {
  // 1. Fetch all teachings
  // 2. Filter by same category
  // 3. Exclude current teaching
  // 4. Sort by published_date (newest first)
  // 5. Return top 6
}
```

**API Response Format Fix**:
```typescript
// API returns: {teachings: [...], total: 693}
const data = await response.json();
const teachings = data.teachings || data;  // ✅ Handle both formats

if (!Array.isArray(teachings)) {
  console.error('[getRelatedTeachings] Expected array, got:', typeof teachings);
  return [];
}
```

---

### 4. **Preview Mechanism** (Already Working from Previous Session)

**Location**: `src/components/teachings/TeachingDetail.tsx`

**Video Preview**:
- Tracks actual `playbackTime` from Cloudflare Stream `timeupdate` messages
- Shows progress: `"0:15 / 0:30"`
- Stops when `playbackTime >= preview_duration`
- Shows modal: "Preview ended. Sign up to continue."

**Audio Preview**:
- Uses Podbean Widget API events
- Tracks total played time (accumulates during play, pauses timer)
- Stops when limit reached

---

## 🎯 Critical Testing Checklist

### Teaching Detail Pages

**Test URL**: `http://localhost:3001/teachings/you-cant-trust-the-science-or-religion-or-your-mind`

**Expected Behavior**:
- ✅ Video plays (Cloudflare iframe `8f92c26dc5e0977531408c5e0ca7764d`)
- ✅ Audio player below video (Podbean `6tt44-1107032-pb`)
- ✅ Preview banner shows if not logged in
- ✅ Progress shows `"0:00 / 0:30"`
- ✅ After 30 seconds actual playback, video stops
- ✅ Modal appears: "Sign up to continue"
- ✅ Related teachings sidebar (6 from same category)

**Dashboard URL**: `http://localhost:3001/dashboard/user/teachings/you-cant-trust-the-science-or-religion-or-your-mind`

**Expected Behavior**:
- ✅ Sidebar shows with "Teachings" in dark red (#7D1A13)
- ✅ Video/audio play without restrictions (logged in)
- ✅ No preview banner
- ✅ Related teachings sidebar works

---

## 🔥 Known Issues & Immediate Priorities

### 1. **483 Teachings Missing Video IDs** 🚨

**Impact**: Major - many teachings show no video even though they have one

**Root Cause**: WordPress meta fields empty, but HTML has embedded iframes

**Solution Needed**:
1. Write script to:
   - Fetch each teaching from WordPress API
   - Parse HTML content for `iframe.videodelivery.net` URLs
   - Extract Cloudflare IDs from iframes
   - Extract Podbean IDs from `podbean.com/player` URLs
   - Update database with correct IDs
2. Run on all 483 teachings with empty arrays

**Example Code Pattern**:
```python
import re
import requests

# Fetch teaching HTML from WordPress
response = requests.get(f"https://www.members.satyoga.org/wp-json/wp/v2/posts/{post_id}")
html_content = response.json()['content']['rendered']

# Extract Cloudflare video ID
cloudflare_match = re.search(r'iframe\.videodelivery\.net/([a-f0-9]+)', html_content)
if cloudflare_match:
    video_id = cloudflare_match.group(1)

# Extract Podbean audio ID
podbean_match = re.search(r'i=([^&]+)', html_content)
if podbean_match:
    audio_id = podbean_match.group(1)
```

### 2. **Port 3000 vs 3001 Confusion**

**Current State**:
- Port 3000: Old dev server?
- Port 3001: Current dev server

**Action**: Verify which port is correct and kill the other process

### 3. **Playwright Tests Not Running**

**Status**: Tests created but not executed
**File**: `e2e/teachings-complete.spec.ts`

**Next Step**: Run tests to verify all functionality

---

## 📁 Key File References

### Modified Recently
- `src/components/dashboard/UserSidebar.tsx` - Complete rebuild
- `src/app/teachings/[slug]/page.tsx` - Related teachings
- `src/app/dashboard/user/teachings/[slug]/page.tsx` - Related teachings
- `src/app/dashboard/user/teachings/[slug]/DashboardTeachingDetailClient.tsx` - Props

### Database
- Connection: `postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db`
- Table: `teachings`
- Columns: `cloudflare_ids JSONB`, `podbean_ids JSONB`, `preview_duration INT`

### Documentation Created
- `TEACHINGS_FIX_SUMMARY.md` - Complete teaching fixes (all 7 phases)
- `TEACHINGS_PREVIEW_AND_RELATED.md` - Preview + related teachings implementation
- `PROJECT_STATUS.md` - Overall project roadmap

---

## 🎨 Figma-Critical Styling Reference

**Colors**:
- Active teaching: `#7D1A13` (dark red)
- Text primary: `#374151`
- Text secondary: `#737373`
- Background: `#F3F4F6`
- Success/online: `#22C55E`
- Live badge: `#EF4444`
- Spotify green: `#42D745`

**Fonts**:
- All text: `fontFamily: 'Avenir Next, sans-serif'`
- Font weights: 400 (normal), 500 (medium), 600 (semibold)

**Dimensions**:
- Sidebar width: `224px`
- Logo: `224x45px`
- Icons: `20x20px`
- Avatar: `40x40px`
- Online indicator: `10x10px` (2.5px in profile)

---

## ⚡ Quick Start After Context Clear

```bash
# 1. Start backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# 2. Start frontend (verify port)
npm run dev  # Should be on 3001

# 3. Test teaching page
open http://localhost:3001/teachings/you-cant-trust-the-science-or-religion-or-your-mind

# 4. Test dashboard sidebar
open http://localhost:3001/dashboard/user/teachings

# 5. Check database
PGPASSWORD='satyoga_dev_password' psql -h localhost -p 5432 -U satyoga -d satyoga_db -c "SELECT slug, cloudflare_ids, podbean_ids FROM teachings WHERE slug = 'you-cant-trust-the-science-or-religion-or-your-mind';"
```

---

## 🧠 Context Retention

**Most Important Things to Remember**:
1. **UserSidebar.tsx** now matches Figma EXACTLY - don't change colors/fonts
2. **483 teachings** need video IDs extracted from WordPress HTML
3. Teaching `you-cant-trust-the-science-or-religion-or-your-mind` is test case (now fixed)
4. Preview mechanism works - tracks actual playback time
5. Related teachings fetch 6 most recent from same category
6. API returns `{teachings: [...]}` not direct array
7. PostgreSQL database, not SQLite
8. Two frontends running - need to clarify correct port

**User's Workflow Preference**:
- Compare with `main` branch for working implementations
- Use Playwright for thorough testing
- Check console logs and screenshots
- Create summary documents like LAST_TOUCHED.md for context clarity
