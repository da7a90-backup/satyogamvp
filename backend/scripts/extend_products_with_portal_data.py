#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path
from PyPDF2 import PdfReader
from playwright.sync_api import sync_playwright
import time

PDF_DIR = Path('./downloaded_pdfs')
PRODUCTS_FILE = './products_categorized.json'
OUTPUT_FILE = './products_categorized_extended.json'

def extract_portal_info_from_pdf(pdf_path):
    """Extract portal URL and credentials from PDF"""
    try:
        print(f"    Reading PDF: {pdf_path.name}")
        
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        
        print(f"    ✓ PDF parsed ({len(text)} chars)")
        
        # Extract portal URL
        url_patterns = [
            r'https?://[^\s<>"]+\.wixsite\.com[^\s<>"]*',
            r'https?://members\.satyoga\.org[^\s<>"]*',
            r'https?://www\.satyoga\.org[^\s<>"]*',
            r'https?://[^\s<>"]+\.weebly\.com[^\s<>"]*',
        ]
        
        portal_url = None
        for pattern in url_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                portal_url = matches[0].rstrip('.,;)')
                break
        
        # Extract credentials
        username_match = re.search(r'(?:Username|User|Login)[:\s]+([^\s<>"]+)', text, re.IGNORECASE)
        password_match = re.search(r'(?:Password|Pass)[:\s]+([^\s<>"]+)', text, re.IGNORECASE)
        
        username = username_match.group(1).rstrip('.,;)') if username_match else None
        password = password_match.group(1).rstrip('.,;)') if password_match else None
        
        if portal_url:
            print(f"    ✓ Found portal: {portal_url}")
            if username:
                print(f"    ✓ Found username: {username}")
            if password:
                print(f"    ✓ Found password: {password}")
            
            return {
                'url': portal_url,
                'username': username,
                'password': password
            }
        
        print(f"    ✗ No portal URL found")
        print(f"    PDF preview: {text[:200]}...")
        return None
        
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return None

def scrape_portal_media(browser, portal_info):
    """Scrape media from portal page"""
    try:
        print(f"    Accessing portal: {portal_info['url']}")
        
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        page.goto(portal_info['url'], wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        # Extract iframes
        iframes = page.query_selector_all('iframe')
        iframe_data = []
        for iframe in iframes:
            src = iframe.get_attribute('src')
            if src:
                iframe_data.append({
                    'src': src,
                    'title': iframe.get_attribute('title') or '',
                    'platform': detect_platform(src)
                })
        
        # Extract videos
        videos = page.query_selector_all('video')
        video_data = []
        for video in videos:
            src = video.get_attribute('src')
            if not src:
                source = video.query_selector('source')
                src = source.get_attribute('src') if source else None
            if src:
                video_data.append({
                    'src': src,
                    'type': 'video',
                    'platform': detect_platform(src)
                })
        
        # Extract audio
        audios = page.query_selector_all('audio, a[href$=".mp3"]')
        audio_data = []
        for audio in audios:
            if audio.get_attribute('href'):
                src = audio.get_attribute('href')
            else:
                src = audio.get_attribute('src')
                if not src:
                    source = audio.query_selector('source')
                    src = source.get_attribute('src') if source else None
            if src:
                audio_data.append({
                    'src': src,
                    'type': 'audio',
                    'platform': detect_platform(src)
                })
        
        # Get page headings for session detection
        headings = page.evaluate('''() => {
            return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
                level: parseInt(h.tagName.substring(1)),
                text: h.textContent.trim()
            }));
        }''')
        
        context.close()
        
        all_media = iframe_data + video_data + audio_data
        print(f"    ✓ Found {len(all_media)} media items")
        
        return {
            'iframes': iframe_data,
            'videos': video_data,
            'audios': audio_data,
            'headings': headings,
            'total_media': len(all_media)
        }
        
    except Exception as e:
        print(f"    ✗ Error scraping: {e}")
        return None

def detect_platform(url):
    """Detect media platform from URL"""
    if not url:
        return 'unknown'
    
    url_lower = url.lower()
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'youtube'
    elif 'vimeo.com' in url_lower:
        return 'vimeo'
    elif 'cloudflare' in url_lower:
        return 'cloudflare'
    elif 'podbean' in url_lower:
        return 'podbean'
    elif '.mp3' in url_lower or '.m4a' in url_lower:
        return 'direct_audio'
    elif '.mp4' in url_lower:
        return 'direct_video'
    
    return 'unknown'

def main():
    print('=' * 70)
    print('EXTENDING PRODUCTS WITH PORTAL DATA (Python)')
    print('=' * 70 + '\n')
    
    # Load products
    with open(PRODUCTS_FILE) as f:
        products_data = json.load(f)
    
    products = products_data['all']
    print(f"Loaded {len(products)} products\n")
    
    # Find products with PDFs
    products_with_pdfs = [p for p in products if p.get('downloads')]
    print(f"Found {len(products_with_pdfs)} products with downloads\n")
    
    # Launch browser
    print("Launching browser...\n")
    
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        
        # Process each product
        extended_products = []
        for i, product in enumerate(products[:5]):  # Test with first 5
            print(f"\n[{i+1}/5] Processing: {product['name']}")
            
            portal_data = {
                'has_portal': False,
                'portal_url': None,
                'credentials': {},
                'media': [],
                'total_media': 0,
                'parse_errors': []
            }
            
            # Check for PDFs
            if not product.get('downloads'):
                print("  ⊘ No downloads")
                extended_products.append({**product, 'portal_data': portal_data})
                continue
            
            # Look for matching PDF
            for download in product['downloads']:
                if not download['url'].endswith('.pdf'):
                    continue
                
                # Find local PDF
                pdf_name = Path(download['url']).name.split('?')[0]
                pdf_path = PDF_DIR / pdf_name
                
                if not pdf_path.exists():
                    print(f"  ⊘ PDF not found: {pdf_name}")
                    continue
                
                # Extract portal info
                portal_info = extract_portal_info_from_pdf(pdf_path)
                if not portal_info:
                    continue
                
                portal_data['has_portal'] = True
                portal_data['portal_url'] = portal_info['url']
                portal_data['credentials'] = {
                    'username': portal_info['username'],
                    'password': portal_info['password']
                }
                
                # Scrape portal
                media = scrape_portal_media(browser, portal_info)
                if media:
                    portal_data['media'] = media
                    portal_data['total_media'] = media['total_media']
                
                time.sleep(2)  # Be polite
                break
            
            extended_products.append({**product, 'portal_data': portal_data})
        
        browser.close()
    
    # Save results
    output_data = {
        'all': extended_products,
        'metadata': {
            'total_products': len(extended_products),
            'products_with_portals': sum(1 for p in extended_products if p['portal_data']['has_portal']),
            'total_media': sum(p['portal_data']['total_media'] for p in extended_products)
        }
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print('\n' + '=' * 70)
    print('SUMMARY:')
    print(f"  Products processed: {output_data['metadata']['total_products']}")
    print(f"  Products with portals: {output_data['metadata']['products_with_portals']}")
    print(f"  Total media items: {output_data['metadata']['total_media']}")
    print(f"\n  ✅ Saved to: {OUTPUT_FILE}")
    print('=' * 70)

if __name__ == '__main__':
    main()
