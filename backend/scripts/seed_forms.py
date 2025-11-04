"""
Seed script for dynamic form templates
Populates database with all application and questionnaire forms
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.form_templates import FormTemplate, FormQuestion, FormCategory, QuestionType
import uuid


def clear_existing_forms(db):
    """Clear existing form templates"""
    print("Clearing existing forms...")
    db.query(FormQuestion).delete()
    db.query(FormTemplate).delete()
    db.commit()
    print("✓ Cleared existing forms")


def seed_shakti_saturation_form(db):
    """Seed Shakti Saturation Month Application Form"""
    print("\n📝 Creating Shakti Saturation Program Application...")

    form = FormTemplate(
        id=uuid.uuid4(),
        slug="shakti-saturation-application",
        name="Shakti Saturation Program Application",
        category=FormCategory.APPLICATION,
        title="Sat Yoga Shakti Saturation Program Application",
        description="To protect the integrity of this spiritual refuge we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer. In this application, you will have the opportunity to introduce yourself, tell us about your spiritual background, and about your motivation for participating—as well as any resistances that may come up in this kind of process.",
        is_active=True,
        is_multi_page=True,
        requires_auth=False,
        allow_anonymous=True,
        success_message="Thank you for your application! We will review it and get back to you soon.",
        notification_emails=["applications@satyoga.org"]
    )

    db.add(form)
    db.flush()

    # Common onsite retreat questions (Page 1)
    questions = [
        # Personal Information
        FormQuestion(
            form_template_id=form.id,
            question_text="Email Address",
            description="Please provide the same email address used for your online membership.",
            question_type=QuestionType.EMAIL,
            is_required=True,
            page_number=1,
            order_index=0
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="First Name",
            question_type=QuestionType.TEXT,
            is_required=True,
            page_number=1,
            order_index=1
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Last Name",
            question_type=QuestionType.TEXT,
            is_required=True,
            page_number=1,
            order_index=2
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Retreat/Program Date",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=1,
            order_index=3,
            options=[
                "November 4 - 13, 2025 - 10 day",
                "November 4 - December 1, 2025 - 4 week",
                "December 16 - Jan 12, 2026 - 4 week",
                "February 3 – 12, 2026 - 10 day",
                "February 3 – March 2, 2026 - 4 week",
                "March 31 – April 9, 2026 - 10 day",
                "March 31 – April 27, 2026 - 4 week",
                "June 30 – July 9, 2026 - 10 day",
                "June 30 – July 27, 2026 - 4 week",
                "November 3 – 12, 2026 - 10 day",
                "November 3 – 30, 2026 - 4 week",
                "December 15, 2026 – January 11, 2027"
            ]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Gender",
            description="What is your physiological category?",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=1,
            order_index=4,
            options=["Male", "Female"]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Date of Birth",
            question_type=QuestionType.DATE,
            is_required=True,
            page_number=1,
            order_index=5
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Current Age",
            question_type=QuestionType.NUMBER,
            is_required=True,
            page_number=1,
            order_index=6
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Phone",
            description="Preferably mobile phone number.",
            question_type=QuestionType.TEL,
            is_required=True,
            page_number=1,
            order_index=7
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Marital Status",
            question_type=QuestionType.DROPDOWN,
            is_required=True,
            page_number=1,
            order_index=8,
            options=["Single", "Married", "Widowed", "Divorced", "Separated", "Partnership", "Celibate"]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Nationality",
            question_type=QuestionType.TEXT,
            is_required=True,
            page_number=1,
            order_index=9
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Issued Passport number and country",
            question_type=QuestionType.TEXT,
            is_required=True,
            page_number=1,
            order_index=10
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Residence",
            description="Where do you live? Please state city, state/province, country.",
            question_type=QuestionType.TEXT,
            is_required=True,
            page_number=1,
            order_index=11
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Occupation",
            question_type=QuestionType.TEXT,
            is_required=True,
            page_number=1,
            order_index=12
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Emergency Contact",
            description="Include name, relationship, city, state, county, phone number, email address.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=1,
            order_index=13
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Photo",
            description="Please upload a current photograph of yourself taken within the last year.",
            question_type=QuestionType.FILE,
            is_required=True,
            page_number=1,
            order_index=14,
            allowed_file_types=["image/*"],
            max_file_size=10485760  # 10MB
        ),

        # Page 2: Personal Essay
        FormQuestion(
            form_template_id=form.id,
            section_heading="Personal Essay",
            question_text="Please tell us why you wish to participate in a Sat Yoga Ashram event.",
            description="Write simply and from the heart, without worrying about language or style. You can give us a snapshot of your current life situation and how you envision your visit can be of benefit to you. You may be candid about any emotional wounds, unwanted behavior patterns, drug or alcohol dependencies, physical illnesses, or other issues that may come up or affect your stability and need healing during your stay. Suggested length of your essay: 2 - 3 paragraphs. Your writing will be kept completely confidential and will be only be shared with our review committee and Shunyamurti.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=2,
            order_index=0
        ),

        # Page 3: Sat Yoga Membership & Teachings
        FormQuestion(
            form_template_id=form.id,
            section_heading="Sat Yoga Membership, Teachings & Spiritual Practice",
            question_text="Connection - How did you hear about us?",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=3,
            order_index=0,
            options=["I am a past visitor", "Word of Mouth", "Internet Search", "Newsletter", "Youtube", "Facebook", "Twitter", "Instagram", "Podcast", "Other"],
            allow_other=True
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Are you currently a Sat Yoga online member?",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=3,
            order_index=1,
            options=[
                "Yes, I am on a free trial.",
                "Yes, I am a Gyani Member.",
                "Yes, I am a Vigyani Member.",
                "Yes, I am a Pragyani Member.",
                "No, I am not currently an online member."
            ],
            allow_other=True
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="If you are a member, how long have you been a member?",
            description="Please write N/A if you are not a member.",
            question_type=QuestionType.TEXT,
            is_required=True,
            page_number=3,
            order_index=2
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you attended any of our past online retreats?",
            description="If so, which retreats have you participated in? Please specify the month and year of each retreat.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=3,
            order_index=3
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="How familiar are you with Shunyamurti's teachings?",
            description="Have you watched Shunyamurti's teachings online? What drew you to them and how have they helped you in your life? Is there a specific teaching that you particularly like, and, if so, why?",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=3,
            order_index=4
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you read any of Shunyamurti's books?",
            description="Please inform us which, if any, of these 4 books you have read.",
            question_type=QuestionType.CHECKBOX,
            is_required=True,
            page_number=3,
            order_index=5,
            options=[
                "The Transformational Imperative",
                "Coming Full Circle: The Secret of the Singularity",
                "The Dao of the Final Days",
                "The Seven Veils of Maya",
                "I have not read any of Shunyamurti's books."
            ]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you participated in healing atmanology sessions online?",
            description="If so, please specify the atmanologist you worked with, when these sessions took place (date and duration), and tell us briefly about your experience. If your sessions are ongoing, please include that information as well.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=3,
            order_index=6
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Describe your current and previous spiritual or meditation practice.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=3,
            order_index=7
        ),

        # Page 4: Health Information
        FormQuestion(
            form_template_id=form.id,
            section_heading="Health Information",
            question_text="Health Conditions",
            description="Do you have any medical/health conditions that may affect or limit your participation in our program?",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=0
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Are you currently ingesting any medications, any psychoactive substances, or herbal supplements?",
            description="Please list them.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=1
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you had any surgeries in the last 5 years? Do you have any limitations due to past surgeries?",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=2
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Do you have any history of anaphylaxis? If so, are you coming prepared with epinephrine or another form of treatment?",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=3
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you ever suffered any fainting spells, severe allergic reactions, asthma, or extreme anxiety states, panic attacks, or suicidal thoughts? Please explain.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=4
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you any other medical concerns that might affect you during your visit?",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=5
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Diet",
            description="Our vegetarian ashram kitchen is gluten-free friendly, and whenever possible try to accommodate health related sensitivities or intolerances. Please tell us about any allergies or dietary restrictions you have, with medical details, so that we can best serve your needs.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=6
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Allergies",
            description="Do you have any specific allergies (food, medicine, stings/bites, seasonal, etc.). Please note that we have honey bees on our property.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=7
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Sleeping Habits",
            description="Do you have any sleeping habits that we should know of? For example, insomnia, light sleeper, snoring, sleep walking, etc.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=4,
            order_index=8
        ),

        # Page 5: COVID Policy
        FormQuestion(
            form_template_id=form.id,
            section_heading="Notice to Applicants: Our Ashram's Policy Regarding Those Who Received an Injection",
            question_text="Did you receive any version of the covid injection?",
            description="Please read our vaxx policy. If not, we strongly encourage you NOT to take the 'vaccine' before coming to the ashram.",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=5,
            order_index=0,
            options=[
                "No, I have not taken the shot nor am planning to take it.",
                "Yes, I have taken the shot or have planned to do so before coming to the ashram."
            ]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you been living with anyone who has had the injection? If so, for how long and in what sort of relationship?",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=5,
            order_index=1
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Have you had close and prolonged physical contact with someone who had the injection within the past six months?",
            description="If so, please let us know if you have experienced any symptoms of either a psychological or somatic nature during this period.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=5,
            order_index=2
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Do you have funds available to you to cover possible medical related costs that may be incurred while you are here at the ashram?",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=5,
            order_index=3,
            options=["Yes", "No"]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Doctor Contact",
            description="If you have any current medical conditions, please provide the contact information of your doctor. Include name, phone number, and the email address of your doctor or 'N/A' if this is not applicable to you.",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=5,
            order_index=4
        ),

        # Page 6: Ashram Stay
        FormQuestion(
            form_template_id=form.id,
            section_heading="Ashram Stay",
            question_text="Do you agree to follow our Ashram Guidelines during your stay?",
            description="To protect the integrity of this spiritual refuge, we want to ensure that all who come to stay with us have a complete understanding of our path and vision, feel naturally aligned with what we offer, and are ready to embark on this adventure and offer a spirit of joyful participation. Please review our ashram guidelines at https://www.satyoga.org/guidelines.",
            question_type=QuestionType.CHECKBOX,
            is_required=True,
            page_number=6,
            order_index=0,
            options=[
                "Yes, have read and agree to follow the Ashram Guidelines",
                "No, I will have trouble following the Ashram Guidelines and will explain below"
            ]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Please explain here if you may have trouble following the Ashram Guidelines.",
            question_type=QuestionType.TEXTAREA,
            is_required=False,
            page_number=6,
            order_index=1
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Smoking Policy",
            description="The Ashram has a no smoking policy. Please let us know if you have been a smoker in the past or if you are currently trying to quit, or using nicotine patches/gum?",
            question_type=QuestionType.TEXTAREA,
            is_required=True,
            page_number=6,
            order_index=2
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Do you have funds available to you to cover the program contribution?",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=6,
            order_index=3,
            options=["Yes", "No"]
        ),
        FormQuestion(
            form_template_id=form.id,
            question_text="Health Insurance",
            description="If you are from outside Costa Rica, then you will need to send us a copy of your health insurance policy that is valid for your time in Costa Rica. If you are from Costa Rica, you will need to have a valid caja card. Otherwise, you will need to purchase emergency travel insurance for your time here. Your acceptance into the program is contingent on this document. Do you have international health insurance?",
            question_type=QuestionType.RADIO,
            is_required=True,
            page_number=6,
            order_index=4,
            options=[
                "Yes",
                "No",
                "Not currently, but I would be able to get insurance if accepted to the program."
            ]
        ),
    ]

    for q in questions:
        db.add(q)

    db.commit()
    print(f"✓ Created Shakti Saturation form with {len(questions)} questions")
    return form.id


def seed_sevadhari_form(db):
    """Seed Sevadhari Program Application Form"""
    print("\n📝 Creating Sevadhari Program Application...")

    form = FormTemplate(
        id=uuid.uuid4(),
        slug="sevadhari-application",
        name="Sevadhari Program Application",
        category=FormCategory.APPLICATION,
        title="Sat Yoga Ashram Sevadhari Program Application",
        description="The core purpose of the Sat Yoga Ashram is to facilitate a deep process of inner transformation for visitors and residents alike. Participating in one of our programs can be a powerful and life changing event augmented by extended immersion in an energy field dedicated to spiritual growth and self-transcendence.",
        introduction="Our Sevadhari Program is a three- to six-month immersion in yogic life for those who are ready for a serious and direct spiritual path to liberation. In exchange for around 25 hours per week of work, sevadharis will live at our ashram and participate in all our community classes as well as the Sat Yoga approach to transformation.",
        is_active=True,
        is_multi_page=True,
        requires_auth=False,
        allow_anonymous=True,
        success_message="Thank you for your application! We will review it and get back to you soon.",
        notification_emails=["applications@satyoga.org"]
    )

    db.add(form)
    db.flush()

    # Common questions + Sevadhari-specific questions
    questions = [
        # Page 1: Personal Information (same as common)
        FormQuestion(form_template_id=form.id, question_text="Email Address", description="Please provide the same email address used for your online membership.", question_type=QuestionType.EMAIL, is_required=True, page_number=1, order_index=0),
        FormQuestion(form_template_id=form.id, question_text="First Name", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="Last Name", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Retreat/Program Date", question_type=QuestionType.RADIO, is_required=True, page_number=1, order_index=3, options=["Seva Dhari: February 4, 2025 - 3 month or 6 month option", "Seva Dhari: April 15, 2025 - 3 month or 6 month option"]),
        FormQuestion(form_template_id=form.id, question_text="Gender", description="What is your physiological category?", question_type=QuestionType.RADIO, is_required=True, page_number=1, order_index=4, options=["Male", "Female"]),
        FormQuestion(form_template_id=form.id, question_text="Date of Birth", question_type=QuestionType.DATE, is_required=True, page_number=1, order_index=5),
        FormQuestion(form_template_id=form.id, question_text="Current Age", question_type=QuestionType.NUMBER, is_required=True, page_number=1, order_index=6),
        FormQuestion(form_template_id=form.id, question_text="Phone", description="Preferably mobile phone number.", question_type=QuestionType.TEL, is_required=True, page_number=1, order_index=7),
        FormQuestion(form_template_id=form.id, question_text="Marital Status", question_type=QuestionType.DROPDOWN, is_required=True, page_number=1, order_index=8, options=["Single", "Married", "Widowed", "Divorced", "Separated", "Partnership", "Celibate"]),
        FormQuestion(form_template_id=form.id, question_text="Nationality", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=9),
        FormQuestion(form_template_id=form.id, question_text="Passport Number", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=10),
        FormQuestion(form_template_id=form.id, question_text="Residence", description="Where do you live? Please state city, state/province, country.", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=11),
        FormQuestion(form_template_id=form.id, question_text="Occupation", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=12),
        FormQuestion(form_template_id=form.id, question_text="Emergency Contact", description="Include name, relationship, city, state, county, phone number, email address.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=1, order_index=13),
        FormQuestion(form_template_id=form.id, question_text="Photo", description="Please upload a current photograph of yourself taken within the last year.", question_type=QuestionType.FILE, is_required=True, page_number=1, order_index=14, allowed_file_types=["image/*"], max_file_size=10485760),

        # Page 2: Personal Essay (Sevadhari-specific)
        FormQuestion(form_template_id=form.id, section_heading="Personal Essay", question_text="Why do you desire to study and serve at the Sat Yoga Ashram? What do you hope to gain from your experience?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=2, order_index=0),
        FormQuestion(form_template_id=form.id, question_text="How would you describe your strengths and weaknesses?", description="Please tell us about some of your strengths (interpersonal skills, how you deal with challenges, characteristics, talents, etc.) and weaknesses (areas in which you recognize room for growth and improvement) as you see them.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=2, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="What does it mean for you to live in community?", description="How would it challenge you? How would it help you grow? Are you comfortable with living and working in close quarters with others?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=2, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Have you lived or stayed for an extended period of time in another ashram or community?", description="If so, which one? Please share your experience.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=2, order_index=3),

        # Page 3: Work Experience & Skills
        FormQuestion(form_template_id=form.id, section_heading="Work Experience & Skills", question_text="Please choose the areas in which you are most qualified to work.", description="You may choose more than one.", question_type=QuestionType.CHECKBOX, is_required=True, page_number=3, order_index=0, options=["Administration", "Agriculture", "Fundraising", "Gardens & Landscaping", "Healing & Healthcare", "Housekeeping & Hospitality", "Infrastructure & Construction", "Kitchen & Food Processing/Preservation", "Media & IT", "Outreach & Publications"]),
        FormQuestion(form_template_id=form.id, question_text="What experience, training, or certifications do you have in the areas you chose?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=3, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="CV/Résumé", description="Please upload a current curriculum vitae or résumé. Include links to work samples, YouTube channels, etc.", question_type=QuestionType.FILE, is_required=True, page_number=3, order_index=2, allowed_file_types=["application/pdf", ".doc", ".docx"], max_file_size=10485760),

        # Page 4: Sat Yoga Membership & Teachings (same as common)
        FormQuestion(form_template_id=form.id, section_heading="Sat Yoga Membership, Teachings & Spiritual Practice", question_text="Connection - How did you hear about us?", question_type=QuestionType.RADIO, is_required=True, page_number=4, order_index=0, options=["I am a past visitor", "Word of Mouth", "Internet Search", "Newsletter", "Youtube", "Facebook", "Twitter", "Instagram", "Podcast", "Other"], allow_other=True),
        FormQuestion(form_template_id=form.id, question_text="Are you currently a Sat Yoga online member?", question_type=QuestionType.RADIO, is_required=True, page_number=4, order_index=1, options=["Yes, I am on a free trial.", "Yes, I am a Gyani Member.", "Yes, I am a Vigyani Member.", "Yes, I am a Pragyani Member.", "No, I am not currently an online member."], allow_other=True),
        FormQuestion(form_template_id=form.id, question_text="If you are a member, how long have you been a member?", description="Please write N/A if you are not a member.", question_type=QuestionType.TEXT, is_required=True, page_number=4, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Have you attended any of our past online retreats?", description="If so, which retreats have you participated in? Please specify the month and year of each retreat.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=3),
        FormQuestion(form_template_id=form.id, question_text="How familiar are you with Shunyamurti's teachings?", description="Have you watched Shunyamurti's teachings online? What drew you to them and how have they helped you in your life? Is there a specific teaching that you particularly like, and, if so, why?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=4),
        FormQuestion(form_template_id=form.id, question_text="Have you read any of Shunyamurti's books?", description="Please inform us which, if any, of these 4 books you have read.", question_type=QuestionType.CHECKBOX, is_required=True, page_number=4, order_index=5, options=["The Transformational Imperative", "Coming Full Circle: The Secret of the Singularity", "The Dao of the Final Days", "The Seven Veils of Maya", "I have not read any of Shunyamurti's books."]),
        FormQuestion(form_template_id=form.id, question_text="Have you participated in healing atmanology sessions online?", description="If so, please specify the atmanologist you worked with, when these sessions took place (date and duration), and tell us briefly about your experience. If your sessions are ongoing, please include that information as well.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=6),
        FormQuestion(form_template_id=form.id, question_text="Describe your current and previous spiritual or meditation practice.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=7),

        # Page 5: Health Information (same, with psychological addition)
        FormQuestion(form_template_id=form.id, section_heading="Medical & Health Information", question_text="Health Conditions", description="Do you have any medical/health conditions that may affect or limit your participation in our program?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=0),
        FormQuestion(form_template_id=form.id, question_text="Are you currently ingesting any medications, any psychoactive substances, or herbal supplements?", description="Please list them.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="Have you had any surgeries in the last 5 years? Do you have any limitations due to past surgeries?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Do you have a history of psychological difficulties or any prior diagnosis or treatment?", description="Are you currently under the care of a therapist or a psychiatrist? Do you have any emotional or mental conditions that might affect you during your stay? Please explain and, if applicable, include any history or current use of prescribed psycho-pharmaceutical medications, shamanic or psychedelic substances, alcohol, tobacco, or other drugs.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=3),
        FormQuestion(form_template_id=form.id, question_text="Diet", description="Our vegetarian ashram kitchen is gluten-free friendly, and whenever possible try to accommodate health related sensitivities or intolerances. Please tell us about any allergies or dietary restrictions you have, with medical details, so that we can best serve your needs.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=4),
        FormQuestion(form_template_id=form.id, question_text="Allergies", description="Do you have any specific allergies (food, medicine, stings/bites, seasonal, etc.). Please note that we have honey bees on our property.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=5),
        FormQuestion(form_template_id=form.id, question_text="Sleeping Habits", description="Do you have any sleeping habits that we should know of? For example, insomnia, light sleeper, snoring, sleep walking, etc.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=6),

        # Page 6: COVID Policy (same as common)
        FormQuestion(form_template_id=form.id, section_heading="Notice to Applicants: Our Ashram's Policy Regarding Those Who Received an Injection", question_text="Did you receive any version of the covid injection?", description="Please read our vaxx policy. If not, we strongly encourage you NOT to take the 'vaccine' before coming to the ashram.", question_type=QuestionType.RADIO, is_required=True, page_number=6, order_index=0, options=["No, I have not taken the shot nor am planning to take it.", "Yes, I have taken the shot or have planned to do so before coming to the ashram."]),
        FormQuestion(form_template_id=form.id, question_text="Have you been living with anyone who has had the injection? If so, for how long and in what sort of relationship?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=6, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="Have you had close and prolonged physical contact with someone who had the injection within the past six months?", description="If so, please let us know if you have experienced any symptoms of either a psychological or somatic nature during this period.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=6, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Do you have funds available to you to cover possible medical related costs that may be incurred while you are here at the ashram?", question_type=QuestionType.RADIO, is_required=True, page_number=6, order_index=3, options=["Yes", "No"]),
        FormQuestion(form_template_id=form.id, question_text="Doctor Contact", description="If you have any current medical conditions, please provide the contact information of your doctor. Include name, phone number, and the email address of your doctor or 'N/A' if this is not applicable to you.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=6, order_index=4),

        # Page 7: Commitment & Schedule
        FormQuestion(form_template_id=form.id, section_heading="Commitment", question_text="How long are you able to commit for?", description="In general, we are interested in applicants who have the flexibility to make a commitment for at least three to six months.", question_type=QuestionType.RADIO, is_required=True, page_number=7, order_index=0, options=["3 months", "6 months", "Other"]),
        FormQuestion(form_template_id=form.id, question_text="Do you agree to follow our full ashram schedule of meditations, classes, and seva during your stay?", description="Please consider 4:00 a.m. meditation, midday meditation, and evening classes, plus the seva schedule.", question_type=QuestionType.CHECKBOX, is_required=True, page_number=7, order_index=1, options=["Yes, I agree to follow the schedule during my stay.", "No, I will have trouble following the schedule and will explain below"]),
        FormQuestion(form_template_id=form.id, question_text="Please explain here if you might have trouble following the complete schedule.", question_type=QuestionType.TEXTAREA, is_required=False, page_number=7, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Do you agree to follow our Ashram Guidelines during your stay?", description="Please review our ashram guidelines at https://www.satyoga.org/guidelines.", question_type=QuestionType.CHECKBOX, is_required=True, page_number=7, order_index=3, options=["Yes, have read and agree to follow the Ashram Guidelines", "No, I will have trouble following the Ashram Guidelines and will explain below"]),
        FormQuestion(form_template_id=form.id, question_text="Smoking Policy", description="The Ashram has a no smoking policy. Please let us know if you have been a smoker in the past or if you are currently trying to quit, or using nicotine patches/gum?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=7, order_index=4),
        FormQuestion(form_template_id=form.id, question_text="Health Insurance", description="If you are from outside Costa Rica, then you will need to send us a copy of your health insurance policy that is valid for your time in Costa Rica. Do you have international health insurance?", question_type=QuestionType.RADIO, is_required=True, page_number=7, order_index=5, options=["Yes", "No", "Not currently, but I would be able to get insurance if accepted to the program."]),
    ]

    for q in questions:
        db.add(q)

    db.commit()
    print(f"✓ Created Sevadhari form with {len(questions)} questions")
    return form.id


def seed_darshan_form(db):
    """Seed Darshan Retreat Application Form"""
    print("\n📝 Creating Darshan Retreat Application...")

    form = FormTemplate(
        id=uuid.uuid4(),
        slug="darshan-application",
        name="Darshan Retreat Application",
        category=FormCategory.APPLICATION,
        title="Sat Yoga Darshan Retreat Application",
        description="To protect the integrity of this spiritual refuge, we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer. In this application, you will have the opportunity to introduce yourself, tell us about your spiritual background, and describe your motivation for participating—as well as any resistances that may come up in this kind of process.",
        is_active=True,
        is_multi_page=True,
        requires_auth=False,
        allow_anonymous=True,
        success_message="Thank you for your application! We will review it and get back to you soon.",
        notification_emails=["applications@satyoga.org"]
    )

    db.add(form)
    db.flush()

    # Common questions for Darshan (same as Shakti but different dates)
    questions = [
        # Page 1: Personal Information
        FormQuestion(form_template_id=form.id, question_text="Email Address", description="Please provide the same email address used for your online membership.", question_type=QuestionType.EMAIL, is_required=True, page_number=1, order_index=0),
        FormQuestion(form_template_id=form.id, question_text="First Name", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="Last Name", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Retreat/Program Date", question_type=QuestionType.RADIO, is_required=True, page_number=1, order_index=3, options=["Darshan retreat: January 21 - 27, 2025", "Darshan retreat: March 18 - 24, 2025"]),
        FormQuestion(form_template_id=form.id, question_text="Gender", description="What is your physiological category?", question_type=QuestionType.RADIO, is_required=True, page_number=1, order_index=4, options=["Male", "Female"]),
        FormQuestion(form_template_id=form.id, question_text="Date of Birth", question_type=QuestionType.DATE, is_required=True, page_number=1, order_index=5),
        FormQuestion(form_template_id=form.id, question_text="Current Age", question_type=QuestionType.NUMBER, is_required=True, page_number=1, order_index=6),
        FormQuestion(form_template_id=form.id, question_text="Phone", description="Preferably mobile phone number.", question_type=QuestionType.TEL, is_required=True, page_number=1, order_index=7),
        FormQuestion(form_template_id=form.id, question_text="Marital Status", question_type=QuestionType.DROPDOWN, is_required=True, page_number=1, order_index=8, options=["Single", "Married", "Widowed", "Divorced", "Separated", "Partnership", "Celibate"]),
        FormQuestion(form_template_id=form.id, question_text="Nationality", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=9),
        FormQuestion(form_template_id=form.id, question_text="Issued Passport number and country", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=10),
        FormQuestion(form_template_id=form.id, question_text="Residence", description="Where do you live? Please state city, state/province, country.", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=11),
        FormQuestion(form_template_id=form.id, question_text="Occupation", question_type=QuestionType.TEXT, is_required=True, page_number=1, order_index=12),
        FormQuestion(form_template_id=form.id, question_text="Emergency Contact", description="Include name, relationship, city, state, county, phone number, email address.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=1, order_index=13),
        FormQuestion(form_template_id=form.id, question_text="Photo", description="Please upload a current photograph of yourself taken within the last year.", question_type=QuestionType.FILE, is_required=True, page_number=1, order_index=14, allowed_file_types=["image/*"], max_file_size=10485760),

        # Page 2: Personal Essay
        FormQuestion(form_template_id=form.id, section_heading="Personal Essay", question_text="Please tell us why you wish to participate in a Sat Yoga Ashram event.", description="Write simply and from the heart, without worrying about language or style. You can give us a snapshot of your current life situation and how you envision your visit can be of benefit to you. You may be candid about any emotional wounds, unwanted behavior patterns, drug or alcohol dependencies, physical illnesses, or other issues that may come up or affect your stability and need healing during your stay. Suggested length of your essay: 2 - 3 paragraphs. Your writing will be kept completely confidential and will be only be shared with our review committee and Shunyamurti.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=2, order_index=0),

        # Page 3: Sat Yoga Membership & Teachings
        FormQuestion(form_template_id=form.id, section_heading="Sat Yoga Membership, Teachings & Spiritual Practice", question_text="Connection - How did you hear about us?", question_type=QuestionType.RADIO, is_required=True, page_number=3, order_index=0, options=["I am a past visitor", "Word of Mouth", "Internet Search", "Newsletter", "Youtube", "Facebook", "Twitter", "Instagram", "Podcast", "Other"], allow_other=True),
        FormQuestion(form_template_id=form.id, question_text="Are you currently a Sat Yoga online member?", question_type=QuestionType.RADIO, is_required=True, page_number=3, order_index=1, options=["Yes, I am on a free trial.", "Yes, I am a Gyani Member.", "Yes, I am a Vigyani Member.", "Yes, I am a Pragyani Member.", "No, I am not currently an online member."], allow_other=True),
        FormQuestion(form_template_id=form.id, question_text="If you are a member, how long have you been a member?", description="Please write N/A if you are not a member.", question_type=QuestionType.TEXT, is_required=True, page_number=3, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Have you attended any of our past online retreats?", description="If so, which retreats have you participated in? Please specify the month and year of each retreat.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=3, order_index=3),
        FormQuestion(form_template_id=form.id, question_text="How familiar are you with Shunyamurti's teachings?", description="Have you watched Shunyamurti's teachings online? What drew you to them and how have they helped you in your life? Is there a specific teaching that you particularly like, and, if so, why?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=3, order_index=4),
        FormQuestion(form_template_id=form.id, question_text="Have you read any of Shunyamurti's books?", description="Please inform us which, if any, of these 4 books you have read.", question_type=QuestionType.CHECKBOX, is_required=True, page_number=3, order_index=5, options=["The Transformational Imperative", "Coming Full Circle: The Secret of the Singularity", "The Dao of the Final Days", "The Seven Veils of Maya", "I have not read any of Shunyamurti's books."]),
        FormQuestion(form_template_id=form.id, question_text="Have you participated in healing atmanology sessions online?", description="If so, please specify the atmanologist you worked with, when these sessions took place (date and duration), and tell us briefly about your experience. If your sessions are ongoing, please include that information as well.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=3, order_index=6),
        FormQuestion(form_template_id=form.id, question_text="Describe your current and previous spiritual or meditation practice.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=3, order_index=7),

        # Page 4: Health Information
        FormQuestion(form_template_id=form.id, section_heading="Health Information", question_text="Health Conditions", description="Do you have any medical/health conditions that may affect or limit your participation in our program?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=0),
        FormQuestion(form_template_id=form.id, question_text="Are you currently ingesting any medications, any psychoactive substances, or herbal supplements?", description="Please list them.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="Have you had any surgeries in the last 5 years? Do you have any limitations due to past surgeries?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Do you have any history of anaphylaxis? If so, are you coming prepared with epinephrine or another form of treatment?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=3),
        FormQuestion(form_template_id=form.id, question_text="Have you ever suffered any fainting spells, severe allergic reactions, asthma, or extreme anxiety states, panic attacks, or suicidal thoughts? Please explain.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=4),
        FormQuestion(form_template_id=form.id, question_text="Have you any other medical concerns that might affect you during your visit?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=5),
        FormQuestion(form_template_id=form.id, question_text="Diet", description="Our vegetarian ashram kitchen is gluten-free friendly, and whenever possible try to accommodate health related sensitivities or intolerances. Please tell us about any allergies or dietary restrictions you have, with medical details, so that we can best serve your needs.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=6),
        FormQuestion(form_template_id=form.id, question_text="Allergies", description="Do you have any specific allergies (food, medicine, stings/bites, seasonal, etc.). Please note that we have honey bees on our property.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=7),
        FormQuestion(form_template_id=form.id, question_text="Sleeping Habits", description="Do you have any sleeping habits that we should know of? For example, insomnia, light sleeper, snoring, sleep walking, etc.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=4, order_index=8),

        # Page 5: COVID Policy
        FormQuestion(form_template_id=form.id, section_heading="Notice to Applicants: Our Ashram's Policy Regarding Those Who Received an Injection", question_text="Did you receive any version of the covid injection?", description="Please read our vaxx policy. If not, we strongly encourage you NOT to take the 'vaccine' before coming to the ashram.", question_type=QuestionType.RADIO, is_required=True, page_number=5, order_index=0, options=["No, I have not taken the shot nor am planning to take it.", "Yes, I have taken the shot or have planned to do so before coming to the ashram."]),
        FormQuestion(form_template_id=form.id, question_text="Have you been living with anyone who has had the injection? If so, for how long and in what sort of relationship?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="Have you had close and prolonged physical contact with someone who had the injection within the past six months?", description="If so, please let us know if you have experienced any symptoms of either a psychological or somatic nature during this period.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Do you have funds available to you to cover possible medical related costs that may be incurred while you are here at the ashram?", question_type=QuestionType.RADIO, is_required=True, page_number=5, order_index=3, options=["Yes", "No"]),
        FormQuestion(form_template_id=form.id, question_text="Doctor Contact", description="If you have any current medical conditions, please provide the contact information of your doctor. Include name, phone number, and the email address of your doctor or 'N/A' if this is not applicable to you.", question_type=QuestionType.TEXTAREA, is_required=True, page_number=5, order_index=4),

        # Page 6: Ashram Stay
        FormQuestion(form_template_id=form.id, section_heading="Ashram Stay", question_text="Do you agree to follow our Ashram Guidelines during your stay?", description="Please review our ashram guidelines at https://www.satyoga.org/guidelines.", question_type=QuestionType.CHECKBOX, is_required=True, page_number=6, order_index=0, options=["Yes, have read and agree to follow the Ashram Guidelines", "No, I will have trouble following the Ashram Guidelines and will explain below"]),
        FormQuestion(form_template_id=form.id, question_text="Please explain here if you may have trouble following the Ashram Guidelines.", question_type=QuestionType.TEXTAREA, is_required=False, page_number=6, order_index=1),
        FormQuestion(form_template_id=form.id, question_text="Smoking Policy", description="The Ashram has a no smoking policy. Please let us know if you have been a smoker in the past or if you are currently trying to quit, or using nicotine patches/gum?", question_type=QuestionType.TEXTAREA, is_required=True, page_number=6, order_index=2),
        FormQuestion(form_template_id=form.id, question_text="Do you have funds available to you to cover the program contribution?", question_type=QuestionType.RADIO, is_required=True, page_number=6, order_index=3, options=["Yes", "No"]),
        FormQuestion(form_template_id=form.id, question_text="Health Insurance", description="If you are from outside Costa Rica, then you will need to send us a copy of your health insurance policy that is valid for your time in Costa Rica. If you are from Costa Rica, you will need to have a valid caja card. Otherwise, you will need to purchase emergency travel insurance for your time here. Your acceptance into the program is contingent on this document. Do you have international health insurance?", question_type=QuestionType.RADIO, is_required=True, page_number=6, order_index=4, options=["Yes", "No", "Not currently, but I would be able to get insurance if accepted to the program."]),
    ]

    for q in questions:
        db.add(q)

    db.commit()
    print(f"✓ Created Darshan form with {len(questions)} questions")
    return form.id


def main():
    db = SessionLocal()

    try:
        print("=" * 60)
        print("SEEDING FORM TEMPLATES")
        print("=" * 60)

        # Clear existing
        clear_existing_forms(db)

        # Seed forms
        shakti_id = seed_shakti_saturation_form(db)
        sevadhari_id = seed_sevadhari_form(db)
        darshan_id = seed_darshan_form(db)

        print("\n" + "=" * 60)
        print("✅ SEEDING COMPLETE!")
        print("=" * 60)
        print(f"\nCreated forms:")
        print(f"  - Shakti Saturation Application (ID: {shakti_id})")
        print(f"  - Sevadhari Program Application (ID: {sevadhari_id})")
        print(f"  - Darshan Retreat Application (ID: {darshan_id})")
        print(f"\nYou can now access these forms at:")
        print(f"  http://localhost:3000/apply?form=shakti-saturation-application")
        print(f"  http://localhost:3000/apply?form=sevadhari-application")
        print(f"  http://localhost:3000/apply?form=darshan-application")

    except Exception as e:
        print(f"\n❌ Error seeding forms: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
