import React, { useState } from "react";
import { FiMail, FiLock, FiKey, FiArrowRight } from "react-icons/fi";
import { authService } from "../services/auth.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

const toastConfig = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [resetToken, setResetToken] = useState(""); // C2 fix: server-side reset token
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.sendOtp(email);
            // C2 fix: OTP no longer in response — just advance step
            setStep(2);
            toast.success("OTP sent to your email!", toastConfig);
        } catch {
            toast.error("Failed to send OTP. Please try again.", toastConfig);
        } finally {
            setLoading(false);
        }
    };

    // C2 fix: verify OTP server-side, receive resetToken
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authService.verifyOtp(email, otp);
            setResetToken(response.data.data.resetToken);
            setStep(3);
            toast.success("OTP verified successfully!", toastConfig);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP. Please try again.", toastConfig);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await authService.sendOtp(email);
            toast.success("New OTP sent to your email!", toastConfig);
        } catch {
            toast.error("Failed to resend OTP. Please try again.", toastConfig);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match", toastConfig);
            return;
        }
        setLoading(true);
        try {
            // C2 fix: pass resetToken for server-side validation
            await authService.changePassword(email, newPassword, resetToken);
            toast.success("Password reset successfully!", toastConfig);
            setEmail(""); setOtp(""); setNewPassword(""); setConfirmPassword("");
            navigate("/login");
            setStep(1);
        } catch {
            toast.error("Failed to reset password. Please try again.", toastConfig);
        } finally {
            setLoading(false);
        }
    };

    const stepLabel = step === 1 ? "Enter your email to receive an OTP" : step === 2 ? "Enter the OTP sent to your email" : "Create a new password";

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
                    <p className="text-purple-100 mt-2">{stepLabel}</p>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <form onSubmit={handleSendOtp}>
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiMail className="h-5 w-5 text-gray-400" /></div>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="your@email.com" required />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                                {loading ? "Sending..." : "Send OTP"}
                                {!loading && <FiArrowRight className="ml-2 h-4 w-4" />}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-6">
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiKey className="h-5 w-5 text-gray-400" /></div>
                                    <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter 6-digit OTP" required maxLength="6" />
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    Didn't receive code?{" "}
                                    <button type="button" onClick={handleResendOtp} disabled={loading} className="text-purple-600 hover:text-purple-800 font-medium focus:outline-none">Resend OTP</button>
                                </p>
                            </div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                                {loading ? "Verifying..." : "Verify OTP"}
                                {!loading && <FiArrowRight className="ml-2 h-4 w-4" />}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-6">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400" /></div>
                                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter new password" required minLength="6" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400" /></div>
                                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Confirm new password" required minLength="6" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                                {loading ? "Resetting..." : "Reset Password"}
                                {!loading && <FiArrowRight className="ml-2 h-4 w-4" />}
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 text-center">
                    <p className="text-sm text-gray-600">
                        Remember your password?{" "}
                        <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
