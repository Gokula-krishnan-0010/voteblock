'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // get userId from query 
  const email = searchParams.get('email'); // get email from query

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert('Please enter the OTP');
      return;
    }

    if (!userId) {
      alert('Invalid session. Please login again.');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();

      if (data.success) {
        alert('OTP verified! Redirecting...');
        router.push('/voter/profile');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h1>Verify OTP</h1>
      <p>We sent a 6-digit code to <b>{email}</b></p>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
      />
      <button
        onClick={handleVerifyOtp}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </div>
  );
}
