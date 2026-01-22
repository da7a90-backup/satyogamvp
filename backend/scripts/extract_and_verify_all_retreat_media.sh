#!/bin/bash
# Extract and verify ALL retreat media from WordPress

set -e

OUTPUT_DIR="/tmp/retreat_media_verification"
mkdir -p "$OUTPUT_DIR"

echo "======================================================================================================="
echo "EXTRACTING AND VERIFYING ALL RETREAT MEDIA FROM WORDPRESS"
echo "======================================================================================================="

# All 17 retreat products from database
RETREATS=(
    "A Gathering of Visionaries"
    "Advanced Training for Spiritual Revolutionaries"
    "All's Well That Ends Well"
    "Corona Retreat: Awakening in a Dying World"
    "Empowered Meditation for Healing and Joy"
    "Healing with Truth Retreat"
    "How to Cultivate the Love of God"
    "Living by the Brilliance of the Tao"
    "Meditation Weekend April 2018"
    "Overcoming Death Retreat"
    "Ramana's Revelation of Liberating Truth"
    "Realize the Supreme Self Now"
    "Spiritual Preparation for Social Collapse"
    "The Alchemy of Endless Ecstasy"
    "The Basis of White Magic"
    "The Ecstasy of Cosmic Consciousness"
    "The Secret of Samadhi"
)

for retreat in "${RETREATS[@]}"; do
    echo ""
    echo "───────────────────────────────────────────────────────────────────────────────────────────────────"
    echo "Processing: $retreat"
    echo "───────────────────────────────────────────────────────────────────────────────────────────────────"

    # Create safe filename
    safe_name=$(echo "$retreat" | tr ' ' '_' | tr -cd '[:alnum:]_' | tr '[:upper:]' '[:lower:]')

    # Find ALL WordPress pages related to this retreat (Portal, A&V, Audio, Video, etc.)
    echo "  → Searching WordPress for portal pages..."
    ssh root@104.248.239.206 "mysql -u root -p'2v.7Mhrw[T' -D satyoganew -N -e \"
        SELECT
            p.ID,
            p.post_title,
            p.post_name
        FROM wrt6_posts p
        WHERE p.post_type = 'page'
        AND p.post_status = 'publish'
        AND (
            p.post_title LIKE '%${retreat}%Portal%'
            OR p.post_title LIKE '%${retreat}%Audio%'
            OR p.post_title LIKE '%${retreat}%Video%'
            OR p.post_title LIKE '%${retreat}%A&V%'
            OR p.post_title LIKE '%${retreat}%Classes%'
            OR (p.post_title LIKE '%${retreat}%' AND p.post_name LIKE '%portal%')
            OR (p.post_title LIKE '%${retreat}%' AND p.post_name LIKE '%audio%')
            OR (p.post_title LIKE '%${retreat}%' AND p.post_name LIKE '%video%')
        )
    \" 2>/dev/null" > "$OUTPUT_DIR/${safe_name}_pages.txt"

    if [ -s "$OUTPUT_DIR/${safe_name}_pages.txt" ]; then
        page_count=$(wc -l < "$OUTPUT_DIR/${safe_name}_pages.txt")
        echo "  ✓ Found $page_count portal page(s)"

        # For each portal page, extract ALL media URLs
        while IFS=$'\t' read -r page_id page_title page_name; do
            echo "    → Extracting media from: $page_title (ID: $page_id)"

            # Extract ALL media from this page
            ssh root@104.248.239.206 "mysql -u root -p'2v.7Mhrw[T' -D satyoganew -N -e \"
                SELECT DISTINCT
                    pm.meta_key,
                    pm.meta_value
                FROM wrt6_postmeta pm
                WHERE pm.post_id = $page_id
                AND (
                    pm.meta_key LIKE '_oembed_%'
                    OR pm.meta_key = '_elementor_data'
                    OR pm.meta_key = 'portal_media'
                    OR pm.meta_value LIKE '%youtube%'
                    OR pm.meta_value LIKE '%cloudflare%'
                    OR pm.meta_value LIKE '%videodelivery%'
                    OR pm.meta_value LIKE '%podbean%'
                    OR pm.meta_value LIKE '%.mp3%'
                    OR pm.meta_value LIKE '%.mp4%'
                    OR pm.meta_value LIKE '%vimeo%'
                )
            \" 2>/dev/null" > "$OUTPUT_DIR/${safe_name}_media_raw.txt"

            if [ -s "$OUTPUT_DIR/${safe_name}_media_raw.txt" ]; then
                media_count=$(wc -l < "$OUTPUT_DIR/${safe_name}_media_raw.txt")
                echo "      ✓ Found $media_count media entries"
            fi
        done < "$OUTPUT_DIR/${safe_name}_pages.txt"
    else
        echo "  ⚠ No portal pages found in WordPress"
    fi
done

echo ""
echo "======================================================================================================="
echo "✓ EXTRACTION COMPLETE"
echo "======================================================================================================="
echo "Results saved to: $OUTPUT_DIR"
echo ""
echo "Files created:"
ls -lh "$OUTPUT_DIR"
