import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api-client";

export default function Signup() {
  const navigate = useNavigate();

  type FormType = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

  type ErrorType = {
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  const [form, setForm] = useState<FormType>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ErrorType>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors: ErrorType = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        await apiPost('/signup', {
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        alert('Signup successful! Redirecting to login...');
        navigate("/login");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Signup failed";
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        
        <h2 className="text-2xl font-bold text-[#1F1F1F] text-center mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign up for BookStore
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#926d24]"
              }`}
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.username
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#926d24]"
              }`}
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#926d24]"
              }`}
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#926d24]"
              }`}
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#926d24]"
              }`}
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#926d24] text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#926d24] font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
