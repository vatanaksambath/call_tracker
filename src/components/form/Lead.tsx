"use client";
/*
 * Lead Selection Component - API Ready
 * 
 * This component is fully prepared for API integration with the following features:
 * 
 * 1. STATE MANAGEMENT:
 *    - leads: Array of lead data from API
 *    - loading: Loading state for API calls
 *    - error: Error state for failed API calls
 *    - currentPage: Current pagination page
 *    - totalPages: Total pages from API response
 *    - searchTerm: Search input with debounced API calls
 * 
 * 2. API INTEGRATION READY:
 *    - fetchLeads() function ready for endpoint connection
 *    - Proper error handling and loading states
 *    - Search with 1000ms debounce to reduce API calls
 *    - Pagination support for server-side pagination
 * 
 * 3. ENDPOINT REQUIREMENTS:
 *    - GET /api/leads?page={page}&limit={limit}&search={search}
 *    - Response: { leads: ILead[], totalPages: number, currentPage: number, totalItems: number }
 * 
 * 4. FEATURES:
 *    - Real-time search with API integration
 *    - Server-side pagination
 *    - Loading and error states with retry functionality
 *    - Responsive modal with consistent design
 * 
 * TO ACTIVATE API: Uncomment the API call in fetchLeads() function and provide the endpoint URL
 */
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api"; // Ready for API integration

export interface ILead {
  LeadID: string;
  LeadFullName: string;
  Email?: string;
  Phone?: string;
}

// Sample lead data - replace with actual API call
const sampleLeads: ILead[] = [
  { LeadID: "1", LeadFullName: "John Doe", Email: "john@example.com", Phone: "123-456-7890" },
  { LeadID: "2", LeadFullName: "Jane Smith", Email: "jane@example.com", Phone: "098-765-4321" },
  { LeadID: "3", LeadFullName: "Bob Johnson", Email: "bob@example.com", Phone: "555-123-4567" },
  { LeadID: "4", LeadFullName: "Alice Brown", Email: "alice@example.com", Phone: "777-888-9999" },
];

interface LeadProps {
  value?: ILead;
  onChange?: (lead: ILead) => void;
  error?: string;
}

export default function Lead({ value, onChange, error: validationError }: LeadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(value || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination settings
  const itemsPerPage = 10;

  // API Functions - Ready for endpoint integration
  const fetchLeads = useCallback(async (_page: number = 1, search: string = "") => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API endpoint
      // 
      // Expected API Endpoint: GET /api/leads
      // Query Parameters:
      // - page: number (page number for pagination)
      // - limit: number (items per page)
      // - search: string (search term for filtering)
      //
      // Expected Response Format:
      // {
      //   leads: ILead[],
      //   totalPages: number,
      //   currentPage: number,
      //   totalItems: number
      // }
      //
      // Uncomment and modify when API is ready:
      // const response = await api.get(`/api/leads?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(search)}`);
      // setLeads(response.data.leads);
      // setTotalPages(response.data.totalPages);
      
      // For now, use sample data with simulated pagination
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      let filteredData = sampleLeads;
      if (search) {
        filteredData = sampleLeads.filter(lead =>
          lead.LeadFullName.toLowerCase().includes(search.toLowerCase()) ||
          lead.LeadID.toLowerCase().includes(search.toLowerCase()) ||
          lead.Email?.toLowerCase().includes(search.toLowerCase()) ||
          lead.Phone?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      setLeads(filteredData);
      setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
      
    } catch (err) {
      setError("Failed to fetch leads. Please try again.");
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Get leads for current page (client-side pagination for now)
  const getCurrentPageLeads = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return leads.slice(startIndex, endIndex);
  };

  // Handle search with debouncing (only when there's a search term)
  useEffect(() => {
    if (!searchTerm) return; // Don't run for empty search terms
    
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      if (isModalOpen) {
        fetchLeads(1, searchTerm);
      }
    }, 1000);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, isModalOpen, fetchLeads]);

  // Initial load (only when modal opens or page changes, not for search)
  useEffect(() => {
    if (isModalOpen && !searchTerm) {
      fetchLeads(currentPage, "");
    }
  }, [isModalOpen, currentPage, fetchLeads, searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // When using server-side pagination, this will trigger the useEffect above
    // For now, it just changes the current page state
  };

  // Get current leads to display (use API data when available, fallback to filtered sample data)  
  const filteredLeads = leads.length > 0 ? leads : sampleLeads.filter(lead =>
    lead.LeadFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.LeadID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.Phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayLeads = getCurrentPageLeads();

  const handleLeadSelect = (lead: ILead) => {
    setSelectedLead(lead);
    onChange?.(lead);
    setIsModalOpen(false);
  };

  const handleModalOpen = () => {
    setSearchTerm(""); // Clear search when opening modal
    setIsModalOpen(true);
  };

  return (
    <div>
      <Label>Lead</Label>
      <button
        onClick={handleModalOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
          validationError 
            ? "border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/20 dark:text-red-400" 
            : "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        <span className="truncate text-left">
          {selectedLead ? (
            <span className="text-gray-800 dark:text-gray-200">{`${selectedLead.LeadID} - ${selectedLead.LeadFullName}`}</span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Click to select lead</span>
          )}
        </span>
        <svg
          className="fill-current flex-shrink-0"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
            fill=""
          />
        </svg>
      </button>
      {validationError && <p className="text-sm text-red-500 mt-1">{validationError}</p>}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="max-w-[700px] p-4 lg:p-11"
      >
        <div className="px-2 lg:pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Select a Lead
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Choose a lead to associate with this site visit.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          <form>
            <div className="relative">
              <button 
                type="button"
                className="absolute -translate-y-1/2 left-4 top-1/2"
              >
                <svg 
                  className="fill-gray-500 dark:fill-gray-400" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" 
                    fill=""
                  />
                </svg>
              </button>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
              />
            </div>
          </form>
        </div>
          
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading leads...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <p className="text-red-500 mb-2">⚠️ Error</p>
                <p className="text-gray-500 dark:text-gray-400">{error}</p>
                <button 
                  onClick={() => fetchLeads(currentPage, searchTerm)}
                  className="mt-2 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No leads found matching your search.
              </p>
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <Table>
                  {/* ...existing code... */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Lead ID
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Full Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Email
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Phone
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {displayLeads.map((lead) => (
                      <TableRow 
                        key={lead.LeadID}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer"
                      >
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div onClick={() => handleLeadSelect(lead)} className="w-full h-full">
                            {lead.LeadID}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-white/90 font-medium">
                          <div onClick={() => handleLeadSelect(lead)} className="w-full h-full">
                            {lead.LeadFullName}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div onClick={() => handleLeadSelect(lead)} className="w-full h-full">
                            {lead.Email}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div onClick={() => handleLeadSelect(lead)} className="w-full h-full">
                            {lead.Phone}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeadSelect(lead);
                            }}
                            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          >
                            Select
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        
        {filteredLeads.length > 0 && !loading && !error && (
          <div className="flex items-center justify-center mt-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
