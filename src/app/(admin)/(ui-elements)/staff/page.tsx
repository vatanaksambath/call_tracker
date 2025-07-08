"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import SearchComponent from "@/components/common/SearchComponent";
import StaffTable from "@/components/tables/StaffTable";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Staff", href: "/staff" }
  ];

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("staff_id");

  const handleSearch = (query: string, type: string) => {
    setSearchQuery(query);
    setSearchType(type);
  };
  
  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex items-center gap-3 justify-between">
            <Link href="/staff/create" className="block w-full md:w-auto">
              <Button size="md" variant="primary">
                Add Staff +
              </Button>
            </Link>          
            <SearchComponent onSearch={handleSearch} />
          </div>
          <StaffTable searchQuery={searchQuery} searchType={searchType} />
        </ComponentCard>
      </div>
    </div>
  );
}