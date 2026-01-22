# Retreat Access Investigation Report

**User**: sidbarrack@gmail.com (Sid Barrack)
**Date**: 2026-01-20
**Issue**: Past retreat purchases not accessible in "My Online Retreats"

---

## Summary

User purchased 3 past retreat products from Dharma Bandhara:
1. ✅ **"Live Free of Anxiety!"** - WORKING (shows in My Online Retreats)
2. ⚠️  **"Revelation of the Real"** - MISSING (not showing at all)
3. ⚠️  **"All's Well That Ends Well"** - SHOWS BUT EMPTY (displays "Schedule Coming Soon")

Also has:
4. ⚠️  **"Hopeless Yet Hilarious"** - HAS ACCESS BUT NO MEDIA

---

## Detailed Findings

### 1. "Live Free of Anxiety!" ✅ WORKING

**Product ID**: `908d5a9d-e38c-4e69-9ffd-3f66fc002243`

**Status**: ✅ Fully functional

**What's correct**:
- Type: PHYSICAL (but correctly linked to retreat)
- Has `retreat_id`: `98190aa3-68cc-4360-bcfa-a2743c6c5936`
- Has UserProductAccess ✅
- Has RetreatRegistration ✅ (lifetime access)
- Retreat has `past_retreat_portal_media` with 6 media items (list format) ✅
- Shows in "My Online Retreats" ✅

---

### 2. "Revelation of the Real" ❌ CRITICAL ISSUE

**Product ID**: `50e02443-a974-4020-a63f-144882bd3d76`

**Status**: ❌ Not showing in My Online Retreats

**Root Cause**: Product has **NO `retreat_id`** - it's not linked to any retreat!

**What exists**:
- Type: PHYSICAL
- Has UserProductAccess ✅
- Has `portal_media` with content ✅ (youtube, vimeo, cloudflare, mp4, mp3)
- In user's purchases ✅

**What's missing**:
- ❌ NO `retreat_id` field
- ❌ NO retreat exists in database for this product
- ❌ NO RetreatRegistration (impossible without retreat_id)
- ❌ Cannot appear in "My Online Retreats"

**Fix Required**:
1. Create a Retreat record for "Revelation of the Real" OR find existing retreat
2. Link product to retreat (`product.retreat_id = retreat.id`)
3. Create RetreatRegistration for user with LIFETIME access
4. Move media from `product.portal_media` to `retreat.past_retreat_portal_media`

---

### 3. "All's Well That Ends Well" ⚠️  SHOWS BUT NO CONTENT

**Product ID**: `81bbbdbc-0428-4f1f-958f-0b8b713cab6d`
**Retreat ID**: `51ea9e57-6b22-404b-b4e4-86405e5ee125`

**Status**: ⚠️  Shows in list but displays "Schedule Coming Soon" instead of media

**What exists**:
- Type: RETREAT_PORTAL_ACCESS ✅
- Has `retreat_id` ✅
- Has UserProductAccess ✅
- Has RetreatRegistration ✅ (lifetime access)
- Retreat has `past_retreat_portal_media` ✅

**The Problem**: Media format mismatch!
- `past_retreat_portal_media` is stored as **DICT** not **LIST**
- Format: `{'mp3': [...], 'mp4': [...], 'vimeo': [...], 'youtube': [...], 'cloudflare': [...]}`
- API/Frontend expects: `[{title: 'Day 1', video_url: '...', audio_url: '...'}, ...]`

**Fix Required**:
- Check if arrays inside the dict keys actually have media items
- If empty: Need media migration
- If populated: Transform dict format to list format OR update API to handle both formats

---

### 4. "Hopeless Yet Hilarious" ⚠️  HAS ACCESS BUT NO MEDIA

**Product ID**: `1835ab75-aa85-4d8f-9491-9897c2c9b660`
**Retreat ID**: `a455e708-75a1-48af-bac6-b616cfc1f535`

**Status**: ⚠️  Has registration but `past_retreat_portal_media` is empty

**What exists**:
- Has `retreat_id` ✅
- Has UserProductAccess ✅
- Has RetreatRegistration ✅ (lifetime access)
- Retreat record exists ✅

**What's missing**:
- ❌ `past_retreat_portal_media` is empty/null
- Shows "Schedule Coming Soon" in portal

**Fix Required**:
- Media migration from source (waiting for SSH access to VPS)

---

## Database State Summary

### Orders (3 total)
1. ORD-1767970865 - "Live Free of Anxiety!" - $107.35 - COMPLETED
2. ORD-1768922485 - "Revelation of the Real" - $107.35 - COMPLETED
3. ORD-1768922842 - "All's Well That Ends Well" - $175.15 - COMPLETED

### Payments (3 total)
All payments are status: COMPLETED, type: PRODUCT

### UserProductAccess (4 total)
All 4 products have UserProductAccess granted ✅

### RetreatRegistrations (3 total)
1. Live Free of Anxiety! ✅
2. Hopeless Yet Hilarious ✅
3. All's Well That Ends Well ✅
4. **Revelation of the Real** ❌ MISSING (no retreat_id to register for)

---

## Action Plan

### Immediate Fixes (Can do now)

1. **Fix "Revelation of the Real" - Missing retreat linkage**
   - Options:
     a. Create new Retreat record from product data
     b. Find existing retreat and link product to it
   - Update product type from PHYSICAL to RETREAT_PORTAL_ACCESS
   - Create RetreatRegistration for user
   - Migrate `product.portal_media` to `retreat.past_retreat_portal_media`

2. **Investigate "All's Well That Ends Well" media format**
   - Query database to see if dict keys contain actual media URLs
   - If yes: Transform format or update API to handle dict format
   - If no: Add to media migration list

3. **Update API error handling**
   - `/api/retreats/{slug}` - Return 404 if `past_retreat_portal_media` is empty
   - `/api/products/{slug}/portal-access` - Return 404 if media is missing
   - Provide clear error messages instead of "Schedule Coming Soon"

### Deferred (Requires SSH access)

4. **Media Migration for empty retreats**
   - "Hopeless Yet Hilarious" - needs `past_retreat_portal_media` populated
   - Any others found during migration

5. **Webhook Logging Enhancement**
   - Add detailed logging to `grant_access_after_payment()` in `payments.py:763-1110`
   - Track when RetreatRegistration creation fails
   - Prevent future silent failures

---

## Questions for User

1. **"Revelation of the Real"** retreat:
   - Does this retreat exist in your system with a different name?
   - Should we create a new retreat record for it?
   - Do you have retreat metadata (description, dates, etc.)?

2. **"All's Well That Ends Well"** media:
   - Do you want me to check if the dict format contains actual media URLs?
   - Should the API be updated to handle dict format, or should we transform it to list?

3. **Media Migration**:
   - Ready to provide SSH access for media migration?
   - Where are the source media files stored (old WP site, local files, etc.)?

---

## Files Created

- `backend/scripts/investigate_retreat_access.py` - Database investigation tool (can be reused for other users)

## Next Steps

Waiting for your decision on how to proceed with "Revelation of the Real" retreat creation/linkage.
