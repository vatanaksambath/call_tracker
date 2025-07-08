'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getUserFromToken } from '@/lib/api';
import { formatApiDataForSelect, parseDateString } from '@/lib/utils';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import DatePicker from '@/components/form/date-picker';
import TextArea from '@/components/form/input/TextArea';
import { ChevronDownIcon } from '@/icons';
import Address, { IAddress } from '@/components/form/Address';
import ContactInfo, {
    IContactChannel,
    IContactValue,
} from '@/components/form/ContactInfo';
import ImageUpload from '@/components/form/ImageUpload';
import LoadingOverlay from '@/components/ui/loading/LoadingOverlay';
import Alert from '@/components/ui/alert/Alert';
import axios from 'axios';
import AlertModal from '@/components/example/ModalExample/ModalBasedAlerts';
import ComponentCardInput from '@/components/common/ComponentCardInput';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface SelectOption {
    value: string;
    label: string;
}

const formatDateForAPI = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CreateStaffPage() {
    const router = useRouter();
    const breadcrumbs = [
        { name: 'Home', href: '/' },
        { name: 'Staff', href: '/staff' },
        { name: 'Create' },
    ];

    const [formData, setFormData] = useState({
        staffCode: '',
        firstName: '',
        lastName: '',
        gender: null as SelectOption | null,
        dob: null as Date | null,
        position: '',
        department: '',
        employmentType: '',
        employmentStartDate: null as Date | null,
        employmentEndDate: null as Date | null,
        employmentLevel: '',
        manager: null as SelectOption | null,
        address: {
            province: null,
            district: null,
            commune: null,
            village: null,
            homeAddress: '',
            streetAddress: '',
        } as IAddress,
        contact_data: [] as IContactChannel[],
        photo: null as File | null,
    });

    type StaffFormErrors = {
        staffCode?: string;
        firstName?: string;
        lastName?: string;
        gender?: string;
        dob?: string;
        position?: string;
        employmentStartDate?: string;
        employmentEndDate?: string;
        department?: string;
        employmentType?: string;
        employmentLevel?: string;
        manager?: string;
        address?: string;
        contact_data?: string;
    };

    const [errors, setErrors] = useState<StaffFormErrors>({});
    const [dropdownOptions, setDropdownOptions] = useState({
        gender: [],
        manager: [],
        channelType: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [alertInfo, setAlertInfo] = useState<{
        variant: 'success' | 'error';
        title: string;
        message: string;
    } | null>(null);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [genderRes, managerRes, channelTypeRes] = await Promise.all([
                    api.get('common/gender'),
                    api.get('common/gender'), // Assuming an endpoint for managers
                    api.get('channel-type/channel-type'),
                ]);

                const formattedGenders = genderRes.data.map((item: any) => ({
                    value: String(item.gender_id),
                    label: item.gender_name,
                }));

                const formattedManagers = managerRes.data.map((item: any) => ({
                    value: String(item.manager_id),
                    label: item.manager_name,
                }));

                const formattedChannelTypes = channelTypeRes.data.map((item: any) => ({
                    value: String(item.channel_type_id),
                    label: item.channel_type_name,
                }));

                setDropdownOptions({
                    gender: formattedGenders,
                    manager: formattedManagers,
                    channelType: formattedChannelTypes,
                });
            } catch (error) {
                console.error('Failed to fetch dropdown data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDropdownData();
    }, []);

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof StaffFormErrors]) {
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[field as keyof StaffFormErrors];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: StaffFormErrors = {};
        if (!formData.staffCode.trim())
            newErrors.staffCode = 'Staff ID is required.';
        if (!formData.firstName.trim())
            newErrors.firstName = 'First name is required.';
        if (!formData.lastName.trim())
            newErrors.lastName = 'Last name is required.';
        if (!formData.gender) newErrors.gender = 'Gender is required.';
        if (!formData.dob) newErrors.dob = 'Date of birth is required.';
        if (!formData.department.trim()) newErrors.department = 'Department is required.';
        if (!formData.position.trim()) newErrors.position = 'Position is required.';
        if (!formData.employmentType.trim()) newErrors.employmentType = 'Employment Type is required.';
        if (!formData.employmentLevel.trim()) newErrors.employmentLevel = 'Employment Level is required.';
        if (!formData.employmentStartDate) newErrors.employmentStartDate = 'Employment Start date is required.';
        if (!formData.employmentEndDate)  newErrors.employmentEndDate = 'Employment End date is required.';
        // if (!formData.manager) newErrors.manager = 'Manager is required.';
        if (!formData.address.province) {
            newErrors.address = 'A complete address with province is required.';
        }
        if (
            formData.contact_data.length === 0 ||
            !formData.contact_data.some((c) => c.contact_values.length > 0)
        ) {
            newErrors.contact_data = 'Contact is required.';
        } else {
            const isInvalid = formData.contact_data.some(
                (c) =>
                    !c.channel_type ||
                    c.contact_values.some((v) => !v.contact_number.trim())
            );
            if (isInvalid) {
                newErrors.contact_data =
                    'Each contact group must have a channel and each contact must have a number/ID.';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        const tokenUser = getUserFromToken();
        if (!tokenUser?.user_id) {
            setAlertInfo({
                variant: 'error',
                title: 'Authentication Error',
                message: 'Could not find user information. Please log in again.',
            });
            setTimeout(() => {
                router.push("/signin");
            }, 2000);
            return;
        }

        setIsSaving(true);
        setAlertInfo(null);
        try {
            let photoUrl = null;
            if (formData.photo) {
                const photoFormData = new FormData();
                photoFormData.append('photo', formData.photo);
                photoFormData.append('menu', 'staff');
                photoFormData.append('photoId', formData.staffCode);
                const uploadResponse = await api.post(
                    '/files/upload-one-photo',
                    photoFormData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );
                photoUrl = uploadResponse.data.imageUrl;
            }

            const contactDataGrouped = formData.contact_data.reduce(
                (acc, channel) => {
                    if (channel.channel_type && channel.contact_values.length > 0) {
                        acc.push({
                            channel_type_id: channel.channel_type.value,
                            contact_values: channel.contact_values.map((val) => ({
                                user_name: val.user_name,
                                contact_number: val.contact_number,
                                remark: val.remark,
                                is_primary: val.is_primary,
                            })),
                        });
                    }
                    return acc;
                },
                [] as {
                    channel_type_id: string;
                    contact_values: Omit<IContactValue, 'id'>[];
                }[]
            );

            const staffPayload = {
                staff_id: formData.staffCode,
                staff_code: formData.staffCode,
                first_name: formData.firstName,
                last_name: formData.lastName,
                gender_id: formData.gender?.value,
                village_id: formData.address.village?.value,
                manager_id: formData.manager?.value || null,
                date_of_birth: formatDateForAPI(formData.dob),
                position: formData.position,
                department: formData.department,
                employment_type: formData.employmentType,
                employment_start_date: formatDateForAPI(formData.employmentStartDate),
                employment_end_date: formatDateForAPI(formData.employmentEndDate),
                employment_level: formData.employmentLevel,
                current_address: `${formData.address.homeAddress}, ${formData.address.streetAddress}`,
                photo_url: [photoUrl],
                contact_data: contactDataGrouped,
            };

            const createStaff = await api.post('/staff/create', staffPayload);
            if(createStaff.data[0].statusCode = 200) {
                setAlertInfo({
                variant: 'success',
                title: 'Success!',
                message: 'Staff has been created successfully.',
                });

                setTimeout(() => {
                    router.push('/staff');
                }, 2000);
            }   
        } catch (err) {
            console.error('Failed to save staff:', err);
            setAlertInfo({
                variant: 'error',
                title: 'Save Failed',
                message: 'An error occurred while saving the staff member.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/staff');
    };

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
                    <form
                        className="flex flex-col"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        <ComponentCardInput title="Staff Information">
                            <div className="px-2 pb-2">
                                <div className="col-span-2 lg:col-span-3 pb-6">
                                    <ImageUpload
                                        value={formData.photo}
                                        onChange={(file) => handleChange('photo', file)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 shadow-md">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Staff ID</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter staff ID"
                                            value={formData.staffCode}
                                            onChange={(e) =>
                                                handleChange('staffCode', e.target.value)
                                            }
                                        />
                                        {errors.staffCode && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.staffCode}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>First Name</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter first name"
                                            value={formData.firstName}
                                            onChange={(e) =>
                                                handleChange('firstName', e.target.value)
                                            }
                                        />
                                        {errors.firstName && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.firstName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Last Name</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter last name"
                                            value={formData.lastName}
                                            onChange={(e) => handleChange('lastName', e.target.value)}
                                        />
                                        {errors.lastName && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.lastName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Gender</Label>
                                        <div className="relative">
                                            <Select
                                                options={dropdownOptions.gender}
                                                value={formData.gender || undefined}
                                                onChange={(selectedOption) =>
                                                    handleChange('gender', selectedOption)
                                                }
                                                className="dark:bg-dark-900"
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon />
                                            </span>
                                        </div>
                                        {errors.gender && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.gender}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <DatePicker
                                            id="date-picker-dob"
                                            label="Date of Birth"
                                            placeholder="Select a date"
                                            value={formData.dob || undefined}
                                            onChange={(dates) => handleChange('dob', dates[0])}
                                        />
                                        {errors.dob && (
                                            <p className="text-sm text-red-500 mt-1">{errors.dob}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Position</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter position"
                                                type="position"
                                                value={formData.position}
                                                onChange={(e) =>
                                                    handleChange('position', e.target.value)
                                                }
                                            />
                                        </div>
                                        {errors.position && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.position}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Department</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter department"
                                                type="department"
                                                value={formData.department}
                                                onChange={(e) =>
                                                    handleChange('department', e.target.value)
                                                }
                                            />
                                        </div>
                                        {errors.department && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.department}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <ContactInfo
                                            value={formData.contact_data}
                                            onChange={(newcontact_data) =>
                                                handleChange('contact_data', newcontact_data)
                                            }
                                            error={errors.contact_data}
                                        />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Address
                                            value={formData.address}
                                            onSave={(newAddress) =>
                                                handleChange('address', newAddress)
                                            }
                                            error={errors.address}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ComponentCardInput>
                        <div className="pb-3" />
                        <ComponentCardInput title="Employment Information">
                            <div className="px-2 pb-3">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 shadow-md">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Employment Type</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter employment type"
                                            value={formData.employmentType}
                                            onChange={(e) =>
                                                handleChange('employmentType', e.target.value)
                                            }
                                        />
                                        {errors.employmentType && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.employmentType}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Employment Level</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter employment level"
                                                type="employmentLevel"
                                                value={formData.employmentLevel}
                                                onChange={(e) =>
                                                    handleChange('employmentLevel', e.target.value)
                                                }
                                            />
                                        </div>
                                        {errors.employmentLevel && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.employmentLevel}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <DatePicker
                                            id="date-picker-employmentStartDate"
                                            label="Employment Start Date"
                                            placeholder="Select a date"
                                            value={formData.employmentStartDate || undefined}
                                            onChange={(dates) =>
                                                handleChange('employmentStartDate', dates[0])
                                            }
                                        />
                                        {errors.employmentStartDate && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.employmentStartDate}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <DatePicker
                                            id="date-picker-employmentEndDate"
                                            label="Employment End Date"
                                            placeholder="Select a date"
                                            value={formData.employmentEndDate || undefined}
                                            onChange={(dates) =>
                                                handleChange('employmentEndDate', dates[0])
                                            }
                                        />
                                        {errors.employmentEndDate && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.employmentEndDate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-6 justify-end">
                                <Button
                                    size="md"
                                    variant="outline"
                                    type="button"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
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
