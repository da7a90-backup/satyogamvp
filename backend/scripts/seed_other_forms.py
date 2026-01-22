"""
Seed script to create Scholarship and Help Us Improve forms
Run: python backend/scripts/seed_other_forms.py
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.form_templates import FormTemplate, FormQuestion, FormCategory, QuestionType
from app.models.user import User
import uuid

def seed_other_forms():
    db: Session = SessionLocal()

    try:
        # Get admin user
        admin_user = db.query(User).filter(User.is_admin == True).first()
        admin_id = admin_user.id if admin_user else None

        # ============ SCHOLARSHIP APPLICATION ============
        print("Creating Scholarship Application Form...")
        scholarship_form = FormTemplate(
            id=uuid.uuid4(),
            slug="scholarship-application",
            name="Scholarship Application",
            category=FormCategory.SCHOLARSHIP,
            title="Retreat Scholarship Application",
            description="Apply for financial assistance to attend a Sat Yoga retreat",
            introduction="""
            <p>Welcome to the Sat Yoga Scholarship Application.</p>
            <p>We offer partial scholarships to sincere seekers who would not otherwise be able to attend our retreats due to financial constraints.</p>
            <p>Scholarships are limited and awarded based on genuine need and alignment with our teachings.</p>
            <p>Please complete this application honestly and thoroughly.</p>
            """,
            is_active=True,
            is_multi_page=False,
            requires_auth=False,
            allow_anonymous=True,
            success_message="Thank you for your scholarship application! We will review it and contact you within 7-10 business days.",
            send_confirmation_email=True,
            notification_emails=["scholarships@satyoga.org"],
            created_by=admin_id
        )
        db.add(scholarship_form)
        db.flush()

        scholarship_questions = [
            # Personal Information
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Full Name",
                description="Your full legal name",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=0,
                section_heading="Personal Information"
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Email Address",
                question_type=QuestionType.EMAIL,
                is_required=True,
                page_number=1,
                order_index=1
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Phone Number",
                question_type=QuestionType.TEL,
                is_required=True,
                page_number=1,
                order_index=2
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Country of Residence",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=3
            ),
            # Retreat Selection
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Which retreat are you applying to attend?",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=4,
                section_heading="Retreat Information",
                placeholder="E.g., Shakti Retreat - March 2025"
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Have you attended a Sat Yoga retreat or program before?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=5,
                options=["Yes", "No"]
            ),
            # Financial Need
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Please describe your current financial situation",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=6,
                section_heading="Financial Need",
                placeholder="Please be honest about your financial circumstances and why you need assistance..."
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="What amount can you contribute toward the retreat cost?",
                question_type=QuestionType.NUMBER,
                is_required=True,
                page_number=1,
                order_index=7,
                placeholder="Amount in USD"
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="What percentage of scholarship assistance are you requesting?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=8,
                options=["25%", "50%", "75%", "Full scholarship (100%)"]
            ),
            # Motivation & Commitment
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Why do you want to attend this retreat?",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=9,
                section_heading="Motivation & Commitment",
                placeholder="Please share your spiritual journey and what draws you to this retreat..."
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="How do you plan to integrate the retreat teachings into your life?",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=10,
                placeholder="Please describe your commitment to the spiritual path..."
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Are you familiar with Shunyamurti's teachings?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=11,
                options=["Very familiar - I regularly watch/listen", "Somewhat familiar", "Just beginning to explore"]
            ),
            FormQuestion(
                form_template_id=scholarship_form.id,
                question_text="Is there anything else you would like us to know about your application?",
                question_type=QuestionType.TEXTAREA,
                is_required=False,
                page_number=1,
                order_index=12,
                placeholder="Optional additional information..."
            ),
        ]

        for q in scholarship_questions:
            db.add(q)

        print(f"✓ Created Scholarship Application with {len(scholarship_questions)} questions")

        # ============ HELP US IMPROVE / FEEDBACK FORM ============
        print("Creating Help Us Improve Feedback Form...")
        feedback_form = FormTemplate(
            id=uuid.uuid4(),
            slug="help-us-improve",
            name="Help Us Improve",
            category=FormCategory.FEEDBACK,
            title="Help Us Improve Sat Yoga",
            description="Share your feedback, suggestions, or report issues",
            introduction="""
            <p>Your feedback helps us improve Sat Yoga and serve the sangha better.</p>
            <p>Whether you have a suggestion, found a bug, or want to share your experience, we want to hear from you.</p>
            <p>Thank you for taking the time to help us improve!</p>
            """,
            is_active=True,
            is_multi_page=False,
            requires_auth=False,
            allow_anonymous=True,
            success_message="Thank you for your feedback! We review all submissions and appreciate your input.",
            send_confirmation_email=False,
            notification_emails=["feedback@satyoga.org"],
            created_by=admin_id
        )
        db.add(feedback_form)
        db.flush()

        feedback_questions = [
            # Contact Info (Optional)
            FormQuestion(
                form_template_id=feedback_form.id,
                question_text="Name (Optional)",
                description="You can submit feedback anonymously if you prefer",
                question_type=QuestionType.TEXT,
                is_required=False,
                page_number=1,
                order_index=0,
                section_heading="Contact Information (Optional)"
            ),
            FormQuestion(
                form_template_id=feedback_form.id,
                question_text="Email (Optional)",
                description="Provide your email if you'd like us to follow up",
                question_type=QuestionType.EMAIL,
                is_required=False,
                page_number=1,
                order_index=1
            ),
            # Feedback Type
            FormQuestion(
                form_template_id=feedback_form.id,
                question_text="What type of feedback are you providing?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=2,
                section_heading="Feedback Type",
                options=[
                    "Website Issue/Bug",
                    "Feature Suggestion",
                    "Content Feedback",
                    "Retreat Experience",
                    "General Feedback",
                    "Other"
                ]
            ),
            # Feedback Area
            FormQuestion(
                form_template_id=feedback_form.id,
                question_text="Which area does this relate to?",
                question_type=QuestionType.CHECKBOX,
                is_required=False,
                page_number=1,
                order_index=3,
                options=[
                    "Website Navigation",
                    "Online Teachings",
                    "Courses",
                    "Retreats",
                    "Store/Dharma Bandhara",
                    "User Dashboard",
                    "Payment System",
                    "Email Communications"
                ],
                allow_other=True
            ),
            # Detailed Feedback
            FormQuestion(
                form_template_id=feedback_form.id,
                question_text="Please share your feedback in detail",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=4,
                section_heading="Your Feedback",
                placeholder="Please be as specific as possible. If reporting a bug, include steps to reproduce it..."
            ),
            # Priority/Severity
            FormQuestion(
                form_template_id=feedback_form.id,
                question_text="How would you rate the importance/urgency of this feedback?",
                question_type=QuestionType.RADIO,
                is_required=False,
                page_number=1,
                order_index=5,
                options=[
                    "Critical - Blocking my use of the site",
                    "High - Significant issue or important suggestion",
                    "Medium - Moderate improvement",
                    "Low - Nice to have",
                    "Not sure"
                ]
            ),
            # Screenshots/Files
            FormQuestion(
                form_template_id=feedback_form.id,
                question_text="Upload Screenshots or Files (Optional)",
                description="If reporting a bug, screenshots are very helpful",
                question_type=QuestionType.FILE,
                is_required=False,
                page_number=1,
                order_index=6,
                allowed_file_types=["image/*", "application/pdf"],
                max_file_size=5242880  # 5MB
            ),
        ]

        for q in feedback_questions:
            db.add(q)

        print(f"✓ Created Help Us Improve form with {len(feedback_questions)} questions")

        db.commit()
        print("\n✅ Successfully created Scholarship and Feedback forms!")
        print("\nForm slugs:")
        print("  - scholarship-application")
        print("  - help-us-improve")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting scholarship and feedback forms seed...")
    seed_other_forms()
    print("Done!")
