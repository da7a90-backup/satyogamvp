"use client";

import { useState, useEffect } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SuccessNotificationProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

const SuccessNotification = ({
  message,
  duration = 5000,
  onClose,
}: SuccessNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-md shadow-md max-w-md z-50">
      <div className="p-4 flex items-start">
        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
        <div className="flex-grow">
          <p className="text-green-800 font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 text-green-500 hover:text-green-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SuccessNotification;
