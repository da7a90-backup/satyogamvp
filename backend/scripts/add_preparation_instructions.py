"""
Script to add preparation instructions to a retreat.
This demonstrates the new rich content structure for preparation cards.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.retreat import Retreat
import json


def add_full_retreat_data(retreat_slug: str):
    """Add complete retreat data including preparation instructions, FAQs, live schedule, etc."""

    db = Session(engine)

    try:
        # Find the retreat
        retreat = db.query(Retreat).filter(Retreat.slug == retreat_slug).first()

        if not retreat:
            print(f"❌ Retreat with slug '{retreat_slug}' not found")
            return False

        # Invitation video URL
        retreat.invitation_video_url = "https://youtu.be/q8yIlc7jkeA"

        # Announcement
        retreat.announcement = "Lorem ipsum dolor sit amet consectetur. Sit hendrerit ornare porttitor eros malesuada lorem. Id velit at auctor bibendum interdum sem placerat nibh. Maecenas eget faucibus ullamcor hendrerit sit purus eu tellus leo. Scelerisque nisl odio donec mi elementum. Sagittis lorem suspendisse odio amet magna mauris libero."

        # About content
        retreat.about_content = "Lorem ipsum dolor sit amet consectetur. Potenti scelerisque odio vulputate est nulla sit at ultricies. Pellentesque nulla sed ac convallis egestas amet. Duis aenean consequat id hendrerit sit purus eu tellus leo. Scelerisque nisl odio donec mi elementum."

        # About image - using placeholder
        retreat.about_image_url = "/orbanner.png"

        # FAQs
        retreat.faq_data = [
            {
                "question": "What time are the Livestream Satsangs with Shunyamurti?",
                "answer": "The Livestream Satsangs with Shunyamurti are scheduled at 5:30 PM EST. Please check your local timezone and mark your calendar accordingly."
            },
            {
                "question": "Do I have to follow the live retreat schedule or can I create a schedule that best suits my home situation?",
                "answer": "While we encourage following the live schedule to experience the full retreat energy with the community, you can also participate at your own pace. All sessions will be recorded and available for viewing after they conclude."
            },
            {
                "question": "How do I use Zoom?",
                "answer": "You'll receive a Zoom link via email before the retreat begins. Simply click the link at the scheduled time, and you'll join the session. Make sure to download the Zoom app beforehand for the best experience. We recommend testing your audio and video settings before the first session."
            },
            {
                "question": "How do I view the satsangs?",
                "answer": "All satsangs will be accessible through your retreat portal in the 'Classes' tab. Live sessions can be joined via Zoom links provided in the 'Live Schedule' sidebar. Recorded sessions will be available in your portal after the live transmission."
            },
            {
                "question": "Where can I leave a question for Shunyamurti?",
                "answer": "You can submit questions through the Forum tab in your retreat portal. Questions submitted during live sessions may be addressed in real-time, while others will be collected for future Q&A sessions."
            },
            {
                "question": "What happens if the ashram loses electricity or the internet connection drops?",
                "answer": "In the rare event of technical difficulties at the ashram, we will notify all participants immediately through email and the retreat portal. The session will resume as soon as possible, and we will ensure all content is recorded and made available to you."
            }
        ]

        # Live Schedule (December 27-29, 2025)
        retreat.live_schedule = [
            {
                "date": "December 27th",
                "day_label": "Friday",
                "is_live": True,
                "sessions": [
                    {
                        "time": "5:30 pm",
                        "title": "Opening Livestream Satsang with Shunyamurti",
                        "description": "Join us for the opening session of this profound retreat experience.",
                        "youtube_live_url": "https://youtu.be/q8yIlc7jkeA",
                        "youtube_live_id": "q8yIlc7jkeA",
                        "thumbnail_url": "/orbanner.png",
                        "is_happening_now": True
                    }
                ]
            },
            {
                "date": "December 28th",
                "day_label": "Saturday",
                "is_live": False,
                "sessions": [
                    {
                        "time": "5:00 am",
                        "title": "Meditation via Zoom",
                        "description": "Morning meditation practice to center your awareness.",
                        "zoom_link": "https://zoom.us/j/123456789"
                    },
                    {
                        "time": "6:30 am",
                        "title": "Asana and Pranayama Practice via Zoom",
                        "description": "Gentle yoga and breathing exercises.",
                        "zoom_link": "https://zoom.us/j/123456789"
                    },
                    {
                        "time": "11:15 am",
                        "title": "Livestream Satsang with Shunyamurti",
                        "description": "Morning teaching and Q&A session.",
                        "youtube_live_url": "https://youtu.be/q8yIlc7jkeA",
                        "youtube_live_id": "q8yIlc7jkeA",
                        "thumbnail_url": "/orbanner.png"
                    },
                    {
                        "time": "5:30 pm",
                        "title": "Livestream Satsang with Shunyamurti",
                        "description": "Evening satsang and meditation.",
                        "youtube_live_url": "https://youtu.be/q8yIlc7jkeA",
                        "youtube_live_id": "q8yIlc7jkeA"
                    }
                ]
            },
            {
                "date": "December 29th",
                "day_label": "Sunday",
                "is_live": False,
                "sessions": [
                    {
                        "time": "6:30 am",
                        "title": "Morning meditation via zoom",
                        "description": "Closing meditation to integrate the retreat experience.",
                        "zoom_link": "https://zoom.us/j/123456789"
                    },
                    {
                        "time": "11:15 am",
                        "title": "Encounter group via zoom",
                        "description": "Final gathering and sharing circle.",
                        "zoom_link": "https://zoom.us/j/123456789",
                        "thumbnail_url": "/orbanner.png"
                    }
                ]
            }
        ]

        # Sample preparation instructions matching the image layout
        preparation_instructions = [
            {
                "title": "A Sacred Space for Transformation",
                "content": [
                    "Please minimize any distractions this weekend. Eat lightly of high vibrational vegetarian food (eat only if you feel truly hungry). Meditate for as many hours a day as you can find time for. This will prepare you to receive more light. To the degree that you can free yourself of daily obligations this retreat will be an opportunity for the hearted seeker of Absolute Enlightenment to make a quantum leap of consciousness.",
                ],
                "expandable": False
            },
            {
                "title": "Setting Your Intention",
                "content": [
                    "This retreat is a once in a lifetime opportunity for those who are prepared. Set your intention now to take full advantage of the spiritual alchemy that will be offered during this sacred journey, please prepare yourself carefully during the coming weeks.",
                ],
                "expandable": False
            },
            {
                "title": "A Sacred Space At Home",
                "contentPreview": "Create an environment that is conducive to a Shunyamurti retreat, here are some pointers for you to take into consideration as you prepare...",
                "content": [
                    "Create an environment that is conducive to a Shunyamurti retreat, here are some pointers for you to take into consideration as you prepare:",
                ],
                "bullets": [
                    "Create a sacred space near your computer that is conducive to meditation, free from loud noises, clutter, and other distractions, as well as any interruptions from other beings.",
                    "Organize the physical body and the environment in a way that enables you to receive the spiritual transmissions.",
                    "Engage in centering periods of silence, and time for your personal reflection and contemplation throughout the week.",
                    "Maintain the physical body via treated with a healthy cleanse guided by ayurveda or similar spiritual practices. During this retreat, your body should be received as a temple to house a powerful meditation, teaching and transmission of divine wisdom and love.",
                    "Participate in light yogasanas/meditation and can remain centred in this way throughout your daily preparations ahead of the session ends.",
                    "Turn off your phone and remain offline as much as possible in between Teachings (all immediately after the session ends)."
                ],
                "expandable": True
            },
            {
                "title": "Creating a daily schedule",
                "contentPreview": "This weekend will be centered around four sacred ceremonies for preparation, beginning with a morning early morning meditation...",
                "content": [
                    "This weekend will be centered around four sacred ceremonies for preparation, beginning with a morning early morning meditation. As a gentle, soul-guided morning ceremony, please consider starting with:",
                    "",
                    "The gathering creates a purified and unified energy field enabling the clearing of the soul, planting of deeper meditation states, and the power of heart-centered intention for the session.",
                    "",
                    "Shunyamurti has asked that this retreat not be used to try during all the preparation time and suggests now that the retreat is soon, please start looking at inner spiritual tools for the transformation.",
                    "",
                    "We are delighted to create events participation and the offering community live practices for self-atman transformation. These preparations give you an opportunity to integrate moments and the time these new spaces for such a teaching and plethora of retreat."
                ],
                "expandable": True
            },
            {
                "title": "Early morning meditation",
                "content": [
                    "As a gentle, soul-guided morning ceremony, we will starting our time here with a pre-dawn meditation every morning of the retreat. This gathering creates a purified and unified energy field enabling the clearing of the soul-energy, planting of deeper meditation Wisdom practices, and the power of heart-centered-action in the group. The gathering creates a purified and unified energy field enabling the gathering enables the clearing of the mind, body and opens pathways within and out of the body heart-womb connection throughout this lifetime and all its other forms, all through a very powerful embodied technique cultivating presence within the formless (as well as the moment) through the collective unified container of the present. Our first morning mediation is before dawn.",
                    "",
                    "During retreats, we all engage together with this time to prepare the gathering for next morning's teaching journey and so Shunyamurti has asked that this place only that the start for reflections of silence, inner contemplation and practice of light body-heart energies."
                ],
                "expandable": True
            },
            {
                "title": "The Ancient Practice of Yoga",
                "content": [
                    "In this exquisite morning teaching, Shunyamurti engages the ancient wisdom of Aham Vidya (the Yoga of Selfhood) to deepen the understanding within the practice of Self- inquiry. The teachings in the great beauty of  Aham  Vimarsana and the Self through this exquisitely cultivated technique show that this simple practice to meditate on the the emptiness is an absolute technique because this meditation brings unity of heart and enables surrender before  I Am.",
                ],
                "videoUrl": "dQw4w9WgXcQ",
                "videoType": "youtube",
                "expandable": True
            }
        ]

        # Update the retreat with all data
        retreat.preparation_instructions = preparation_instructions

        db.commit()
        print(f"✅ Successfully updated retreat '{retreat.title}'")
        print(f"   - Added {len(preparation_instructions)} preparation instructions")
        print(f"   - Added {len(retreat.faq_data)} FAQs")
        print(f"   - Added {len(retreat.live_schedule)} days of live schedule")
        print(f"   - Added invitation video, announcement, and about content")
        print(f"   Retreat slug: {retreat.slug}")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        return False

    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        retreat_slug = sys.argv[1]
    else:
        # Default to a retreat slug if not provided
        retreat_slug = input("Enter retreat slug (or press Enter for 'hopeless-yet-hilarious'): ").strip()
        if not retreat_slug:
            retreat_slug = "hopeless-yet-hilarious"

    add_full_retreat_data(retreat_slug)
