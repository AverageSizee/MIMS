import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, KeyRound } from 'lucide-react';

export default function ForcePasswordChange() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update the password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });
      if (authError) throw authError;

      // 2. Mark requires_password_change to false in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ requires_password_change: false })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // 3. Refresh the auth profile to release the lock and redirect to dashboard
      if (refreshProfile) {
        await refreshProfile();
      } else {
        window.location.reload();
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <KeyRound className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to MIMS!</h2>
          <p className="text-sm text-gray-500 mt-2">
            Since your account was created by a manager, you must set a new secure password before accessing the dashboard.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input required type="password" name="newPassword" value={passwords.newPassword} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input required type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition flex justify-center items-center mt-2 shadow-sm">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
