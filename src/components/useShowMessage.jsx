import { useState } from "react";

export default function useShowMessage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const showMessage = (msg) => {
    setMessage(msg);
    setIsVisible(true); 
    setTimeout(() => setIsVisible(false), 7000); 
    setTimeout(() => setMessage(""), 8000);
  };

  const showError = (err) => {
    setError(err);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 7000);
    setTimeout(() => setError(""), 8000);
  };

  return { message, showMessage, error, showError, isVisible };
}
