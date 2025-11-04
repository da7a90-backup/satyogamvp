#!/usr/bin/env python3
"""Parse ALL teachings from data.ts and generate seed script"""
import json
import re
from datetime import datetime

# Read data.ts file
with open('../../src/lib/data.ts', 'r') as f:
    content = f.read()

# Find the export const data line
match = re.search(r'export const data = (\{.*)', content, re.DOTALL)
if not match:
    print("Could not find data export")
    exit(1)

# Extract the JSON part - everything from opening brace to the end
json_str = match.group(1)

# Find where the JSON object ends (before the closing of export)
# Look for the pattern that closes the main object
json_str = json_str.split('};')[0] + '}'

# Try to parse as JSON (won't work due to TypeScript syntax)
# So let's extract teachings manually

teachings_list = []

# Find all teaching objects
pattern = r'\{\s*"id":\s*(\d+),\s*"type":\s*"post".*?"slug":\s*"([^"]+)".*?"title":\s*"([^"]+)".*?"excerpt_text":\s*"([^"]*)".*?"featured_media":\s*\{\s*"id":\s*\d+,\s*"url":\s*"([^"]+)".*?"cloudflare_ids":\s*\[([^\]]*)\].*?"podbean_ids":\s*\[([^\]]*)\].*?"content_type":\s*"([^"]+)"'

matches = re.finditer(pattern, content, re.DOTALL)

for i, match in enumerate(matches):
    teaching_id = match.group(1)
    slug = match.group(2)
    title = match.group(3)
    description = match.group(4)[:200]  # Truncate long descriptions
    thumbnail_url = match.group(5)
    cloudflare_str = match.group(6)
    podbean_str = match.group(7)
    content_type = match.group(8)

    # Parse cloudflare IDs
    cloudflare_ids = []
    if cloudflare_str.strip():
        cloudflare_ids = [cid.strip('"') for cid in cloudflare_str.split(',') if cid.strip()]

    # Parse podbean IDs
    podbean_ids = []
    if podbean_str.strip():
        podbean_ids = [pid.strip('"') for pid in podbean_str.split(',') if pid.strip()]

    teaching = {
        'id': teaching_id,
        'slug': slug,
        'title': title,
        'description': description,
        'thumbnail_url': thumbnail_url,
        'cloudflare_ids': cloudflare_ids,
        'podbean_ids': podbean_ids,
        'content_type': content_type
    }

    teachings_list.append(teaching)

    if i < 10:  # Print first 10
        print(f"{i+1}. {title[:50]}")
        print(f"   Slug: {slug}")
        print(f"   Cloudflare: {cloudflare_ids}")
        print(f"   Podbean: {podbean_ids}")
        print()

print(f"\n✅ Found {len(teachings_list)} teachings total")

# Save to JSON for the seed script to use
with open('all_teachings_data.json', 'w') as f:
    json.dump(teachings_list, f, indent=2)

print(f"✅ Saved to all_teachings_data.json")
