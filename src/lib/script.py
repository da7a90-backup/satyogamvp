import requests
import json
import html
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import unicodedata
import time

# === Config ===
STRAPI_URL = "http://127.0.0.1:1337"
API_TOKEN = "3e988fb77d15e62ec3fb9e328b8e978cbac4fbae96188de67e30057f49f33b0905bf720d44f011eccc27f2ee3a0ed542a840b85826219fa311389e42b1842814c4a771b49f697713036898c0c9d01abfc54d0e2f06a1f10225c7ce464583996ae3f7c99db9b14af1b68269d7f5fda74371c54bc5e531c1a59f29ab8b0a89180e"
MAX_WORKERS = 3  # Reduced from 10 to avoid overwhelming the API
ENABLE_PARALLEL = True  # Set to True after testing sequential import

headers = {
    "Authorization": f"Bearer {API_TOKEN}"
}

# === Load JSON ===
with open("teachings_data.json", "r", encoding="utf-8") as f:
    teachings = json.load(f)

print(f"Loaded {len(teachings)} teachings.")

# === Global counters ===
success_count = 0
error_count = 0
skip_count = 0
update_count = 0

# === Improved utilities ===

def sanitize_text_block(text):
    if not isinstance(text, str):
        return None
    
    try:
        # Only decode unicode escapes if they actually exist
        if '\\u' in text:
            text = text.encode('utf-8').decode('unicode_escape')
    except Exception as e:
        print(f"  ⚠️  Unicode decode warning: {e}")
        # Continue with original text
    
    try:
        text = html.unescape(text)
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text if text else None
    except Exception as e:
        print(f"  ⚠️  Text sanitization warning: {e}")
        return str(text) if text else None

def build_content_blocks(raw_content, title="(no title)"):
    blocks = []
    if not raw_content or not isinstance(raw_content, str):
        print(f"  ⚠️  Empty content for '{title[:50]}...'")
        return []

    try:
        # Handle escape sequences
        raw_content = raw_content.replace("\\n", "\n")
        raw_content = raw_content.replace("\\r", "\r")
        raw_content = raw_content.replace("\\t", "\t")
        
        # Decode HTML entities
        raw_content = html.unescape(raw_content)
        
        # Normalize unicode
        raw_content = unicodedata.normalize("NFKC", raw_content)
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in raw_content.split("\n\n") if p.strip()]

        for i, para in enumerate(paragraphs):
            para = re.sub(r"<[^>]+>", "", para).strip()
            
            if not para:
                continue
                
            if not isinstance(para, str):
                print(f"  ⚠️  Non-string paragraph in '{title[:30]}...': {type(para)}")
                continue

            blocks.append({
                "type": "paragraph",
                "children": [{"text": para, "type": "text"}]
            })

    except Exception as e:
        print(f"  ❌  Content processing error for '{title[:30]}...': {e}")
        # Return a simple fallback block
        fallback_text = str(raw_content)[:500] + "..." if len(str(raw_content)) > 500 else str(raw_content)
        blocks = [{
            "type": "paragraph",
            "children": [{"text": fallback_text, "type": "text"}]
        }]

    return blocks

def upload_image(url, title=""):
    if not url:
        return None
        
    try:
        print(f"  📸  Uploading image for '{title[:30]}...': {url}")
        response = requests.get(url, timeout=30)  # Increased timeout
        
        if response.status_code != 200:
            print(f"  ⚠️  Image download failed (status {response.status_code}): {url}")
            return None
            
        # Get filename from URL
        filename = url.split("/")[-1]
        if not filename or '.' not in filename:
            filename = "image.jpg"
            
        files = {
            "files": (
                filename,
                response.content,
                response.headers.get("Content-Type", "image/jpeg")
            )
        }
        
        upload_res = requests.post(f"{STRAPI_URL}/api/upload", files=files, headers=headers, timeout=30)
        
        if upload_res.status_code == 200:
            uploaded_files = upload_res.json()
            if uploaded_files and len(uploaded_files) > 0:
                print(f"  ✅  Image uploaded successfully: {uploaded_files[0]['id']}")
                return uploaded_files[0]["id"]
        else:
            print(f"  ⚠️  Image upload failed (status {upload_res.status_code}): {upload_res.text[:200]}")
            
    except Exception as e:
        print(f"  ⚠️  Image upload exception for {url}: {e}")
    
    return None

def get_existing_entry(wordpress_id=None, slug=None):
    """Returns the existing entry data if found, None otherwise"""
    try:
        if wordpress_id:
            res = requests.get(
                f"{STRAPI_URL}/api/teachings?filters[wordpressId][$eq]={wordpress_id}", 
                headers=headers,
                timeout=10
            )
        elif slug:
            res = requests.get(
                f"{STRAPI_URL}/api/teachings?filters[slug][$eq]={slug}", 
                headers=headers,
                timeout=10
            )
        else:
            return None
            
        if res.status_code == 200:
            data = res.json()
            if data["meta"]["pagination"]["total"] > 0:
                return data["data"][0]  # Return the first matching entry
        else:
            print(f"  ⚠️  Error checking for existing entry (status {res.status_code})")
            
    except Exception as e:
        print(f"  ⚠️  Error checking for existing entry: {e}")
        
    return None

def entry_exists(wordpress_id=None, slug=None):
    """Simple check if entry exists"""
    return get_existing_entry(wordpress_id, slug) is not None

def update_teaching_publish_date(existing_entry, publish_date, title):
    """Update an existing teaching with publishDate"""
    try:
        entry_id = existing_entry["id"]
        
        # Check if publishDate is already set
        current_publish_date = existing_entry.get("attributes", {}).get("publishDate")
        if current_publish_date:
            print(f"  ⏩  PublishDate already set for '{title[:50]}...': {current_publish_date}")
            return f"⏩ PublishDate already set: {title}"
        
        payload = {
            "data": {
                "publishDate": publish_date
            }
        }
        
        print(f"  📝  Updating publishDate for '{title[:50]}...' (ID: {entry_id})")
        res = requests.put(f"{STRAPI_URL}/api/teachings/{entry_id}", json=payload, headers=headers, timeout=30)
        
        if res.status_code in (200, 201):
            print(f"  ✅  Updated publishDate: {title[:50]}...")
            return f"✅ Updated publishDate: {title}"
        else:
            print(f"  ❌  Update failed (status {res.status_code}): {res.text[:300]}")
            return f"❌ Update failed: {title} - {res.status_code}"
            
    except Exception as e:
        print(f"  ❌  Exception during update: {e}")
        return f"❌ Exception updating {title}: {e}"

# === Main import function ===

def import_teaching(data, index=0):
    global success_count, error_count, skip_count, update_count
    
    title = data.get("title", f"Untitled {index}")
    slug = data.get("slug", f"untitled-{index}")
    wordpress_id = data.get("wordpressId")
    publish_date = data.get("date", "")

    print(f"\n[{index+1}/{len(teachings)}] Processing: {title[:60]}...")

    # Check if entry already exists
    existing_entry = get_existing_entry(wordpress_id=wordpress_id, slug=slug)
    
    if existing_entry:
        print(f"  📋  Found existing entry: {title[:50]}...")
        result = update_teaching_publish_date(existing_entry, publish_date, title)
        if "Updated publishDate" in result:
            update_count += 1
        elif "already set" in result:
            skip_count += 1
        else:
            error_count += 1
        return result

    # Entry doesn't exist, create new one
    print(f"  🆕  Creating new entry: {title[:50]}...")

    # Upload image (but don't fail if it doesn't work)
    image_id = None
    if data.get("featuredImage"):
        image_id = upload_image(data.get("featuredImage"), title)

    # Build content blocks
    content_blocks = build_content_blocks(data.get("content", ""), title)
    
    if not content_blocks:
        print(f"  ⚠️  No content blocks created for: {title[:50]}...")

    # Create payload
    payload = {
        "data": {
            "title": title,
            "slug": slug,
            "contenttype": data.get("contenttype", "teaching"),
            "description": data.get("description", ""),
            "summary": data.get("summary", ""),
            "content": content_blocks,
            "featuredImage": image_id,
            "videoUrl": data.get("videoUrl", ""),
            "videoPlatform": data.get("videoPlatform", "none"),
            "videoId": data.get("videoId", ""),
            "audioUrl": data.get("audioUrl", ""),
            "audioPlatform": data.get("audioPlatform", "none"),
            "duration": data.get("duration", ""),
            "access": data.get("access", "anon"),
            "hiddenTags": data.get("hiddenTags", ""),
            "wordpressId": wordpress_id,
            "transcription": data.get("transcription", ""),
            "source_file": data.get("source_file", ""),
            "publishDate": publish_date
        }
    }

    # Validate payload is JSON serializable
    try:
        json.dumps(payload, ensure_ascii=False)
    except Exception as e:
        print(f"  ❌  Payload serialization error: {e}")
        error_count += 1
        return f"❌ Serialization failed: {title} - {e}"

    # Make API call
    try:
        print(f"  📤  Sending to API...")
        res = requests.post(f"{STRAPI_URL}/api/teachings", json=payload, headers=headers, timeout=30)
        
        if res.status_code in (200, 201):
            print(f"  ✅  Success: {title[:50]}...")
            success_count += 1
            return f"✅ Imported: {title}"
        else:
            print(f"  ❌  API error (status {res.status_code}): {res.text[:300]}")
            error_count += 1
            return f"❌ Failed: {title} - {res.status_code} - {res.text[:100]}"
            
    except Exception as e:
        print(f"  ❌  Exception during import: {e}")
        error_count += 1
        return f"❌ Exception importing {title}: {e}"

# === Import functions ===

def run_sequential_import():
    """Import teachings one by one (safer for debugging)"""
    print("\n=== Running Sequential Import ===")
    
    for index, teaching in enumerate(teachings):
        result = import_teaching(teaching, index)
        print(f"Result: {result}")
        
        # Small delay to avoid overwhelming the API
        time.sleep(0.5)
        
        # Progress update every 10 items
        if (index + 1) % 10 == 0:
            print(f"\n--- Progress Update ---")
            print(f"Processed: {index + 1}/{len(teachings)}")
            print(f"New imports: {success_count}, Updates: {update_count}, Errors: {error_count}, Skipped: {skip_count}")
            print("----------------------\n")

def run_parallel_import():
    """Import teachings in parallel (faster but harder to debug)"""
    print("\n=== Running Parallel Import ===")
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks with index
        futures = [executor.submit(import_teaching, t, i) for i, t in enumerate(teachings)]
        
        # Process results as they complete
        for future in as_completed(futures):
            try:
                result = future.result()
                print(result)
            except Exception as e:
                print(f"❌ Thread exception: {e}")
                error_count += 1

def print_final_summary():
    print(f"\n{'='*50}")
    print(f"FINAL SUMMARY")
    print(f"{'='*50}")
    print(f"Total teachings: {len(teachings)}")
    print(f"New imports: {success_count}")
    print(f"Updated with publishDate: {update_count}")
    print(f"Errors: {error_count}")
    print(f"Skipped (publishDate already set): {skip_count}")
    print(f"{'='*50}")

if __name__ == "__main__":
    start_time = time.time()
    
    if ENABLE_PARALLEL:
        run_parallel_import()
    else:
        run_sequential_import()
    
    print_final_summary()
    
    elapsed_time = time.time() - start_time
    print(f"Total time: {elapsed_time:.2f} seconds")