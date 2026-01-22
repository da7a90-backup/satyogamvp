"""
Update all retreat database URLs from satyoga.org to Cloudflare R2.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.retreat import Retreat

r2_base_url = "https://pub-e67be537d9c14db9ab71c556cf0b1ffa.r2.dev/retreat-audio"

def main():
    db = SessionLocal()

    print(f"{'='*80}")
    print(f"UPDATING RETREAT URLS FROM SATYOGA.ORG TO CLOUDFLARE R2")
    print(f"{'='*80}\n")

    retreats = db.query(Retreat).all()

    total_updated = 0
    retreats_updated = []

    for retreat in retreats:
        if not retreat.past_retreat_portal_media:
            continue

        media = retreat.past_retreat_portal_media
        if not isinstance(media, list):
            continue

        updated_media = []
        url_count = 0

        for item in media:
            if not isinstance(item, dict):
                updated_media.append(item)
                continue

            updated_item = item.copy()
            audio_url = item.get('audio_url') or item.get('audio')

            if audio_url and 'satyoga.org' in audio_url:
                filename = audio_url.split('/')[-1]
                new_url = f"{r2_base_url}/{filename}"

                # Update the appropriate field
                if 'audio_url' in item:
                    updated_item['audio_url'] = new_url
                elif 'audio' in item:
                    updated_item['audio'] = new_url

                url_count += 1

            updated_media.append(updated_item)

        if url_count > 0:
            retreat.past_retreat_portal_media = updated_media
            retreats_updated.append((retreat.title, url_count))
            total_updated += url_count
            print(f"✅ {retreat.title}")
            print(f"   Updated {url_count} URLs\n")

    db.commit()

    print(f"{'='*80}")
    print(f"UPDATE COMPLETE")
    print(f"{'='*80}")
    print(f"Total URLs updated: {total_updated}")
    print(f"Retreats updated: {len(retreats_updated)}")

    db.close()

if __name__ == "__main__":
    main()
