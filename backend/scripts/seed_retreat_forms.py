"""
Seed script to create retreat application form templates (Shakti, Darshan, Sevadhari)
Run: python backend/scripts/seed_retreat_forms.py
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.form_templates import FormTemplate, FormQuestion, FormCategory, QuestionType
from app.models.user import User
import uuid

def seed_retreat_forms():
    db: Session = SessionLocal()

    try:
        # Get admin user (or create a system user)
        admin_user = db.query(User).filter(User.is_admin == True).first()
        admin_id = admin_user.id if admin_user else None

        # ============ SHAKTI RETREAT APPLICATION ============
        print("Creating Shakti Retreat Application Form...")
        shakti_form = FormTemplate(
            id=uuid.uuid4(),
            slug="shakti-retreat-application",
            name="Shakti Retreat Application",
            category=FormCategory.APPLICATION,
            title="Shakti Retreat Application",
            description="Apply for the Shakti Retreat - A transformative journey into the Divine Feminine",
            introduction="""
            <p>Welcome to the Shakti Retreat application process.</p>
            <p>The Shakti Retreat is designed for those seeking to awaken the Divine Feminine within and experience profound spiritual transformation.</p>
            <p>Please complete this application thoughtfully. We review each application individually to ensure the retreat is a good fit for all participants.</p>
            """,
            is_active=True,
            is_multi_page=False,
            requires_auth=False,
            allow_anonymous=True,
            success_message="Thank you for your application! We will review it and contact you within 3-5 business days.",
            send_confirmation_email=True,
            notification_emails=["applications@satyoga.org"],
            created_by=admin_id
        )
        db.add(shakti_form)
        db.flush()

        # Shakti questions
        shakti_questions = [
            # Personal Information
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Full Name",
                description="Your full legal name as it appears on your ID",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=0,
                section_heading="Personal Information"
            ),
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Email Address",
                question_type=QuestionType.EMAIL,
                is_required=True,
                page_number=1,
                order_index=1
            ),
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Phone Number",
                question_type=QuestionType.TEL,
                is_required=True,
                page_number=1,
                order_index=2
            ),
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Date of Birth",
                question_type=QuestionType.DATE,
                is_required=True,
                page_number=1,
                order_index=3
            ),
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Country of Residence",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=4
            ),
            # Retreat Experience
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Have you attended a retreat before?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=5,
                section_heading="Retreat Experience",
                options=["Yes, I have attended a Sat Yoga retreat", "Yes, at another center", "No, this will be my first retreat"]
            ),
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="What draws you to the Shakti Retreat?",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=6,
                placeholder="Please share what attracts you to this particular retreat..."
            ),
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Do you have any experience with meditation or spiritual practices?",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=7,
                placeholder="Please describe your experience..."
            ),
            # Health & Dietary
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Do you have any health conditions we should be aware of?",
                question_type=QuestionType.TEXTAREA,
                is_required=False,
                page_number=1,
                order_index=8,
                section_heading="Health & Dietary Information",
                placeholder="Please list any physical or mental health conditions..."
            ),
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="Dietary Restrictions or Preferences",
                question_type=QuestionType.CHECKBOX,
                is_required=False,
                page_number=1,
                order_index=9,
                options=["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "No restrictions"],
                allow_other=True
            ),
            # Commitment
            FormQuestion(
                form_template_id=shakti_form.id,
                question_text="I understand that the Shakti Retreat requires full participation in all scheduled activities",
                question_type=QuestionType.CHECKBOX,
                is_required=True,
                page_number=1,
                order_index=10,
                section_heading="Commitment Agreement",
                options=["I agree to participate fully in all scheduled activities"]
            ),
        ]

        for q in shakti_questions:
            db.add(q)

        print(f"✓ Created Shakti Retreat Application with {len(shakti_questions)} questions")

        # ============ DARSHAN RETREAT APPLICATION ============
        print("Creating Darshan Retreat Application Form...")
        darshan_form = FormTemplate(
            id=uuid.uuid4(),
            slug="darshan-retreat-application",
            name="Darshan Retreat Application",
            category=FormCategory.APPLICATION,
            title="Darshan Retreat Application",
            description="Apply for the Darshan Retreat - Direct transmission of spiritual wisdom",
            introduction="""
            <p>Welcome to the Darshan Retreat application process.</p>
            <p>Darshan retreats offer direct transmission of spiritual wisdom through satsang with Shunyamurti.</p>
            <p>Please complete this application with sincerity and openness.</p>
            """,
            is_active=True,
            is_multi_page=False,
            requires_auth=False,
            allow_anonymous=True,
            success_message="Thank you for your application! We will review it and contact you within 3-5 business days.",
            send_confirmation_email=True,
            notification_emails=["applications@satyoga.org"],
            created_by=admin_id
        )
        db.add(darshan_form)
        db.flush()

        # Darshan questions (similar structure to Shakti)
        darshan_questions = [
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Full Name",
                description="Your full legal name as it appears on your ID",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=0,
                section_heading="Personal Information"
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Email Address",
                question_type=QuestionType.EMAIL,
                is_required=True,
                page_number=1,
                order_index=1
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Phone Number",
                question_type=QuestionType.TEL,
                is_required=True,
                page_number=1,
                order_index=2
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Date of Birth",
                question_type=QuestionType.DATE,
                is_required=True,
                page_number=1,
                order_index=3
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Country of Residence",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=4
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="What is your intention for attending the Darshan Retreat?",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=5,
                section_heading="Spiritual Inquiry",
                placeholder="Please share your intention and what you hope to receive..."
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Do you have any experience with Sat Yoga teachings?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=6,
                options=["Yes, I am familiar with Shunyamurti's teachings", "Somewhat familiar", "No, this is my first contact"]
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Do you have any health conditions we should be aware of?",
                question_type=QuestionType.TEXTAREA,
                is_required=False,
                page_number=1,
                order_index=7,
                section_heading="Health & Dietary Information",
                placeholder="Please list any physical or mental health conditions..."
            ),
            FormQuestion(
                form_template_id=darshan_form.id,
                question_text="Dietary Restrictions or Preferences",
                question_type=QuestionType.CHECKBOX,
                is_required=False,
                page_number=1,
                order_index=8,
                options=["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "No restrictions"],
                allow_other=True
            ),
        ]

        for q in darshan_questions:
            db.add(q)

        print(f"✓ Created Darshan Retreat Application with {len(darshan_questions)} questions")

        # ============ SEVADHARI (KARMA YOGA) APPLICATION ============
        print("Creating Sevadhari (Karma Yoga) Application Form...")
        sevadhari_form = FormTemplate(
            id=uuid.uuid4(),
            slug="sevadhari-karma-yoga-application",
            name="Sevadhari Karma Yoga Application",
            category=FormCategory.APPLICATION,
            title="Sevadhari (Karma Yoga) Program Application",
            description="Apply to join the Sevadhari program - Service as spiritual practice",
            introduction="""
            <p>Welcome to the Sevadhari (Karma Yoga) Program application.</p>
            <p>The Sevadhari program offers an opportunity to practice selfless service as a path to spiritual awakening.</p>
            <p>Participants contribute to the ashram community while deepening their spiritual practice through work, meditation, and satsang.</p>
            <p>Please complete this application with honesty and clarity about your intentions.</p>
            """,
            is_active=True,
            is_multi_page=False,
            requires_auth=False,
            allow_anonymous=True,
            success_message="Thank you for your application! The Sevadhari coordinator will review it and contact you within 5-7 business days.",
            send_confirmation_email=True,
            notification_emails=["sevadhari@satyoga.org", "applications@satyoga.org"],
            created_by=admin_id
        )
        db.add(sevadhari_form)
        db.flush()

        # Sevadhari questions
        sevadhari_questions = [
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Full Name",
                description="Your full legal name as it appears on your ID",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=0,
                section_heading="Personal Information"
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Email Address",
                question_type=QuestionType.EMAIL,
                is_required=True,
                page_number=1,
                order_index=1
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Phone Number",
                question_type=QuestionType.TEL,
                is_required=True,
                page_number=1,
                order_index=2
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Date of Birth",
                question_type=QuestionType.DATE,
                is_required=True,
                page_number=1,
                order_index=3
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Country of Residence",
                question_type=QuestionType.TEXT,
                is_required=True,
                page_number=1,
                order_index=4
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Preferred Length of Stay",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=5,
                section_heading="Program Details",
                options=["1 month", "2-3 months", "4-6 months", "6+ months", "Open to discussion"]
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Preferred Start Date",
                question_type=QuestionType.DATE,
                is_required=True,
                page_number=1,
                order_index=6
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Why do you want to join the Sevadhari program?",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=7,
                section_heading="Intentions & Experience",
                placeholder="Please share your motivation and intentions..."
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Do you have any special skills or experience that would benefit the community?",
                question_type=QuestionType.TEXTAREA,
                is_required=False,
                page_number=1,
                order_index=8,
                placeholder="E.g., carpentry, cooking, gardening, teaching, tech skills, etc."
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Have you attended a Sat Yoga retreat or program before?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=9,
                options=["Yes", "No"]
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Do you have experience with meditation or spiritual practices?",
                question_type=QuestionType.TEXTAREA,
                is_required=True,
                page_number=1,
                order_index=10,
                placeholder="Please describe your practice and experience..."
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Do you have any health conditions we should be aware of?",
                question_type=QuestionType.TEXTAREA,
                is_required=False,
                page_number=1,
                order_index=11,
                section_heading="Health & Practical Information",
                placeholder="Please list any physical or mental health conditions..."
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Dietary Restrictions or Preferences",
                question_type=QuestionType.CHECKBOX,
                is_required=False,
                page_number=1,
                order_index=12,
                options=["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "No restrictions"],
                allow_other=True
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="Can you work outdoors in tropical climate conditions?",
                question_type=QuestionType.RADIO,
                is_required=True,
                page_number=1,
                order_index=13,
                options=["Yes, I am comfortable with outdoor work", "I prefer indoor work", "I am open to both"]
            ),
            FormQuestion(
                form_template_id=sevadhari_form.id,
                question_text="I understand that Sevadharis are expected to participate in daily meditation, karma yoga, and community activities",
                question_type=QuestionType.CHECKBOX,
                is_required=True,
                page_number=1,
                order_index=14,
                section_heading="Commitment Agreement",
                options=["I agree to participate fully in the Sevadhari program requirements"]
            ),
        ]

        for q in sevadhari_questions:
            db.add(q)

        print(f"✓ Created Sevadhari Application with {len(sevadhari_questions)} questions")

        db.commit()
        print("\n✅ Successfully created all 3 retreat application forms!")
        print("\nForm slugs:")
        print("  - shakti-retreat-application")
        print("  - darshan-retreat-application")
        print("  - sevadhari-karma-yoga-application")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting retreat forms seed...")
    seed_retreat_forms()
    print("Done!")
