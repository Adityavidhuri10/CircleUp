import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/auth.service';

// ─── useLogin ────────────────────────────────────────────────────────────────
export const useLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(formData.email, formData.password);
            if (response.data.status === 'success') {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                navigate('/');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, error, handleChange, handleSubmit };
};

// ─── useSignUp ───────────────────────────────────────────────────────────────
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/didyxuyd5/image/upload';
const CLOUDINARY_PRESET = 'hg73yvrn';

export const useSignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        anonymousName: '',
        picture: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size too large (max 5MB)');
            return;
        }
        if (!file.type.match(/image\/(jpeg|jpg|png|gif)$/)) {
            setError('Please upload a valid image file (JPEG, JPG, PNG, GIF)');
            return;
        }

        setImageLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', CLOUDINARY_PRESET);

        try {
            const response = await axios.post(CLOUDINARY_URL, data);
            setFormData((prev) => ({ ...prev, picture: response.data.secure_url }));
        } catch {
            setError('Failed to upload image. Please try again.');
        } finally {
            setImageLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.picture) { setError('Please upload a profile picture'); return; }
        if (!formData.location) { setError('Please enter your location'); return; }

        setLoading(true);
        setError(null);
        try {
            const response = await authService.signup(formData);
            if (response.data.status === 'success') {
                navigate('/login', { state: { registrationSuccess: true } });
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, imageLoading, error, previewImage, handleChange, handleImageUpload, handleSubmit };
};

// ─── useForgotPassword ───────────────────────────────────────────────────────
// C2 Fix: OTP verified server-side. Flow:
//   Step 1 → sendOtp(email)   → server hashes+stores OTP, emails it
//   Step 2 → verifyOtp(email, otp) → server validates → returns resetToken
//   Step 3 → changePassword(email, newPassword, resetToken) → server bcrypt-hashes + saves
export const useForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [resetToken, setResetToken] = useState(''); // C2 fix: replaces generatedOtp
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toastConfig = {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    return {
        email, setEmail,
        otp, setOtp,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        step, setStep,
        resetToken, setResetToken,  // C2 fix: exposes resetToken state for page component
        loading, setLoading,
        navigate,
        toastConfig,
    };
};
