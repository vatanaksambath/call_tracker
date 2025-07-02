"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CameraIcon, UserIcon } from '@heroicons/react/24/solid';
import Label from './Label';

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(value);
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onChange(file || null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
        <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-6 border-blue-50 dark:border-gray-300 shadow-md">
            {preview ? (
                <Image
                    src={preview}
                    alt="Lead photo"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                />
            ) : (
                // <UserIcon className="h-20 w-20 text-gray-400 dark:text-gray-500" />
                <Image
                    src="/images/user/owner.jpg"
                    alt="Lead photo"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                />
            )}
            </div>
            <button
                type="button"
                onClick={triggerFileSelect}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full border-2 border-white dark:border-gray-900"
                aria-label="Upload photo"
            >
                <CameraIcon className="h-5 w-5" />
            </button>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
            />
        </div>
    </div>
  );
};

export default ImageUpload;
