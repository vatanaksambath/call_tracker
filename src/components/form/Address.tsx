"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import api from "@/lib/api";
import formatApiDataForSelect from "@/lib/utils";

interface ISelectOption {
  value: string;
  label: string;
}

export interface IAddress {
  province: ISelectOption | null;
  district: ISelectOption | null;
  commune: ISelectOption | null;
  village: ISelectOption | null;
  homeAddress: string;
  streetAddress: string;
}

interface AddressProps {
  value: IAddress;
  onSave: (address: IAddress) => void;
  error?: string;
}

export default function Address({ value, onSave, error }: AddressProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localAddress, setLocalAddress] = useState<IAddress>(value);
  const [provinces, setProvinces] = useState<ISelectOption[]>([]);
  const [districts, setDistricts] = useState<ISelectOption[]>([]);
  const [communes, setCommunes] = useState<ISelectOption[]>([]);
  const [villages, setVillages] = useState<ISelectOption[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof IAddress, string>>>({});

  const handleLocalChange = (field: keyof IAddress, fieldValue: ISelectOption | string | null) => {
    setLocalAddress(prev => {
      const newState = { ...prev, [field]: fieldValue };

      if (field === "province") {
        newState.district = null;
        newState.commune = null;
        newState.village = null;
      } else if (field === "district") {
        newState.commune = null;
        newState.village = null;
      } else if (field === "commune") {
        newState.village = null;
      }

      return newState;
    });

    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    if (isModalOpen && provinces.length === 0) {
      api
        .get("common/address/province")
        .then(res => {
          setProvinces(formatApiDataForSelect(res.data, "province_id", "province_name"));
        })
        .catch(err => console.error("Failed to fetch provinces", err));
    }
  }, [isModalOpen, provinces.length]);

  useEffect(() => {
    const provinceId = localAddress.province?.value;
    setDistricts([]);
    if (provinceId) {
      api
        .get(`common/address/district/${provinceId}`)
        .then(res => {
          setDistricts(formatApiDataForSelect(res.data, "district_id", "district_name"));
        })
        .catch(err => console.error("Failed to fetch districts", err));
    }
  }, [localAddress.province]);

  useEffect(() => {
    const districtId = localAddress.district?.value;
    setCommunes([]);
    if (districtId) {
      api
        .get(`common/address/commune/${districtId}`)
        .then(res => {
          setCommunes(formatApiDataForSelect(res.data, "commune_id", "commune_name"));
        })
        .catch(err => console.error("Failed to fetch communes", err));
    }
  }, [localAddress.district]);

  useEffect(() => {
    const communeId = localAddress.commune?.value;
    setVillages([]);
    if (communeId) {
      api
        .get(`common/address/village/${communeId}`)
        .then(res => {
          setVillages(formatApiDataForSelect(res.data, "village_id", "village_name"));
        })
        .catch(err => console.error("Failed to fetch villages", err));
    }
  }, [localAddress.commune]);

  useEffect(() => {
    setLocalAddress(value);
  }, [value]);

const handleSaveClick = () => {
    const newErrors: typeof errors = {};
    if (!localAddress.province) newErrors.province = "Province is required.";
    if (!localAddress.district) newErrors.district = "District is required.";
    if (!localAddress.commune) newErrors.commune = "Commune is required.";
    if (!localAddress.village) newErrors.village = "Village is required.";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setErrors({});
    onSave(localAddress);
    setIsModalOpen(false);
};

  const handleCancelClick = () => {
    setLocalAddress(value);
    setErrors({});
    setIsModalOpen(false);
  };

  const displayAddress = [
    value.province?.label,
    value.district?.label,
    value.commune?.label,
    value.village?.label,
    value.homeAddress,
    value.streetAddress
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <Label>Address</Label>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex w-full items-center justify-between gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
          error 
            ? "border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/20 dark:text-red-400" 
            : "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        <span className="truncate text-left">
          {displayAddress ? (
            <span className="text-gray-800 dark:text-gray-200">{displayAddress}</span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Click to select address</span>
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
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setLocalAddress(value);
          setErrors({});
          setIsModalOpen(false);
        }}
        className="max-w-[800px] p-4 lg:p-11"
      >
        <div className="px-2 lg:pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Select Address
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Choose or enter the address details for this location.
          </p>
        </div>
          
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Province</Label>
              <Select
                options={provinces}
                value={localAddress.province || undefined}
                onChange={opt => handleLocalChange("province", opt)}
              />
              {errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
            </div>

            <div>
              <Label>District</Label>
              <Select
                options={districts}
                value={localAddress.district || undefined}
                onChange={opt => handleLocalChange("district", opt)}
              />
              {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district}</p>}
            </div>

            <div>
              <Label>Commune</Label>
              <Select
                options={communes}
                value={localAddress.commune || undefined}
                onChange={opt => handleLocalChange("commune", opt)}
              />
              {errors.commune && <p className="text-sm text-red-500 mt-1">{errors.commune}</p>}
            </div>

            <div>
              <Label>Village</Label>
              <Select
                options={villages}
                value={localAddress.village || undefined}
                onChange={opt => handleLocalChange("village", opt)}
              />
              {errors.village && <p className="text-sm text-red-500 mt-1">{errors.village}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Home Address</Label>
              <Input
                type="text"
                placeholder="e.g., House #123"
                value={localAddress.homeAddress}
                onChange={e => handleLocalChange("homeAddress", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Street Address</Label>
              <Input
                type="text"
                placeholder="e.g., Street 456"
                value={localAddress.streetAddress}
                onChange={e => handleLocalChange("streetAddress", e.target.value)}
              />
            </div>
          </div>
          
        </div>
                  <div className="flex justify-end gap-4 mt-6 pt-4  border-gray-200 dark:border-white/[0.05]">
            <Button variant="outline" type="button" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveClick}>Save Address</Button>
          </div>
      </Modal>
    </div>
  );
}
