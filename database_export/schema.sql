--
-- PostgreSQL database dump
--

\restrict kc559UMsXOq5SxkwgN5yAXFhRR7Lwec1saO2sVD0c5pMHT7PMiwe9wF8yqR6qlp

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: accesslevel; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.accesslevel AS ENUM (
    'free',
    'preview',
    'gyani',
    'pragyani',
    'pragyani_plus'
);


ALTER TYPE public.accesslevel OWNER TO satyoga;

--
-- Name: accesstype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.accesstype AS ENUM (
    'LIFETIME',
    'LIMITED_12DAY'
);


ALTER TYPE public.accesstype OWNER TO satyoga;

--
-- Name: applicationstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.applicationstatus AS ENUM (
    'PENDING',
    'REVIEWED',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.applicationstatus OWNER TO satyoga;

--
-- Name: applicationtype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.applicationtype AS ENUM (
    'RETREAT_ONSITE',
    'SCHOLARSHIP',
    'GENERAL'
);


ALTER TYPE public.applicationtype OWNER TO satyoga;

--
-- Name: campaignstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.campaignstatus AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'SENT',
    'FAILED'
);


ALTER TYPE public.campaignstatus OWNER TO satyoga;

--
-- Name: componenttype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.componenttype AS ENUM (
    'VIDEO',
    'AUDIO',
    'TEXT',
    'ASSIGNMENT',
    'QUIZ'
);


ALTER TYPE public.componenttype OWNER TO satyoga;

--
-- Name: contenttype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.contenttype AS ENUM (
    'video',
    'videoandaudio',
    'audio',
    'text'
);


ALTER TYPE public.contenttype OWNER TO satyoga;

--
-- Name: enrollmentstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.enrollmentstatus AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.enrollmentstatus OWNER TO satyoga;

--
-- Name: eventtype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.eventtype AS ENUM (
    'SATSANG',
    'BOOK_GROUP',
    'LIVE_EVENT',
    'RETREAT',
    'COURSE'
);


ALTER TYPE public.eventtype OWNER TO satyoga;

--
-- Name: formcategory; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.formcategory AS ENUM (
    'APPLICATION',
    'QUESTIONNAIRE',
    'SCHOLARSHIP',
    'FEEDBACK',
    'CUSTOM'
);


ALTER TYPE public.formcategory OWNER TO satyoga;

--
-- Name: membershiptierenum; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.membershiptierenum AS ENUM (
    'FREE',
    'GYANI',
    'PRAGYANI',
    'PRAGYANI_PLUS'
);


ALTER TYPE public.membershiptierenum OWNER TO satyoga;

--
-- Name: orderstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.orderstatus AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public.orderstatus OWNER TO satyoga;

--
-- Name: paymentstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.paymentstatus AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public.paymentstatus OWNER TO satyoga;

--
-- Name: paymenttype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.paymenttype AS ENUM (
    'DONATION',
    'MEMBERSHIP',
    'COURSE',
    'RETREAT',
    'PRODUCT'
);


ALTER TYPE public.paymenttype OWNER TO satyoga;

--
-- Name: producttype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.producttype AS ENUM (
    'AUDIO',
    'VIDEO',
    'AUDIO_VIDEO',
    'AUDIO_VIDEO_TEXT',
    'RETREAT_PORTAL_ACCESS',
    'PHYSICAL',
    'EBOOK',
    'GUIDED_MEDITATION',
    'COLLECTION'
);


ALTER TYPE public.producttype OWNER TO satyoga;

--
-- Name: questiontype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.questiontype AS ENUM (
    'TEXT',
    'TEXTAREA',
    'EMAIL',
    'TEL',
    'DATE',
    'NUMBER',
    'RADIO',
    'CHECKBOX',
    'DROPDOWN',
    'FILE',
    'HEADING',
    'PARAGRAPH'
);


ALTER TYPE public.questiontype OWNER TO satyoga;

--
-- Name: registrationstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.registrationstatus AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED'
);


ALTER TYPE public.registrationstatus OWNER TO satyoga;

--
-- Name: retreattype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.retreattype AS ENUM (
    'ONLINE',
    'ONSITE_DARSHAN',
    'ONSITE_SHAKTI',
    'ONSITE_SEVADHARI'
);


ALTER TYPE public.retreattype OWNER TO satyoga;

--
-- Name: subscriberstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.subscriberstatus AS ENUM (
    'ACTIVE',
    'UNSUBSCRIBED',
    'BOUNCED'
);


ALTER TYPE public.subscriberstatus OWNER TO satyoga;

--
-- Name: subscriptionstatus; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.subscriptionstatus AS ENUM (
    'ACTIVE',
    'CANCELLED',
    'EXPIRED',
    'PENDING'
);


ALTER TYPE public.subscriptionstatus OWNER TO satyoga;

--
-- Name: triggertype; Type: TYPE; Schema: public; Owner: satyoga
--

CREATE TYPE public.triggertype AS ENUM (
    'MIXPANEL_EVENT',
    'USER_ACTION',
    'TIME_BASED'
);


ALTER TYPE public.triggertype OWNER TO satyoga;

--
-- Name: update_form_questions_updated_at(); Type: FUNCTION; Schema: public; Owner: satyoga
--

CREATE FUNCTION public.update_form_questions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_form_questions_updated_at() OWNER TO satyoga;

--
-- Name: update_form_templates_updated_at(); Type: FUNCTION; Schema: public; Owner: satyoga
--

CREATE FUNCTION public.update_form_templates_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_form_templates_updated_at() OWNER TO satyoga;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accordion_items; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.accordion_items (
    id integer NOT NULL,
    accordion_section_id integer,
    item_id integer,
    title text,
    heading text,
    content text NOT NULL,
    paragraphs jsonb,
    order_index integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.accordion_items OWNER TO satyoga;

--
-- Name: accordion_items_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.accordion_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accordion_items_id_seq OWNER TO satyoga;

--
-- Name: accordion_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.accordion_items_id_seq OWNED BY public.accordion_items.id;


--
-- Name: accordion_sections; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.accordion_sections (
    id integer NOT NULL,
    page_slug character varying(100) NOT NULL,
    section_slug character varying(100) NOT NULL,
    title character varying(500),
    description text,
    tagline character varying(200),
    type character varying(50),
    gap character varying(50),
    title_line_height character varying(50),
    background_elements jsonb,
    order_index integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.accordion_sections OWNER TO satyoga;

--
-- Name: accordion_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.accordion_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accordion_sections_id_seq OWNER TO satyoga;

--
-- Name: accordion_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.accordion_sections_id_seq OWNED BY public.accordion_sections.id;


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.analytics_events (
    id uuid NOT NULL,
    user_id uuid,
    event_name character varying(255) NOT NULL,
    event_properties jsonb,
    mixpanel_event_id character varying(255),
    ip_address character varying(50),
    user_agent character varying(500),
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.analytics_events OWNER TO satyoga;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.applications (
    id uuid NOT NULL,
    user_id uuid,
    type public.applicationtype NOT NULL,
    form_data jsonb NOT NULL,
    status public.applicationstatus NOT NULL,
    notes text,
    submitted_at timestamp without time zone NOT NULL,
    reviewed_at timestamp without time zone,
    reviewed_by uuid
);


ALTER TABLE public.applications OWNER TO satyoga;

--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.blog_categories (
    id character varying NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.blog_categories OWNER TO satyoga;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.blog_posts (
    id character varying NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image character varying(500),
    author_name character varying(100),
    author_image character varying(500),
    read_time integer,
    is_featured boolean,
    is_published boolean,
    meta_title character varying(255),
    meta_description text,
    meta_keywords character varying(500),
    category_id character varying,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.blog_posts OWNER TO satyoga;

--
-- Name: blogs; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.blogs (
    id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    content text NOT NULL,
    excerpt text,
    author_id uuid,
    category character varying(100),
    tags jsonb,
    featured_image character varying(500),
    is_published boolean NOT NULL,
    published_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.blogs OWNER TO satyoga;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.cart_items (
    id uuid NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.cart_items OWNER TO satyoga;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.carts (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.carts OWNER TO satyoga;

--
-- Name: contact_info; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.contact_info (
    id integer NOT NULL,
    tagline text,
    heading text,
    description text,
    email character varying(200) NOT NULL,
    phone character varying(50),
    address text,
    privacy_policy_text text,
    privacy_policy_link character varying(500),
    submit_button_text character varying(100),
    success_message text,
    error_message text,
    is_active boolean,
    updated_at timestamp without time zone,
    hero_image character varying(500),
    map_image character varying(500),
    form_fields jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.contact_info OWNER TO satyoga;

--
-- Name: COLUMN contact_info.hero_image; Type: COMMENT; Schema: public; Owner: satyoga
--

COMMENT ON COLUMN public.contact_info.hero_image IS 'URL to the hero/banner image for the contact page';


--
-- Name: COLUMN contact_info.map_image; Type: COMMENT; Schema: public; Owner: satyoga
--

COMMENT ON COLUMN public.contact_info.map_image IS 'URL to the map image showing location';


--
-- Name: COLUMN contact_info.form_fields; Type: COMMENT; Schema: public; Owner: satyoga
--

COMMENT ON COLUMN public.contact_info.form_fields IS 'JSON configuration for form fields';


--
-- Name: contact_info_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.contact_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_info_id_seq OWNER TO satyoga;

--
-- Name: contact_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.contact_info_id_seq OWNED BY public.contact_info.id;


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.contact_submissions (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    topic character varying(255),
    message text NOT NULL,
    submitted_at timestamp without time zone NOT NULL,
    responded_at timestamp without time zone,
    response text
);


ALTER TABLE public.contact_submissions OWNER TO satyoga;

--
-- Name: course_classes; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.course_classes (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    order_index integer NOT NULL,
    video_url character varying(500),
    duration integer,
    materials jsonb,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.course_classes OWNER TO satyoga;

--
-- Name: course_comments; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.course_comments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    class_id uuid,
    content text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.course_comments OWNER TO satyoga;

--
-- Name: course_components; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.course_components (
    id uuid NOT NULL,
    class_id uuid NOT NULL,
    type public.componenttype NOT NULL,
    title character varying(500) NOT NULL,
    content text,
    order_index integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.course_components OWNER TO satyoga;

--
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.course_enrollments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrolled_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    payment_id uuid,
    status public.enrollmentstatus NOT NULL
);


ALTER TABLE public.course_enrollments OWNER TO satyoga;

--
-- Name: course_page_sections; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.course_page_sections (
    id integer NOT NULL,
    section_type character varying(100) NOT NULL,
    data jsonb NOT NULL,
    order_index integer NOT NULL,
    is_active boolean
);


ALTER TABLE public.course_page_sections OWNER TO satyoga;

--
-- Name: course_page_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.course_page_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_page_sections_id_seq OWNER TO satyoga;

--
-- Name: course_page_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.course_page_sections_id_seq OWNED BY public.course_page_sections.id;


--
-- Name: course_progress; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.course_progress (
    id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    class_id uuid NOT NULL,
    component_id uuid,
    completed boolean NOT NULL,
    progress_percentage integer NOT NULL,
    last_accessed timestamp without time zone NOT NULL,
    time_spent integer NOT NULL
);


ALTER TABLE public.course_progress OWNER TO satyoga;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.courses (
    id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    price numeric(10,2),
    instructor_id uuid,
    thumbnail_url character varying(500),
    is_published boolean NOT NULL,
    difficulty_level character varying(50),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.courses OWNER TO satyoga;

--
-- Name: donation_projects; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.donation_projects (
    id integer NOT NULL,
    project_id character varying(100) NOT NULL,
    project_name character varying(200) NOT NULL,
    title character varying(500) NOT NULL,
    description text NOT NULL,
    image_url character varying(500),
    order_index integer NOT NULL,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.donation_projects OWNER TO satyoga;

--
-- Name: donation_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.donation_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.donation_projects_id_seq OWNER TO satyoga;

--
-- Name: donation_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.donation_projects_id_seq OWNED BY public.donation_projects.id;


--
-- Name: email_automations; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.email_automations (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    trigger_type public.triggertype NOT NULL,
    trigger_config jsonb NOT NULL,
    template_id uuid NOT NULL,
    delay_minutes integer NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.email_automations OWNER TO satyoga;

--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.email_campaigns (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    template_id uuid NOT NULL,
    subject character varying(500) NOT NULL,
    from_name character varying(255) NOT NULL,
    from_email character varying(255) NOT NULL,
    segment_filter jsonb,
    status public.campaignstatus NOT NULL,
    scheduled_at timestamp without time zone,
    sent_at timestamp without time zone,
    total_sent integer NOT NULL,
    total_opened integer NOT NULL,
    total_clicked integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.email_campaigns OWNER TO satyoga;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.email_templates (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    subject character varying(500) NOT NULL,
    beefree_template_id character varying(255),
    beefree_json jsonb,
    html_content text NOT NULL,
    variables jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.email_templates OWNER TO satyoga;

--
-- Name: emails_sent; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.emails_sent (
    id uuid NOT NULL,
    campaign_id uuid,
    automation_id uuid,
    subscriber_id uuid NOT NULL,
    template_id uuid NOT NULL,
    sendgrid_message_id character varying(255),
    sent_at timestamp without time zone NOT NULL,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    status character varying(50) NOT NULL
);


ALTER TABLE public.emails_sent OWNER TO satyoga;

--
-- Name: events; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.events (
    id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    type public.eventtype NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    location character varying(255),
    is_recurring boolean NOT NULL,
    recurrence_rule jsonb,
    max_participants integer,
    is_published boolean NOT NULL,
    thumbnail_url character varying(500),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.events OWNER TO satyoga;

--
-- Name: faq_categories; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.faq_categories (
    id integer NOT NULL,
    category_id character varying(100) NOT NULL,
    label character varying(200) NOT NULL,
    order_index integer NOT NULL,
    is_active boolean
);


ALTER TABLE public.faq_categories OWNER TO satyoga;

--
-- Name: faq_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.faq_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.faq_categories_id_seq OWNER TO satyoga;

--
-- Name: faq_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.faq_categories_id_seq OWNED BY public.faq_categories.id;


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    category_id character varying(100) NOT NULL,
    page character varying(100),
    question text NOT NULL,
    answer text NOT NULL,
    order_index integer NOT NULL,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.faqs OWNER TO satyoga;

--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.faqs_id_seq OWNER TO satyoga;

--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: form_fields; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.form_fields (
    id integer NOT NULL,
    form_type character varying(100) NOT NULL,
    field_id character varying(100) NOT NULL,
    label character varying(200) NOT NULL,
    field_type character varying(50) NOT NULL,
    placeholder text,
    required boolean,
    options jsonb,
    rows integer,
    grid_column character varying(10),
    validation_rules jsonb,
    order_index integer NOT NULL,
    is_active boolean
);


ALTER TABLE public.form_fields OWNER TO satyoga;

--
-- Name: form_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.form_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.form_fields_id_seq OWNER TO satyoga;

--
-- Name: form_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.form_fields_id_seq OWNED BY public.form_fields.id;


--
-- Name: form_questions; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.form_questions (
    id uuid NOT NULL,
    form_template_id uuid NOT NULL,
    question_text text NOT NULL,
    description text,
    placeholder character varying(255),
    question_type public.questiontype NOT NULL,
    is_required boolean NOT NULL,
    page_number integer NOT NULL,
    order_index integer NOT NULL,
    section_heading character varying(500),
    options jsonb,
    allow_other boolean NOT NULL,
    validation_rules jsonb,
    conditional_logic jsonb,
    allowed_file_types jsonb,
    max_file_size integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    CONSTRAINT check_order_index_non_negative CHECK ((order_index >= 0)),
    CONSTRAINT check_page_number_positive CHECK ((page_number >= 1))
);


ALTER TABLE public.form_questions OWNER TO satyoga;

--
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.form_submissions (
    id uuid NOT NULL,
    form_template_id uuid NOT NULL,
    user_id uuid,
    answers jsonb NOT NULL,
    files jsonb,
    submitter_email character varying(255),
    submitter_name character varying(255),
    status character varying(50) NOT NULL,
    reviewed_at timestamp without time zone,
    reviewed_by uuid,
    reviewer_notes text,
    submitted_at timestamp without time zone NOT NULL,
    ip_address character varying(45),
    user_agent character varying(500)
);


ALTER TABLE public.form_submissions OWNER TO satyoga;

--
-- Name: form_templates; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.form_templates (
    id uuid NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    category public.formcategory NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    introduction text,
    is_active boolean NOT NULL,
    is_multi_page boolean NOT NULL,
    requires_auth boolean NOT NULL,
    allow_anonymous boolean NOT NULL,
    success_message text,
    success_redirect character varying(500),
    send_confirmation_email boolean NOT NULL,
    notification_emails jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    created_by uuid
);


ALTER TABLE public.form_templates OWNER TO satyoga;

--
-- Name: galleries; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.galleries (
    id integer NOT NULL,
    page character varying(100) NOT NULL,
    section character varying(100),
    name character varying(200),
    order_index integer NOT NULL,
    is_active boolean
);


ALTER TABLE public.galleries OWNER TO satyoga;

--
-- Name: galleries_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.galleries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.galleries_id_seq OWNER TO satyoga;

--
-- Name: galleries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.galleries_id_seq OWNED BY public.galleries.id;


--
-- Name: gallery_images; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.gallery_images (
    id integer NOT NULL,
    gallery_id integer,
    src character varying(500) NOT NULL,
    alt text NOT NULL,
    size character varying(50),
    order_index integer NOT NULL
);


ALTER TABLE public.gallery_images OWNER TO satyoga;

--
-- Name: gallery_images_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.gallery_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gallery_images_id_seq OWNER TO satyoga;

--
-- Name: gallery_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.gallery_images_id_seq OWNED BY public.gallery_images.id;


--
-- Name: instructors; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.instructors (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    bio text,
    photo_url character varying(500),
    email character varying(255),
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.instructors OWNER TO satyoga;

--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.media_assets (
    id integer NOT NULL,
    original_path character varying(500) NOT NULL,
    storage_type character varying(20) NOT NULL,
    storage_id character varying(200),
    cdn_url text NOT NULL,
    variants jsonb,
    file_type character varying(50),
    file_size integer,
    width integer,
    height integer,
    alt_text text,
    context character varying(200),
    uploaded_at timestamp without time zone,
    is_active boolean,
    CONSTRAINT check_storage_type CHECK (((storage_type)::text = ANY ((ARRAY['cloudflare_images'::character varying, 'r2'::character varying])::text[])))
);


ALTER TABLE public.media_assets OWNER TO satyoga;

--
-- Name: media_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.media_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_assets_id_seq OWNER TO satyoga;

--
-- Name: media_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.media_assets_id_seq OWNED BY public.media_assets.id;


--
-- Name: membership_discount_items; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.membership_discount_items (
    id integer NOT NULL,
    feature_id integer,
    item_text text NOT NULL,
    order_index integer NOT NULL
);


ALTER TABLE public.membership_discount_items OWNER TO satyoga;

--
-- Name: membership_discount_items_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.membership_discount_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.membership_discount_items_id_seq OWNER TO satyoga;

--
-- Name: membership_discount_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.membership_discount_items_id_seq OWNED BY public.membership_discount_items.id;


--
-- Name: membership_features; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.membership_features (
    id integer NOT NULL,
    tier_slug character varying(100) NOT NULL,
    feature_type character varying(50),
    title text,
    content text NOT NULL,
    order_index integer NOT NULL
);


ALTER TABLE public.membership_features OWNER TO satyoga;

--
-- Name: membership_features_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.membership_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.membership_features_id_seq OWNER TO satyoga;

--
-- Name: membership_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.membership_features_id_seq OWNED BY public.membership_features.id;


--
-- Name: membership_pricing; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.membership_pricing (
    id integer NOT NULL,
    tier_name character varying(100) NOT NULL,
    tier_slug character varying(100) NOT NULL,
    monthly_price numeric(10,2),
    yearly_price numeric(10,2) NOT NULL,
    yearly_savings character varying(50),
    description text,
    trial_badge character varying(200),
    recommended boolean,
    yearly_only boolean,
    highlight_box text,
    order_index integer NOT NULL,
    is_active boolean,
    updated_at timestamp without time zone
);


ALTER TABLE public.membership_pricing OWNER TO satyoga;

--
-- Name: membership_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.membership_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.membership_pricing_id_seq OWNER TO satyoga;

--
-- Name: membership_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.membership_pricing_id_seq OWNED BY public.membership_pricing.id;


--
-- Name: membership_tiers; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.membership_tiers (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    description character varying(500),
    price_monthly numeric(10,2),
    price_annual numeric(10,2),
    features character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.membership_tiers OWNER TO satyoga;

--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.newsletter_subscribers (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    user_id uuid,
    subscribed_at timestamp without time zone NOT NULL,
    unsubscribed_at timestamp without time zone,
    status public.subscriberstatus NOT NULL,
    tags jsonb,
    subscriber_metadata jsonb
);


ALTER TABLE public.newsletter_subscribers OWNER TO satyoga;

--
-- Name: online_retreats; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.online_retreats (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(500) NOT NULL,
    subtitle text,
    fixed_date character varying(200),
    location character varying(100),
    duration character varying(50),
    booking_tagline text,
    intro1_title text,
    intro1_content jsonb,
    intro2_title text,
    intro2_content jsonb,
    agenda_title text,
    agenda_items jsonb,
    included_title text,
    included_items jsonb,
    hero_background character varying(500),
    images jsonb,
    video_url character varying(500),
    video_thumbnail character varying(500),
    video_type character varying(50),
    testimonial_data jsonb,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    base_price numeric(10,2),
    price_options jsonb,
    member_discount_percentage integer,
    scholarship_available boolean DEFAULT false,
    scholarship_deadline character varying(200),
    application_url character varying(500),
    schedule_tagline character varying(200),
    schedule_title character varying(500),
    schedule_items jsonb,
    intro3_title text,
    intro3_content jsonb,
    testimonial_tagline character varying(200),
    testimonial_heading character varying(500),
    intro3_media character varying(500)
);


ALTER TABLE public.online_retreats OWNER TO satyoga;

--
-- Name: COLUMN online_retreats.base_price; Type: COMMENT; Schema: public; Owner: satyoga
--

COMMENT ON COLUMN public.online_retreats.base_price IS 'Base price (usually the limited access price)';


--
-- Name: COLUMN online_retreats.price_options; Type: COMMENT; Schema: public; Owner: satyoga
--

COMMENT ON COLUMN public.online_retreats.price_options IS 'Array of pricing options with type, label, price, description';


--
-- Name: COLUMN online_retreats.member_discount_percentage; Type: COMMENT; Schema: public; Owner: satyoga
--

COMMENT ON COLUMN public.online_retreats.member_discount_percentage IS 'Discount percentage for members (e.g., 10 for 10%)';


--
-- Name: COLUMN online_retreats.scholarship_available; Type: COMMENT; Schema: public; Owner: satyoga
--

COMMENT ON COLUMN public.online_retreats.scholarship_available IS 'Whether scholarships are available for this retreat';


--
-- Name: online_retreats_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.online_retreats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.online_retreats_id_seq OWNER TO satyoga;

--
-- Name: online_retreats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.online_retreats_id_seq OWNED BY public.online_retreats.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10,2) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.order_items OWNER TO satyoga;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_number character varying(50) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status public.orderstatus NOT NULL,
    payment_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO satyoga;

--
-- Name: page_sections; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.page_sections (
    id integer NOT NULL,
    page_slug character varying(100) NOT NULL,
    section_slug character varying(100) NOT NULL,
    section_type character varying(50) NOT NULL,
    order_index integer NOT NULL,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.page_sections OWNER TO satyoga;

--
-- Name: page_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.page_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.page_sections_id_seq OWNER TO satyoga;

--
-- Name: page_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.page_sections_id_seq OWNED BY public.page_sections.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    user_id uuid,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) NOT NULL,
    payment_method character varying(50),
    tilopay_transaction_id character varying(255),
    tilopay_order_id character varying(255),
    tilopay_response jsonb,
    status public.paymentstatus NOT NULL,
    payment_type public.paymenttype NOT NULL,
    reference_id character varying(255),
    payment_metadata jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO satyoga;

--
-- Name: products; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    short_description text,
    description text,
    type public.producttype NOT NULL,
    price numeric(10,2) NOT NULL,
    regular_price numeric(10,2),
    sale_price numeric(10,2),
    digital_content_url character varying(500),
    thumbnail_url character varying(500),
    featured_image character varying(500),
    images json,
    sku character varying(100),
    woo_type json,
    downloads json,
    categories json,
    tags json,
    portal_media json,
    has_video_category boolean,
    has_audio_category boolean,
    product_slug character varying(255),
    store_slug character varying(255),
    portal_url character varying(500),
    retreat_id uuid,
    is_available boolean NOT NULL,
    in_stock boolean NOT NULL,
    stock_quantity integer,
    published boolean,
    featured boolean,
    weight character varying(50),
    allow_reviews boolean,
    external_url character varying(500),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    member_discount numeric(5,2) DEFAULT 10.00
);


ALTER TABLE public.products OWNER TO satyoga;

--
-- Name: retreat_info; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.retreat_info (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(500) NOT NULL,
    duration character varying(100),
    type character varying(100),
    category character varying(200),
    description text,
    short_description text,
    icon_url character varying(500),
    image_url character varying(500),
    order_index integer NOT NULL,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.retreat_info OWNER TO satyoga;

--
-- Name: retreat_info_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.retreat_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.retreat_info_id_seq OWNER TO satyoga;

--
-- Name: retreat_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.retreat_info_id_seq OWNED BY public.retreat_info.id;


--
-- Name: retreat_portals; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.retreat_portals (
    id uuid NOT NULL,
    retreat_id uuid NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    content jsonb,
    order_index integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.retreat_portals OWNER TO satyoga;

--
-- Name: retreat_registrations; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.retreat_registrations (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    retreat_id uuid NOT NULL,
    access_type public.accesstype,
    payment_id uuid,
    registered_at timestamp without time zone NOT NULL,
    access_expires_at timestamp without time zone,
    status public.registrationstatus NOT NULL,
    application_data jsonb
);


ALTER TABLE public.retreat_registrations OWNER TO satyoga;

--
-- Name: retreats; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.retreats (
    id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    type public.retreattype NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    price_lifetime numeric(10,2),
    price_limited numeric(10,2),
    price_onsite numeric(10,2),
    location character varying(255),
    max_participants integer,
    is_published boolean NOT NULL,
    thumbnail_url character varying(500),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.retreats OWNER TO satyoga;

--
-- Name: section_content; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.section_content (
    id integer NOT NULL,
    section_id integer,
    eyebrow character varying(200),
    heading text,
    subheading text,
    tagline character varying(200),
    content jsonb,
    quote text,
    description text,
    video_url character varying(500),
    video_thumbnail character varying(500),
    video_type character varying(50),
    logo_url character varying(500),
    logo_alt character varying(200),
    subtitle text,
    image_url character varying(500),
    image_alt character varying(200),
    background_image character varying(500),
    background_decoration character varying(500),
    secondary_images jsonb,
    button_text character varying(100),
    button_link character varying(500),
    gap character varying(50),
    title_line_height character varying(50),
    background_elements jsonb,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.section_content OWNER TO satyoga;

--
-- Name: section_content_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.section_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.section_content_id_seq OWNER TO satyoga;

--
-- Name: section_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.section_content_id_seq OWNED BY public.section_content.id;


--
-- Name: section_decorations; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.section_decorations (
    id integer NOT NULL,
    section_id integer,
    decoration_key character varying(100) NOT NULL,
    decoration_url character varying(500) NOT NULL
);


ALTER TABLE public.section_decorations OWNER TO satyoga;

--
-- Name: section_decorations_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.section_decorations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.section_decorations_id_seq OWNER TO satyoga;

--
-- Name: section_decorations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.section_decorations_id_seq OWNED BY public.section_decorations.id;


--
-- Name: section_tabs; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.section_tabs (
    id integer NOT NULL,
    section_id integer,
    tab_id character varying(100) NOT NULL,
    label character varying(200) NOT NULL,
    tagline character varying(200),
    title text,
    description text,
    button_text character varying(100),
    button_link character varying(500),
    image_url character varying(500),
    order_index integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.section_tabs OWNER TO satyoga;

--
-- Name: section_tabs_id_seq; Type: SEQUENCE; Schema: public; Owner: satyoga
--

CREATE SEQUENCE public.section_tabs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.section_tabs_id_seq OWNER TO satyoga;

--
-- Name: section_tabs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: satyoga
--

ALTER SEQUENCE public.section_tabs_id_seq OWNED BY public.section_tabs.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    tier character varying(50) NOT NULL,
    status public.subscriptionstatus NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    payment_id uuid,
    auto_renew boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO satyoga;

--
-- Name: teaching_accesses; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.teaching_accesses (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    teaching_id uuid NOT NULL,
    accessed_at timestamp without time zone NOT NULL,
    duration_watched integer
);


ALTER TABLE public.teaching_accesses OWNER TO satyoga;

--
-- Name: teaching_comments; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.teaching_comments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    teaching_id uuid NOT NULL,
    parent_id uuid,
    content text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.teaching_comments OWNER TO satyoga;

--
-- Name: teaching_favorites; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.teaching_favorites (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    teaching_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.teaching_favorites OWNER TO satyoga;

--
-- Name: teaching_watch_later; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.teaching_watch_later (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    teaching_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.teaching_watch_later OWNER TO satyoga;

--
-- Name: teachings; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.teachings (
    id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    content_type public.contenttype NOT NULL,
    access_level public.accesslevel NOT NULL,
    preview_duration integer,
    video_url character varying(500),
    audio_url character varying(500),
    text_content text,
    thumbnail_url character varying(500),
    duration integer,
    published_date timestamp without time zone,
    category character varying(100),
    tags jsonb,
    view_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    cloudflare_ids jsonb,
    podbean_ids jsonb,
    youtube_ids jsonb DEFAULT '[]'::jsonb,
    dash_preview_duration integer,
    featured character varying(50) DEFAULT NULL::character varying,
    of_the_month character varying(50) DEFAULT NULL::character varying,
    pinned character varying(50) DEFAULT NULL::character varying,
    topic character varying(100) DEFAULT NULL::character varying,
    filter_tags jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.teachings OWNER TO satyoga;

--
-- Name: user_analytics; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.user_analytics (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    total_donations numeric(10,2) NOT NULL,
    total_spent numeric(10,2) NOT NULL,
    courses_enrolled integer NOT NULL,
    courses_completed integer NOT NULL,
    retreats_attended integer NOT NULL,
    teachings_viewed integer NOT NULL,
    last_active_at timestamp without time zone,
    total_sessions integer NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.user_analytics OWNER TO satyoga;

--
-- Name: user_calendars; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.user_calendars (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid,
    retreat_id uuid,
    custom_title character varying(500),
    added_at timestamp without time zone NOT NULL,
    reminded_at timestamp without time zone
);


ALTER TABLE public.user_calendars OWNER TO satyoga;

--
-- Name: user_product_accesses; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.user_product_accesses (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    order_id uuid,
    granted_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone
);


ALTER TABLE public.user_product_accesses OWNER TO satyoga;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    phone character varying(50),
    address text,
    bio text,
    avatar_url character varying(500),
    preferences jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO satyoga;

--
-- Name: users; Type: TABLE; Schema: public; Owner: satyoga
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    membership_tier public.membershiptierenum NOT NULL,
    membership_start_date timestamp without time zone,
    membership_end_date timestamp without time zone,
    is_active boolean NOT NULL,
    is_admin boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO satyoga;

--
-- Name: accordion_items id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.accordion_items ALTER COLUMN id SET DEFAULT nextval('public.accordion_items_id_seq'::regclass);


--
-- Name: accordion_sections id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.accordion_sections ALTER COLUMN id SET DEFAULT nextval('public.accordion_sections_id_seq'::regclass);


--
-- Name: contact_info id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.contact_info ALTER COLUMN id SET DEFAULT nextval('public.contact_info_id_seq'::regclass);


--
-- Name: course_page_sections id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_page_sections ALTER COLUMN id SET DEFAULT nextval('public.course_page_sections_id_seq'::regclass);


--
-- Name: donation_projects id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.donation_projects ALTER COLUMN id SET DEFAULT nextval('public.donation_projects_id_seq'::regclass);


--
-- Name: faq_categories id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.faq_categories ALTER COLUMN id SET DEFAULT nextval('public.faq_categories_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: form_fields id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_fields ALTER COLUMN id SET DEFAULT nextval('public.form_fields_id_seq'::regclass);


--
-- Name: galleries id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.galleries ALTER COLUMN id SET DEFAULT nextval('public.galleries_id_seq'::regclass);


--
-- Name: gallery_images id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.gallery_images ALTER COLUMN id SET DEFAULT nextval('public.gallery_images_id_seq'::regclass);


--
-- Name: media_assets id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.media_assets ALTER COLUMN id SET DEFAULT nextval('public.media_assets_id_seq'::regclass);


--
-- Name: membership_discount_items id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_discount_items ALTER COLUMN id SET DEFAULT nextval('public.membership_discount_items_id_seq'::regclass);


--
-- Name: membership_features id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_features ALTER COLUMN id SET DEFAULT nextval('public.membership_features_id_seq'::regclass);


--
-- Name: membership_pricing id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_pricing ALTER COLUMN id SET DEFAULT nextval('public.membership_pricing_id_seq'::regclass);


--
-- Name: online_retreats id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.online_retreats ALTER COLUMN id SET DEFAULT nextval('public.online_retreats_id_seq'::regclass);


--
-- Name: page_sections id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.page_sections ALTER COLUMN id SET DEFAULT nextval('public.page_sections_id_seq'::regclass);


--
-- Name: retreat_info id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_info ALTER COLUMN id SET DEFAULT nextval('public.retreat_info_id_seq'::regclass);


--
-- Name: section_content id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_content ALTER COLUMN id SET DEFAULT nextval('public.section_content_id_seq'::regclass);


--
-- Name: section_decorations id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_decorations ALTER COLUMN id SET DEFAULT nextval('public.section_decorations_id_seq'::regclass);


--
-- Name: section_tabs id; Type: DEFAULT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_tabs ALTER COLUMN id SET DEFAULT nextval('public.section_tabs_id_seq'::regclass);


--
-- Name: accordion_items accordion_items_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.accordion_items
    ADD CONSTRAINT accordion_items_pkey PRIMARY KEY (id);


--
-- Name: accordion_sections accordion_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.accordion_sections
    ADD CONSTRAINT accordion_sections_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_name_key UNIQUE (name);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: contact_info contact_info_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.contact_info
    ADD CONSTRAINT contact_info_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: course_classes course_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_classes
    ADD CONSTRAINT course_classes_pkey PRIMARY KEY (id);


--
-- Name: course_comments course_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_comments
    ADD CONSTRAINT course_comments_pkey PRIMARY KEY (id);


--
-- Name: course_components course_components_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_components
    ADD CONSTRAINT course_components_pkey PRIMARY KEY (id);


--
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id);


--
-- Name: course_page_sections course_page_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_page_sections
    ADD CONSTRAINT course_page_sections_pkey PRIMARY KEY (id);


--
-- Name: course_progress course_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: donation_projects donation_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.donation_projects
    ADD CONSTRAINT donation_projects_pkey PRIMARY KEY (id);


--
-- Name: donation_projects donation_projects_project_id_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.donation_projects
    ADD CONSTRAINT donation_projects_project_id_key UNIQUE (project_id);


--
-- Name: email_automations email_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.email_automations
    ADD CONSTRAINT email_automations_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: emails_sent emails_sent_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.emails_sent
    ADD CONSTRAINT emails_sent_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: faq_categories faq_categories_category_id_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.faq_categories
    ADD CONSTRAINT faq_categories_category_id_key UNIQUE (category_id);


--
-- Name: faq_categories faq_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.faq_categories
    ADD CONSTRAINT faq_categories_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: form_fields form_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_fields
    ADD CONSTRAINT form_fields_pkey PRIMARY KEY (id);


--
-- Name: form_questions form_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT form_questions_pkey PRIMARY KEY (id);


--
-- Name: form_submissions form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);


--
-- Name: form_templates form_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_templates
    ADD CONSTRAINT form_templates_pkey PRIMARY KEY (id);


--
-- Name: galleries galleries_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.galleries
    ADD CONSTRAINT galleries_pkey PRIMARY KEY (id);


--
-- Name: gallery_images gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_pkey PRIMARY KEY (id);


--
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (id);


--
-- Name: media_assets media_assets_original_path_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_original_path_key UNIQUE (original_path);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: membership_discount_items membership_discount_items_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_discount_items
    ADD CONSTRAINT membership_discount_items_pkey PRIMARY KEY (id);


--
-- Name: membership_features membership_features_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_features
    ADD CONSTRAINT membership_features_pkey PRIMARY KEY (id);


--
-- Name: membership_pricing membership_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_pricing
    ADD CONSTRAINT membership_pricing_pkey PRIMARY KEY (id);


--
-- Name: membership_pricing membership_pricing_tier_name_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_pricing
    ADD CONSTRAINT membership_pricing_tier_name_key UNIQUE (tier_name);


--
-- Name: membership_pricing membership_pricing_tier_slug_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_pricing
    ADD CONSTRAINT membership_pricing_tier_slug_key UNIQUE (tier_slug);


--
-- Name: membership_tiers membership_tiers_name_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_tiers
    ADD CONSTRAINT membership_tiers_name_key UNIQUE (name);


--
-- Name: membership_tiers membership_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_tiers
    ADD CONSTRAINT membership_tiers_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: online_retreats online_retreats_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.online_retreats
    ADD CONSTRAINT online_retreats_pkey PRIMARY KEY (id);


--
-- Name: online_retreats online_retreats_slug_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.online_retreats
    ADD CONSTRAINT online_retreats_slug_key UNIQUE (slug);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: page_sections page_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: retreat_info retreat_info_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_info
    ADD CONSTRAINT retreat_info_pkey PRIMARY KEY (id);


--
-- Name: retreat_info retreat_info_slug_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_info
    ADD CONSTRAINT retreat_info_slug_key UNIQUE (slug);


--
-- Name: retreat_portals retreat_portals_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_portals
    ADD CONSTRAINT retreat_portals_pkey PRIMARY KEY (id);


--
-- Name: retreat_registrations retreat_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_registrations
    ADD CONSTRAINT retreat_registrations_pkey PRIMARY KEY (id);


--
-- Name: retreats retreats_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreats
    ADD CONSTRAINT retreats_pkey PRIMARY KEY (id);


--
-- Name: section_content section_content_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_content
    ADD CONSTRAINT section_content_pkey PRIMARY KEY (id);


--
-- Name: section_decorations section_decorations_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_decorations
    ADD CONSTRAINT section_decorations_pkey PRIMARY KEY (id);


--
-- Name: section_tabs section_tabs_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_tabs
    ADD CONSTRAINT section_tabs_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: teaching_accesses teaching_accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_accesses
    ADD CONSTRAINT teaching_accesses_pkey PRIMARY KEY (id);


--
-- Name: teaching_comments teaching_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_comments
    ADD CONSTRAINT teaching_comments_pkey PRIMARY KEY (id);


--
-- Name: teaching_favorites teaching_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_favorites
    ADD CONSTRAINT teaching_favorites_pkey PRIMARY KEY (id);


--
-- Name: teaching_watch_later teaching_watch_later_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_watch_later
    ADD CONSTRAINT teaching_watch_later_pkey PRIMARY KEY (id);


--
-- Name: teachings teachings_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teachings
    ADD CONSTRAINT teachings_pkey PRIMARY KEY (id);


--
-- Name: user_analytics user_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_analytics
    ADD CONSTRAINT user_analytics_pkey PRIMARY KEY (id);


--
-- Name: user_calendars user_calendars_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_calendars
    ADD CONSTRAINT user_calendars_pkey PRIMARY KEY (id);


--
-- Name: user_product_accesses user_product_accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_product_accesses
    ADD CONSTRAINT user_product_accesses_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_accordion_items_section; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_accordion_items_section ON public.accordion_items USING btree (accordion_section_id, order_index);


--
-- Name: idx_accordion_page; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_accordion_page ON public.accordion_sections USING btree (page_slug, section_slug, order_index);


--
-- Name: idx_course_sections_active; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_course_sections_active ON public.course_page_sections USING btree (is_active, order_index);


--
-- Name: idx_donation_projects_active; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_donation_projects_active ON public.donation_projects USING btree (is_active, order_index);


--
-- Name: idx_faqs_category; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_faqs_category ON public.faqs USING btree (category_id, is_active, order_index);


--
-- Name: idx_faqs_page; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_faqs_page ON public.faqs USING btree (page, is_active);


--
-- Name: idx_form_fields_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_fields_type ON public.form_fields USING btree (form_type, is_active, order_index);


--
-- Name: idx_form_questions_form_template_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_questions_form_template_id ON public.form_questions USING btree (form_template_id);


--
-- Name: idx_form_questions_page_order; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_questions_page_order ON public.form_questions USING btree (form_template_id, page_number, order_index);


--
-- Name: idx_form_submissions_form_template_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_submissions_form_template_id ON public.form_submissions USING btree (form_template_id);


--
-- Name: idx_form_submissions_status; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_submissions_status ON public.form_submissions USING btree (status);


--
-- Name: idx_form_submissions_submitted_at; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_submissions_submitted_at ON public.form_submissions USING btree (submitted_at);


--
-- Name: idx_form_submissions_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_submissions_user_id ON public.form_submissions USING btree (user_id);


--
-- Name: idx_form_templates_category; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_templates_category ON public.form_templates USING btree (category);


--
-- Name: idx_form_templates_is_active; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_templates_is_active ON public.form_templates USING btree (is_active);


--
-- Name: idx_form_templates_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_form_templates_slug ON public.form_templates USING btree (slug);


--
-- Name: idx_galleries_page; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_galleries_page ON public.galleries USING btree (page, is_active);


--
-- Name: idx_gallery_images_gallery; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_gallery_images_gallery ON public.gallery_images USING btree (gallery_id, order_index);


--
-- Name: idx_media_context; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_media_context ON public.media_assets USING btree (context);


--
-- Name: idx_media_original_path; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_media_original_path ON public.media_assets USING btree (original_path);


--
-- Name: idx_media_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_media_type ON public.media_assets USING btree (storage_type, is_active);


--
-- Name: idx_membership_features_tier; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_membership_features_tier ON public.membership_features USING btree (tier_slug, order_index);


--
-- Name: idx_membership_pricing_active; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_membership_pricing_active ON public.membership_pricing USING btree (is_active, order_index);


--
-- Name: idx_online_retreats_active; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_online_retreats_active ON public.online_retreats USING btree (is_active, fixed_date);


--
-- Name: idx_online_retreats_active_date; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_online_retreats_active_date ON public.online_retreats USING btree (is_active, fixed_date);


--
-- Name: idx_online_retreats_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_online_retreats_slug ON public.online_retreats USING btree (slug);


--
-- Name: idx_page_sections_page; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_page_sections_page ON public.page_sections USING btree (page_slug, is_active, order_index);


--
-- Name: idx_retreat_info_active; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_retreat_info_active ON public.retreat_info USING btree (is_active, order_index);


--
-- Name: idx_section_content_section; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_section_content_section ON public.section_content USING btree (section_id);


--
-- Name: idx_section_tabs_section; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_section_tabs_section ON public.section_tabs USING btree (section_id, order_index);


--
-- Name: idx_teachings_featured; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_teachings_featured ON public.teachings USING btree (featured) WHERE (featured IS NOT NULL);


--
-- Name: idx_teachings_filter_tags; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_teachings_filter_tags ON public.teachings USING gin (filter_tags) WHERE (filter_tags IS NOT NULL);


--
-- Name: idx_teachings_of_the_month; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_teachings_of_the_month ON public.teachings USING btree (of_the_month) WHERE (of_the_month IS NOT NULL);


--
-- Name: idx_teachings_pinned; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_teachings_pinned ON public.teachings USING btree (pinned) WHERE (pinned IS NOT NULL);


--
-- Name: idx_teachings_topic; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_teachings_topic ON public.teachings USING btree (topic) WHERE (topic IS NOT NULL);


--
-- Name: idx_watch_later_teaching; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_watch_later_teaching ON public.teaching_watch_later USING btree (teaching_id);


--
-- Name: idx_watch_later_user; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX idx_watch_later_user ON public.teaching_watch_later USING btree (user_id);


--
-- Name: ix_analytics_events_created_at; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_analytics_events_created_at ON public.analytics_events USING btree (created_at);


--
-- Name: ix_analytics_events_event_name; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_analytics_events_event_name ON public.analytics_events USING btree (event_name);


--
-- Name: ix_analytics_events_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_analytics_events_id ON public.analytics_events USING btree (id);


--
-- Name: ix_analytics_events_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_analytics_events_user_id ON public.analytics_events USING btree (user_id);


--
-- Name: ix_applications_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_applications_id ON public.applications USING btree (id);


--
-- Name: ix_applications_status; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_applications_status ON public.applications USING btree (status);


--
-- Name: ix_applications_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_applications_type ON public.applications USING btree (type);


--
-- Name: ix_applications_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_applications_user_id ON public.applications USING btree (user_id);


--
-- Name: ix_blogs_category; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_blogs_category ON public.blogs USING btree (category);


--
-- Name: ix_blogs_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_blogs_id ON public.blogs USING btree (id);


--
-- Name: ix_blogs_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_blogs_slug ON public.blogs USING btree (slug);


--
-- Name: ix_cart_items_cart_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- Name: ix_cart_items_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_cart_items_id ON public.cart_items USING btree (id);


--
-- Name: ix_cart_items_product_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_cart_items_product_id ON public.cart_items USING btree (product_id);


--
-- Name: ix_carts_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_carts_id ON public.carts USING btree (id);


--
-- Name: ix_carts_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_carts_user_id ON public.carts USING btree (user_id);


--
-- Name: ix_contact_submissions_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_contact_submissions_id ON public.contact_submissions USING btree (id);


--
-- Name: ix_course_classes_course_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_classes_course_id ON public.course_classes USING btree (course_id);


--
-- Name: ix_course_classes_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_classes_id ON public.course_classes USING btree (id);


--
-- Name: ix_course_comments_course_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_comments_course_id ON public.course_comments USING btree (course_id);


--
-- Name: ix_course_comments_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_comments_id ON public.course_comments USING btree (id);


--
-- Name: ix_course_comments_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_comments_user_id ON public.course_comments USING btree (user_id);


--
-- Name: ix_course_components_class_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_components_class_id ON public.course_components USING btree (class_id);


--
-- Name: ix_course_components_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_components_id ON public.course_components USING btree (id);


--
-- Name: ix_course_enrollments_course_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_enrollments_course_id ON public.course_enrollments USING btree (course_id);


--
-- Name: ix_course_enrollments_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_enrollments_id ON public.course_enrollments USING btree (id);


--
-- Name: ix_course_enrollments_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_enrollments_user_id ON public.course_enrollments USING btree (user_id);


--
-- Name: ix_course_progress_class_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_progress_class_id ON public.course_progress USING btree (class_id);


--
-- Name: ix_course_progress_enrollment_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_progress_enrollment_id ON public.course_progress USING btree (enrollment_id);


--
-- Name: ix_course_progress_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_course_progress_id ON public.course_progress USING btree (id);


--
-- Name: ix_courses_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_courses_id ON public.courses USING btree (id);


--
-- Name: ix_courses_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_courses_slug ON public.courses USING btree (slug);


--
-- Name: ix_email_automations_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_email_automations_id ON public.email_automations USING btree (id);


--
-- Name: ix_email_automations_trigger_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_email_automations_trigger_type ON public.email_automations USING btree (trigger_type);


--
-- Name: ix_email_campaigns_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_email_campaigns_id ON public.email_campaigns USING btree (id);


--
-- Name: ix_email_campaigns_status; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_email_campaigns_status ON public.email_campaigns USING btree (status);


--
-- Name: ix_email_templates_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_email_templates_id ON public.email_templates USING btree (id);


--
-- Name: ix_emails_sent_automation_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_emails_sent_automation_id ON public.emails_sent USING btree (automation_id);


--
-- Name: ix_emails_sent_campaign_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_emails_sent_campaign_id ON public.emails_sent USING btree (campaign_id);


--
-- Name: ix_emails_sent_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_emails_sent_id ON public.emails_sent USING btree (id);


--
-- Name: ix_emails_sent_subscriber_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_emails_sent_subscriber_id ON public.emails_sent USING btree (subscriber_id);


--
-- Name: ix_events_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_events_id ON public.events USING btree (id);


--
-- Name: ix_events_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_events_slug ON public.events USING btree (slug);


--
-- Name: ix_events_start_datetime; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_events_start_datetime ON public.events USING btree (start_datetime);


--
-- Name: ix_events_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_events_type ON public.events USING btree (type);


--
-- Name: ix_form_questions_form_template_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_questions_form_template_id ON public.form_questions USING btree (form_template_id);


--
-- Name: ix_form_questions_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_questions_id ON public.form_questions USING btree (id);


--
-- Name: ix_form_submissions_form_template_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_submissions_form_template_id ON public.form_submissions USING btree (form_template_id);


--
-- Name: ix_form_submissions_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_submissions_id ON public.form_submissions USING btree (id);


--
-- Name: ix_form_submissions_status; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_submissions_status ON public.form_submissions USING btree (status);


--
-- Name: ix_form_submissions_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_submissions_user_id ON public.form_submissions USING btree (user_id);


--
-- Name: ix_form_templates_category; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_templates_category ON public.form_templates USING btree (category);


--
-- Name: ix_form_templates_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_templates_id ON public.form_templates USING btree (id);


--
-- Name: ix_form_templates_is_active; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_form_templates_is_active ON public.form_templates USING btree (is_active);


--
-- Name: ix_form_templates_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_form_templates_slug ON public.form_templates USING btree (slug);


--
-- Name: ix_instructors_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_instructors_id ON public.instructors USING btree (id);


--
-- Name: ix_newsletter_subscribers_email; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_newsletter_subscribers_email ON public.newsletter_subscribers USING btree (email);


--
-- Name: ix_newsletter_subscribers_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_newsletter_subscribers_id ON public.newsletter_subscribers USING btree (id);


--
-- Name: ix_newsletter_subscribers_status; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_newsletter_subscribers_status ON public.newsletter_subscribers USING btree (status);


--
-- Name: ix_newsletter_subscribers_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_newsletter_subscribers_user_id ON public.newsletter_subscribers USING btree (user_id);


--
-- Name: ix_order_items_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_order_items_id ON public.order_items USING btree (id);


--
-- Name: ix_order_items_order_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: ix_order_items_product_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: ix_orders_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_orders_id ON public.orders USING btree (id);


--
-- Name: ix_orders_order_number; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: ix_orders_status; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_orders_status ON public.orders USING btree (status);


--
-- Name: ix_orders_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: ix_payments_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_payments_id ON public.payments USING btree (id);


--
-- Name: ix_payments_payment_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_payments_payment_type ON public.payments USING btree (payment_type);


--
-- Name: ix_payments_status; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_payments_status ON public.payments USING btree (status);


--
-- Name: ix_payments_tilopay_transaction_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_payments_tilopay_transaction_id ON public.payments USING btree (tilopay_transaction_id);


--
-- Name: ix_payments_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: ix_products_featured; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_products_featured ON public.products USING btree (featured);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_product_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_products_product_slug ON public.products USING btree (product_slug);


--
-- Name: ix_products_published; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_products_published ON public.products USING btree (published);


--
-- Name: ix_products_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_products_slug ON public.products USING btree (slug);


--
-- Name: ix_products_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_products_type ON public.products USING btree (type);


--
-- Name: ix_retreat_portals_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_retreat_portals_id ON public.retreat_portals USING btree (id);


--
-- Name: ix_retreat_portals_retreat_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_retreat_portals_retreat_id ON public.retreat_portals USING btree (retreat_id);


--
-- Name: ix_retreat_registrations_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_retreat_registrations_id ON public.retreat_registrations USING btree (id);


--
-- Name: ix_retreat_registrations_retreat_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_retreat_registrations_retreat_id ON public.retreat_registrations USING btree (retreat_id);


--
-- Name: ix_retreat_registrations_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_retreat_registrations_user_id ON public.retreat_registrations USING btree (user_id);


--
-- Name: ix_retreats_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_retreats_id ON public.retreats USING btree (id);


--
-- Name: ix_retreats_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_retreats_slug ON public.retreats USING btree (slug);


--
-- Name: ix_retreats_type; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_retreats_type ON public.retreats USING btree (type);


--
-- Name: ix_subscriptions_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_subscriptions_id ON public.subscriptions USING btree (id);


--
-- Name: ix_subscriptions_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: ix_teaching_accesses_teaching_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_accesses_teaching_id ON public.teaching_accesses USING btree (teaching_id);


--
-- Name: ix_teaching_accesses_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_accesses_user_id ON public.teaching_accesses USING btree (user_id);


--
-- Name: ix_teaching_comments_parent_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_comments_parent_id ON public.teaching_comments USING btree (parent_id);


--
-- Name: ix_teaching_comments_teaching_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_comments_teaching_id ON public.teaching_comments USING btree (teaching_id);


--
-- Name: ix_teaching_comments_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_comments_user_id ON public.teaching_comments USING btree (user_id);


--
-- Name: ix_teaching_favorites_teaching_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_favorites_teaching_id ON public.teaching_favorites USING btree (teaching_id);


--
-- Name: ix_teaching_favorites_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_favorites_user_id ON public.teaching_favorites USING btree (user_id);


--
-- Name: ix_teaching_watch_later_teaching_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_watch_later_teaching_id ON public.teaching_watch_later USING btree (teaching_id);


--
-- Name: ix_teaching_watch_later_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teaching_watch_later_user_id ON public.teaching_watch_later USING btree (user_id);


--
-- Name: ix_teachings_access_level; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teachings_access_level ON public.teachings USING btree (access_level);


--
-- Name: ix_teachings_category; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teachings_category ON public.teachings USING btree (category);


--
-- Name: ix_teachings_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_teachings_id ON public.teachings USING btree (id);


--
-- Name: ix_teachings_slug; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_teachings_slug ON public.teachings USING btree (slug);


--
-- Name: ix_user_analytics_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_user_analytics_user_id ON public.user_analytics USING btree (user_id);


--
-- Name: ix_user_calendars_event_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_user_calendars_event_id ON public.user_calendars USING btree (event_id);


--
-- Name: ix_user_calendars_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_user_calendars_id ON public.user_calendars USING btree (id);


--
-- Name: ix_user_calendars_retreat_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_user_calendars_retreat_id ON public.user_calendars USING btree (retreat_id);


--
-- Name: ix_user_calendars_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_user_calendars_user_id ON public.user_calendars USING btree (user_id);


--
-- Name: ix_user_product_accesses_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_user_product_accesses_id ON public.user_product_accesses USING btree (id);


--
-- Name: ix_user_product_accesses_product_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_user_product_accesses_product_id ON public.user_product_accesses USING btree (product_id);


--
-- Name: ix_user_product_accesses_user_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_user_product_accesses_user_id ON public.user_product_accesses USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: satyoga
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: form_questions trigger_form_questions_updated_at; Type: TRIGGER; Schema: public; Owner: satyoga
--

CREATE TRIGGER trigger_form_questions_updated_at BEFORE UPDATE ON public.form_questions FOR EACH ROW EXECUTE FUNCTION public.update_form_questions_updated_at();


--
-- Name: form_templates trigger_form_templates_updated_at; Type: TRIGGER; Schema: public; Owner: satyoga
--

CREATE TRIGGER trigger_form_templates_updated_at BEFORE UPDATE ON public.form_templates FOR EACH ROW EXECUTE FUNCTION public.update_form_templates_updated_at();


--
-- Name: accordion_items accordion_items_accordion_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.accordion_items
    ADD CONSTRAINT accordion_items_accordion_section_id_fkey FOREIGN KEY (accordion_section_id) REFERENCES public.accordion_sections(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: applications applications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id);


--
-- Name: blogs blogs_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_classes course_classes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_classes
    ADD CONSTRAINT course_classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_comments course_comments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_comments
    ADD CONSTRAINT course_comments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.course_classes(id) ON DELETE SET NULL;


--
-- Name: course_comments course_comments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_comments
    ADD CONSTRAINT course_comments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_comments course_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_comments
    ADD CONSTRAINT course_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_components course_components_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_components
    ADD CONSTRAINT course_components_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.course_classes(id) ON DELETE CASCADE;


--
-- Name: course_enrollments course_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_enrollments course_enrollments_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: course_enrollments course_enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_progress course_progress_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.course_classes(id) ON DELETE CASCADE;


--
-- Name: course_progress course_progress_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.course_components(id) ON DELETE CASCADE;


--
-- Name: course_progress course_progress_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.course_progress
    ADD CONSTRAINT course_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.course_enrollments(id) ON DELETE CASCADE;


--
-- Name: courses courses_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id);


--
-- Name: email_automations email_automations_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.email_automations
    ADD CONSTRAINT email_automations_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON DELETE CASCADE;


--
-- Name: email_campaigns email_campaigns_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON DELETE CASCADE;


--
-- Name: emails_sent emails_sent_automation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.emails_sent
    ADD CONSTRAINT emails_sent_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES public.email_automations(id) ON DELETE CASCADE;


--
-- Name: emails_sent emails_sent_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.emails_sent
    ADD CONSTRAINT emails_sent_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns(id) ON DELETE CASCADE;


--
-- Name: emails_sent emails_sent_subscriber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.emails_sent
    ADD CONSTRAINT emails_sent_subscriber_id_fkey FOREIGN KEY (subscriber_id) REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE;


--
-- Name: emails_sent emails_sent_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.emails_sent
    ADD CONSTRAINT emails_sent_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON DELETE CASCADE;


--
-- Name: faqs faqs_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.faq_categories(category_id);


--
-- Name: form_questions form_questions_form_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT form_questions_form_template_id_fkey FOREIGN KEY (form_template_id) REFERENCES public.form_templates(id) ON DELETE CASCADE;


--
-- Name: form_submissions form_submissions_form_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_form_template_id_fkey FOREIGN KEY (form_template_id) REFERENCES public.form_templates(id) ON DELETE CASCADE;


--
-- Name: form_submissions form_submissions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: form_submissions form_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: form_templates form_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.form_templates
    ADD CONSTRAINT form_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: gallery_images gallery_images_gallery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_gallery_id_fkey FOREIGN KEY (gallery_id) REFERENCES public.galleries(id) ON DELETE CASCADE;


--
-- Name: membership_discount_items membership_discount_items_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_discount_items
    ADD CONSTRAINT membership_discount_items_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.membership_features(id) ON DELETE CASCADE;


--
-- Name: membership_features membership_features_tier_slug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.membership_features
    ADD CONSTRAINT membership_features_tier_slug_fkey FOREIGN KEY (tier_slug) REFERENCES public.membership_pricing(tier_slug);


--
-- Name: newsletter_subscribers newsletter_subscribers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders orders_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_retreat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_retreat_id_fkey FOREIGN KEY (retreat_id) REFERENCES public.retreats(id);


--
-- Name: retreat_portals retreat_portals_retreat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_portals
    ADD CONSTRAINT retreat_portals_retreat_id_fkey FOREIGN KEY (retreat_id) REFERENCES public.retreats(id) ON DELETE CASCADE;


--
-- Name: retreat_registrations retreat_registrations_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_registrations
    ADD CONSTRAINT retreat_registrations_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: retreat_registrations retreat_registrations_retreat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_registrations
    ADD CONSTRAINT retreat_registrations_retreat_id_fkey FOREIGN KEY (retreat_id) REFERENCES public.retreats(id) ON DELETE CASCADE;


--
-- Name: retreat_registrations retreat_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.retreat_registrations
    ADD CONSTRAINT retreat_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: section_content section_content_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_content
    ADD CONSTRAINT section_content_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.page_sections(id) ON DELETE CASCADE;


--
-- Name: section_decorations section_decorations_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_decorations
    ADD CONSTRAINT section_decorations_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.page_sections(id) ON DELETE CASCADE;


--
-- Name: section_tabs section_tabs_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.section_tabs
    ADD CONSTRAINT section_tabs_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.page_sections(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teaching_accesses teaching_accesses_teaching_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_accesses
    ADD CONSTRAINT teaching_accesses_teaching_id_fkey FOREIGN KEY (teaching_id) REFERENCES public.teachings(id) ON DELETE CASCADE;


--
-- Name: teaching_accesses teaching_accesses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_accesses
    ADD CONSTRAINT teaching_accesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teaching_comments teaching_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_comments
    ADD CONSTRAINT teaching_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.teaching_comments(id) ON DELETE CASCADE;


--
-- Name: teaching_comments teaching_comments_teaching_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_comments
    ADD CONSTRAINT teaching_comments_teaching_id_fkey FOREIGN KEY (teaching_id) REFERENCES public.teachings(id) ON DELETE CASCADE;


--
-- Name: teaching_comments teaching_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_comments
    ADD CONSTRAINT teaching_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teaching_favorites teaching_favorites_teaching_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_favorites
    ADD CONSTRAINT teaching_favorites_teaching_id_fkey FOREIGN KEY (teaching_id) REFERENCES public.teachings(id) ON DELETE CASCADE;


--
-- Name: teaching_favorites teaching_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_favorites
    ADD CONSTRAINT teaching_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teaching_watch_later teaching_watch_later_teaching_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_watch_later
    ADD CONSTRAINT teaching_watch_later_teaching_id_fkey FOREIGN KEY (teaching_id) REFERENCES public.teachings(id) ON DELETE CASCADE;


--
-- Name: teaching_watch_later teaching_watch_later_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.teaching_watch_later
    ADD CONSTRAINT teaching_watch_later_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_analytics user_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_analytics
    ADD CONSTRAINT user_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_calendars user_calendars_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_calendars
    ADD CONSTRAINT user_calendars_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: user_calendars user_calendars_retreat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_calendars
    ADD CONSTRAINT user_calendars_retreat_id_fkey FOREIGN KEY (retreat_id) REFERENCES public.retreats(id) ON DELETE CASCADE;


--
-- Name: user_calendars user_calendars_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_calendars
    ADD CONSTRAINT user_calendars_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_product_accesses user_product_accesses_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_product_accesses
    ADD CONSTRAINT user_product_accesses_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: user_product_accesses user_product_accesses_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_product_accesses
    ADD CONSTRAINT user_product_accesses_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_product_accesses user_product_accesses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_product_accesses
    ADD CONSTRAINT user_product_accesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: satyoga
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kc559UMsXOq5SxkwgN5yAXFhRR7Lwec1saO2sVD0c5pMHT7PMiwe9wF8yqR6qlp

