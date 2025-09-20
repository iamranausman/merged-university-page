'use client';

import UniversityCard from '../atoms/UniversityCard';
import Container from '../atoms/Container';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import { useEffect, useState } from 'react';

const PopularUniversities = ({data}) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try
    {
      setLoading(true);

      if(data.success){
        setUniversities(data.data);
      } else {
        console.log(data.message);
        setError(data.message)
      }

    } catch (error){
      console.log(error);
    } finally{
      setLoading(false);
    }
  }, [data]);

  return (
    <section className="bg-white">
      <Container>
        <div>
          <div className="text-center mb-16">
            <Heading level={3}>
              Popular <span className="text-[#0B6D76]">Universities</span>
            </Heading>
            <p className="max-w-2xl mx-auto">
              <Paragraph>
                Explore world-renowned universities offering top-tier education,
                diverse programs, and vibrant campus life. Choose your path to
                success at prestigious institutions.
              </Paragraph>
            </p>
          </div>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <div className="relative flex xl:justify-between lg:justify-between md:justify-center justify-center  sm:justify-center items-center gap-10 flex-wrap md:flex-nowrap">
              {universities.map((university, index) => {
                const image = university.logo && typeof university.logo === 'string' && university.logo.trim() !== ''
                  ? university.logo
                  : '/assets/university_icon.png';
                const name = university.name || 'University';
                const id = university.id;
                const slug = university.slug || '';
                const details = { id, label: 'University', name };
                return (
                  <div key={id} className="flex flex-col items-center relative">
                    <UniversityCard
                      name={name}
                      image={image}
                      id={id}
                      slug={slug}
                      className="animate-fade-in"
                    />
                    {/* Simple custom image between cards (not dot svg) */}
                    {index < universities.length - 1 && (
                      <img
                        src="/assets/dot.png"
                        alt="connector"
                        className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-full md:translate-x-4 w-[100%] h-auto hidden md:block"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default PopularUniversities;