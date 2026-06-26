import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    role: 'CANDIDATE', phone: '', location: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Per-field validation ─────────────────────────────────────────
  const validate = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required.';
        if (/\d/.test(value)) return 'Name cannot contain numbers.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required.';
        if (!/^[0-9]{10}$/.test(value)) return 'Phone must be exactly 10 digits.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(value)) return 'Must include at least one uppercase letter.';
        if (!/[a-z]/.test(value)) return 'Must include at least one lowercase letter.';
        if (!/[0-9]/.test(value)) return 'Must include at least one number.';
        if (!/[@$!%*?&]/.test(value)) return 'Must include one special character (@$!%*?&).';
        return '';
      case 'location':
        if (!value.trim()) return 'Location is required.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow digits for phone
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digits }));
      setErrors(prev => ({ ...prev, phone: validate('phone', digits) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const validateAll = () => {
    const fields = ['name', 'email', 'phone', 'password', 'location'];
    const newErrors = {};
    fields.forEach(f => { newErrors[f] = validate(f, formData[f]); });
    setErrors(newErrors);
    return Object.values(newErrors).every(e => e === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateAll()) return;
    setLoading(true);
    try {
      await API.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data || 'Registration failed!');
    }
    setLoading(false);
  };

  // ─── Password strength indicator ──────────────────────────────────
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    return score;
  };
  const strength = getStrength(formData.password);
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength];

  const InputField = ({ label, name, type = 'text', placeholder }) => (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-1.5 text-sm">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors text-sm
          ${errors[name] ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-indigo-500'}`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span>⚠️</span> {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">AI Job Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your account</p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <span>❌</span> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <InputField label="Full Name" name="name" placeholder="e.g. Chinmayee Patil" />

          {/* Email */}
          <InputField label="Email" name="email" type="email" placeholder="you@example.com" />

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, uppercase, number, symbol"
                className={`w-full border rounded-lg px-4 py-3 pr-10 focus:outline-none transition-colors text-sm
                  ${errors.password ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-indigo-500'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength bar */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= strength ? strengthColor : '#e5e7eb' }} />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
              </div>
            )}
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Role</label>
            <select name="role" value={formData.role} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-sm">
              <option value="CANDIDATE">Candidate (Job Seeker)</option>
              <option value="RECRUITER">Recruiter (HR)</option>
            </select>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors text-sm
                ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-indigo-500'}`}
            />
            <p className="text-gray-400 text-xs mt-1">{formData.phone.length}/10 digits</p>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.phone}
              </p>
            )}
          </div>

          {/* Location */}
          <InputField label="Location" name="location" placeholder="e.g. Pune, Maharashtra" />

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 mt-2 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-5 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login here</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;