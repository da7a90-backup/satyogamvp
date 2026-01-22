"""
Add sample portal media to the "live-free-of-anxiety" retreat for testing
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.retreat import Retreat
import json

def add_sample_media():
    db = SessionLocal()
    
    try:
        # Find the "live-free-of-anxiety" retreat
        retreat = db.query(Retreat).filter(Retreat.slug == "live-free-of-anxiety").first()
        
        if not retreat:
            print("Retreat not found!")
            return
        
        print(f"Found retreat: {retreat.title}")
        print(f"Current portal media: {retreat.past_retreat_portal_media}")
        
        # Create sample portal media (audio-video pairs for 3 days = 6 items)
        sample_media = [
            # Day 1 - Morning Audio
            {
                "title": "Day 1 Morning Session Audio",
                "subtitle": "Introduction to Living Free of Anxiety",
                "description": "Morning meditation and teaching on the foundations of anxiety-free living",
                "audio_url": "https://customer-46jkf2iw5vwf3rza.cloudflarestream.com/b5e0be4e4b0c4e7f9b5e0be4e4b0c4e7/downloads/default.mp4",
                "video_url": None,
                "order": 0
            },
            # Day 1 - Afternoon Video
            {
                "title": "Day 1 Afternoon Session Video",
                "subtitle": "Understanding the Root of Anxiety",
                "description": "Video teaching exploring the psychological and spiritual dimensions of anxiety",
                "audio_url": None,
                "video_url": "https://customer-46jkf2iw5vwf3rza.cloudflarestream.com/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/manifest/video.m3u8",
                "order": 1
            },
            # Day 2 - Morning Audio
            {
                "title": "Day 2 Morning Session Audio",
                "subtitle": "The Path to Inner Peace",
                "description": "Guided meditation and practices for cultivating serenity",
                "audio_url": "https://customer-46jkf2iw5vwf3rza.cloudflarestream.com/c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1/downloads/default.mp4",
                "video_url": None,
                "order": 2
            },
            # Day 2 - Afternoon Video
            {
                "title": "Day 2 Afternoon Session Video",
                "subtitle": "Releasing Fear and Embracing Trust",
                "description": "Deep dive into the nature of fear and the practice of trust",
                "audio_url": None,
                "video_url": "https://customer-46jkf2iw5vwf3rza.cloudflarestream.com/s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6/manifest/video.m3u8",
                "order": 3
            },
            # Day 3 - Morning Audio
            {
                "title": "Day 3 Morning Session Audio",
                "subtitle": "Sustaining Serenity in Daily Life",
                "description": "Practical guidance for maintaining inner peace",
                "audio_url": "https://customer-46jkf2iw5vwf3rza.cloudflarestream.com/i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1/downloads/default.mp4",
                "video_url": None,
                "order": 4
            },
            # Day 3 - Closing Video
            {
                "title": "Day 3 Closing Session Video",
                "subtitle": "Integration and Moving Forward",
                "description": "Final teachings and closing ceremony",
                "audio_url": None,
                "video_url": "https://customer-46jkf2iw5vwf3rza.cloudflarestream.com/y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6/manifest/video.m3u8",
                "order": 5
            },
        ]
        
        # Update the retreat with portal media
        retreat.past_retreat_portal_media = sample_media
        
        db.commit()
        
        print(f"\n✅ Successfully added {len(sample_media)} portal media items to '{retreat.title}'")
        print(f"\nMedia breakdown:")
        for i, item in enumerate(sample_media):
            day_num = i // 2 + 1
            media_type = "Audio" if item['audio_url'] else "Video"
            print(f"  Day {day_num} - {media_type}: {item['title']}")
        
        print(f"\nYou can now access this retreat at: /dashboard/user/retreats/{retreat.slug}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_media()
