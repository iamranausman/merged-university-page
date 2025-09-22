import React from 'react'
import CourseDetailPage from '../../../components/clientcomponents/CourseDetailPage'

async function fetchData(slug) {
  // Use Promise.all to fetch data from three APIs concurrently
  const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/getcoursedetails/${slug}`, {
    method:"POST"
  })

  // Convert the responses to JSON
  const coursesData = await coursesResponse.json();

  return coursesData;
}

export async function generateMetadata({params}) {

  const { slug } = await params;

  const singleCourse = await fetchData(slug);

  console.log(singleCourse);

  const description = `${singleCourse?.data?.name} ${singleCourse?.data?.qualification} course is offered in ${singleCourse?.data?.university_name}${singleCourse?.data?.location ? ` ${singleCourse?.data?.location}` : ''} with the duration of ${singleCourse?.data?.duration}${singleCourse?.data?.language ? `, taught in ${singleCourse?.data?.language}` : ''}. ${singleCourse?.data?.yearly_fee ? `The tuition fees are $${singleCourse?.data?.yearly_fee} yearly` : ''}${singleCourse?.data?.intake ? ` and admission intake is ${singleCourse?.data?.intake}` : ''}.`;
    
  const pageTitle = `${singleCourse?.data?.name} ${singleCourse?.data?.qualification} in ${singleCourse?.data?.university_name}`;
  const imageUrl = singleCourse?.data?.universityLogo || 'https://www.universitiespage.com/filemanager/photos/1/thumbs/5d98611365165.png';
  const currentUrl = `${process.env.NEXT_PUBLIC_APP_WEBSITE_NAME}/courses/${slug}`;

  return {
    title: pageTitle,
    description: description,
    icons: {
      icon: "/assets/fav.png",
    },
    image: {
      url: imageUrl,
    },
    siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
    alternates: {
      canonical: currentUrl,
    },
    openGraph: {
      title: pageTitle,
      description: description,
      url: currentUrl,
      siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: imageUrl,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description: description,
      site: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: imageUrl
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

  const coursesData = await fetchData(slug)

  return (
    <div>
      <CourseDetailPage s_course = {coursesData} />
    </div>
  )
}

export default page
