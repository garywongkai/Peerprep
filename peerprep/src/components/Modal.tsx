import React from "react";

interface ConfirmationModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    show,
    onConfirm,
    onCancel,
    message,
}) => {
    if (!show) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "start",
                marginTop: "3em",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "20px",
                    width: "300px",
                    textAlign: "center",
                    boxShadow: "0 6px 6px rgba(0, 0, 0, 0.02)",
                }}
            >
                <p>{message}</p>
                <button
                    onClick={onConfirm}
                    style={{
                        margin: "10px",
                        backgroundColor: "#74B573",
                        color: "white",
                    }}
                >
                    Confirm
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        margin: "10px",
                        backgroundColor: "#CA5E5B",
                        color: "white",
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
