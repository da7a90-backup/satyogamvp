"""
Seed complete onsite retreat application forms with ALL questions.
This creates forms for: Darshan Retreat, Shakti Saturation, Seva Dhari
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.form import DynamicFormTemplate, FormSection, FormField, FieldType
import uuid


def clear_existing_form(db: Session, slug: str):
    """Clear existing form if it exists"""
    form = db.query(DynamicFormTemplate).filter(DynamicFormTemplate.slug == slug).first()
    if form:
        print(f"Deleting existing form: {slug}")
        db.delete(form)
        db.commit()


def create_darshan_retreat_form(db: Session):
    """Create Darshan Retreat Application form with all questions"""
    print("\n🏔️  Creating Darshan Retreat Application...")

    clear_existing_form(db, "darshan-retreat-application")

    form = DynamicFormTemplate(
        id=str(uuid.uuid4()),
        slug="darshan-retreat-application",
        title="Darshan Retreat Application",
        subtitle="To protect the integrity of this spiritual refuge, we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer.",
        description="In this application, you will have the opportunity to introduce yourself, tell us about your spiritual background, and describe your motivation for participating—as well as any resistances that may come up in this kind of process.",
        is_published=True
    )
    db.add(form)
    db.flush()

    # Section 1: About You
    section1 = FormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="About You",
        description="All questions are required responses",
        order=0
    )
    db.add(section1)
    db.flush()

    fields_section1 = [
        ("Email Address", FieldType.EMAIL, "Please provide the same email address used for your online membership", 0),
        ("First Name", FieldType.TEXT, None, 1),
        ("Last Name", FieldType.TEXT, None, 2),
        ("Gender", FieldType.SELECT, "What is your physiological category?", 4),
        ("Date of Birth", FieldType.DATE, "Example: 7 January 2019", 5),
        ("Current Age", FieldType.TEXT, None, 6),
        ("Phone", FieldType.PHONE, "Preferably mobile phone number", 7),
        ("Marital Status", FieldType.SELECT, None, 8),
        ("Nationality", FieldType.TEXT, None, 9),
        ("Residence", FieldType.TEXT, "Where do you live? Please state city, state/province, country", 10),
        ("Occupation", FieldType.TEXT, None, 11),
        ("Emergency Contact", FieldType.TEXTAREA, "Include name, relationship, city, state, county, phone number, email address", 12),
        ("Photo", FieldType.PHOTO, "Please upload a current photograph of yourself taken within the last year", 13),
    ]

    for label, field_type, help_text, order in fields_section1:
        options = None
        if label == "Gender":
            options = ["Male", "Female"]
        elif label == "Marital Status":
            options = ["Single", "Married", "Widowed", "Divorced", "Separated", "Partnership", "Celibate"]
        elif label == "Retreat/Program Date":
            options = [
                "Darshan retreat: January 21 - 27, 2025",
                "Darshan retreat: March 18 - 24, 2025"
            ]

        field = FormField(
            id=str(uuid.uuid4()),
            section_id=section1.id,
            label=label,
            field_type=field_type,
            placeholder=None,
            help_text=help_text,
            is_required=True,
            order=order,
            options=options
        )
        db.add(field)

    # Add Retreat/Program Date after Email
    retreat_date_field = FormField(
        id=str(uuid.uuid4()),
        section_id=section1.id,
        label="Retreat/Program Date",
        field_type=FieldType.SELECT,
        placeholder=None,
        help_text="Mark only one oval",
        is_required=True,
        order=3,
        options=[
            "Darshan retreat: January 21 - 27, 2025",
            "Darshan retreat: March 18 - 24, 2025"
        ]
    )
    db.add(retreat_date_field)

    # Section 2: Personal Essay
    section2 = FormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="Personal Essay",
        description=None,
        order=1
    )
    db.add(section2)
    db.flush()

    essay_field = FormField(
        id=str(uuid.uuid4()),
        section_id=section2.id,
        label="Please tell us why you wish to participate in a Sat Yoga Ashram event",
        field_type=FieldType.TEXTAREA,
        placeholder=None,
        help_text="Write simply and from the heart, without worrying about language or style. You can give us a snapshot of your current life situation and how you envision your visit can be of benefit to you. You may be candid about any emotional wounds, unwanted behavior patterns, drug or alcohol dependencies, physical illnesses, or other issues that may come up or affect your stability and need healing during your stay. Suggested length of your essay: 2 - 3 paragraphs. Your writing will be kept completely confidential and will be only be shared with our review committee and Shunyamurti.",
        is_required=True,
        order=0
    )
    db.add(essay_field)

    # Section 3: Sat Yoga Membership, Teachings & Spiritual Practice
    section3 = FormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="Sat Yoga Membership, Teachings & Spiritual Practice",
        description=None,
        order=2
    )
    db.add(section3)
    db.flush()

    fields_section3 = [
        ("Connection", FieldType.SELECT, "How did you hear about us?", 0, [
            "I am a past visitor",
            "Word of Mouth",
            "Internet Search",
            "Newsletter",
            "Youtube",
            "Facebook",
            "Twitter",
            "Instagram",
            "Podcast",
            "Other"
        ]),
        ("Are you currently a Sat Yoga online member?", FieldType.SELECT, None, 1, [
            "Yes, I am on a free trial",
            "Yes, I am a Gyani Member",
            "Yes, I am a Vigyani Member",
            "Yes, I am a Pragyani Member",
            "No, I am not currently an online member",
            "Other"
        ]),
        ("If you are a member, how long have you been a member?", FieldType.TEXT, "Please write N/A if you are not a member", 2),
        ("Have you attended any of our past online retreats?", FieldType.TEXTAREA, "If so, which retreats have you participated in? Please specify the month and year of each retreat", 3),
        ("How familiar are you with Shunyamurti's teachings?", FieldType.TEXTAREA, "Have you watched Shunyamurti's teachings online? What drew you to them and how have they helped you in your life? Is there a specific teaching that you particularly like, and, if so, why?", 4),
        ("Describe your current and previous spiritual or meditation practice", FieldType.TEXTAREA, None, 7),
    ]

    for label, field_type, help_text, order, *options_list in fields_section3:
        options = options_list[0] if options_list else None
        field = FormField(
            id=str(uuid.uuid4()),
            section_id=section3.id,
            label=label,
            field_type=field_type,
            placeholder=None,
            help_text=help_text,
            is_required=True,
            order=order,
            options=options
        )
        db.add(field)

    # Add books question (checkbox)
    books_field = FormField(
        id=str(uuid.uuid4()),
        section_id=section3.id,
        label="Have you read any of Shunyamurti's books?",
        field_type=FieldType.SELECT,
        placeholder=None,
        help_text="Please inform us which, if any, of these 4 books you have read. Tick all that apply",
        is_required=True,
        order=5,
        options=[
            "The Transformational Imperative",
            "Coming Full Circle: The Secret of the Singularity",
            "The Dao of the Final Days",
            "The Seven Veils of Maya",
            "I have not read any of Shunyamurti's books"
        ]
    )
    db.add(books_field)

    # Add atmanology sessions question
    atman_field = FormField(
        id=str(uuid.uuid4()),
        section_id=section3.id,
        label="Have you participated in healing atmanology sessions online?",
        field_type=FieldType.TEXTAREA,
        placeholder=None,
        help_text="If so, please specify the atmanologist you worked with, when these sessions took place (date and duration), and tell us briefly about your experience. If your sessions are ongoing, please include that information as well",
        is_required=True,
        order=6
    )
    db.add(atman_field)

    # Section 4: Health Information
    section4 = FormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="Health Information",
        description=None,
        order=3
    )
    db.add(section4)
    db.flush()

    health_fields = [
        ("Health Conditions", FieldType.TEXTAREA, "Do you have any medical/health conditions that may affect or limit your participation in our program?", 0),
        ("Are you currently ingesting any medications, any psychoactive substances, or herbal supplements?", FieldType.TEXTAREA, "Please list them", 1),
        ("Have you had any surgeries in the last 5 years? Do you have any limitations due to past surgeries?", FieldType.TEXTAREA, None, 2),
        ("Do you have any history of anaphylaxis?", FieldType.TEXTAREA, "If so, are you coming prepared with epinephrine or another form of treatment?", 3),
        ("Have you ever suffered any fainting spells, severe allergic reactions, asthma, or extreme anxiety states, panic attacks, or suicidal thoughts?", FieldType.TEXTAREA, "Please explain", 4),
        ("Do you have any other medical concerns that might affect you during your visit?", FieldType.TEXTAREA, None, 5),
        ("Diet", FieldType.TEXTAREA, "Our vegetarian ashram kitchen is gluten-free friendly, and whenever possible try to accommodate health related sensitivities or intolerances. Please tell us about any allergies or dietary restrictions you have, with medical details, so that we can best serve your needs", 6),
        ("Allergies", FieldType.TEXTAREA, "Do you have any specific allergies (food, medicine, stings/bites, seasonal, etc.). Please note that we have honey bees on our property", 7),
        ("Sleeping Habits", FieldType.TEXTAREA, "Do you have any sleeping habits that we should know of? For example, insomnia, light sleeper, snoring, sleep walking, etc", 8),
    ]

    for label, field_type, help_text, order in health_fields:
        field = FormField(
            id=str(uuid.uuid4()),
            section_id=section4.id,
            label=label,
            field_type=field_type,
            placeholder=None,
            help_text=help_text,
            is_required=True,
            order=order
        )
        db.add(field)

    # COVID Policy section fields
    covid_notice = FormField(
        id=str(uuid.uuid4()),
        section_id=section4.id,
        label="Notice to Applicants: Our Ashram's Policy Regarding Those Who Received an Injection",
        field_type=FieldType.TEXTAREA,
        placeholder=None,
        help_text="The welfare of every soul is precious to us. We have a responsibility to provide the healthiest environment possible for our community and all our visitors. Unfortunately, the consequences of the pandemic and the mass injection of a previously unknown kind of serum—producing genetic corruption and possibly an invasion of nanobots—also include the noxious effect of a phenomenon known as shedding. There is a growing body of evidence that unhappily supports the reality of this effect. Until we discover sufficient credible contradictory evidence, or an antidote, our duty requires protecting our uninjected community and retreatants. For that reason, we must at this time decline the applications of those who have been so injected. If you are in that category, please know that we have agonized over this decision, and we are here to support you fully online with the wisdom that will enable the overcoming of suffering—and attainment of the deathless Self. By the way, this policy will also apply to anyone who receives the bird flu injection that is on the horizon with the next planned pandemic. Please be alert and informed.",
        is_required=False,
        order=9
    )
    db.add(covid_notice)

    covid_fields = [
        ("Did you receive any version of the covid injection?", FieldType.SELECT, "If so, please read our vaxx policy above. If not, we strongly encourage you NOT to take the 'vaccine' before coming to the ashram", 10, [
            "No, I have not taken the shot nor am planning to take it",
            "Yes, I have taken the shot or have planned to do so before coming to the ashram"
        ]),
        ("Have you been living with anyone who has had the injection?", FieldType.TEXTAREA, "If so, for how long and in what sort of relationship?", 11),
        ("Have you had close and prolonged physical contact with someone who had the injection within the past six months?", FieldType.TEXTAREA, "If so, please let us know if you have experienced any symptoms of either a psychological or somatic nature during this period", 12),
        ("Do you have funds available to you to cover possible medical related costs that may be incurred while you are here at the ashram?", FieldType.SELECT, None, 13, ["Yes", "No"]),
        ("Doctor Contact", FieldType.TEXT, "If you have any current medical conditions, please provide the contact information of your doctor. Include name, phone number, and the email address of your doctor or 'N/A' if this is not applicable to you", 14),
    ]

    for label, field_type, help_text, order, *options_list in covid_fields:
        options = options_list[0] if options_list else None
        field = FormField(
            id=str(uuid.uuid4()),
            section_id=section4.id,
            label=label,
            field_type=field_type,
            placeholder=None,
            help_text=help_text,
            is_required=True,
            order=order,
            options=options
        )
        db.add(field)

    # Section 5: Ashram Stay
    section5 = FormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="Ashram Stay",
        description=None,
        order=4
    )
    db.add(section5)
    db.flush()

    ashram_fields = [
        ("Do you agree to follow our Ashram Guidelines during your stay?", FieldType.SELECT, "To protect the integrity of this spiritual refuge, we want to ensure that all who come to stay with us have a complete understanding of our path and vision, feel naturally aligned with what we offer, and are ready to embark on this adventure and offer a spirit of joyful participation. Please review our ashram guidelines here: https://www.satyoga.org/guidelines", 0, [
            "Yes, have read and agree to follow the Ashram Guidelines",
            "No, I will have trouble following the Ashram Guidelines and will explain below"
        ]),
        ("Please explain here if you may have trouble following the Ashram Guidelines", FieldType.TEXTAREA, None, 1),
        ("Smoking Policy", FieldType.TEXTAREA, "The Ashram has a no smoking policy. Please let us know if you have been a smoker in the past or if you are currently trying to quit, or using nicotine patches/gum?", 2),
        ("Do you have funds available to you to cover the program contribution?", FieldType.SELECT, None, 3, ["Yes", "No"]),
        ("Health Insurance", FieldType.SELECT, "If you are from outside Costa Rica, then you will need to send us a copy of your health insurance policy that is valid for your time in Costa Rica. If you are from Costa Rica, you will need to have a valid caja card. Otherwise, you will need to purchase emergency travel insurance for your time here. Your acceptance into the program is contingent on this document. Do you have international health insurance?", 4, [
            "Yes",
            "No",
            "Not currently, but I would be able to get insurance if accepted to the program"
        ]),
    ]

    for label, field_type, help_text, order, *options_list in ashram_fields:
        options = options_list[0] if options_list else None
        field = FormField(
            id=str(uuid.uuid4()),
            section_id=section5.id,
            label=label,
            field_type=field_type,
            placeholder=None,
            help_text=help_text,
            is_required=label != "Please explain here if you may have trouble following the Ashram Guidelines",
            order=order,
            options=options
        )
        db.add(field)

    db.commit()
    print(f"✅ Darshan Retreat Application created successfully!")
    return form.id


def main():
    db = SessionLocal()
    try:
        print("🌟 Starting onsite retreat forms seeding...")

        # Create Darshan Retreat form
        darshan_id = create_darshan_retreat_form(db)

        print(f"\n✅ All forms created successfully!")
        print(f"\nForm IDs:")
        print(f"  - Darshan Retreat: {darshan_id}")
        print(f"\nYou can now access the form at:")
        print(f"  http://localhost:3000/apply?form=darshan-retreat-application")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
