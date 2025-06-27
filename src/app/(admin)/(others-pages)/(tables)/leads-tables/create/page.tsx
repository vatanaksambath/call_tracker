"use client";
import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EnvelopeIcon, ChevronDownIcon } from "@/icons";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import TextArea from "@/components/form/input/TextArea";
import DatePicker from "@/components/form/date-picker";
import Select from "@/components/form/Select";
import { useRouter } from "next/navigation";

export default function CreateLeadPage() {
  const router = useRouter();

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Lead", href: "/leads-tables" },
    { name: "Create" },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: null,
    dob: null,
    email: "",
    phone: "",
    occupation: "",
    leadSource: null,
    customerType: null,
    business: null,
    remark: "",
  });

  type LeadFormErrors = {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dob?: string;
    email?: string;
    phone?: string;
    occupation?: string;
    leadSource?: string;
    customerType?: string;
    business?: string;
  };

  const [errors, setErrors] = useState<LeadFormErrors>({});

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: LeadFormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.gender) newErrors.gender = "Please select a gender.";
    if (!formData.dob) newErrors.dob = "Date of birth is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.occupation.trim()) newErrors.occupation = "Occupation is required.";
    if (!formData.leadSource) newErrors.leadSource = "Please select a lead source.";
    if (!formData.customerType) newErrors.customerType = "Please select a customer type.";
    if (!formData.business) newErrors.business = "Please select a business.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      console.log("Saving new lead...", formData);
      router.push("/leads-tables");
    } else {
      console.log("Validation Failed", errors);
    }
  };

  const handleCancel = () => {
    router.push("/leads-tables");
  };

  const countries = [
    { code: "KH", label: "+855" },
    { code: "US", label: "+1" },
    { code: "CN", label: "+86" },
  ];

  const optionsBusiness = [
    { value: "business1", label: "Business 1" },
    { value: "business2", label: "Business 2" },
    { value: "business3", label: "Business 3" },
  ];

  const optionsGender = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" }
  ];

  const optionsLeadSource = [
    { value: "source1", label: "Source 1" },
    { value: "source2", label: "Source 2" },
    { value: "source3", label: "Source 3" },
  ];

  const optionsCustomerType = [
    { value: "new", label: "New Customer" },
    { value: "returning", label: "Returning Customer" },
    { value: "vip", label: "VIP Customer" },
  ];

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Create New Lead">
          <div className="mg-4">
            <form className="flex flex-col" noValidate>
              <div className="px-2 pb-3">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">

                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                    />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Gender</Label>
                    <div className="relative">
                      <Select
                        options={optionsGender}
                        onChange={(selectedOption) => handleChange("gender", selectedOption)} 
                        className="dark:bg-dark-900"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <DatePicker
                      id="date-picker-dob"
                      label="Date of Birth"
                      placeholder="Select a date"
                      onChange={(dates) => handleChange("dob", dates[0])}
                    />
                    {errors.dob && <p className="text-sm text-red-500 mt-1">{errors.dob}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <div className="relative">
                      <Input
                        placeholder="info@gmail.com"
                        type="email"
                        className="pl-[62px]"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <EnvelopeIcon />
                      </span>
                    </div>
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <PhoneInput
                      selectPosition="start"
                      countries={countries}
                      placeholder="+855 (098) 000-0000"
                      onChange={(phoneNumber) => handleChange("phone", phoneNumber)}
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Occupation</Label>
                    <Input
                      type="text"
                      placeholder="Enter occupation"
                      value={formData.occupation}
                      onChange={(e) => handleChange("occupation", e.target.value)}
                    />
                    {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Lead Source</Label>
                    <div className="relative">
                      <Select
                        options={optionsLeadSource}
                        onChange={(selectedOption) => handleChange("leadSource", selectedOption)}
                        className="dark:bg-dark-900"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.leadSource && <p className="text-sm text-red-500 mt-1">{errors.leadSource}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Customer Type</Label>
                    <div className="relative">
                      <Select
                        options={optionsCustomerType}
                        onChange={(selectedOption) => handleChange("customerType", selectedOption)}
                        className="dark:bg-dark-900"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.customerType && <p className="text-sm text-red-500 mt-1">{errors.customerType}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Business</Label>
                    <div className="relative">
                      <Select
                        options={optionsBusiness}
                        onChange={(selectedOption) => handleChange("business", selectedOption)}
                        className="dark:bg-dark-900"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.business && <p className="text-sm text-red-500 mt-1">{errors.business}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label>Remark</Label>
                    <TextArea
                      value={formData.remark}
                      onChange={(value) => handleChange("remark", value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 justify-end">
                <Button size="md" variant="outline" type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="md" type="button" onClick={handleSave}>
                  Save Lead
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
