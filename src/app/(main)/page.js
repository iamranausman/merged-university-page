import React from "react";
import Hero from "../components/organisms/Hero";
import PopularUniversities from "../components/organisms/PopularUniversities";
import PopularCourses from "../components/organisms/PopularCourses";
import LatestArticles from "../components/organisms/LatestArticles";
import "../globals.css"; // Import global styles
import BrowseCourses from "../components/organisms/BrowseCourses";
import CountryList from "../components/molecules/country";

export async function generateMetadata() {
  return {
    title: "Apply free for Study Abroad Admission directly in world top Universities.",
    description: "Apply online free of cost to abroad universities and know about their courses, tuition fees, scholarships, and intake details.",
    icons: {
      icon: "/assets/fav.png",
    },
    keywords: [
      "study abroad scholarships",
      "MBBS abroad",
      "overseas universities",
      "abroad education consulatns",
      "visa consultants",
      "full scholarship to study abrod",
      "study abroad scholarships 2020",
      "best visa consultants"
    ],
    image: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/assets/hero.webp`,
      width: 1900,
      height: 1080,
    },
    siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
    alternates: {
      canonical: process.env.NEXT_PUBLIC_APP_URL,
    },
    openGraph: {
      title: "Apply free for Study Abroad Admission directly in world top Universities.",
      description: "Apply online free of cost to abroad universities and know about their courses, tuition fees, scholarships, and intake details.",
      url: process.env.NEXT_PUBLIC_APP_URL,
      siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/assets/hero.webp`,
          width: 1900,
          height: 1080,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Apply free for Study Abroad Admission directly in world top Universities.",
      description: "Apply online free of cost to abroad universities and know about their courses, tuition fees, scholarships, and intake details.",
      site: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/assets/hero.webp`,
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

async function fetchData() {
  // Use Promise.all to fetch data from three APIs concurrently
  const [uniResponse, courseResponse, blogResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/getuniversities`, { 
      method: 'POST',
      cache: 'no-store' 
    }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/limitedcourses`, {
      method: "POST",
      cache: 'no-store'
    }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/frontend/blogs/homeblog`, {
      method: "GET",
      cache: 'no-store'
    }),
  ]);

  // Convert the responses to JSON
  const uniData = await uniResponse.json();
  const courseData = await courseResponse.json();
  const blogData = await blogResponse.json();

  return { uniData, courseData, blogData };
}

export default async function Home() {

  const { uniData, courseData, blogData } = await fetchData();

  return (
    <div>
      <Hero />
       
      <div className=" complete-page-spaceing banner-bottom-space bg-white mt-30">
        <PopularUniversities data={uniData} />
        <CountryList />
        <PopularCourses data={courseData} />
        <BrowseCourses />
        <LatestArticles data={blogData} />
      </div>
    </div>
  );
}