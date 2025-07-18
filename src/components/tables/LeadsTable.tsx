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
import { 
    EyeIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon, 
    AdjustmentsHorizontalIcon, XMarkIcon, ChevronLeftIcon, 
    ChevronRightIcon, DocumentMagnifyingGlassIcon, UserCircleIcon, 
    CakeIcon, PhoneIcon, EnvelopeIcon, BriefcaseIcon, MapPinIcon, 
    TagIcon, BuildingOffice2Icon, CalendarDaysIcon, InformationCircleIcon 
} from "@heroicons/react/24/outline";
import Button from "../ui/button/Button";
import api from "@/lib/api";
import LoadingOverlay from "../ui/loading/LoadingOverlay";
import { useRouter } from "next/navigation";

interface ApiLeadData {
  lead_id: string;
  first_name: string;
  last_name: string;
  gender_name: string;
  email: string | null;
  date_of_birth: string;
  created_date: string;
  lead_source_name: string;
  customer_type_name: string;
  business_name: string;
  occupation: string | null;
  province_name: string | null;
  district_name: string | null;
  commune_name: string | null;
  village_name: string | null;
  home_address: string | null;
  street_address: string | null;
  is_active: boolean;
  photo_url: string | null;
  contact_data: {
      contact_values: {
          contact_number: string;
          is_primary: boolean;
          remark: string;
      }[];
  }[];
}

interface Lead {
  leadId: string;
  fullName: string;
  avatar: string;
  gender: string;
  phone: string;
  dob: string;
  contactDate: string;
  email: string;
  leadSource: string;
  customerType: string;
  business: string;
  occupation: string;
  address: string;
  status: 'Active' | 'Inactive';
  raw: ApiLeadData;
}

interface LeadsTableProps {
    searchQuery: string;
    searchType: string;
}

const allColumns: { key: keyof Lead; label: string }[] = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'leadId', label: 'Lead ID' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Primary Phone' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'contactDate', label: 'Contact Date' },
    { key: 'email', label: 'Email' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'business', label: 'Business' },
    { key: 'address', label: 'Address' },
    { key: 'leadSource', label: 'Lead Source' },
    { key: 'customerType', label: 'Customer Type' },
    { key: 'status', label: 'Status' },
];

const ActionMenu = ({ lead, onSelect }: { lead: Lead; onSelect: (action: 'view' | 'edit' | 'delete', lead: Lead) => void; }) => {
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
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('view', lead); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><EyeIcon className="h-4 w-4"/> View</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('edit', lead); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><PencilIcon className="h-4 w-4"/> Edit</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('delete', lead); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><TrashIcon className="h-4 w-4"/> Delete</a></li>
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
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
                    <div className="p-4">
                        <h4 className="font-semibold mb-2">Visible Columns</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {allColumns.map(col => (
                                <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
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

const ViewLeadModal = ({
    lead,
    onClose,
  }: {
    lead: Lead | null;
    onClose: () => void;
  }) => {
    if (!lead) return null;
  
    const DetailItem = ({
      icon: Icon,
      label,
      value,
    }: {
      icon: React.ElementType;
      label: string;
      value: React.ReactNode;
    }) => (
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-primary-500 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-100 font-medium">
            {value || "-"}
          </p>
        </div>
      </div>
    );
  
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-zinc-700 transition-all duration-300">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Lead Information
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition" />
            </Button>
          </div>
  
          <div className="flex-grow overflow-y-auto mt-6 pr-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 lg:border-r lg:pr-6 border-gray-200 dark:border-zinc-700">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Image
                    src={lead.avatar}
                    alt={lead.fullName}
                    width={128}
                    height={128}
                    className="rounded-full object-cover bg-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = "/images/user/user-02.jpg";
                    }}
                  />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                    {lead.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lead.leadId}
                  </p>
                  <Badge
                    size="md"
                    color={lead.status === "Active" ? "success" : "error"}
                    className="mt-1 px-3 py-1 text-xs rounded-full"
                  >
                    {lead.status}
                  </Badge>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Personal Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DetailItem icon={UserCircleIcon} label="Gender" value={lead.gender} />
                    <DetailItem icon={PhoneIcon} label="Primary Phone" value={lead.phone} />
                    <DetailItem icon={CakeIcon} label="Date of Birth" value={lead.dob} />
                    <DetailItem icon={BriefcaseIcon} label="Occupation" value={lead.occupation} />
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Lead Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DetailItem icon={TagIcon} label="Lead Source" value={lead.leadSource} />
                    <DetailItem icon={InformationCircleIcon} label="Customer Type" value={lead.customerType} />
                    <DetailItem icon={BuildingOffice2Icon} label="Business" value={lead.business} />
                    <DetailItem icon={CalendarDaysIcon} label="Contact Date" value={lead.contactDate} />
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                  <DetailItem icon={MapPinIcon} label="Address" value={lead.address} />
                </div>
              </div>
            </div>
          </div>
  
          {/* Footer */}
          <div className="mt-8 flex justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    const getPageNumbers = () => {
        const pages = [];
        const pageLimit = 2;
        
        if (totalPages <= 1) return [];
        pages.push(1);
        if (currentPage > pageLimit + 1) pages.push('...');
        
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) pages.push(i);

        if (currentPage < totalPages - pageLimit -1) pages.push('...');
        if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
        
        return [...new Set(pages)];
    };

    return (
        <nav className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8"><ChevronLeftIcon className="h-4 w-4" /></Button>
            {getPageNumbers().map((page, index) =>
                typeof page === 'number' ? (
                    <Button key={index} variant={currentPage === page ? 'ghost' : 'ghost'} size="icon" onClick={() => onPageChange(page)} className="h-8 w-8">{page}</Button>
                ) : (
                    <span key={index} className="flex items-center justify-center h-8 w-8 text-sm text-gray-500">...</span>
                )
            )}
            <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-8 w-8"><ChevronRightIcon className="h-4 w-4" /></Button>
        </nav>
    );
};

export default function LeadsTable({ searchQuery, searchType }: LeadsTableProps) {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const [visibleColumns, setVisibleColumns] = useState<(keyof Lead)[]>(() => {
        try {
            const savedColumns = localStorage.getItem('leadsTableVisibleColumns');
            return savedColumns ? JSON.parse(savedColumns) : ['fullName', 'gender', 'dob', 'phone', 'contactDate', 'status'];
        } catch (error) {
            return ['fullName', 'phone', 'contactDate', 'status'];
        }
    });

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, searchType]);

    useEffect(() => {
        const fetchLeads = async () => {
            setIsLoading(true);
            try {
                const response = await api.post('/lead/pagination', {
                    page_number: String(currentPage),
                    page_size: String(pageSize),
                    search_type: searchType,
                    query_search: searchQuery
                });
                
                const apiResult = response.data[0];
                if (apiResult && apiResult.data) {
                    const formattedLeads: Lead[] = apiResult.data.map((lead: ApiLeadData) => {
                        const primaryContact = lead.contact_data?.flatMap(cd => cd.contact_values).find(cv => cv.is_primary);
                        const fullAddress = [
                            lead.home_address,
                            lead.street_address,
                            lead.village_name,
                            lead.commune_name,
                            lead.district_name,
                            lead.province_name,
                        ].filter(Boolean).join(', ');

                        return {
                            leadId: lead.lead_id,
                            fullName: `${lead.first_name} ${lead.last_name}`,
                            avatar: lead.photo_url || "/images/user/user-02.jpg",
                            gender: lead.gender_name,
                            phone: primaryContact?.contact_number || 'N/A',
                            dob: lead.date_of_birth,
                            contactDate: new Date(lead.created_date).toLocaleDateString(),
                            email: lead.email || 'N/A',
                            leadSource: lead.lead_source_name,
                            customerType: lead.customer_type_name,
                            business: lead.business_name,
                            occupation: lead.occupation || 'N/A',
                            address: fullAddress || 'N/A',
                            status: lead.is_active ? 'Active' : 'Inactive',
                            raw: lead,
                        };
                    });
                    
                    setLeads(formattedLeads);
                    setTotalRows(apiResult.total_row);
                } else {
                    setLeads([]);
                    setTotalRows(0);
                }

            } catch (error) {
                console.error("Failed to fetch leads:", error);
                setLeads([]);
                setTotalRows(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeads();
    }, [currentPage, pageSize, searchType, searchQuery]);

    useEffect(() => {
        localStorage.setItem('leadsTableVisibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const handleActionSelect = (action: 'view' | 'edit' | 'delete', lead: Lead) => {
        if (action === 'view') {
            setSelectedLead(lead);
        } else if (action === 'edit') {
            router.push(`/lead/update/${lead.leadId}`);
        } else {
            console.log(`${action} lead ${lead.leadId}`);
        }
    };

    const renderCellContent = (lead: Lead, columnKey: keyof Lead) => {
        switch (columnKey) {
            case 'fullName':
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                            <Image width={40} height={40} src={lead.avatar} alt={lead.fullName} onError={(e) => { e.currentTarget.src = "/images/user/user-02.jpg"; }}/>
                        </div>
                        <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{lead.fullName}</span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{lead.leadId}</span>
                        </div>
                    </div>
                );
            case 'status':
                return (
                    <Badge size="sm" color={lead.status === "Active" ? "success" : "error"}>
                        {lead.status}
                    </Badge>
                );
            default:
                return  <span className="text-gray-600 dark:text-gray-400">
                            {typeof lead[columnKey] === 'string' || typeof lead[columnKey] === 'number'
                            ? lead[columnKey]
                            : ''}
                        </span>;
        }
    };

    const sortedVisibleColumns = allColumns.filter(col => visibleColumns.includes(col.key));
    const totalPages = Math.ceil(totalRows / pageSize);

    return (
        <>
            <LoadingOverlay isLoading={isLoading} />
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] flex flex-col h-full">
                <div className="p-2 flex-shrink-0 flex justify-end">
                    <ColumnSelector visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
                </div>
                <div className="overflow-auto flex-grow">
                    <Table className="min-w-[1000px]">
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-dark-800 z-10">
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
                            {leads.length === 0 && !isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={sortedVisibleColumns.length + 1}
                                        className="h-full"
                                    >
                                        <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-400 gap-2 py-10">
                                        <DocumentMagnifyingGlassIcon className="h-12 w-12" />
                                        <span className="font-medium">No leads found.</span>
                                        <span className="text-sm">There might be a connection issue!!!</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leads.map((lead) => (
                                    <TableRow key={lead.leadId}>
                                        {sortedVisibleColumns.map(col => (
                                            <TableCell key={`${lead.leadId}-${col.key}`} className="px-5 py-4 text-start text-theme-sm">
                                                {renderCellContent(lead, col.key)}
                                            </TableCell>
                                        ))}
                                        <TableCell className="px-4 py-3 text-center">
                                            <ActionMenu lead={lead} onSelect={handleActionSelect} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="p-4 flex-shrink-0 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Showing {leads.length} of {totalRows} results</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
            <ViewLeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
        </>
    );
}
