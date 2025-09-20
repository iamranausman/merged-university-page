"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NewDashboard from "../../../app/components/molecules/NewDashboard";
import ConSultantDashboard from "../../../app/components/organisms/ConSultantDashboard";

export default function DashboardPage() {
  // Default: student dashboard
  return <NewDashboard />;
}