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
                alignItems: "center",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "300px",
                    textAlign: "center",
                    border: "3px solid black",
                }}
            >
                <p>{message}</p>
                <button
                    onClick={onConfirm}
                    style={{
                        margin: "10px",
                        backgroundColor: "green",
                        color: "white",
                    }}
                >
                    Confirm
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        margin: "10px",
                        backgroundColor: "red",
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
