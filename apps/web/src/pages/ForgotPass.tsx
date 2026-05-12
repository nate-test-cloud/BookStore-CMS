import { useState } from "react";

type ErrorType = {
  email?: string;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ErrorType>({});
  const [message, setMessage] = useState("");

  // 🔍 Validation
  const validate = () => {
    let newErrors: ErrorType = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    return newErrors;
  };

  // 🚀 Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length === 0) {
      try {
        const res = await fetch("http://localhost:5000/api/v1/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to send reset link");
        } else {
          setMessage("Reset link sent to your email 📩");
          setEmail(""); // optional reset
        }

      } catch (error) {
        console.error(error);
        setMessage("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        
        <h2 className="text-2xl font-bold text-[#1F1F1F] text-center mb-2">
          Forgot Password
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your email to reset your password
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#926d24]"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-[#926d24] text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Send Reset Link
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="text-center text-sm mt-4 text-gray-600">{message}</p>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <a href="/login" className="text-[#926d24] font-medium hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}