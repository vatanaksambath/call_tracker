"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadsTable from "@/components/tables/LeadsTable";
import { Metadata } from "next";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Radio from "@/components/form/input/Radio";
import { EnvelopeIcon } from "@/icons";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import TextArea from "@/components/form/input/TextArea";
import DatePicker from "@/components/form/date-picker";

// export const metadata: Metadata = {
//   title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
//   // other metadata
// };

export default function LeadsTables() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  const [selectedValue, setSelectedValue] = useState<string>("option2");

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
  };

  const [message, setMessage] = useState("");
  const countries = [
    { code: "KH", label: "+855" },
    { code: "US", label: "+1" },
    { code: "CN", label: "+86" },
  ];
  const handlePhoneNumberChange = (phoneNumber: string) => {
    console.log("Updated phone number:", phoneNumber);
  };
  return (
    <div>
      <PageBreadcrumb pageTitle="Leads Table" />
      <div className="space-y-6">
        <ComponentCard title="Leads Table">
          <div className="flex items-center gap-3">
            <Button size="md" variant="primary"
              onClick={openModal}
            >
              Add Lead +
            </Button>
            <Button size="md" variant="outline">
              Edit Lead
            </Button>
          </div>
          <LeadsTable />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Lead Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your lead profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" defaultValue="Kang" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" defaultValue="Keang" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <DatePicker
                      id="date-picker"
                      label="Date of Birth"
                      placeholder="Select a date"
                      onChange={(dates, currentDateString) => {
                        // Handle your logic
                        console.log({ dates, currentDateString });
                      }}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <DatePicker
                      id="date-picker"
                      label="Date Registered"
                      placeholder="Select a date"
                      onChange={(dates, currentDateString) => {
                        // Handle your logic
                        console.log({ dates, currentDateString });
                      }}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <div className="relative">
                      <Input
                        placeholder="info@gmail.com"
                        type="text"
                        className="pl-[62px]"
                      />
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <EnvelopeIcon />
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <PhoneInput
                      selectPosition="start"
                      countries={countries}
                      placeholder="+855 (098) 000-0000"
                      onChange={handlePhoneNumberChange}
                    />
                  </div>{" "}

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Gender</Label>
                    <div className="flex flex-wrap items-center gap-8">
                      <Radio
                        id="radio1"
                        name="group1"
                        value="Male"
                        checked={selectedValue === "Male"}
                        onChange={handleRadioChange}
                        label="Male"
                      />
                      <Radio
                        id="radio2"
                        name="group1"
                        value="Female"
                        checked={selectedValue === "Female"}
                        onChange={handleRadioChange}
                        label="Female"
                      />

                    </div>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Occupation</Label>
                    <Input type="text" defaultValue="" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Remark</Label>
                    <TextArea
                      value={message}
                      onChange={(value) => setMessage(value)}
                      rows={6}
                    />
                  </div>

                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
            {/* <div className="flex items-center gap-3 px-2 mt-6 modal-footer lg:justify-end">
              <Button
                size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div> */}
          </form>
        </div>
      </Modal>
    </div>

  );
}
