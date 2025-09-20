// src/app/page.jsx

import CountriesGuide from "../../components/organisms/CountriesGuide";

import React from 'react'

 
export const metadata = {
  title: 'Countries Guide',
  description: 'Countries Guide',
  image: {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/assets/guid.webp`,
    width: 1900,
    height: 1080,
  },
  siteName: process.env.NEXT_PUBLIC_APP_WEBSITE_NAME,
};

export default function CountriesGuides() {
  return (
    <main className="min-h-screen  bg-white">
      <CountriesGuide />
    </main>
  );
}
