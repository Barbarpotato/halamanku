"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
} from "react";
import { usePathname } from "next/navigation";

const GlobalLoaderContext = createContext();

export const GlobalLoaderProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);
	const pathname = usePathname();
	const timeoutRef = useRef();

	useEffect(() => {
		// On route change, start loading
		setIsLoading(true);

		// Clear previous timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Stop loading after delay
		timeoutRef.current = setTimeout(() => {
			setIsLoading(false);
		}, 500); // Minimum display time

		// Cleanup on unmount
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [pathname]);

	const startLoading = () => {
		setIsLoading(true);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	const stopLoading = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setTimeout(() => setIsLoading(false), 100); // Small delay to avoid flicker
	};

	return (
		<GlobalLoaderContext.Provider
			value={{ isLoading, startLoading, stopLoading }}
		>
			{children}
		</GlobalLoaderContext.Provider>
	);
};

export const useGlobalLoader = () => useContext(GlobalLoaderContext);
