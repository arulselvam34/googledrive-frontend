import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      verifyEmailAutomatically();
    }
  }, [token, email]);

  const verifyEmailAutomatically = async () => {
    setLoading(true);
    try {
      await authService.verifyEmail({ token, email });
      setVerified(true);
      toast.success('Email verified successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    await verifyEmailAutomatically();
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4 text-green-600">Email Verified!</h1>
          <p className="text-gray-600">
            Your email has been verified successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Verify Email</h1>
        <p className="text-gray-600 mb-8">
          Click the link in the email sent to <strong>{email}</strong> or verify below.
        </p>

        <button
          onClick={handleManualVerify}
          disabled={loading || !token}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <p className="text-center text-gray-600 mt-6 text-sm">
          If you don't see the verification email, check your spam folder.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
