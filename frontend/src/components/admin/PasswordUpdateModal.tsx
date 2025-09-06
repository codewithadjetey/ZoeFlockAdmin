"use client";
import React, { useState } from "react";
import { Modal, Button, Input, SelectInput } from "@/components/ui";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { User } from "@/interfaces";

interface PasswordUpdateResponse {
  success: boolean;
  message: string;
  data: {
    password: string;
  };
}

interface PasswordUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const PasswordUpdateModal: React.FC<PasswordUpdateModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [action, setAction] = useState<"generate" | "custom">("generate");
  const [password, setPassword] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setLoading(true);

      const payload: any = {
        action,
        send_email: sendEmail,
      };

      if (action === "custom") {
        if (!password || password.length < 8) {
          toast.error("Password must be at least 8 characters long");
          return;
        }
        payload.password = password;
      }

      const response = await api.put(`/users/${user.id}/admin-password`, payload);
      const responseData = response.data as PasswordUpdateResponse;

      if (responseData.success) {
        const newPassword = responseData.data.password;
        setGeneratedPassword(newPassword);
        
        toast.success(responseData.message);
        
        if (action === "generate") {
          // Show the generated password
          setGeneratedPassword(newPassword);
        } else {
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAction("generate");
    setPassword("");
    setSendEmail(true);
    setGeneratedPassword("");
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success("Password copied to clipboard!");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update User Password">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        {user && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Updating password for:</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </div>
        )}

        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password Update Method
          </label>
          <SelectInput
            value={action}
            onChange={(value) => setAction(value as "generate" | "custom")}
            options={[
              { value: "generate", label: "Generate Random Password" },
              { value: "custom", label: "Enter Custom Password" },
            ]}
          />
        </div>

        {/* Custom Password Input */}
        {action === "custom" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>
        )}

        {/* Email Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sendEmail"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Send password to user's email
          </label>
        </div>

        {/* Generated Password Display */}
        {generatedPassword && action === "generate" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Generated Password
            </h4>
            <div className="flex items-center space-x-2">
              <code className="bg-white dark:bg-gray-800 px-3 py-2 rounded border text-sm font-mono text-green-800 dark:text-green-200">
                {generatedPassword}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
              >
                <i className="fas fa-copy mr-1"></i>
                Copy
              </Button>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Please save this password securely. It won't be shown again.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-key mr-2"></i>
                Update Password
              </>
            )}
          </Button>
        </div>

        {/* Close button for generated password */}
        {generatedPassword && action === "generate" && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onSuccess();
                handleClose();
              }}
            >
              <i className="fas fa-check mr-2"></i>
              Done
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default PasswordUpdateModal; 