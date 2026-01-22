#!/usr/bin/env python3
"""
Seed COMPLETE retreat application forms with ALL questions
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.form_templates import FormTemplate, FormQuestion, QuestionType, FormCategory
from app.models.retreat import Retreat
from sqlalchemy.orm.attributes import flag_modified
import uuid

def create_common_questions(order_start=0):
    """Create ALL 42 common questions used across all retreat applications"""
    questions = []
    order = order_start

    # 1. Email
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Email Address",
        description="Please provide the same email address used for your online membership",
        question_type=QuestionType.EMAIL,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 2. First Name
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="First Name",
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 3. Last Name
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Last Name",
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 4. Retreat/Program Date (will be customized per retreat)
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Retreat/Program Date",
        question_type=QuestionType.DROPDOWN,
        is_required=True,
        options=[],  # Will be filled in
        order_index=order
    ))
    order += 1

    # 5. Gender
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Gender",
        description="What is your physiological category?",
        question_type=QuestionType.RADIO,
        is_required=True,
        options=["Male", "Female"],
        order_index=order
    ))
    order += 1

    # 6. Date of Birth
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Date of Birth",
        placeholder="Example: 7 January 2019",
        question_type=QuestionType.DATE,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 7. Current Age
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Current Age",
        question_type=QuestionType.NUMBER,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 8. Phone
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Phone",
        placeholder="Preferably mobile phone number",
        question_type=QuestionType.TEL,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 9. Marital Status
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Marital Status",
        question_type=QuestionType.DROPDOWN,
        is_required=True,
        options=["Single", "Married", "Widowed", "Divorced", "Separated", "Partnership", "Celibate"],
        order_index=order
    ))
    order += 1

    # 10. Nationality
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Nationality",
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 11. Residence
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Residence",
        placeholder="Where do you live? Please state city, state/province, country.",
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 12. Occupation
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Occupation",
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 13. Emergency Contact
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Emergency Contact",
        placeholder="Include name, relationship, city, state, country, phone number, email address.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 14. Photo
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Photo",
        description="Please upload a current photograph of yourself taken within the last year.",
        question_type=QuestionType.FILE,
        is_required=True,
        allowed_file_types=["image/*"],
        max_file_size=5242880,  # 5MB
        order_index=order
    ))
    order += 1

    # 15. Personal Essay
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        section_heading="Personal Essay",
        question_text="Please tell us why you wish to participate in a Sat Yoga Ashram event",
        description="Write simply and from the heart, without worrying about language or style. You can give us a snapshot of your current life situation and how you envision your visit can be of benefit to you. You may be candid about any emotional wounds, unwanted behavior patterns, drug or alcohol dependencies, physical illnesses, or other issues that may come up or affect your stability and need healing during your stay. Suggested length: 2-3 paragraphs. Your writing will be kept completely confidential.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 16. Connection
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        section_heading="Sat Yoga Membership, Teachings & Spiritual Practice",
        question_text="How did you hear about us?",
        question_type=QuestionType.DROPDOWN,
        is_required=True,
        options=["I am a past visitor", "Word of Mouth", "Internet Search", "Newsletter", "Youtube", "Facebook", "Twitter", "Instagram", "Podcast", "Other"],
        order_index=order
    ))
    order += 1

    # 17. Membership Status
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Are you currently a Sat Yoga online member?",
        question_type=QuestionType.DROPDOWN,
        is_required=True,
        options=[
            "Yes, I am on a free trial.",
            "Yes, I am a Gyani Member.",
            "Yes, I am a Vigyani Member.",
            "Yes, I am a Pragyani Member.",
            "No, I am not currently an online member.",
            "Other"
        ],
        order_index=order
    ))
    order += 1

    # 18. Membership Duration
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="If you are a member, how long have you been a member?",
        placeholder="Please write N/A if you are not a member.",
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 19. Past Online Retreats
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you attended any of our past online retreats?",
        placeholder="If so, which retreats have you participated in? Please specify the month and year of each retreat.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 20. Teachings Familiarity
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="How familiar are you with Shunyamurti's teachings?",
        description="Have you watched Shunyamurti's teachings online? What drew you to them and how have they helped you in your life? Is there a specific teaching that you particularly like, and, if so, why?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 21. Books Read
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you read any of Shunyamurti's books?",
        description="Please inform us which, if any, of these 4 books you have read.",
        question_type=QuestionType.CHECKBOX,
        is_required=True,
        options=[
            "The Transformational Imperative",
            "Coming Full Circle: The Secret of the Singularity",
            "The Dao of the Final Days",
            "The Seven Veils of Maya",
            "I have not read any of Shunyamurti's books."
        ],
        order_index=order
    ))
    order += 1

    # 22. Atmanology Sessions
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you participated in healing atmanology sessions online?",
        description="If so, please specify the atmanologist you worked with, when these sessions took place (date and duration), and tell us briefly about your experience. If your sessions are ongoing, please include that information as well.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 23. Spiritual Practice
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Describe your current and previous spiritual or meditation practice",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 24. Health Conditions
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        section_heading="Health Information",
        question_text="Health Conditions",
        description="Do you have any medical/health conditions that may affect or limit your participation in our program?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 25. Medications
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Are you currently ingesting any medications, any psychoactive substances, or herbal supplements?",
        placeholder="Please list them.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 26. Surgeries
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you had any surgeries in the last 5 years? Do you have any limitations due to past surgeries?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 27. Anaphylaxis
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Do you have any history of anaphylaxis? If so, are you coming prepared with epinephrine or another form of treatment?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 28. Mental Health History
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you ever suffered any fainting spells, severe allergic reactions, asthma, or extreme anxiety states, panic attacks, or suicidal thoughts?",
        placeholder="Please explain.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 29. Other Medical Concerns
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you any other medical concerns that might affect you during your visit?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 30. Diet
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Diet",
        description="Our vegetarian ashram kitchen is gluten-free friendly, and whenever possible try to accommodate health related sensitivities or intolerances. Please tell us about any allergies or dietary restrictions you have, with medical details, so that we can best serve your needs.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 31. Allergies
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Allergies",
        description="Do you have any specific allergies (food, medicine, stings/bites, seasonal, etc.). Please note that we have honey bees on our property.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 32. Sleeping Habits
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Sleeping Habits",
        description="Do you have any sleeping habits that we should know of? For example, insomnia, light sleeper, snoring, sleep walking, etc.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 33. COVID Injection
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Did you receive any version of the covid injection?",
        description="If so, please read our policy. If not, we strongly encourage you NOT to take the vaccine before coming to the ashram.",
        question_type=QuestionType.RADIO,
        is_required=True,
        options=[
            "No, I have not taken the shot nor am planning to take it.",
            "Yes, I have taken the shot or have planned to do so before coming to the ashram."
        ],
        order_index=order
    ))
    order += 1

    # 34. Living with Injected
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you been living with anyone who has had the injection? If so, for how long and in what sort of relationship?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 35. Physical Contact with Injected
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you had close and prolonged physical contact with someone who had the injection within the past six months?",
        description="If so, please let us know if you have experienced any symptoms of either a psychological or somatic nature during this period.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 36. Medical Funds
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Do you have funds available to you to cover possible medical related costs that may be incurred while you are here at the ashram?",
        question_type=QuestionType.RADIO,
        is_required=True,
        options=["Yes", "No"],
        order_index=order
    ))
    order += 1

    # 37. Doctor Contact
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Doctor Contact",
        description='If you have any current medical conditions, please provide the contact information of your doctor. Include name, phone number, and email address or "N/A" if this is not applicable to you.',
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 38. Ashram Guidelines
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        section_heading="Ashram Stay",
        question_text="Do you agree to follow our Ashram Guidelines during your stay?",
        description="To protect the integrity of this spiritual refuge, we want to ensure that all who come to stay with us have a complete understanding of our path and vision. Please review our ashram guidelines at https://www.satyoga.org/guidelines.",
        question_type=QuestionType.CHECKBOX,
        is_required=True,
        options=[
            "Yes, I have read and agree to follow the Ashram Guidelines",
            "No, I will have trouble following the Ashram Guidelines and will explain below"
        ],
        order_index=order
    ))
    order += 1

    # 39. Guidelines Concerns
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Please explain here if you may have trouble following the Ashram Guidelines",
        question_type=QuestionType.TEXTAREA,
        is_required=False,
        order_index=order
    ))
    order += 1

    # 40. Smoking Policy
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Smoking Policy",
        description="The Ashram has a no smoking policy. Please let us know if you have been a smoker in the past or if you are currently trying to quit, or using nicotine patches/gum?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # 41. Program Funds
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Do you have funds available to you to cover the program contribution?",
        question_type=QuestionType.RADIO,
        is_required=True,
        options=["Yes", "No"],
        order_index=order
    ))
    order += 1

    # 42. Health Insurance
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Health Insurance",
        description="If you are from outside Costa Rica, you will need to send us a copy of your health insurance policy valid for your time in Costa Rica. If you are from Costa Rica, you will need a valid caja card. Otherwise, you will need to purchase emergency travel insurance. Your acceptance is contingent on this document.",
        question_type=QuestionType.RADIO,
        is_required=True,
        options=[
            "Yes",
            "No",
            "Not currently, but I would be able to get insurance if accepted to the program."
        ],
        order_index=order
    ))
    order += 1

    return questions, order

def create_sevadhari_specific_questions(order_start):
    """Create Sevadhari-specific questions"""
    questions = []
    order = order_start

    # Passport Number (comes after question 12 in original)
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Passport Number",
        question_type=QuestionType.TEXT,
        is_required=True,
        order_index=order
    ))
    order += 1

    # After question 15
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Why do you desire to study and serve at the Sat Yoga Ashram? What do you hope to gain from your experience?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="How would you describe your strengths and weaknesses?",
        description="Please tell us about some of your strengths (interpersonal skills, how you deal with challenges, characteristics, talents, etc.) and weaknesses (areas in which you recognize room for growth and improvement) as you see them.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="What does it mean for you to live in community?",
        description="How would it challenge you? How would it help you grow? Are you comfortable with living and working in close quarters with others?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Have you lived or stayed for an extended period of time in another ashram or community?",
        description="If so, which one? Please share your experience.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # Work Experience & Skills
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        section_heading="Work Experience & Skills",
        question_text="Please choose the areas in which you are most qualified to work",
        description="You may choose more than one.",
        question_type=QuestionType.CHECKBOX,
        is_required=True,
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
        ],
        order_index=order
    ))
    order += 1

    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="What experience, training, or certifications do you have in the areas you chose?",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="CV/Résumé",
        description="Please upload a current curriculum vitae or résumé. Include links to work samples, YouTube channels, etc.",
        question_type=QuestionType.FILE,
        is_required=True,
        allowed_file_types=["application/pdf", ".doc", ".docx"],
        max_file_size=10485760,  # 10MB
        order_index=order
    ))
    order += 1

    # Psychological History (replaces/extends question 28)
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        section_heading="Medical & Health Information",
        question_text="Do you have a history of psychological difficulties or any prior diagnosis or treatment?",
        description="Are you currently under the care of a therapist or psychiatrist? Do you have any emotional or mental conditions that might affect you during your stay? Please explain and, if applicable, include any history or current use of prescribed psycho-pharmaceutical medications, shamanic or psychedelic substances, alcohol, tobacco, or other drugs.",
        question_type=QuestionType.TEXTAREA,
        is_required=True,
        order_index=order
    ))
    order += 1

    # Commitment section
    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        section_heading="Commitment",
        question_text="How long are you able to commit for?",
        description="In general, we are interested in applicants who have the flexibility to make a commitment for at least three to six months.",
        question_type=QuestionType.DROPDOWN,
        is_required=True,
        options=["3 months", "6 months", "Flexible/Open to discussion"],
        order_index=order
    ))
    order += 1

    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Do you agree to follow our full ashram schedule of meditations, classes, and seva during your stay?",
        description="Please consider 4:00 a.m. meditation, midday meditation, evening classes, plus the seva schedule.",
        question_type=QuestionType.CHECKBOX,
        is_required=True,
        options=[
            "Yes, I agree to follow the schedule during my stay.",
            "No, I will have trouble following the schedule and will explain below."
        ],
        order_index=order
    ))
    order += 1

    questions.append(FormQuestion(
        id=str(uuid.uuid4()),
        question_text="Please explain here if you might have trouble following the complete schedule",
        question_type=QuestionType.TEXTAREA,
        is_required=False,
        order_index=order
    ))
    order += 1

    return questions

def seed_all_forms(db):
    try:
        # Get retreats
        shakti = db.query(Retreat).filter(Retreat.slug == 'shakti').first()
        sevadhari = db.query(Retreat).filter(Retreat.slug == 'sevadhari').first()
        darshan = db.query(Retreat).filter(Retreat.slug == 'darshan').first()

        if not all([shakti, sevadhari, darshan]):
            print("Error: Not all retreats found")
            return

        # Get dates
        shakti_dates = shakti.product_component_data.get('dateOptions', []) if shakti.product_component_data else []
        sevadhari_dates = sevadhari.product_component_data.get('dateOptions', []) if sevadhari.product_component_data else []
        darshan_dates = darshan.product_component_data.get('dateOptions', []) if darshan.product_component_data else []

        print("\n=== Creating SHAKTI Form ===")
        shakti_questions, _ = create_common_questions()
        # Update date field
        for q in shakti_questions:
            if "Retreat/Program Date" in q.question_text:
                q.options = shakti_dates

        shakti_form = FormTemplate(
            id=str(uuid.uuid4()),
            slug="shakti-application",
            name="Shakti Saturation Month Application",
            category=FormCategory.APPLICATION,
            title="Shakti Saturation Month Application",
            description="To protect the integrity of this spiritual refuge we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer.",
            is_active=True,
            requires_auth=True,
            questions=shakti_questions
        )
        db.add(shakti_form)
        print(f"✓ Shakti: {len(shakti_questions)} questions")

        # Update retreat
        if shakti.product_component_data:
            shakti.product_component_data['formSlug'] = 'shakti-application'
            flag_modified(shakti, 'product_component_data')

        print("\n=== Creating DARSHAN Form ===")
        darshan_questions, _ = create_common_questions()
        # Update date field
        for q in darshan_questions:
            if "Retreat/Program Date" in q.question_text:
                q.options = darshan_dates

        darshan_form = FormTemplate(
            id=str(uuid.uuid4()),
            slug="darshan-application",
            name="Private Darshan Retreat Application",
            category=FormCategory.APPLICATION,
            title="Private Darshan Retreat Application",
            description="To protect the integrity of this spiritual refuge, we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer.",
            is_active=True,
            requires_auth=True,
            questions=darshan_questions
        )
        db.add(darshan_form)
        print(f"✓ Darshan: {len(darshan_questions)} questions")

        # Update retreat
        if darshan.product_component_data:
            darshan.product_component_data['formSlug'] = 'darshan-application'
            flag_modified(darshan, 'product_component_data')

        print("\n=== Creating SEVADHARI Form ===")
        base_questions, order = create_common_questions()
        specific_questions = create_sevadhari_specific_questions(order)
        sevadhari_questions = base_questions + specific_questions

        # Update date field
        for q in sevadhari_questions:
            if "Retreat/Program Date" in q.question_text:
                q.options = sevadhari_dates

        sevadhari_form = FormTemplate(
            id=str(uuid.uuid4()),
            slug="sevadhari-application",
            name="Sevadhari Program Application",
            category=FormCategory.APPLICATION,
            title="Sevadhari Program Application",
            description="The core purpose of the Sat Yoga Ashram is to facilitate a deep process of inner transformation. Our Sevadhari Program is a three- to six-month immersion in yogic life for those who are ready for a serious and direct spiritual path to liberation.",
            is_active=True,
            requires_auth=True,
            questions=sevadhari_questions
        )
        db.add(sevadhari_form)
        print(f"✓ Sevadhari: {len(sevadhari_questions)} questions ({len(specific_questions)} unique)")

        # Update retreat
        if sevadhari.product_component_data:
            sevadhari.product_component_data['formSlug'] = 'sevadhari-application'
            flag_modified(sevadhari, 'product_component_data')

        db.commit()
        print("\n✅ ALL FORMS CREATED SUCCESSFULLY!")
        print(f"Total questions created: {len(shakti_questions) + len(darshan_questions) + len(sevadhari_questions)}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_all_forms(db)
    finally:
        db.close()
