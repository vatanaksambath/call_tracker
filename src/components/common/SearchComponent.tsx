"use client";
import React, { useState } from 'react';
import Input from '../form/input/InputField';
import Select from '../form/Select';
import { MagnifyingGlassIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface SearchProps {
  onSearch: (searchQuery: string, searchType: string) => void;
}

const searchOptions = [
    { value: 'lead_id', label: 'Lead ID' },
    { value: 'lead_name', label: 'Lead Name' },
];

const SearchComponent: React.FC<SearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState(searchOptions[0]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch(query.trim(), type.value);
    }
  };

  return (
    <div className="flex items-center w-full max-w-lg rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 h-11">
      
      <div className="relative border-r border-gray-200 dark:border-gray-700 h-full">
        <div className="flex items-center h-full px-3 text-sm text-gray-700 dark:text-gray-300">
          {/* On small screens, show a filter icon. On larger screens, show the text label. */}
          <FunnelIcon className="h-5 w-5 text-gray-400 sm:hidden" />
          <span className="hidden sm:inline">{type.label}</span>
          <ChevronDownIcon className="h-4 w-4 ml-2 text-gray-400" />
        </div>
        <Select 
            options={searchOptions}
            value={type}
            onChange={(option) => setType(option)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="relative flex-1 min-w-0 h-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </span>
        <Input 
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full pl-10 border-none bg-transparent focus:ring-0 text-sm"
        />
      </div>
    </div>
  );
};

export default SearchComponent;
