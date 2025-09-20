'use client';

import { useState, useEffect } from 'react';
import { Bell, User, FileText, Heart, Lock, Menu } from 'lucide-react';

import ConsultantDashboardHome from '../../organisms/consultant/ConsultantDashboardHome';
import Container from '../../atoms/Container';
import ConsultantProfile from '../../organisms/consultant/ConsultantProfile';
//import StudentApplication from '../organisms/StudentApplication';
import ConsultantWishlist from '../../organisms/consultant/ConsultantWishlist';
import ConsultantPassword from '../../organisms/consultant/ConsultantPassword';
import ConsultantNotification from '../../organisms/consultant/ConsultantNotification';

const ConsultantDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderComponent = () => {
    switch (activeTab) {
      case 'Dashboard': return <ConsultantDashboardHome />;
      case 'Profile': return <ConsultantProfile />;
      /*case 'Application': return <StudentApplication />;*/
      case 'Wishlist': return <ConsultantWishlist />;
      case 'Password': return <ConsultantPassword />;
      case 'Notifications': return <ConsultantNotification />;
      default: return <ConsultantDashboardHome />;
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Menu size={20} /> },
    { name: 'Profile', icon: <User size={20} /> },
    /*{ name: 'Application', icon: <FileText size={20} /> },*/
    { name: 'Wishlist', icon: <Heart size={20} /> },
    { name: 'Password', icon: <Lock size={20} /> },
    { name: 'Notifications', icon: <Bell size={20} /> },
  ];

  return (
    <Container>
      <div className="">
        <div className="flex gap-[30px] flex-col lg:flex-row min-h-screen pb-[50px] lg:pt-[50px] pt-[80px] bg-white p-6">
          {/* Left Sidebar - unchanged */}
          <div className="w-80 bg-[#E7F1F2] rounded-3xl p-4 space-y-4">
            {menuItems.map((item) => (
              <div
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-xl
                  ${activeTab === item.name ? 'bg-[#0B6D76] text-white' : 'hover:bg-gray-200'}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Main Content Area - unchanged */}
          <div className="bg-[#E7F1F2] w-full rounded-3xl p-8 space-y-8">
            {renderComponent()}
          </div>
        </div>

        {/* Additional Form Section - REMOVED */}
      </div>
    </Container>
  );
};

export default ConsultantDashboard;