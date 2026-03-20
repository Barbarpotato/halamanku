"use client";

import React from "react";
import { useGlobalLoader } from "./GlobalLoaderProvider";

const GlobalLoader = () => {
	const { isLoading } = useGlobalLoader();

	if (!isLoading) return null;

	return (
		<div className="global-loader-overlay">
			<div className="global-loader-content">
				<div className="spinner"></div>
				<p>Loading...</p>
			</div>
		</div>
	);
};

export default GlobalLoader;
