import React from 'react';
import ArticleDetailPage from '../../components/clientcomponents/ArticleDetailPage';


async function fetchData(slug) {
  // Use Promise.all to fetch data from three APIs concurrently
  const [singleResponse, blogsResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/blogs/singleblog/`, {
      method: "POST",
      body: JSON.stringify({slug})
    }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/blogs?slug=${slug}`)
  ]);

  // Convert the responses to JSON
  const singleData = await singleResponse.json();
  const blogData = await blogsResponse.json();

  return { singleData, blogData };
}

export async function generateMetadata({params}) {

  const { slug } = await params

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/blogs/singleblog/`, {
    method: "POST",
    body: JSON.stringify({slug})
  });
  
  if (!response.ok) {
    return {
      title: '404 Page Not Found',
      description: '404 Page Not Found',
      robots: {
        index: false,
        follow: false,
        nocache: true,
      },
    };
  }


  const data = await response.json();

  const blogdata = data.data;

  let seo = []

  if(blogdata?.seo){
    try {
      seo = typeof blogdata.seo === 'string' ? JSON.parse(blogdata.seo) : blogdata.seo;
    } catch (e) {
      console.error('Error parsing SEO data:', e);
    }
  }

  const showMeta = seo.show_meta !== 'off';

  const canonical_url = `${process.env.NEXT_PUBLIC_APP_URL}/${blogdata.slug}`

  const article_title = showMeta && seo.meta_title ? seo.meta_title : blogdata.title
  const article_description = showMeta && seo.meta_description ? seo.meta_description : blogdata.short_description

  const image_url = blogdata.image ? blogdata.image : `${process.env.NEXT_PUBLIC_APP_URL}/assets/hero.webp`

  return {
    title: article_title,
    description: article_description,
    alternates: {
      canonical: canonical_url,
    },
    icons: {
      icon: "/assets/fav.png",
    },
    image: {
      url: image_url,
      width: 1900,
      height: 1080,
    },
    siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
    openGraph: {
      title: article_title,
      description: article_description,
      url: canonical_url,
      siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: image_url,
          width: 1900,
          height: 1080,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary",
      title: article_title,
      description: article_description,
      url: canonical_url,
      site: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: image_url,
          width: 1900,
          height: 1080,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
    },
  };
}

const page = async ({params}) => {

  const { slug } = await params;

  const { singleData, blogData } = await fetchData(slug);

  return (
    <div>
      <ArticleDetailPage singleData={singleData} blogData={blogData} />
    </div>
  )
}

export default page
