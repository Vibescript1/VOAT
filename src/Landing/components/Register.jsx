import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Home, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("left");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  // Attempts logic
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [lockTimer, setLockTimer] = useState(0);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (lockTimer > 0) {
      const interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setAttemptsLeft(3);
            localStorage.removeItem("otpBlockExpiresAt");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockTimer]);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const validateName = (name) => /^[a-zA-Z\s]{3,50}$/.test(name.trim());
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/.test(password);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const validateFile = (file) => {
    if (!file) return false;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    return allowedTypes.includes(file.type);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setSelectedFile(null);
    if (!validateFile(file)) {
      toast.error("Please upload a valid PDF, DOC, or DOCX file.");
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
  };

  const handleGetOtp = async (e, isResend = false) => {
    if (e) e.preventDefault();

    if (!validateName(name)) {
      toast.error("Invalid Name. Only alphabets and spaces allowed (3-50 chars).");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Invalid Email format.");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Password must be 8+ chars with uppercase, lowercase, digit, special char.");
      return;
    }
    if (activeTab === "left" && !validateFile(selectedFile)) {
      toast.error("Please upload a valid PDF, DOC, or DOCX resume.");
      return;
    }

    setLoading(true);
    try {
      // Simulate sending OTP
      const generatedOTP = "123456"; // This would be the OTP sent to email
      localStorage.setItem("tempOTP", generatedOTP); // Store OTP temporarily
      setTempToken("dummy-token");
      setShowOtp(true);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setResendTimer(60);
      setAttemptsLeft(3);
      setLockTimer(0);
      toast.success(isResend ? `OTP resent to ${email}!` : `OTP sent to ${email}! Please check your email.`);
    } catch (error) {
      toast.error("Failed to send OTP, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, idx) => {
    if (lockTimer > 0) return; // disable input if locked
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (idx < 5) inputRefs.current[idx + 1].focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (lockTimer > 0) return; // disable input if locked
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        inputRefs.current[idx - 1].focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (lockTimer > 0) {
      toast.error(`Too many attempts. Please wait ${lockTimer}s.`);
      return;
    }
    if (otp.includes("")) {
      toast.error("Please enter complete OTP.");
      return;
    }

    setLoading(true);
    try {
      // Verify the entered OTP against the stored OTP
      const storedOTP = localStorage.getItem("tempOTP");
      const enteredOtp = otp.join("");

      if (enteredOtp !== storedOTP) {
        setAttemptsLeft((prev) => prev - 1);
        if (attemptsLeft <= 1) {
          setLockTimer(60); // lock for 60 seconds
          toast.error("Too many wrong attempts. Please wait 60 seconds.");
          localStorage.setItem("otpBlockExpiresAt", Date.now() + 60000);
        } else {
          toast.error(`Incorrect OTP. ${attemptsLeft - 1} attempts remaining.`);
        }
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      // OTP is correct, show success message and loading
      toast.success("OTP verified successfully!");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for 1.5 seconds

      // Proceed with registration
      toast.success("Account created successfully!");
      localStorage.removeItem("tempOTP");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-indigo-100 transition-colors duration-500">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden bg-white"
      >
        <div className="md:w-1/2 hidden md:block">
          <img
            src="https://img.freepik.com/premium-vector/illustration-vector-graphic-cartoon-character-online-registration_516790-1807.jpg"
            alt="Register"
            className="h-full w-full object-cover p-6"
          />
        </div>

        <div className="md:w-1/2 p-8 flex flex-col justify-center items-center">
          {!showOtp && (
            <div className="mb-6 flex justify-center w-full max-w-md">
              <div className="flex bg-gray-100 rounded-full p-1 relative w-[200px]">
                <motion.div
                  className="absolute top-0 bottom-0 left-0 w-1/2 bg-blue-500 center rounded-full z-0"
                  animate={{ x: activeTab === "right" ? "100%" : "0%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  className={`w-1/2 relative z-10 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                    activeTab === "left"
                      ? "bg-blue-500 text-white"
                      : "text-blue-600"
                  }`}
                  onClick={() => setActiveTab("left")}
                >
                  User
                </button>
                <button
                  className={`w-1/2 relative z-10 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                    activeTab === "right"
                      ? "bg-blue-500 text-white"
                      : "text-blue-600"
                  }`}
                  onClick={() => setActiveTab("right")}
                >
                  HR
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showOtp ? (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-4"
                onSubmit={handleGetOtp}
              >
                <h2 className="text-center text-2xl font-bold mb-6 text-gray-900">
                  Create an Account
                </h2>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      if (/^[a-zA-Z\s]*$/.test(e.target.value))
                        setName(e.target.value);
                    }}
                    maxLength={50}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={100}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="relative">
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={30}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200"
                    placeholder="Min 8 chars with upper, lower, digit & special"
                  />
                  <span
                    className="absolute top-9 right-3 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One number
                      </div>
                      <div className={`flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : ''}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        One special character
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "left" && (
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">
                      Upload Resume (PDF, DOC, or DOCX)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="file-upload"
                      />
                      <div className={`border-2 border-dashed rounded-lg p-3 text-center transition-all duration-300 bg-white ${
                        isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}>
                        {selectedFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                document.getElementById('file-upload').value = '';
                              }}
                              className="text-xs text-red-600 hover:text-red-800 underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, DOC, or DOCX (max 10MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  className={`w-full font-semibold py-2 rounded-lg transition duration-300 flex items-center justify-center ${
                    loading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-700 hover:bg-blue-800 text-white"
                  }`}
                >
                  {loading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                  Get OTP
                </motion.button>

                 <div className="mt-4 flex justify-between">
  <span
    onClick={() => navigate('/')}
    className="text-blue-600 text-sm font-semibold cursor-pointer transition-all duration-200 hover:underline hover:text-blue-700 flex items-center gap-1"
  >
    <Home size={16} /> Go To Home
  </span>
  <span
    onClick={() => navigate('/login')}
    className="text-blue-600 text-sm font-semibold cursor-pointer transition-all duration-200 hover:underline hover:text-blue-700 flex items-center gap-1"
  >
    <UserPlus size={16} /> Go to Login Now
  </span>
</div>
              </motion.form>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md flex flex-col items-center"

              >
                <h2 className="text-center text-2xl font-bold mb-6 text-gray-900">
                  Enter OTP
                </h2>

                <div className="flex space-x-2 mb-4">
                  {otp.map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(e, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      disabled={loading || lockTimer > 0}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      className={`w-10 h-12 text-center text-lg border rounded-md ${
                        lockTimer > 0
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    />
                  ))}
                </div>

                {lockTimer > 0 && (
                  <p className="mb-4 text-red-600 font-semibold">
                    Too many wrong attempts. Please wait {lockTimer}s.
                  </p>
                )}

                <motion.button
                  onClick={handleVerifyOtp}
                  disabled={loading || lockTimer > 0}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full font-semibold py-2 rounded-lg transition duration-300 flex items-center justify-center ${
                    loading || lockTimer > 0
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-700 hover:bg-blue-800 text-white"
                  }`}
                >
                  {loading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                  Verify OTP
                </motion.button>

                <p className="mt-4 text-gray-600">
                  Didn't receive OTP?{" "}
                  <button
                    onClick={(e) => {
                      if (resendTimer === 0 && !loading) handleGetOtp(e, true);
                    }}
                    disabled={resendTimer !== 0 || loading}
                    className={`text-blue-600 underline cursor-pointer ${
                      resendTimer !== 0 ? "cursor-not-allowed text-gray-400" : ""
                    }`}
                  >
                    Resend OTP {resendTimer > 0 && `(${resendTimer}s)`}
                  </button>
                </p>

                <p
                  onClick={() => {
                    setShowOtp(false);
                    setOtp(new Array(6).fill(""));
                    setAttemptsLeft(3);
                    setLockTimer(0);
                  }}
                  className="mt-4 text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  Back to Signup
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

