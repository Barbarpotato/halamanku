"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import Modal from "./Modal";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [type, setType] = useState("info"); // 'info' or 'confirm'
	const [message, setMessage] = useState("");
	const resolveRef = useRef();

	const show = ({ type = "info", message }) => {
		setType(type);
		setMessage(message);
		setIsOpen(true);
		return new Promise((resolve) => {
			resolveRef.current = resolve;
		});
	};

	const confirm = ({ message }) => {
		return show({ type: "confirm", message });
	};

	const handleConfirm = () => {
		setIsOpen(false);
		resolveRef.current(true);
	};

	const handleCancel = () => {
		setIsOpen(false);
		resolveRef.current(false);
	};

	const handleClose = () => {
		setIsOpen(false);
		if (type === "confirm") resolveRef.current(false);
	};

	return (
		<ModalContext.Provider value={{ show, confirm }}>
			{children}
			<Modal
				isOpen={isOpen}
				type={type}
				message={message}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
				onClose={handleClose}
			/>
		</ModalContext.Provider>
	);
};

export const useModal = () => useContext(ModalContext);
