#!/bin/bash
#Extract ALL retreat media from WordPress via SSH

set -e

OUTPUT_DIR="/tmp/retreat_media_extraction"
mkdir -p "$OUTPUT_DIR"

echo "=================================================================================================="
echo "EXTRACTING ALL RETREAT MEDIA FROM WORDPRESS"
echo "=================================================================================================="

# List of retreat products to extract based on our local database
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
    "Reason, Revelation, and Redemption"
    "Revelation of the Real"
    "Spiritual Preparation for Social Collapse"
    "The Alchemy of Endless Ecstasy"
    "The Basis of White Magic"
    "The Ecstasy of Cosmic Consciousness"
    "The Secret of Samadhi"
    "Why Our Situation is Hopeless, Yet Hilarious"
)

for retreat in "${RETREATS[@]}"; do
    echo ""
    echo "──────────────────────────────────────────────────────────────────────────────────────────────"
    echo "Extracting: $retreat"
    echo "──────────────────────────────────────────────────────────────────────────────────────────────"

    # Create safe filename
    safe_name=$(echo "$retreat" | tr ' ' '_' | tr -cd '[:alnum:]_')

    # Find pages related to this retreat (A&V, Portal, Audio/Video)
    ssh root@104.248.239.206 "mysql -u root -p'2v.7Mhrw[T' -D satyoganew -N -e \"
        SELECT
            p.ID,
            p.post_title,
            GROUP_CONCAT(DISTINCT pm.meta_value SEPARATOR '|||')
        FROM wrt6_posts p
        LEFT JOIN wrt6_postmeta pm ON p.ID = pm.post_id
        WHERE p.post_type = 'page'
        AND p.post_status = 'publish'
        AND p.post_title LIKE '%${retreat}%'
        AND (
            pm.meta_key LIKE '_oembed_%'
            OR pm.meta_key = '_elementor_data'
            OR pm.meta_value LIKE '%youtube%'
            OR pm.meta_value LIKE '%cloudflare%'
            OR pm.meta_value LIKE '%videodelivery%'
            OR pm.meta_value LIKE '%podbean%'
            OR pm.meta_value LIKE '%.mp3%'
            OR pm.meta_value LIKE '%.mp4%'
        )
        GROUP BY p.ID, p.post_title
    \"" > "$OUTPUT_DIR/${safe_name}.txt" 2>/dev/null || echo "  ⚠ No media found"

    if [ -s "$OUTPUT_DIR/${safe_name}.txt" ]; then
        line_count=$(wc -l < "$OUTPUT_DIR/${safe_name}.txt")
        echo "  ✓ Extracted media from $line_count pages"
    else
        echo "  ⚠ No media pages found"
    fi
done

echo ""
echo "=================================================================================================="
echo "✓ EXTRACTION COMPLETE"
echo "=================================================================================================="
echo "Media data saved to: $OUTPUT_DIR"
echo ""
echo "Files created:"
ls -lh "$OUTPUT_DIR"
