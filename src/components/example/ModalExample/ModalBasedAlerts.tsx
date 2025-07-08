"use client";
import React from "react";
import { Modal } from "../../ui/modal"; // Assuming Modal is a base component at this path
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  variant,
  title,
  message,
}) => {
  const variantConfig = {
    success: {
      bg: "fill-success-50 dark:fill-success-500/15",
      icon: <CheckCircleIcon className="h-10 w-10 text-success-500" />,
      button: "bg-success-500 hover:bg-success-600",
    },
    error: {
      bg: "fill-error-50 dark:fill-error-500/15",
      icon: <XCircleIcon className="h-10 w-10 text-error-500" />,
      button: "bg-error-500 hover:bg-error-600",
    },
    warning: {
      bg: "fill-warning-50 dark:fill-warning-500/15",
      icon: <ExclamationTriangleIcon className="h-10 w-10 text-warning-500" />,
      button: "bg-warning-500 hover:bg-warning-600",
    },
    info: {
      bg: "fill-blue-light-50 dark:fill-blue-light-500/15",
      icon: <InformationCircleIcon className="h-10 w-10 text-blue-light-500" />,
      button: "bg-blue-light-500 hover:bg-blue-light-600",
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-10"
    >
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center z-1 mb-7">
          <svg
            className={config.bg}
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
            />
          </svg>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            {config.icon}
          </span>
        </div>
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
          {title}
        </h4>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          {message}
        </p>
        <div className="flex items-center justify-center w-full gap-3 mt-7">
          <button
            type="button"
            onClick={onClose}
            className={`flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg shadow-theme-xs sm:w-auto ${config.button}`}
          >
            Okay, Got It
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;
