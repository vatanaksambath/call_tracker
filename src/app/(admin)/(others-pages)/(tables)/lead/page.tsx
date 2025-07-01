"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadsTable from "@/components/tables/LeadsTable";
import { Metadata } from "next";
import React from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Lead", href: "/lead" }
  ];

export default function LeadsPage() {
  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Leads">
          <div className="flex items-center gap-3">
            <Link href="/lead/create">
              <Button size="md" variant="primary">
                Add Lead +
              </Button>
            </Link>
            {/* <Button size="md" variant="outline">
              Edit Lead
            </Button> */}
          </div>
          <LeadsTable />
        </ComponentCard>
      </div>
    </div>
  );
}