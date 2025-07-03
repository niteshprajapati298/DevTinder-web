import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const EmailVerify = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`${BASE_URL}/verify-email/${token}`);
        setMessage("✅ Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setMessage("❌ Invalid or expired verification link.");
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 bg-base-300 shadow-lg rounded">
        <h2 className="text-lg font-bold">{message}</h2>
      </div>
    </div>
  );
};

export default EmailVerify;
