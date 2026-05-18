import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../authApi";

export default function OAuthSuccess() {

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {

    const handleOAuth = async () => {

      const token = params.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      localStorage.setItem("token", token);

      const user = await getCurrentUser();

      login(user, token);

      navigate("/hiring");
    };

    handleOAuth();

  }, []);

  return <div>Logging in...</div>;
}
