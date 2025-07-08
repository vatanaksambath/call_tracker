"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    EyeIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, 
    AdjustmentsHorizontalIcon, XMarkIcon, ChevronLeftIcon, 
    ChevronRightIcon, DocumentMagnifyingGlassIcon, UserCircleIcon, 
    CakeIcon, PhoneIcon, EnvelopeIcon, BriefcaseIcon, MapPinIcon, 
    TagIcon, BuildingOffice2Icon, CalendarDaysIcon, InformationCircleIcon 
} from "@heroicons/react/24/outline";
import Button from "../ui/button/Button";
import api from "@/lib/api";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import { create } from "domain";

// Interface for the raw data from the staff API
interface ApiStaffData {
  staff_id: number;
  staff_code: string;
  first_name: string;
  last_name: string
  gender_name: string;
  date_of_birth: string;
  position: string;
  department: string | null;
  employment_type: string;
  employment_start_date: string;
  employment_end_date: string | null;
  employment_level: string | null;
  current_address: string | null;
  photo_url: string[] | null;
  is_active: boolean;
  contact_data: {
      contact_values: {
          contact_number: string;
          is_primary: boolean;
          remark: string;
      }[];
  }[];
  created_date: string;
  created_by: string;
  last_update: string;
  updated_by: string;
}

// Cleaned-up interface for use within the frontend component
interface Staff {
  id: string;
  staffCode: string;
  fullName: string;
  avatar: string;
  gender: string;
  phone: string;
  dob: string;
  position: string;
  department: string;
  employment_type: string;
  employment_start_date: string;
  employment_end_date: string | null;
  employment_level: string | null;
  current_address: string | null;
  photo_url: string[] | null;
  status: 'Active' | 'Inactive';
  raw: ApiStaffData;
}

const allColumns: { key: keyof Staff; label: string }[] = [
    { key: 'fullName', label: 'Staff Name' },
    { key: 'staffCode', label: 'Staff ID' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'phone', label: 'Primary Phone' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'employment_type', label: 'Employment Type' },
    { key: 'employment_level', label: 'Employment Level' },
    { key: 'employment_start_date', label: 'Employment Start Date' },
    { key: 'employment_end_date', label: 'Employment End Date' },
    { key: 'status', label: 'Status' },
];

const ActionMenu = ({ staff, onSelect }: { staff: Staff; onSelect: (action: 'view' | 'edit' | 'delete', staff: Staff) => void; }) => {
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
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
                    <ul className="py-1">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('view', staff); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><EyeIcon className="h-4 w-4"/> View</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('edit', staff); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><PencilIcon className="h-4 w-4"/> Edit</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('delete', staff); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><TrashIcon className="h-4 w-4"/> Delete</a></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const ColumnSelector = ({ visibleColumns, setVisibleColumns }: { visibleColumns: (keyof Staff)[], setVisibleColumns: React.Dispatch<React.SetStateAction<(keyof Staff)[]>> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleColumn = (columnKey: keyof Staff) => {
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

const ViewStaffModal = ({ staff, onClose }: { staff: Staff | null; onClose: () => void; }) => {
    if (!staff) return null;

    const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm text-gray-800 dark:text-gray-100">{value || '-'}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Staff Information</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" />
                    </Button>
                </div>
                
                <div className="flex-grow overflow-y-auto mt-6 pr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 lg:border-r lg:pr-6 border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col items-center text-center">
                                <Image src={staff.avatar} alt={staff.fullName} width={128} height={128} className="rounded-full bg-gray-200 mb-4" onError={(e) => { e.currentTarget.src = "/images/user/user-02.jpg"; }}/>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase">{staff.fullName}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{staff.staffCode}</p>
                                <div className="mt-2">
                                    <Badge size="md" color={staff.status === "Active" ? "success" : "error"}>{staff.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Personal Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem icon={UserCircleIcon} label="Gender" value={staff.gender} />
                                    <DetailItem icon={PhoneIcon} label="Primary Phone" value={staff.phone} />
                                    <DetailItem icon={CakeIcon} label="Date of Birth" value={staff.dob} />
                                </div>
                            </div>
                             <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Employment Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem icon={BriefcaseIcon} label="Position" value={staff.position} />
                                    <DetailItem icon={BuildingOffice2Icon} label="Department" value={staff.department} />
                                    <DetailItem icon={CalendarDaysIcon} label="Start Date" value={staff.employment_start_date} />
                                    <DetailItem icon={CalendarDaysIcon} label="Start Date" value={staff.employment_end_date} />
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <DetailItem icon={MapPinIcon} label="Address" value={staff.current_address} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={onClose}>Close</Button>
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

interface StaffTableProps {
    searchQuery: string;
    searchType: string;
}

export default function StaffTable({ searchQuery, searchType }: StaffTableProps) {
    const router = useRouter();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const [visibleColumns, setVisibleColumns] = useState<(keyof Staff)[]>(() => {
        try {
            const savedColumns = localStorage.getItem('staffTableVisibleColumns');
            return savedColumns ? JSON.parse(savedColumns) : ['fullName', 'gender', 'dob', 'phone', 'position', 'status'];
        } catch (error) {
            return ['fullName', 'gender', 'dob', 'phone', 'position', 'status'];
        }
    });

    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, searchType]);

    useEffect(() => {
        const fetchStaff = async () => {
            setIsLoading(true);
            try {
                const response = await api.post('/staff/pagination', {
                    page_number: String(currentPage),
                    page_size: String(pageSize),
                    search_type: searchType,
                    query_search: searchQuery
                });
                
                const apiResult = response.data[0];
                if (apiResult && apiResult.data) {
                    const formattedStaff: Staff[] = apiResult.data.map((staff: ApiStaffData) => {
                        const primaryContact = staff.contact_data?.flatMap(cd => cd.contact_values).find(cv => cv.is_primary);
                        return {
                            id: String(staff.staff_id),
                            staffCode: staff.staff_code,
                            fullName: `${staff.first_name} ${staff.last_name}`,
                            avatar: staff.photo_url?.[0] || "/images/user/user-02.jpg",
                            gender: staff.gender_name,
                            phone: primaryContact?.contact_number || 'N/A',
                            dob: staff.date_of_birth,
                            created_date: new Date(staff.created_date).toLocaleDateString(),
                            created_by: staff.created_by,
                            last_update: new Date(staff.last_update).toLocaleDateString(),
                            updated_by: staff.updated_by,
                            employmentType: staff.employment_type,
                            employmentStartDate: staff.employment_start_date,
                            employmentEndDate: staff.employment_end_date || 'N/A',
                            employmentLevel: staff.employment_level || 'N/A',
                            position: staff.position,
                            department: staff.department || 'N/A',
                            address: staff.current_address || 'N/A',
                            status: staff.is_active ? 'Active' : 'Inactive',
                            raw: staff,
                        };
                    });
                    
                    setStaffList(formattedStaff);
                    setTotalRows(apiResult.total_row);
                } else {
                    setStaffList([]);
                    setTotalRows(0);
                }

            } catch (error) {
                console.error("Failed to fetch staff:", error);
                setStaffList([]);
                setTotalRows(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStaff();
    }, [currentPage, pageSize, searchQuery, searchType]);

    useEffect(() => {
        localStorage.setItem('staffTableVisibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const handleActionSelect = (action: 'view' | 'edit' | 'delete', staff: Staff) => {
        if (action === 'view') {
            setSelectedStaff(staff);
        } else if (action === 'edit') {
            router.push(`/staff/update/${staff.id}`);
        } else {
            console.log(`${action} staff ${staff.id}`);
        }
    };

    const renderCellContent = (staff: Staff, columnKey: keyof Staff) => {
        switch (columnKey) {
            case 'fullName':
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                            <Image
                                src={staff.avatar}
                                alt={staff.fullName}
                                width={128}
                                height={128}
                                className="rounded-full object-cover bg-gray-200"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/user/user-02.jpg";
                                }}
                            />
                        </div>
                        <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{staff.fullName}</span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{staff.staffCode}</span>
                        </div>
                    </div>
                );
            case 'status':
                return (
                    <Badge size="sm" color={staff.status === "Active" ? "success" : "error"}>
                        {staff.status}
                    </Badge>
                );
            default:
                return  <span className="text-gray-600 dark:text-gray-400">
                            {typeof staff[columnKey] === 'string' || typeof staff[columnKey] === 'number'
                            ? staff[columnKey]
                            : ''}
                        </span>;
        }
    };

    const sortedVisibleColumns = allColumns.filter(col => visibleColumns.includes(col.key));
    const totalPages = Math.ceil(totalRows / pageSize);

    return (
        <>
            <LoadingOverlay isLoading={isLoading} />
            <div className="rounded-xl border-t border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] flex flex-col h-full">
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
                            {staffList.length === 0 && !isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={sortedVisibleColumns.length + 1} className="h-full">
                                        <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-400 gap-2 py-10">
                                        <DocumentMagnifyingGlassIcon className="h-12 w-12" />
                                        <span className="font-medium">No staff found.</span>
                                        <span className="text-sm">Try adjusting your search or filters.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staffList.map((staff) => (
                                    <TableRow key={staff.id}>
                                        {sortedVisibleColumns.map(col => (
                                            <TableCell key={`${staff.id}-${col.key}`} className="px-5 py-4 text-start text-theme-sm">
                                                {renderCellContent(staff, col.key)}
                                            </TableCell>
                                        ))}
                                        <TableCell className="px-4 py-3 text-center">
                                            <ActionMenu staff={staff} onSelect={handleActionSelect} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="p-4 flex-shrink-0 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Showing {staffList.length} of {totalRows} results</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
            <ViewStaffModal staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
        </>
    );
}
