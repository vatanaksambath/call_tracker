"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import api from "@/lib/api";
import { formatApiDataForSelect } from "@/lib/utils";
import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ComponentCard from "../common/ComponentCard";

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

  const handleLocalChange = (field: keyof IAddress, fieldValue: any | null) => {
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
    value.homeAddress,
    value.streetAddress,
    value.village?.label,
    value.commune?.label,
    value.district?.label,
    value.province?.label,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <Label>Address</Label>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`w-full border ${error ? "border-red-500" : "border-gray-300"
          } rounded-md cursor-pointer bg-white dark:bg-dark-800 h-11 flex items-center overflow-hidden`}
      >
        <div className="flex-shrink-0 h-full flex items-center justify-center px-3.5 border-r border-gray-200 dark:border-gray-600 dark:bg-dark-700">
          <MapPinIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-grow px-4 truncate">
          {displayAddress ? (
            <span className="text-sm text-gray-700 dark:text-gray-200">{displayAddress}</span>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">Click to select address</span>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {isModalOpen && (
        <div className="fixed inset-0 bg-grey/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Select Address
              </h2>
              <button type="button" onClick={handleCancelClick} className="p-2 rounded-full text-gray-400 bg-gray-50 dark:bg-gray-50 shadow-md">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-3 border-b border-gray-200 dark:border-gray-700" />
            <ComponentCard title="address" className="shadow-md">
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
            </ComponentCard>
            <div className="mt-5 border-b border-gray-200 dark:border-gray-700 shadow-md" />
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" type="button" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveClick}>Save Address</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
