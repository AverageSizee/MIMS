import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ShieldCheck, User, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Secondary client for creating users without logging the manager out
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export default function Employees() {
  const { user } = useAuth(); // Logged in manager
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    email: '',
    password: '',
    full_name: '',
    role: 'employee',
    force_reset: true
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleEdit = (emp) => {
    setFormData({
      email: emp.email, // Email usually isn't editable easily without email confirmation, but we show it
      password: '', // Blank when editing
      full_name: emp.full_name,
      role: emp.role,
      force_reset: emp.requires_password_change
    });
    setEditingId(emp.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (targetId, name) => {
    if (targetId === user.id) {
      alert("You cannot delete your own account!");
      return;
    }
    if (!window.confirm(`Are you sure you want to completely delete ${name}'s account? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      // Call the secure Postgres function we created in SQL
      const { error } = await supabase.rpc('delete_user_account', { target_user_id: targetId });
      if (error) throw error;
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting user:', err.message);
      alert('Error deleting user: ' + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingId) {
        // UPDATE EXISTING USER (Only profile data: name, role, reset flag)
        const { error } = await supabase.from('profiles').update({
          full_name: formData.full_name.trim(),
          role: formData.role,
          requires_password_change: formData.force_reset
        }).eq('id', editingId);
        
        if (error) throw error;
        alert(`Account updated successfully!`);
      } else {
        // CREATE NEW USER
        const { data, error: signUpError } = await adminSupabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name.trim(),
              role: formData.role
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Immediately update the profile to apply the force_reset checkbox preference
        if (data?.user?.id) {
          await supabase.from('profiles').update({
            requires_password_change: formData.force_reset
          }).eq('id', data.user.id);
        }
        alert(`Account created successfully for ${formData.full_name.trim()}!`);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error.message);
      alert('Error saving account: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Employee Directory</h2>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setFormData(initialFormState);
            } else {
              setShowForm(true);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'Register New Account'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 pb-2 border-b border-gray-100 mb-2">
            <h3 className="font-semibold text-gray-700">{editingId ? 'Edit User Account' : 'Create New User Account'}</h3>
            <p className="text-sm text-gray-500">
              {editingId ? 'Update employee details and system access.' : 'This account will immediately have access to the system.'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
            <select required name="role" value={formData.role} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
              <option value="employee">Employee (Basic Access)</option>
              <option value="manager">Manager (Admin Access)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Login ID)</label>
            <input required disabled={!!editingId} type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100 disabled:text-gray-500" placeholder="john@mims.com" />
            {editingId && <p className="text-xs text-gray-500 mt-1">Email cannot be changed after creation.</p>}
          </div>
          
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
              <input required type="text" name="password" value={formData.password} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="At least 6 characters" minLength={6} />
            </div>
          )}

          <div className="md:col-span-2 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="force_reset" 
                checked={formData.force_reset} 
                onChange={handleInputChange} 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <div>
                <span className="block text-sm font-medium text-gray-800">Force Password Reset</span>
                <span className="block text-xs text-gray-500">
                  {editingId 
                    ? "If checked, this user will be locked out and forced to set a new password on their next login."
                    : "If checked, the employee must choose a new password the first time they log in."}
                </span>
              </div>
            </label>
          </div>
          
          <div className="md:col-span-2 flex justify-between mt-4 border-t pt-4">
            {editingId ? (
              <button type="button" onClick={handleDelete} className="text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-lg flex items-center transition-colors">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            ) : <div></div>}
            <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? 'Update Account' : 'Create Account')}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium flex items-center space-x-3 text-gray-900">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span>{emp.full_name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit
                          ${emp.role === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                        `}>
                          {emp.role === 'manager' && <ShieldCheck className="w-3 h-3 mr-1" />}
                          {emp.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {emp.requires_password_change ? (
                          <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full">Must Reset Password</span>
                        ) : (
                          <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEdit(emp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.id !== emp.id && (
                          <button onClick={() => handleDelete(emp.id, emp.full_name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{emp.full_name}</p>
                        <p className="text-sm text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => handleEdit(emp)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.id !== emp.id && (
                        <button onClick={() => handleDelete(emp.id, emp.full_name)} className="p-2 text-red-600 bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center w-fit
                      ${emp.role === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                    `}>
                      {emp.role === 'manager' && <ShieldCheck className="w-3 h-3 mr-1" />}
                      {emp.role.toUpperCase()}
                    </span>
                    {emp.requires_password_change ? (
                      <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-md border border-amber-100">Must Reset Password</span>
                    ) : (
                      <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-md border border-green-100">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
