#!/bin/bash
# Extract WordPress retreat media data to JSON
# Run this script via SSH on the production server

set -e

DB_USER="root"
DB_PASS="2v.7Mhrw[T"
DB_NAME="satyoganew"
OUTPUT_FILE="/tmp/wp_retreat_media.json"

echo "Extracting WordPress retreat media data..."

# Extract retreat product pages and their media
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -N -e "
SELECT JSON_OBJECT(
    'pages', JSON_ARRAYAGG(
        JSON_OBJECT(
            'page_id', p.ID,
            'page_title', p.post_title,
            'page_content', p.post_content,
            'meta', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'meta_key', pm.meta_key,
                        'meta_value', pm.meta_value
                    )
                )
                FROM wrt6_postmeta pm
                WHERE pm.post_id = p.ID
                AND (
                    pm.meta_key LIKE '_oembed_%'
                    OR pm.meta_key = '_elementor_data'
                    OR pm.meta_value LIKE '%youtube%'
                    OR pm.meta_value LIKE '%cloudflare%'
                    OR pm.meta_value LIKE '%videodelivery%'
                    OR pm.meta_value LIKE '%vimeo%'
                    OR pm.meta_value LIKE '%podbean%'
                    OR pm.meta_value LIKE '%.mp3%'
                    OR pm.meta_value LIKE '%.mp4%'
                )
            )
        )
    )
)
FROM wrt6_posts p
WHERE p.post_type = 'page'
AND p.post_status = 'publish'
AND (
    p.post_title LIKE '%Revelation%A&V%'
    OR p.post_title LIKE '%Well That Ends%A&V%'
    OR p.post_title LIKE '%Hopeless%A&V%'
    OR p.post_title LIKE '%Revelation%Store%'
    OR p.post_title LIKE '%Well That Ends%Store%'
    OR p.post_title LIKE '%Hopeless%Store%'
)
" > "$OUTPUT_FILE"

echo "✓ Data extracted to $OUTPUT_FILE"
echo "File size: $(du -h $OUTPUT_FILE | cut -f1)"

# Print first 500 characters to verify
echo ""
echo "Preview (first 500 chars):"
head -c 500 "$OUTPUT_FILE"
echo "..."
