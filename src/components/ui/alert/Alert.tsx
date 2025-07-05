"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface AlertProps {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ variant, title, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const baseClasses = "rounded-xl border p-4 shadow-lg";

  const variantClasses = {
    success: {
      container: "border-green-500 bg-green-50 dark:border-green-500/30 dark:bg-green-500/15",
      icon: "text-green-500",
    },
    error: {
      container: "border-red-500 bg-red-50 dark:border-red-500/30 dark:bg-red-500/15",
      icon: "text-red-500",
    },
    warning: {
      container: "border-yellow-500 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-500/15",
      icon: "text-yellow-500",
    },
    info: {
      container: "border-blue-500 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/15",
      icon: "text-blue-500",
    },
  };

  const icons = {
    success: <CheckCircleIcon className="h-6 w-6" />,
    error: <XCircleIcon className="h-6 w-6" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6" />,
    info: <InformationCircleIcon className="h-6 w-6" />,
  };
  
  const handleClose = () => {
    setIsVisible(false);
    if(onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (!onClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${baseClasses} ${variantClasses[variant].container}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${variantClasses[variant].icon}`}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        {onClose && (
            <button onClick={handleClose} className="p-1 -m-1 rounded-full hover:bg-gray-500/10">
                <XMarkIcon className="h-5 w-5 text-gray-500"/>
            </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
