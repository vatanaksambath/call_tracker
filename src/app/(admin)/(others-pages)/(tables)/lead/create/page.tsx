"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getUserFromToken } from "@/lib/api"; 
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCardInput from "@/components/common/ComponentCardInput";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/input/TextArea";
import { EnvelopeIcon, ChevronDownIcon } from "@/icons";
import axios from "axios";
import Address, { IAddress } from "@/components/form/Address";
import ContactInfo, { IContactChannel, IContactValue } from "@/components/form/ContactInfo";
import ImageUpload from "@/components/form/ImageUpload";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import { formatDateForAPI } from "@/lib/utils";
import AlertModal from "@/components/example/ModalExample/ModalBasedAlerts";

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
    address: {
        province: null, district: null, commune: null, village: null,
        homeAddress: "", streetAddress: ""
    } as IAddress,
    remark: "",
    contact_data: [] as IContactChannel[],
    photo: null as File | null,
  });

  type LeadFormErrors = {
    firstName?: string; lastName?: string; gender?: string; dob?: string; email?: string;
    phone?: string; occupation?: string; leadSource?: string; contactDate?: string; customerType?: string;
    business?: string; address?: string; remark?: string; contact_data?: string; photo?: File;
  };

  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [dropdownOptions, setDropdownOptions] = useState({
      gender: [], business: [], leadSource: [], customerType: [], channelType: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{variant: "success" | "error", title: string, message: string} | null>(null);

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

        setDropdownOptions({
            gender: formattedGenders,
            business: formattedBusinesses,
            leadSource: formattedLeadSources,
            customerType: formattedCustomerTypes,
            channelType: formattedChannelTypes
        });

      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error("Unauthorized request. Token may be invalid or expired.");
        } else {
          console.error("Failed to fetch dropdown data:", error);
        }
      } finally {
          setIsLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof LeadFormErrors]) {
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[field as keyof LeadFormErrors];
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
    if (!formData.occupation.trim()) newErrors.occupation = "Occupation is required.";
    if (!formData.leadSource) newErrors.leadSource = "Please select a lead source.";
    if (!formData.contactDate) newErrors.contactDate = "Contact Date is required.";
    if (!formData.customerType) newErrors.customerType = "Please select a customer type.";
    if (!formData.business) newErrors.business = "Please select a business.";
    if (!formData.address.province) {
        newErrors.address = "A complete address with province is required.";
    }
    if (formData.contact_data.length === 0 || !formData.contact_data.some(c => c.contact_values.length > 0)) {
    newErrors.contact_data = "Contact is required.";
    } else {
        const isInvalid = formData.contact_data.some(c => 
            !c.channel_type || c.contact_values.some(v => !v.contact_number.trim())
        );
        if (isInvalid) {
            newErrors.contact_data = "Each contact group must have a channel and each contact must have a number/ID.";
        }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => { 
    const tokenUser = getUserFromToken();
    if (!validate() || !tokenUser?.user_id) {
        if (!tokenUser?.user_id) {
            setAlertInfo({ 
                variant: 'error', 
                title: 'Authentication Error', 
                message: 'Could not find user information. Please log in again.' 
            });
            setTimeout(() => {
              router.push("/signin");
          }, 2000);
        }
        return;
    }
    
    setIsSaving(true);
    try {
        let photoUrl = null;
        if (formData.photo) {
            const photoFormData = new FormData();
            photoFormData.append('photo', formData.photo);
            photoFormData.append('menu', 'lead');
            const uploadResponse = await api.post('/files/upload-one-photo', photoFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            photoUrl = uploadResponse.data.imageUrl;
        }

        const contactDataGrouped = formData.contact_data.reduce((acc, channel) => {
            if (channel.channel_type && channel.contact_values.length > 0) {
                acc.push({
                    channel_type_id: channel.channel_type.value,
                    contact_values: channel.contact_values.map(val => ({
                        user_name: val.user_name,
                        contact_number: val.contact_number,
                        remark: val.remark,
                        is_primary: val.is_primary,
                    }))
                });
            }
            return acc;
        }, [] as { channel_type_id: string; contact_values: Omit<IContactValue, 'id'>[] }[]);

        const tokenUser = getUserFromToken();

        const leadPayload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            gender_id: formData.gender?.value,
            customer_type_id: formData.customerType?.value,
            lead_source_id: formData.leadSource?.value,
            village_id: formData.address.village?.value,
            business_id: formData.business?.value,
            initial_staff_id: tokenUser?.user_id, 
            current_staff_id: tokenUser?.user_id,
            date_of_birth: formatDateForAPI(formData.dob),
            email: formData.email,
            occupation: formData.occupation,
            home_address: formData.address.homeAddress,
            street_address: formData.address.streetAddress,
            biz_description: null,
            relationship_date: formatDateForAPI(formData.contactDate),
            remark: formData.remark,
            photo_url: photoUrl,
            contact_data: contactDataGrouped,
        };

        const createLead = await api.post('/lead/create', leadPayload);
        if(createLead.data[0].statusCode = 200) {
          setAlertInfo({ variant: 'success', title: 'Success!', message: 'Lead has been created successfully.' })
          setTimeout(() => {
            router.push("/lead");
          }, 3000);
        }
    } catch (err) {
        setAlertInfo({ variant: 'error', title: 'Save Failed', message: String(err)});
        setAlertInfo({ variant: 'error', title: 'Save Failed', message: 'An error occurred while saving the lead. Please try again.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => { router.push("/lead"); };

  return (
    <>
      <LoadingOverlay isLoading={isLoading || isSaving} />
      {alertInfo && (
        <div className="fixed top-5 right-5 z-[10000] w-full max-w-sm">
            <AlertModal 
              isOpen={!!alertInfo}
              onClose={() => setAlertInfo(null)}
              variant={alertInfo?.variant || 'info'}
              title={alertInfo?.title || ''}
              message={alertInfo?.message || ''}
            />
        </div>
      )}
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <div className="space-y-6">
          <form className="flex flex-col" noValidate onSubmit={(e) => { e.preventDefault(); handleSave() }}>
            <ComponentCardInput title="Lead Information">
              <div className="px-2 pb-2">
                <div className="col-span-2 lg:col-span-3 pb-6">
                    <ImageUpload
                      value={formData.photo}
                      onChange={(file) => handleChange('photo', file)}
                    />
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 shadow-md">          
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
                      <Select options={dropdownOptions.gender} value={formData.gender || undefined} onChange={(selectedOption) => handleChange("gender", selectedOption)} className="dark:bg-dark-900" />
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
                    <ContactInfo
                      value={formData.contact_data}
                      onChange={(newcontact_data) => handleChange('contact_data', newcontact_data)}                  
                      error={errors.contact_data}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Business</Label>
                    <div className="relative">
                      <Select options={dropdownOptions.business} value={formData.business || undefined} onChange={(selectedOption) => handleChange("business", selectedOption)} className="dark:bg-dark-900" />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                    </div>
                    {errors.business && <p className="text-sm text-red-500 mt-1">{errors.business}</p>}
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Address
                      value={formData.address}
                      onSave={(newAddress) => handleChange('address', newAddress)}
                      error={errors.address}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Occupation</Label>
                    <Input type="text" placeholder="Enter occupation" value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} />
                    {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
                  </div>
                </div>
              </div>
            </ComponentCardInput>
            <div className="pb-3"/>
            <ComponentCardInput title="Sourcing Details">
              <div className="px-2 pb-3">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 shadow-md">      
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Lead Source</Label>
                    <div className="relative">
                      <Select options={dropdownOptions.leadSource} value={formData.leadSource || undefined} onChange={(selectedOption) => handleChange("leadSource", selectedOption)} className="dark:bg-dark-900" />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                    </div>
                    {errors.leadSource && <p className="text-sm text-red-500 mt-1">{errors.leadSource}</p>}
                  </div>        
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Customer Type</Label>
                    <div className="relative">
                      <Select options={dropdownOptions.customerType} value={formData.customerType || undefined} onChange={(selectedOption) => handleChange("customerType", selectedOption)} className="dark:bg-dark-900" />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                    </div>
                    {errors.customerType && <p className="text-sm text-red-500 mt-1">{errors.customerType}</p>}
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <DatePicker id="date-picker-contactDate" label="Contact Date" placeholder="Select a date" value={formData.contactDate || undefined} onChange={(dates) => handleChange("contactDate", dates[0])} />
                    {errors.contactDate && <p className="text-sm text-red-500 mt-1">{errors.contactDate}</p>}
                  </div>
                  <div className="col-span-2 lg:col-span-3">
                    <Label>Remark</Label>
                    <TextArea value={formData.remark} onChange={(value) => handleChange("remark", value)} rows={3}/>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 justify-end">
                <Button size="md" variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
                <Button size="md" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Lead'}
                </Button>
              </div>
            </ComponentCardInput>
          </form>
        </div>
      </div>
    </>
  );
}
