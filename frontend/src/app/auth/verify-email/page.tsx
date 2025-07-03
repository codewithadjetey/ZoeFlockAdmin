"use client";
import React, { useState } from "react";
import { Church } from "lucide-react";
import TextInput from "@/components/ui/TextInput";

const VerifyEmailPage = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Church className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Verify Email</h1>
        <p className="text-neutral-600 mt-2">Enter your email to receive a verification link</p>
      </div>
      <form className="space-y-6">
        <TextInput
          label="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          type="email"
          name="email"
        />
        <button
          type="submit"
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          Send Verification Link
        </button>
        <div className="text-center mt-4">
          <span className="text-sm text-neutral-600">Already have an account? </span>
          <a href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">Login</a>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-neutral-600">Don't have an account? </span>
          <a href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">Register</a>
        </div>
      </form>
    </div>
  );
};

export default VerifyEmailPage; 