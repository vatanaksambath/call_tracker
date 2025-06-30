"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; // <-- Import your custom axios instance
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import TextArea from "@/components/form/input/TextArea";
import { EnvelopeIcon, ChevronDownIcon } from "@/icons";
import axios from "axios";
import Address, { IAddress } from "@/components/form/Address";
import ContactInfo, { IContactChannel } from "@/components/form/ContactInfo";

interface SelectOption {
    value: string;
    label: string;
}

export default function CreateLeadPage() {
  const router = useRouter();

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Lead", href: "/lead" },
    { name: "Create" },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: null as SelectOption | null,
    dob: null as Date | null,
    email: "",
    phone: "",
    occupation: "",
    leadSource: null as SelectOption | null,
    contactDate: null as Date | null,
    customerType: null as SelectOption | null,
    business: null as SelectOption | null,
    address: { // New address object
        province: null, district: null, commune: null, village: null,
        homeAddress: "", streetAddress: ""
    } as IAddress,
    remark: "",
    contacts: [] as IContactChannel[], 
  });

  type LeadFormErrors = {
    firstName?: string; lastName?: string; gender?: string; dob?: string; email?: string;
    phone?: string; occupation?: string; leadSource?: string; contactDate?: string; customerType?: string;
    business?: string; address?: string; remark?: string; contacts?: string;
  };

  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [genderOptions, setGenderOptions] = useState<SelectOption[]>([]);
  const [businessOptions, setBusinessOptions] = useState<SelectOption[]>([]);
  const [leadSourceOptions, setLeadSourceOptions] = useState<SelectOption[]>([]);
  const [customerTypeOptions, setCustomerTypeOptions] = useState<SelectOption[]>([]);
  const [channelTypeOptions, setChannelTypeOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [gender, business, leadSource, customerType, channelType] = await Promise.all([
          api.get('common/gender'),
          api.get('common/business'),
          api.get('lead-source/lead-source'),
          api.get('customer-type/customer-type'),
          api.get('channel-type/channel-type')
        ]);

        const formattedGenders = gender.data.map((item: any) => ({
          value: String(item.gender_id),
          label: item.gender_name
        }));

        const formattedBusinesses = business.data.map((item: any) => ({
          value: String(item.business_id),
          label: item.business_name
        }));

        const formattedLeadSources = leadSource.data.map((item: any) => ({
          value: String(item.lead_source_id),
          label: item.lead_source_name
        }));
        
        const formattedCustomerTypes = customerType.data.map((item: any) => ({
            value: String(item.customer_type_id),
            label: item.customer_type_name
        }));

        const formattedChannelTypes = channelType.data.map((item: any) => ({
          value: String(item.channel_type_id),
          label: item.channel_type_name
        }));

        setGenderOptions(formattedGenders);
        setBusinessOptions(formattedBusinesses);
        setLeadSourceOptions(formattedLeadSources);
        setCustomerTypeOptions(formattedCustomerTypes);
        setChannelTypeOptions(formattedChannelTypes)

      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error("Unauthorized request. Token may be invalid or expired.");
        } else {
          console.error("Failed to fetch dropdown data:", error);
        }
      }
    };

    fetchDropdownData();
  }, []); // Empty array ensures this runs only once on mount

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[field];
            return newErrors;
        });
    }
  };

  const validate = () => {
    const newErrors: LeadFormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.gender) newErrors.gender = "Please select a gender.";
    if (!formData.dob) newErrors.dob = "Date of birth is required.";
    if (!formData.email.trim()) { newErrors.email = "Email is required."; } 
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Email address is invalid.";}
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.occupation.trim()) newErrors.occupation = "Occupation is required.";
    if (!formData.leadSource) newErrors.leadSource = "Please select a lead source.";
    if (!formData.contactDate) newErrors.contactDate = "Contact Date is required.";
    if (!formData.contactDate) newErrors.dob = "Contact Date is required.";
    if (!formData.customerType) newErrors.customerType = "Please select a customer type.";
    if (!formData.business) newErrors.business = "Please select a business.";
    if (!formData.address.province) {
        newErrors.address = "A complete address with province is required.";
    }
   // --- UPDATED: Validation for the nested contact structure ---
  //  if (formData.contacts.length === 0 || !formData.contacts.some(c => c.contact_values.length > 0)) {
  //   newErrors.contacts = "At least one contact is required.";
  // } else {
  //     const isInvalid = formData.contacts.some(c => 
  //         !c.channel_type || c.contact_values.some(v => !v.contact_number.trim())
  //     );
  //     if (isInvalid) {
  //         newErrors.contacts = "Each contact group must have a channel and each contact must have a number/ID.";
  //     }
  // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => { 
    if (validate()) {} 
  };
  const handleCancel = () => { router.push("/lead"); };

  const countries = [ { code: "KH", label: "+855" }, { code: "US", label: "+1" }];

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Create New Lead">
          <form className="flex flex-col" noValidate onSubmit={(e) => { e.preventDefault(); handleSave() }}>
              <div className="px-2 pb-3">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">

                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" placeholder="Enter first name" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" placeholder="Enter last name" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Gender</Label>
                    <div className="relative">
                      <Select options={genderOptions} value={formData.gender || undefined} onChange={(selectedOption) => handleChange("gender", selectedOption)} className="dark:bg-dark-900" />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                    </div>
                    {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <DatePicker id="date-picker-dob" label="Date of Birth" placeholder="Select a date" value={formData.dob || undefined} onChange={(dates) => handleChange("dob", dates[0])} />
                    {errors.dob && <p className="text-sm text-red-500 mt-1">{errors.dob}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <div className="relative">
                      <Input placeholder="info@gmail.com" type="email" className="pl-[62px]" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400"><EnvelopeIcon /></span>
                    </div>
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <PhoneInput selectPosition="start" countries={countries} placeholder="+855 (098) 000-0000" value={formData.phone} onChange={(phoneNumber) => handleChange("phone", phoneNumber)} />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Lead Source</Label>
                    <div className="relative">
                      <Select options={leadSourceOptions} value={formData.leadSource || undefined} onChange={(selectedOption) => handleChange("leadSource", selectedOption)} className="dark:bg-dark-900" />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                    </div>
                    {errors.leadSource && <p className="text-sm text-red-500 mt-1">{errors.leadSource}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <DatePicker id="date-picker-contactDate" label="Contact Date" placeholder="Select a date" value={formData.contactDate || undefined} onChange={(dates) => handleChange("contactDate", dates[0])} />
                    {errors.dob && <p className="text-sm text-red-500 mt-1">{errors.contactDate}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Occupation</Label>
                    <Input type="text" placeholder="Enter occupation" value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} />
                    {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
                  </div>
            
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Customer Type</Label>
                    <div className="relative">
                      <Select options={customerTypeOptions} value={formData.customerType || undefined} onChange={(selectedOption) => handleChange("customerType", selectedOption)} className="dark:bg-dark-900" />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                    </div>
                    {errors.customerType && <p className="text-sm text-red-500 mt-1">{errors.customerType}</p>}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Business</Label>
                    <div className="relative">
                      <Select options={businessOptions} value={formData.business || undefined} onChange={(selectedOption) => handleChange("business", selectedOption)} className="dark:bg-dark-900" />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                    </div>
                    {errors.business && <p className="text-sm text-red-500 mt-1">{errors.business}</p>}
                  </div>

                   <div className="col-span-2 lg:col-span-1">
                      <Address 
                        value={formData.address}
                        onSave={(newAddress) => handleChange('address', newAddress) }
                        error={errors.address}
                      />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <ContactInfo 
                        value={formData.contacts}
                        onChange={(newContacts) => handleChange('contacts', newContacts)}
                        error={errors.contacts}
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <Label>Remark</Label>
                    <TextArea value={formData.remark} onChange={(value) => handleChange("remark", value)} rows={3} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 justify-end">
                <Button size="md" variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
                <Button size="md" type="submit">Save Lead</Button>
              </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}