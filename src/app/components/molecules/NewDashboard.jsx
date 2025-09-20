'use client';

import { useState } from 'react';
import { Bell, User, Heart, Lock, Menu } from 'lucide-react';

import StudentDashboardHome from '../organisms/StudentDashboardHome';
import Container from '../atoms/Container';
import StudentProfile from '../organisms/StudentProfile';
//import StudentApplication from '../organisms/StudentApplication';
import StudentWishlist from '../organisms/StudentWishlist';
import StudentPassword from '../organisms/StudentPassword';
import StudentNotifications from '../organisms/StudentNotifications';

const NewDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  

  const renderComponent = () => {
    switch (activeTab) {
      case 'Dashboard': return <StudentDashboardHome />;
      case 'Profile': return <StudentProfile />;
      /*case 'Application': return <StudentApplication />;*/
      case 'Wishlist': return <StudentWishlist />;
      case 'Password': return <StudentPassword />;
      case 'Notifications': return <StudentNotifications />;
      default: return <StudentDashboardHome />;
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

export default NewDashboard;