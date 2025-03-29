// app/(main)/blog/page.tsx
import { Metadata } from 'next';
import { BlogPage } from '@/components/blog/Blog';
import { fetchAPI } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Blog - Sat Yoga',
  description: 'Explore transformative insights, spiritual wisdom, and practical guidance from the Sat Yoga community.',
};

// This is a server component that fetches blog posts from the API
export default async function BlogPageRoute() {
  // In a real implementation, you would fetch blog posts from your Strapi API
  // For this example, we'll use mock data
  
  // Example of how you would fetch from Strapi:
  // const data = await fetchAPI('/blog-posts?populate=*&sort=publishedAt:desc');
  
  // Mock data for demonstration
  const posts = [
    {
      id: '1',
      title: 'One Month in A "Most Undesirable Location"',
      slug: 'one-month-undesirable-location',
      excerpt: 'As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...',
      content: '<p>As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...</p>',
      featuredImage: '',
      category: 'Ashram Life',
      author: {
        id: '1',
        name: 'Donna',
        imageUrl: '',
      },
      publishedAt: '2024-03-21T10:00:00Z',
      readTime: 5,
      isFeatured: true,
    },
    {
      id: '2',
      title: 'My Transformational Journey',
      slug: 'transformational-journey',
      excerpt: 'I arrived at the Ashram on a Tuesday afternoon and was greeted by Amrita and taken to my Bhavan...',
      content: '<p>I arrived at the Ashram on a Tuesday afternoon and was greeted by Amrita and taken to my Bhavan...</p>',
      featuredImage: '',
      category: 'Ashram Life',
      author: {
        id: '2',
        name: 'Judy D.',
        imageUrl: '',
      },
      publishedAt: '2024-03-21T09:00:00Z',
      readTime: 5,
    },
    {
      id: '3',
      title: 'Workers\' Christmas Party',
      slug: 'workers-christmas-party',
      excerpt: 'On December 16, it was our joy to host the annual Christmas party for our local workers...',
      content: '<p>On December 16, it was our joy to host the annual Christmas party for our local workers...</p>',
      featuredImage: '',
      category: 'Ashram Life',
      author: {
        id: '3',
        name: 'Manisha',
        imageUrl: '',
      },
      publishedAt: '2024-03-21T08:00:00Z',
      readTime: 5,
    },
    {
      id: '4',
      title: 'One Month in A "Most Undesirable Location" 2',
      slug: 'one-month-undesirable-location-2',
      excerpt: 'As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...',
      content: '<p>As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...</p>',
      featuredImage: '',
      category: 'Ashram Life',
      author: {
        id: '1',
        name: 'Donna',
        imageUrl: '',
      },
      publishedAt: '2024-03-21T07:00:00Z',
      readTime: 5,
    },
    {
      id: '5',
      title: 'My Transformational Journey 2',
      slug: 'transformational-journey-2',
      excerpt: 'I arrived at the Ashram on a Tuesday afternoon and was greeted by Amrita and taken to my Bhavan...',
      content: '<p>I arrived at the Ashram on a Tuesday afternoon and was greeted by Amrita and taken to my Bhavan...</p>',
      featuredImage: '',
      category: 'Ashram Life',
      author: {
        id: '2',
        name: 'Judy D.',
        imageUrl: '',
      },
      publishedAt: '2024-03-21T06:00:00Z',
      readTime: 5,
    },
    {
      id: '6',
      title: 'Workers\' Christmas Party 2',
      slug: 'workers-christmas-party-2',
      excerpt: 'On December 16, it was our joy to host the annual Christmas party for our local workers...',
      content: '<p>On December 16, it was our joy to host the annual Christmas party for our local workers...</p>',
      featuredImage: '',
      category: 'Ashram Life',
      author: {
        id: '3',
        name: 'Manisha',
        imageUrl: '',
      },
      publishedAt: '2024-03-21T05:00:00Z',
      readTime: 5,
    },
  ];
  
  return <BlogPage initialPosts={posts} />;
}