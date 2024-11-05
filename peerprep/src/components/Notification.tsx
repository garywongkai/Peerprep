// Notification.tsx
import React, { useEffect } from "react";

interface NotificationProps {
    message: string;
    type?: "success" | "error";
    duration?: number;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    type = "success",
    duration = 3500,
    onClose,
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            style={{
                position: "fixed",
                top: "3em",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: type === "success" ? "#74B573" : "#CA5E5B",
                color: "white",
                padding: "15px 25px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                textAlign: "center",
            }}
        >
            {message}
            <button
                onClick={onClose}
                style={{
                    marginLeft: "15px",
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                }}
            >
                ×
            </button>
        </div>
    );
};

export default Notification;
