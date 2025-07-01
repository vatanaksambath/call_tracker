"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { EyeIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import Button from "../ui/button/Button";

interface Lead {
  id: number;
  fullName: string;
  avatar: string;
  gender: string;
  phone: string;
  dob: string;
  contactDate: string;
  email: string;
  leadSource: string;
  customerType: string;
  status: 'Active' | 'Pending' | 'Cancel';
}

const tableData: Lead[] = [
  {
    id: 1,
    fullName: "Lindsey Curtis",
    avatar: "/images/user/user-17.jpg",
    gender: "Female",
    phone: "012 345 678",
    dob: "15-06-1990",
    contactDate: "01-07-2024",
    email: "lindsey.c@example.com",
    leadSource: "Website",
    customerType: "New",
    status: "Active",
  },
  {
    id: 2,
    fullName: "Kaiya George",
    avatar: "/images/user/user-18.jpg",
    gender: "Female",
    phone: "098 765 432",
    dob: "22-11-1992",
    contactDate: "30-06-2024",
    email: "kaiya.g@example.com",
    leadSource: "Referral",
    customerType: "Returning",
    status: "Pending",
  },
  {
    id: 3,
    fullName: "Zain Geidt",
    avatar: "/images/user/user-19.jpg",
    gender: "Male",
    phone: "088 123 456",
    dob: "03-02-1988",
    contactDate: "29-06-2024",
    email: "zain.g@example.com",
    leadSource: "Facebook",
    customerType: "VIP",
    status: "Active",
  },
  {
    id: 4,
    fullName: "Abram Schleifer",
    avatar: "/images/user/user-20.jpg",
    gender: "Male",
    phone: "077 888 999",
    dob: "19-09-2001",
    contactDate: "28-06-2024",
    email: "abram.s@example.com",
    leadSource: "Walk-in",
    customerType: "New",
    status: "Cancel",
  },
];

const allColumns: { key: keyof Lead; label: string }[] = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'contactDate', label: 'Date Registered' },
    { key: 'email', label: 'Email' },
    { key: 'leadSource', label: 'Lead Source' },
    { key: 'customerType', label: 'Customer Type' },
    { key: 'status', label: 'Status' },
];

const ActionMenu = ({ leadId }: { leadId: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
                <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
                    <ul className="py-1">
                        <li><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><EyeIcon className="h-4 w-4"/> View</a></li>
                        <li><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><PencilIcon className="h-4 w-4"/> Edit</a></li>
                        <li><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><TrashIcon className="h-4 w-4"/> Delete</a></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const ColumnSelector = ({ visibleColumns, setVisibleColumns }: { visibleColumns: (keyof Lead)[], setVisibleColumns: React.Dispatch<React.SetStateAction<(keyof Lead)[]>> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleColumn = (columnKey: keyof Lead) => {
        setVisibleColumns(prev => 
            prev.includes(columnKey) 
                ? prev.filter(key => key !== columnKey) 
                : [...prev, columnKey]
        );
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Customize Columns
            </Button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
                    <div className="p-4">
                        <h4 className="font-semibold mb-2">Visible Columns</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {allColumns.map(col => (
                                <label key={col.key} className="flex items-center gap-2 text-sm">
                                    <input 
                                        type="checkbox" 
                                        checked={visibleColumns.includes(col.key)}
                                        onChange={() => toggleColumn(col.key)}
                                        className="form-checkbox h-4 w-4 rounded text-blue-600"
                                    />
                                    {col.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function LeadsTable() {
  const [visibleColumns, setVisibleColumns] = useState<(keyof Lead)[]>(() => {
    try {
      const savedColumns = localStorage.getItem('leadsTableVisibleColumns');
      if (savedColumns) {
        const parsed = JSON.parse(savedColumns);
        if (Array.isArray(parsed)) {
            return parsed;
        }
      }
    } catch (error) {
        console.error("Failed to load columns from localStorage", error);
    }
    return ['fullName', 'gender', 'dob', 'phone', 'status'];
  });

  useEffect(() => {
    try {
        localStorage.setItem('leadsTableVisibleColumns', JSON.stringify(visibleColumns));
    } catch (error) {
        console.error("Failed to save columns to localStorage", error);
    }
  }, [visibleColumns]);

  const renderCellContent = (lead: Lead, columnKey: keyof Lead) => {
    switch (columnKey) {
        case 'fullName':
            return (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                        <Image width={40} height={40} src={lead.avatar} alt={lead.fullName} />
                    </div>
                    <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{lead.fullName}</span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{lead.email}</span>
                    </div>
                </div>
            );
        case 'status':
            return (
                <Badge size="sm" color={lead.status === "Active" ? "success" : lead.status === "Pending" ? "warning" : "error"}>
                    {lead.status}
                </Badge>
            );
        default:
            return <span className="text-gray-600 dark:text-gray-400">{lead[columnKey]}</span>;
    }
  };

  const sortedVisibleColumns = allColumns.filter(col => visibleColumns.includes(col.key));

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-4 flex justify-end">
            <ColumnSelector visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
        </div>
        <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            {sortedVisibleColumns.map(col => (
                                <TableCell key={col.key} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    {col.label}
                                </TableCell>
                            ))}
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {tableData.map((lead) => (
                            <TableRow key={lead.id}>
                                {sortedVisibleColumns.map(col => (
                                    <TableCell key={`${lead.id}-${col.key}`} className="px-5 py-4 text-start text-theme-sm">
                                        {renderCellContent(lead, col.key)}
                                    </TableCell>
                                ))}
                                <TableCell className="px-4 py-3 text-center">
                                    <ActionMenu leadId={lead.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    </div>
  );
}
