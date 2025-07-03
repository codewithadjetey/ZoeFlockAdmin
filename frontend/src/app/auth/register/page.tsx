"use client";
import React, { useState } from 'react';
import { Church } from 'lucide-react';
import TextInput from '@/components/ui/TextInput';
import PasswordInput from '@/components/ui/PasswordInput';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // You can add error handling and form submission logic as needed

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Church className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">ZoeFlockAdmin</h1>
        <p className="text-neutral-600 mt-2">Create your account to get started</p>
      </div>
      <form className="space-y-6">
        <TextInput
          label="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your full name"
          name="name"
        />
        <TextInput
          label="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          type="email"
          name="email"
        />
        <PasswordInput
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          name="password"
        />
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          name="confirmPassword"
        />
        <button
          type="submit"
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          Register
        </button>
        <div className="text-center mt-4">
          <span className="text-sm text-neutral-600">Already have an account? </span>
          <a href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">Login</a>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage; 