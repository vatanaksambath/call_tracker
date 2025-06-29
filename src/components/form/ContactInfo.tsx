"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

// Type for a single contact entry
export interface IContact {
    id: number; // A temporary ID for React keys
    channel_type: ISelectOption | null;
    user_name: string;
    contact_number: string;
    remark: string;
    is_primary: boolean;
}

// Type for dropdown options
interface ISelectOption {
    value: string;
    label: string;
}

// Props for the new component
interface ContactInfoProps {
    value: IContact[];
    onChange: (contacts: IContact[]) => void;
    channelTypes: ISelectOption[];
    error?: string;
}

export default function ContactInfo({ value, onChange, channelTypes, error }: ContactInfoProps) {

    // Adds a new, empty contact form to the list
    const addContact = () => {
        const newContact: IContact = {
            id: Date.now(), // Use timestamp for a simple unique ID
            channel_type: null,
            user_name: "",
            contact_number: "",
            remark: "",
            is_primary: value.length === 0, // Make the first one added primary
        };
        onChange([...value, newContact]);
    };

    // Removes a contact form by its index
    const removeContact = (indexToRemove: number) => {
        const newContacts = value.filter((_, index) => index !== indexToRemove);
        // If the removed contact was primary and there are still contacts left, make the first one primary
        if (value[indexToRemove]?.is_primary && newContacts.length > 0) {
            newContacts[0].is_primary = true;
        }
        onChange(newContacts);
    };

    // Handles changes to any field within a specific contact form
    const handleContactChange = (indexToUpdate: number, field: keyof IContact, fieldValue: any) => {
        const newContacts = value.map((contact, index) => {
            if (index === indexToUpdate) {
                return { ...contact, [field]: fieldValue };
            }
            return contact;
        });
        onChange(newContacts);
    };

    // Ensures only one contact can be primary
    const setAsPrimary = (indexToSet: number) => {
        const newContacts = value.map((contact, index) => ({
            ...contact,
            is_primary: index === indexToSet,
        }));
        onChange(newContacts);
    };

    return (
        <div className="col-span-2 p-4 border rounded-md space-y-4">
            <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Contact Information</Label>
                <Button size="sm" type="button" onClick={addContact} className="flex items-center gap-1">
                    <PlusIcon className="h-4 w-4" />
                    Add Contact
                </Button>
            </div>

            {/* Render a form for each contact in the list */}
            <div className="space-y-4">
                {value.map((contact, index) => (
                    <div key={contact.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                             <input 
                                type="radio"
                                name="primary_contact"
                                checked={contact.is_primary}
                                onChange={() => setAsPrimary(index)}
                                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor={`primary_contact_${index}`} className="text-sm font-medium">Primary</Label>
                             <div className="flex-grow"></div>
                             <Button variant="ghost" size="icon" type="button" onClick={() => removeContact(index)}>
                                <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Channel Type</Label>
                                <Select 
                                    options={channelTypes} 
                                    value={contact.channel_type || undefined}
                                    onChange={opt => handleContactChange(index, 'channel_type', opt)}
                                />
                            </div>
                             <div>
                                <Label>Contact Number / ID</Label>
                                <Input 
                                    placeholder="e.g., 012345678 or user@example.com" 
                                    value={contact.contact_number} 
                                    onChange={e => handleContactChange(index, 'contact_number', e.target.value)} 
                                />
                            </div>
                            <div>
                                <Label>Username</Label>
                                <Input 
                                    placeholder="Optional username" 
                                    value={contact.user_name} 
                                    onChange={e => handleContactChange(index, 'user_name', e.target.value)} 
                                />
                            </div>
                            <div>
                                <Label>Remark</Label>
                                <Input 
                                    placeholder="e.g., Personal, Work" 
                                    value={contact.remark} 
                                    onChange={e => handleContactChange(index, 'remark', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
    );
}
s