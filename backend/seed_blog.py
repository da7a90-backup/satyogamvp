#!/usr/bin/env python3
"""Seed blog posts from JSON file."""
import json
import requests

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOWFjOTY5OS1jYTY2LTQ2MWQtOWJjOC1hZGUyZDcxOWY5NWQiLCJleHAiOjE3NjE4MzU5MzIsInR5cGUiOiJhY2Nlc3MifQ.wBpX6JcOz7Uo5wbZ3kOGECbP3fyzftD_HgOfKkRW6rI"
API_URL = "http://127.0.0.1:8000/api/blog/posts"

# Load posts from JSON
with open('blog_posts.json', 'r') as f:
    posts = json.load(f)

# Create each post
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

for post in posts:
    response = requests.post(API_URL, json=post, headers=headers)
    if response.status_code == 201:
        data = response.json()
        status = "PUBLISHED" if data.get('is_published') else "DRAFT"
        print(f"✓ Created [{status}] {data['title']}")
    else:
        print(f"✗ Failed to create {post['title']}: {response.text}")

print(f"\n✓ Successfully created {len(posts)} blog posts")
