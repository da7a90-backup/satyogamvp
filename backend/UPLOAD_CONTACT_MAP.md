# Upload Contact Page Map Image

## Steps to upload the map image to Cloudflare

1. **Save the map image** from the screenshot showing Costa Rica location

2. **Upload to Cloudflare Images** using the API:

```bash
# From the backend directory
curl -X POST "https://api.cloudflare.com/client/v4/accounts/6ff5acb9f54ba5e1132b12c7a7732ab8/images/v1" \
  -H "Authorization: Bearer me1vH3cjBtiJVKwqCOvCezrIMpdfp3rTqfb6j0hw" \
  -F "file=@/path/to/contact-map.png" \
  -F "id=contact-page-map"
```

3. **Get the image URL** from the response (look for `variants` array)

4. **Update the database** with the Cloudflare URL:

```sql
UPDATE contact_info
SET map_image = 'https://imagedelivery.net/YOUR_ACCOUNT_HASH/contact-page-map/public'
WHERE id = 1;
```

## Alternative: Upload via Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Navigate to Images
3. Upload the map image
4. Copy the public URL
5. Run the UPDATE SQL command above with your URL

## Current Status

- ✅ Database migration completed
- ✅ Backend API updated to serve map_image
- ✅ Contact info data seeded
- ⏳ Waiting for map image upload
- ⏳ Frontend needs to be updated to display map
