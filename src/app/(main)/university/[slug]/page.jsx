import React from 'react'
import UniversityDetails from '../../../components/clientcomponents/UniversityDetails'


async function fetchData(slug) {
  const uniResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/universitydetails/${slug}`, { 
    method: 'POST',
    cache: 'no-store' 
  });
  const uniData = await uniResponse.json();
  return uniData;
}

export async function generateMetadata({params}) {

  const {slug} = await params;

  const uniData = await fetchData(slug);

  if(!uniData.success){
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

  const u_description = `${uniData.data.name} ${uniData.data.country} offers admission and scholarships ${new Date().getFullYear()} in total ${uniData.data.courses_count} courses. Check courses tution fees and these courses are taught in ${uniData.data.language} language.`

  const u_title = `${uniData.data.name} Admission,Scholarship & courses Fee ${new Date().getFullYear()}`;

  const canonical_url = `${process.env.NEXT_PUBLIC_APP_URL}/university/${uniData.data.slug}`

  return {
    title: u_title,
    description: u_description,
    icons: {
      icon: "/assets/fav.png",
    },
    image: {
      url: uniData?.feature_image ? uniData.feature_image : `${process.env.NEXT_PUBLIC_APP_URL}/assets/details.webp`,
      width: 1900,
      height: 1080,
    },
    siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
    alternates: {
      canonical: canonical_url,
    },
    openGraph: {
      title: u_title,
      description: u_description,
      url: canonical_url,
      siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: uniData?.feature_image ? uniData.feature_image : `${process.env.NEXT_PUBLIC_APP_URL}/assets/details.webp`,
          width: 1900,
          height: 1080,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: u_title,
      description: u_description,
      site: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: uniData?.feature_image ? uniData.feature_image : `${process.env.NEXT_PUBLIC_APP_URL}/assets/details.webp`,
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

  const {slug} = await params;

  const uniData = await fetchData(slug);

  return (
    <div>
      <UniversityDetails uniData={uniData} />
    </div>
  )
}

export default page
