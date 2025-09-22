import React from 'react'
import VisitVisaDetailPage from '../../../components/clientcomponents/VisitVisaDetailPage';


async function fetchData(slug) {
  const visaResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/singlevisacountry?slug=${slug}`, { 
    method: 'POST',
    cache: 'no-store' 
  });
  const visaData = await visaResponse.json();
  return visaData;
}

export async function generateMetadata({params}) {

  const {slug} = await params;

  const visaData = await fetchData(slug);

  if(!visaData.success){
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

  const c_title = `${visaData?.country_details?.country_name} Visit Visa`;

  return {
    title: c_title,
    description: visaData.country_details.description,
    robots: {
      index: true,
      follow: true,
      nocache: true,
    },
  };
}

const page = async ({params}) => {

  const {slug} = await params;

  const visaData = await fetchData(slug);

  return (
    <div>
      <VisitVisaDetailPage visaData = {visaData} />
    </div>
  )
}

export default page
