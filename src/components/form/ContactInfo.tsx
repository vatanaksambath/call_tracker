"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import api from "@/lib/api";
import formatApiDataForSelect from "@/lib/utils";

// A single contact detail (e.g., one phone number)
export interface IContactValue {
    id: number; // For React key
    user_name: string;
    contact_number: string;
    remark: string;
    is_primary: boolean;
}

// A group of contacts for a specific channel type
export interface IContactChannel {
    id: number; // For React key
    channel_type: ISelectOption | null;
    contact_values: IContactValue[];
}

interface ISelectOption {
    value: string;
    label: string;
}

interface ContactInfoProps {
    value: IContactChannel[];
    onChange: (contacts: IContactChannel[]) => void;
    error?: string;
}

// --- NEW: Toggle Switch Component ---
const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
        type="button"
        onClick={onChange}
        className={`${
            checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
    >
        <span
            className={`${
                checked ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
    </button>
);


export default function ContactInfo({ value, onChange, error }: ContactInfoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localContacts, setLocalContacts] = useState<IContactChannel[]>([]);
    const [channelTypes, setChannelTypes] = useState<ISelectOption[]>([]);

    useEffect(() => {
        if (isModalOpen && channelTypes.length === 0) {
            api.get('channel-type/channel-type').then(res => {
                setChannelTypes(formatApiDataForSelect(res.data, 'channel_type_id', 'channel_type_name'));
            }).catch(err => console.error("Failed to fetch channel types", err));
        }
    }, [isModalOpen]);

    const handleOpenModal = () => {
        setLocalContacts(JSON.parse(JSON.stringify(value)));
        setIsModalOpen(true);
    };

    const handleSave = () => {
        onChange(localContacts);
        setIsModalOpen(false);
    };
    
    const addChannel = () => {
        setLocalContacts(prev => [
            ...prev,
            {
                id: Date.now(),
                channel_type: null,
                contact_values: [{
                    id: Date.now() + 1,
                    user_name: "",
                    contact_number: "",
                    remark: "",
                    is_primary: !prev.some(c => c.contact_values.some(v => v.is_primary)),
                }]
            }
        ]);
    };
    
    const removeChannel = (channelIndex: number) => {
        const newContacts = localContacts.filter((_, idx) => idx !== channelIndex);
        const wasPrimaryRemoved = localContacts[channelIndex].contact_values.some(v => v.is_primary);
        if (wasPrimaryRemoved && newContacts.length > 0 && newContacts[0].contact_values.length > 0) {
            newContacts[0].contact_values[0].is_primary = true;
        }
        setLocalContacts(newContacts);
    };

    const handleChannelTypeChange = (channelIndex: number, selectedOption: ISelectOption | null) => {
        const newContacts = [...localContacts];
        newContacts[channelIndex].channel_type = selectedOption;
        setLocalContacts(newContacts);
    };

    const addContactValue = (channelIndex: number) => {
        const newContacts = [...localContacts];
        newContacts[channelIndex].contact_values.push({
            id: Date.now(),
            user_name: "",
            contact_number: "",
            remark: "",
            is_primary: !localContacts.some(c => c.contact_values.some(v => v.is_primary)),
        });
        setLocalContacts(newContacts);
    };

    const removeContactValue = (channelIndex: number, valueIndex: number) => {
        const newContacts = [...localContacts];
        const wasPrimary = newContacts[channelIndex].contact_values[valueIndex].is_primary;
        newContacts[channelIndex].contact_values.splice(valueIndex, 1);
        if (wasPrimary && newContacts[channelIndex].contact_values.length > 0) {
            newContacts[channelIndex].contact_values[0].is_primary = true;
        }
        setLocalContacts(newContacts);
    };
    
    const handleValueChange = (channelIndex: number, valueIndex: number, field: keyof IContactValue, fieldValue: any) => {
        const newContacts = [...localContacts];
        (newContacts[channelIndex].contact_values[valueIndex] as any)[field] = fieldValue;
        setLocalContacts(newContacts);
    };

    const setAsPrimary = (channelIndex: number, valueIndex: number) => {
        const newContacts = localContacts.map((channel, cIdx) => ({
            ...channel,
            contact_values: channel.contact_values.map((contact, vIdx) => ({
                ...contact,
                is_primary: cIdx === channelIndex && vIdx === valueIndex
            }))
        }));
        setLocalContacts(newContacts);
    };

    const primaryContact = value.flatMap(c => c.contact_values).find(v => v.is_primary);
    const displayValue = primaryContact ? `${primaryContact.contact_number} (${primaryContact.remark || 'Primary'})` : "Click to add contact info";

    return (
        <div className="col-span-2 lg:col-span-1">
            <Label>Contact Information</Label>
            <div onClick={handleOpenModal} className={`w-full p-2 border ${error ? "border-red-500" : "border-gray-300"} rounded-md cursor-pointer bg-white dark:bg-dark-800 h-10 flex items-center`}>
                <span className="truncate text-sm text-gray-700 dark:text-gray-300">{displayValue}</span>
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-900 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Contact Information</h2>
                            <Button size="sm" type="button" onClick={addChannel} className="flex items-center gap-2">
                                <PlusIcon className="h-4 w-4" /> Add Channel
                            </Button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto space-y-5 pr-2">
                            {localContacts.map((channel, channelIndex) => (
                                <div key={channel.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-dark-800/50">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex-grow pr-4">
                                            <Select options={channelTypes} value={channel.channel_type || undefined} onChange={opt => handleChannelTypeChange(channelIndex, opt)} placeholder="Select a channel type..."/>
                                        </div>
                                        <Button variant="ghost" size="icon" type="button" onClick={() => removeChannel(channelIndex)}>
                                            <XMarkIcon className="h-6 w-6 text-red-500 hover:text-red-600 transition-colors" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {channel.contact_values.map((contact, valueIndex) => (
                                            <div key={contact.id} className="flex items-center gap-3">
                                                <div className="flex flex-col items-center">
                                                    <Label className="text-xs text-gray-500 mb-1">Primary</Label>
                                                    <ToggleSwitch checked={contact.is_primary} onChange={() => setAsPrimary(channelIndex, valueIndex)} />
                                                </div>
                                                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Username</Label>
                                                        <Input placeholder="Optional" value={contact.user_name} onChange={e => handleValueChange(channelIndex, valueIndex, 'user_name', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Contact Number / ID</Label>
                                                        <Input placeholder="Contact value" value={contact.contact_number} onChange={e => handleValueChange(channelIndex, valueIndex, 'contact_number', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Remark</Label>
                                                        <Input placeholder="e.g., Work" value={contact.remark} onChange={e => handleValueChange(channelIndex, valueIndex, 'remark', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="pt-5">
                                                    {channel.contact_values.length > 1 && (
                                                        <Button variant="ghost" size="icon" type="button" onClick={() => removeContactValue(channelIndex, valueIndex)}>
                                                            <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button size="sm" variant="outline" type="button" onClick={() => addContactValue(channelIndex)} className="flex items-center gap-1">
                                            <PlusIcon className="h-3 w-3"/>
                                            Add Contact
                                        </Button>
                                        <div className="pt-5">
                                        
                                        </div>
                                    </div>
                                </div>
                            ))}
                             {localContacts.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No contact channels. Click 'Add Channel' to start.</p>}
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={handleSave}>Save Contacts</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
