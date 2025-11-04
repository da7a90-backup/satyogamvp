-- Migration: Seed/Update contact_info with current data from frontend
-- Date: 2025-11-04

-- Update the existing contact_info record with all current data
UPDATE contact_info SET
    tagline = 'NEED ASSISTANCE OR MORE INFORMATION?',
    heading = 'Contact us',
    description = 'We''re here to help. If you have questions about the website, upcoming retreats (online or onsite), or need assistance, please select the topic in the form below and submit your query.',
    email = 'hello@satyoga.com',
    phone = '+1 (000) 000-0000',
    address = 'Fila San Marcos, Rio Nuevo, Perez Zeledon, Costa Rica',
    hero_image = '/contactusbanner.jpg',
    map_image = NULL, -- Will be updated once map image is uploaded to Cloudflare
    form_fields = '[
        {
            "id": "firstName",
            "label": "First name",
            "type": "text",
            "placeholder": "First name",
            "required": true,
            "gridColumn": "1"
        },
        {
            "id": "lastName",
            "label": "Last name",
            "type": "text",
            "placeholder": "Last name",
            "required": true,
            "gridColumn": "2"
        },
        {
            "id": "email",
            "label": "Email",
            "type": "email",
            "placeholder": "you@company.com",
            "required": true,
            "gridColumn": "1/3"
        },
        {
            "id": "topic",
            "label": "Choose a topic",
            "type": "select",
            "placeholder": "Select one...",
            "required": true,
            "gridColumn": "1/3",
            "options": [
                "General Inquiry",
                "Retreat Information",
                "Membership Questions",
                "Technical Support",
                "Other"
            ]
        },
        {
            "id": "message",
            "label": "Message",
            "type": "textarea",
            "placeholder": "Leave us a message...",
            "required": true,
            "rows": 5,
            "gridColumn": "1/3"
        },
        {
            "id": "agreeToPrivacy",
            "label": "Privacy Policy",
            "type": "checkbox",
            "placeholder": "You agree to our friendly <a href=\"/privacy\" style=\"color: #384250; text-decoration: underline;\">privacy policy</a>.",
            "required": true,
            "gridColumn": "1/3"
        }
    ]'::jsonb,
    privacy_policy_text = 'You agree to our friendly',
    privacy_policy_link = '/privacy',
    submit_button_text = 'Submit',
    success_message = 'Thank you! Your message has been sent successfully.',
    error_message = 'Something went wrong. Please try again.',
    is_active = true,
    updated_at = NOW()
WHERE id = 1;

-- If no record exists, insert a new one
INSERT INTO contact_info (
    tagline, heading, description, email, phone, address,
    hero_image, map_image, form_fields,
    privacy_policy_text, privacy_policy_link,
    submit_button_text, success_message, error_message,
    is_active, updated_at
) SELECT
    'NEED ASSISTANCE OR MORE INFORMATION?',
    'Contact us',
    'We''re here to help. If you have questions about the website, upcoming retreats (online or onsite), or need assistance, please select the topic in the form below and submit your query.',
    'hello@satyoga.com',
    '+1 (000) 000-0000',
    'Fila San Marcos, Rio Nuevo, Perez Zeledon, Costa Rica',
    '/contactusbanner.jpg',
    NULL, -- Will be updated once map image is uploaded to Cloudflare
    '[
        {
            "id": "firstName",
            "label": "First name",
            "type": "text",
            "placeholder": "First name",
            "required": true,
            "gridColumn": "1"
        },
        {
            "id": "lastName",
            "label": "Last name",
            "type": "text",
            "placeholder": "Last name",
            "required": true,
            "gridColumn": "2"
        },
        {
            "id": "email",
            "label": "Email",
            "type": "email",
            "placeholder": "you@company.com",
            "required": true,
            "gridColumn": "1/3"
        },
        {
            "id": "topic",
            "label": "Choose a topic",
            "type": "select",
            "placeholder": "Select one...",
            "required": true,
            "gridColumn": "1/3",
            "options": [
                "General Inquiry",
                "Retreat Information",
                "Membership Questions",
                "Technical Support",
                "Other"
            ]
        },
        {
            "id": "message",
            "label": "Message",
            "type": "textarea",
            "placeholder": "Leave us a message...",
            "required": true,
            "rows": 5,
            "gridColumn": "1/3"
        },
        {
            "id": "agreeToPrivacy",
            "label": "Privacy Policy",
            "type": "checkbox",
            "placeholder": "You agree to our friendly <a href=\"/privacy\" style=\"color: #384250; text-decoration: underline;\">privacy policy</a>.",
            "required": true,
            "gridColumn": "1/3"
        }
    ]'::jsonb,
    'You agree to our friendly',
    '/privacy',
    'Submit',
    'Thank you! Your message has been sent successfully.',
    'Something went wrong. Please try again.',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM contact_info WHERE id = 1);
