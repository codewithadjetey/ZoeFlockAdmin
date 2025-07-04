"use client";
import React, { useRef, useState } from "react";
import { Church } from "lucide-react";
import Link from "next/link";

const OTP_LENGTH = 6;

const OTPPage = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (!value) return;
    const newOtp = [...otp];
    newOtp[idx] = value[0];
    setOtp(newOtp);
    // Move to next input
    if (idx < OTP_LENGTH - 1 && value) {
      inputsRef.current[idx + 1]?.focus();
    }
    // Auto-submit if last box filled
    if (idx === OTP_LENGTH - 1 && newOtp.every(v => v.length === 1)) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (paste.length === OTP_LENGTH) {
      setOtp(paste.split(""));
      handleSubmit(paste);
    }
    e.preventDefault();
  };

  const handleSubmit = (otpValue: string) => {
    setSubmitting(true);
    setMessage("");
    
    // Simulate API call
    setTimeout(() => {
      setMessage("OTP verified successfully! Redirecting to dashboard...");
      setSubmitting(false);
      // TODO: Redirect to dashboard
    }, 1000);
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mx-auto transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <Church className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['Poppins'] transition-colors duration-200">
            Enter OTP
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
            Enter the OTP sent to your email
          </p>
        </div>

        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit(otp.join("")); }}>
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputsRef.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-12 h-12 text-center text-2xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={digit}
                onChange={e => handleChange(e, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                onPaste={handlePaste}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {message && (
            <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800 transition-all duration-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            disabled={submitting || otp.some(d => d === "")}
          >
            {submitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the OTP?{" "}
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
              Resend
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Back to{" "}
            <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPPage; 