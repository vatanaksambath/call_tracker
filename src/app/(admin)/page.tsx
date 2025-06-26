'use client'; // This directive makes it a Client Component

import type { Metadata } from "next"; // Metadata is typically for Server Components, might need adjustments or remove if not used client-side for SEO
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React, { useEffect, useState } from "react"; // Import useEffect and useState
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { useRouter } from 'next/navigation'; // Use useRouter for client-side navigation

export default function Ecommerce() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/signin'); 
    } else {
      setIsAuthenticated(true);
    }
  }, [router]); 

  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}