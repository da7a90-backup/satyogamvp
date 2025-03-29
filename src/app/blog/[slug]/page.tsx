import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostPage } from '@/components/blog/Blog';
import { fetchAPI } from '@/lib/api';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const slug = params.slug;
  
  // In a real implementation, you would fetch the blog post from your Strapi API
  // const data = await fetchAPI(`/blog-posts?filters[slug][$eq]=${slug}&populate=*`);
  
  // If no post is found, return a generic title
  // if (!data || !data.data || data.data.length === 0) {
  //   return {
  //     title: 'Blog Post Not Found - Sat Yoga',
  //   };
  // }
  
  // const post = data.data[0].attributes;
  
  // For this example, we'll use mock data
  const post = {
    title: 'One Month in A "Most Undesirable Location"',
    excerpt: 'As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...',
  };
  
  return {
    title: `${post.title} - Sat Yoga Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPageRoute({ params }: BlogPostPageProps) {
  const slug = params.slug;
  
  // In a real implementation, you would fetch the blog post from your Strapi API
  // const data = await fetchAPI(`/blog-posts?filters[slug][$eq]=${slug}&populate=*`);
  
  // if (!data || !data.data || data.data.length === 0) {
  //   notFound();
  // }
  
  // const post = data.data[0].attributes;
  
  // Mock data for demonstration
  const post = {
    id: '1',
    title: 'One Month in A "Most Undesirable Location"',
    slug: 'one-month-undesirable-location',
    excerpt: 'As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...',
    content: `
      <p>As Shunyamurti recently stated, the undesirableness of the location of the ashram is actually its greatest virtue. There is a logic to this that bears contemplation. I contemplate this every time I have to go to Esparza, the modest town on the highway where I often have to take the car for repairs.</p>
      <p>Two weeks ago our car overheated severely and had to be towed to Esparza. I have developed a relationship with the mechanic there, and he is a nice and honest young fellow. We were stuck in town for about three hours while the car was being fixed, and so, for the first time, we decided to have lunch there. We chose a place in the town plaza. It was, as I suppose is normal in this environment, an open-air restaurant overlooking the tiny town plaza with its gazebo for small band concerts, that I think must happen on Sundays—no idea for certain as we are never in Esparza on a Sunday.</p>
      <p>But it was a weekday, a Thursday, and several shops were open; as it was between Christmas and New Years, there were a few children in the plaza, and a few adults on cell phones sitting in the gazebo. There was a big church nearby. But on the whole it was a singularly unexciting environment, as are almost all of these small Costa Rican towns. The lunch was perfectly acceptable, though nothing special. If I lived in Esparza, I am sure I would find this place perfectly adequate. But I don't live in Esparza.</p>
      <h2>The Humble Ashram Life</h2>
      <p>I live in Sat Yoga Ashram, in the Durika valley, a valley which is in the middle of nowhere, surrounded by mountains. There are no settlements more elaborate than a very humble bodega near us. The ashram has its own farm where most of our vegetables, fruits, and eggs are produced. The food is plentiful and fresh and actually quite exciting, and the entire experience of living in the ashram is vibrant and transcendental. The ashram is in a state of continuous transformation, with new buildings, new gardens, new farms, new roads being built continuously. The energy is high.</p>
      <p>Our neighbors are mostly dairy farmers or coffee producers—mainly subsistence farmers except for the dairymen, who represent wealth in this region. Their farms have been in their families for generations. There is very little initiative or entrepreneurial spirit in the local population. Around our farm there are very poor tico (native Costa Rican) folk. Many of their houses don't have electricity, and are really just shacks. But closer to the local elementary school at the entrance to the dirt road that leads to our land, there is the tienda, the grocery store with some bakery products, and the pulperia, which offers a few more items like soft drinks and hardware items.</p>
    `,
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
  };
  
  // Mock related posts
  const relatedPosts = [
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
  ];
  
  // If the request slug doesn't match the post slug, return 404
  if (slug !== post.slug) {
    notFound();
  }
  
  return <BlogPostPage post={post} relatedPosts={relatedPosts} />;
}
