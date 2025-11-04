#!/usr/bin/env python3
import re
import json

# Read data.ts
with open('../../src/lib/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all teaching blocks - they start with "id": number and end before next "id":
pattern = r'"id":\s*(\d+)[\s\S]*?"slug":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"excerpt_text":\s*"([^"]*?)"[\s\S]*?"featured_media":\s*\{[\s\S]*?"url":\s*"([^"]+)"[\s\S]*?\}[\s\S]*?"cloudflare_ids":\s*\[([^\]]*)\][\s\S]*?"podbean_ids":\s*\[([^\]]*)\][\s\S]*?"content_type":\s*"([^"]+)"'

teachings = []
for match in re.finditer(pattern, content, re.MULTILINE):
    tid, slug, title, desc, thumb, cf_str, pb_str, ctype = match.groups()

    # Clean cloudflare IDs
    cf_ids = []
    if cf_str.strip():
        cf_ids = [cid.strip().strip('"').strip() for cid in cf_str.split(',') if cid.strip()]

    # Clean podbean IDs
    pb_ids = []
    if pb_str.strip():
        pb_ids = [pid.strip().strip('"').strip() for pid in pb_str.split(',') if pid.strip()]

    teachings.append({
        'id': int(tid),
        'slug': slug,
        'title': title,
        'description': desc[:500] if desc else '',
        'thumbnail_url': thumb,
        'cloudflare_ids': cf_ids,
        'podbean_ids': pb_ids,
        'content_type': ctype
    })

print(f"✅ Extracted {len(teachings)} teachings\n")
print("First 10:")
for i, t in enumerate(teachings[:10]):
    print(f"{i+1}. {t['title'][:60]}")
    print(f"   Cloudflare: {len(t['cloudflare_ids'])}, Podbean: {len(t['podbean_ids'])}")

# Save
with open('all_teachings_data.json', 'w') as f:
    json.dump(teachings, f, indent=2)

print(f"\n✅ Saved {len(teachings)} teachings to all_teachings_data.json")
