"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadsTable from "@/components/tables/LeadsTable";
import { Metadata } from "next";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import SearchComponent from "@/components/common/SearchComponent";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Lead", href: "/lead" }
  ];

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("lead_id");

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
            <Link href="/lead/create" className="block w-full md:w-auto">
              <Button size="md" variant="primary">
                Add Lead +
              </Button>
            </Link>          
            <SearchComponent onSearch={handleSearch} />
          </div>
          <LeadsTable searchQuery={searchQuery} searchType={searchType} />
        </ComponentCard>
      </div>
    </div>
  );
}