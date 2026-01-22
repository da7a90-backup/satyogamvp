#!/usr/bin/env python3
"""
Seed complete retreat application forms with all questions
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.form_templates import FormTemplate, FormField, FieldType
from app.models.retreat import Retreat
from sqlalchemy.orm.attributes import flag_modified
import uuid

def create_common_fields():
    """Create common fields used across all retreat applications"""
    return [
        # Basic Information
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.EMAIL,
            label="Email Address",
            name="email",
            placeholder="Please provide the same email address used for your online membership",
            required=True,
            order=1
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="First Name",
            name="first_name",
            required=True,
            order=2
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="Last Name",
            name="last_name",
            required=True,
            order=3
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.SELECT,
            label="Retreat/Program Date",
            name="retreat_date",
            required=True,
            order=4,
            options=[]  # Will be populated per retreat
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.SELECT,
            label="Gender",
            name="gender",
            placeholder="What is your physiological category?",
            required=True,
            order=5,
            options=["Male", "Female"]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.DATE,
            label="Date of Birth",
            name="date_of_birth",
            placeholder="Example: 7 January 2019",
            required=True,
            order=6
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.NUMBER,
            label="Current Age",
            name="current_age",
            required=True,
            order=7
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.PHONE,
            label="Phone",
            name="phone",
            placeholder="Preferably mobile phone number",
            required=True,
            order=8
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.SELECT,
            label="Marital Status",
            name="marital_status",
            required=True,
            order=9,
            options=["Single", "Married", "Widowed", "Divorced", "Separated", "Partnership", "Celibate"]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="Nationality",
            name="nationality",
            required=True,
            order=10
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="Residence",
            name="residence",
            placeholder="Where do you live? Please state city, state/province, country.",
            required=True,
            order=11
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="Occupation",
            name="occupation",
            required=True,
            order=12
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Emergency Contact",
            name="emergency_contact",
            placeholder="Include name, relationship, city, state, country, phone number, email address.",
            required=True,
            order=13
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.FILE,
            label="Photo",
            name="photo",
            placeholder="Please upload a current photograph of yourself taken within the last year.",
            required=True,
            order=14
        ),
        # Personal Essay
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Please tell us why you wish to participate in a Sat Yoga Ashram event",
            name="personal_essay",
            placeholder="Write simply and from the heart, without worrying about language or style. You can give us a snapshot of your current life situation and how you envision your visit can be of benefit to you. You may be candid about any emotional wounds, unwanted behavior patterns, drug or alcohol dependencies, physical illnesses, or other issues that may come up or affect your stability and need healing during your stay. Suggested length: 2-3 paragraphs.",
            required=True,
            order=15
        ),
        # Sat Yoga Membership, Teachings & Spiritual Practice
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.SELECT,
            label="How did you hear about us?",
            name="connection",
            required=True,
            order=16,
            options=["I am a past visitor", "Word of Mouth", "Internet Search", "Newsletter", "Youtube", "Facebook", "Twitter", "Instagram", "Podcast", "Other"]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.SELECT,
            label="Are you currently a Sat Yoga online member?",
            name="membership_status",
            required=True,
            order=17,
            options=[
                "Yes, I am on a free trial.",
                "Yes, I am a Gyani Member.",
                "Yes, I am a Vigyani Member.",
                "Yes, I am a Pragyani Member.",
                "No, I am not currently an online member.",
                "Other"
            ]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="If you are a member, how long have you been a member?",
            name="membership_duration",
            placeholder="Please write N/A if you are not a member.",
            required=True,
            order=18
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you attended any of our past online retreats?",
            name="past_online_retreats",
            placeholder="If so, which retreats have you participated in? Please specify the month and year of each retreat.",
            required=True,
            order=19
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="How familiar are you with Shunyamurti's teachings?",
            name="teachings_familiarity",
            placeholder="Have you watched Shunyamurti's teachings online? What drew you to them and how have they helped you in your life? Is there a specific teaching that you particularly like, and, if so, why?",
            required=True,
            order=20
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.CHECKBOX,
            label="Have you read any of Shunyamurti's books?",
            name="books_read",
            placeholder="Please inform us which, if any, of these 4 books you have read.",
            required=True,
            order=21,
            options=[
                "The Transformational Imperative",
                "Coming Full Circle: The Secret of the Singularity",
                "The Dao of the Final Days",
                "The Seven Veils of Maya",
                "I have not read any of Shunyamurti's books."
            ]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you participated in healing atmanology sessions online?",
            name="atmanology_sessions",
            placeholder="If so, please specify the atmanologist you worked with, when these sessions took place (date and duration), and tell us briefly about your experience. If your sessions are ongoing, please include that information as well.",
            required=True,
            order=22
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Describe your current and previous spiritual or meditation practice",
            name="spiritual_practice",
            required=True,
            order=23
        ),
        # Health Information
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Health Conditions",
            name="health_conditions",
            placeholder="Do you have any medical/health conditions that may affect or limit your participation in our program?",
            required=True,
            order=24
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Are you currently ingesting any medications, any psychoactive substances, or herbal supplements?",
            name="medications",
            placeholder="Please list them.",
            required=True,
            order=25
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you had any surgeries in the last 5 years? Do you have any limitations due to past surgeries?",
            name="surgeries",
            required=True,
            order=26
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Do you have any history of anaphylaxis? If so, are you coming prepared with epinephrine or another form of treatment?",
            name="anaphylaxis_history",
            required=True,
            order=27
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you ever suffered any fainting spells, severe allergic reactions, asthma, or extreme anxiety states, panic attacks, or suicidal thoughts?",
            name="mental_health_history",
            placeholder="Please explain.",
            required=True,
            order=28
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you any other medical concerns that might affect you during your visit?",
            name="other_medical_concerns",
            required=True,
            order=29
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Diet",
            name="dietary_restrictions",
            placeholder="Our vegetarian ashram kitchen is gluten-free friendly, and whenever possible try to accommodate health related sensitivities or intolerances. Please tell us about any allergies or dietary restrictions you have, with medical details, so that we can best serve your needs.",
            required=True,
            order=30
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Allergies",
            name="allergies",
            placeholder="Do you have any specific allergies (food, medicine, stings/bites, seasonal, etc.). Please note that we have honey bees on our property.",
            required=True,
            order=31
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Sleeping Habits",
            name="sleeping_habits",
            placeholder="Do you have any sleeping habits that we should know of? For example, insomnia, light sleeper, snoring, sleep walking, etc.",
            required=True,
            order=32
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.RADIO,
            label="Did you receive any version of the covid injection?",
            name="covid_injection",
            placeholder="If so, please read our policy. If not, we strongly encourage you NOT to take the vaccine before coming to the ashram.",
            required=True,
            order=33,
            options=[
                "No, I have not taken the shot nor am planning to take it.",
                "Yes, I have taken the shot or have planned to do so before coming to the ashram."
            ]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you been living with anyone who has had the injection? If so, for how long and in what sort of relationship?",
            name="injection_contact_living",
            required=True,
            order=34
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you had close and prolonged physical contact with someone who had the injection within the past six months?",
            name="injection_contact_physical",
            placeholder="If so, please let us know if you have experienced any symptoms of either a psychological or somatic nature during this period.",
            required=True,
            order=35
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.RADIO,
            label="Do you have funds available to you to cover possible medical related costs that may be incurred while you are here at the ashram?",
            name="medical_funds",
            required=True,
            order=36,
            options=["Yes", "No"]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="Doctor Contact",
            name="doctor_contact",
            placeholder='If you have any current medical conditions, please provide the contact information of your doctor. Include name, phone number, and email address or "N/A" if this is not applicable to you.',
            required=True,
            order=37
        ),
        # Ashram Stay
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.CHECKBOX,
            label="Do you agree to follow our Ashram Guidelines during your stay?",
            name="ashram_guidelines_agreement",
            placeholder="To protect the integrity of this spiritual refuge, we want to ensure that all who come to stay with us have a complete understanding of our path and vision. Please review our ashram guidelines at https://www.satyoga.org/guidelines.",
            required=True,
            order=38,
            options=[
                "Yes, I have read and agree to follow the Ashram Guidelines",
                "No, I will have trouble following the Ashram Guidelines and will explain below"
            ]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Please explain here if you may have trouble following the Ashram Guidelines",
            name="ashram_guidelines_concerns",
            required=False,
            order=39
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Smoking Policy",
            name="smoking_policy",
            placeholder="The Ashram has a no smoking policy. Please let us know if you have been a smoker in the past or if you are currently trying to quit, or using nicotine patches/gum?",
            required=True,
            order=40
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.RADIO,
            label="Do you have funds available to you to cover the program contribution?",
            name="program_funds",
            required=True,
            order=41,
            options=["Yes", "No"]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.RADIO,
            label="Health Insurance",
            name="health_insurance",
            placeholder="If you are from outside Costa Rica, you will need to send us a copy of your health insurance policy valid for your time in Costa Rica. If you are from Costa Rica, you will need a valid caja card. Otherwise, you will need to purchase emergency travel insurance. Your acceptance is contingent on this document.",
            required=True,
            order=42,
            options=[
                "Yes",
                "No",
                "Not currently, but I would be able to get insurance if accepted to the program."
            ]
        ),
    ]

def create_sevadhari_specific_fields():
    """Create Sevadhari-specific fields"""
    return [
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXT,
            label="Passport Number",
            name="passport_number",
            required=True,
            order=43
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Why do you desire to study and serve at the Sat Yoga Ashram? What do you hope to gain from your experience?",
            name="seva_motivation",
            required=True,
            order=44
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="How would you describe your strengths and weaknesses?",
            name="strengths_weaknesses",
            placeholder="Please tell us about some of your strengths (interpersonal skills, how you deal with challenges, characteristics, talents, etc.) and weaknesses (areas in which you recognize room for growth and improvement) as you see them.",
            required=True,
            order=45
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="What does it mean for you to live in community?",
            name="community_living",
            placeholder="How would it challenge you? How would it help you grow? Are you comfortable with living and working in close quarters with others?",
            required=True,
            order=46
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Have you lived or stayed for an extended period of time in another ashram or community?",
            name="past_ashram_experience",
            placeholder="If so, which one? Please share your experience.",
            required=True,
            order=47
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.CHECKBOX,
            label="Please choose the areas in which you are most qualified to work",
            name="work_skills",
            placeholder="You may choose more than one.",
            required=True,
            order=48,
            options=[
                "Administration",
                "Agriculture",
                "Fundraising",
                "Gardens & Landscaping",
                "Healing & Healthcare",
                "Housekeeping & Hospitality",
                "Infrastructure & Construction",
                "Kitchen & Food Processing/Preservation",
                "Media & IT",
                "Outreach & Publications",
                "Other"
            ]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="What experience, training, or certifications do you have in the areas you chose?",
            name="work_experience",
            required=True,
            order=49
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.FILE,
            label="CV/Résumé",
            name="cv_resume",
            placeholder="Please upload a current curriculum vitae or résumé. Include links to work samples, YouTube channels, etc.",
            required=True,
            order=50
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Do you have a history of psychological difficulties or any prior diagnosis or treatment?",
            name="psychological_history",
            placeholder="Are you currently under the care of a therapist or psychiatrist? Do you have any emotional or mental conditions that might affect you during your stay? Please explain and, if applicable, include any history or current use of prescribed psycho-pharmaceutical medications, shamanic or psychedelic substances, alcohol, tobacco, or other drugs.",
            required=True,
            order=51
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.SELECT,
            label="How long are you able to commit for?",
            name="commitment_duration",
            placeholder="In general, we are interested in applicants who have the flexibility to make a commitment for at least three to six months.",
            required=True,
            order=52,
            options=["3 months", "6 months", "Flexible/Open to discussion"]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.CHECKBOX,
            label="Do you agree to follow our full ashram schedule of meditations, classes, and seva during your stay?",
            name="schedule_commitment",
            placeholder="Please consider 4:00 a.m. meditation, midday meditation, evening classes, plus the seva schedule.",
            required=True,
            order=53,
            options=[
                "Yes, I agree to follow the schedule during my stay.",
                "No, I will have trouble following the schedule and will explain below."
            ]
        ),
        FormField(
            id=str(uuid.uuid4()),
            field_type=FieldType.TEXTAREA,
            label="Please explain here if you might have trouble following the complete schedule",
            name="schedule_concerns",
            required=False,
            order=54
        ),
    ]

def seed_forms(db):
    try:
        # Get retreat slugs
        shakti = db.query(Retreat).filter(Retreat.slug == 'shakti').first()
        sevadhari = db.query(Retreat).filter(Retreat.slug == 'sevadhari').first()
        darshan = db.query(Retreat).filter(Retreat.slug == 'darshan').first()

        if not all([shakti, sevadhari, darshan]):
            print("Error: Not all retreats found in database")
            return

        # Get date options from retreats
        shakti_dates = shakti.product_component_data.get('dateOptions', []) if shakti.product_component_data else []
        sevadhari_dates = sevadhari.product_component_data.get('dateOptions', []) if sevadhari.product_component_data else []
        darshan_dates = darshan.product_component_data.get('dateOptions', []) if darshan.product_component_data else []

        # Create Shakti form
        print("\n=== Creating Shakti Saturation Application Form ===")
        shakti_fields = create_common_fields()
        # Update date field with Shakti dates
        for field in shakti_fields:
            if field.name == "retreat_date":
                field.options = shakti_dates

        shakti_form = FormTemplate(
            id=str(uuid.uuid4()),
            name="Shakti Saturation Month Application",
            slug="shakti-application",
            description="To protect the integrity of this spiritual refuge we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer.",
            retreat_id=shakti.id,
            fields=shakti_fields,
            is_active=True
        )
        db.add(shakti_form)
        print(f"✓ Created Shakti form with {len(shakti_fields)} fields")

        # Update shakti retreat with form slug
        if shakti.product_component_data:
            shakti.product_component_data['formSlug'] = 'shakti-application'
            flag_modified(shakti, 'product_component_data')

        # Create Darshan form
        print("\n=== Creating Darshan Retreat Application Form ===")
        darshan_fields = create_common_fields()
        # Update date field with Darshan dates
        for field in darshan_fields:
            if field.name == "retreat_date":
                field.options = darshan_dates

        darshan_form = FormTemplate(
            id=str(uuid.uuid4()),
            name="Private Darshan Retreat Application",
            slug="darshan-application",
            description="To protect the integrity of this spiritual refuge, we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer.",
            retreat_id=darshan.id,
            fields=darshan_fields,
            is_active=True
        )
        db.add(darshan_form)
        print(f"✓ Created Darshan form with {len(darshan_fields)} fields")

        # Update darshan retreat with form slug
        if darshan.product_component_data:
            darshan.product_component_data['formSlug'] = 'darshan-application'
            flag_modified(darshan, 'product_component_data')

        # Create Sevadhari form
        print("\n=== Creating Sevadhari Program Application Form ===")
        sevadhari_fields = create_common_fields()
        # Update date field with Sevadhari dates
        for field in sevadhari_fields:
            if field.name == "retreat_date":
                field.options = sevadhari_dates

        # Add Sevadhari-specific fields
        sevadhari_specific = create_sevadhari_specific_fields()
        sevadhari_fields.extend(sevadhari_specific)

        sevadhari_form = FormTemplate(
            id=str(uuid.uuid4()),
            name="Sevadhari Program Application",
            slug="sevadhari-application",
            description="The core purpose of the Sat Yoga Ashram is to facilitate a deep process of inner transformation for visitors and residents alike. Our Sevadhari Program is a three- to six-month immersion in yogic life for those who are ready for a serious and direct spiritual path to liberation.",
            retreat_id=sevadhari.id,
            fields=sevadhari_fields,
            is_active=True
        )
        db.add(sevadhari_form)
        print(f"✓ Created Sevadhari form with {len(sevadhari_fields)} fields ({len(sevadhari_specific)} unique)")

        # Update sevadhari retreat with form slug
        if sevadhari.product_component_data:
            sevadhari.product_component_data['formSlug'] = 'sevadhari-application'
            flag_modified(sevadhari, 'product_component_data')

        db.commit()
        print("\n✅ Successfully created all retreat application forms!")
        print(f"   - Shakti: {len(shakti_fields)} fields")
        print(f"   - Darshan: {len(darshan_fields)} fields")
        print(f"   - Sevadhari: {len(sevadhari_fields)} fields")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_forms(db)
    finally:
        db.close()
