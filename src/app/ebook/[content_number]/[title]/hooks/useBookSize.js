"use client";

import { useState, useEffect } from "react";

export default function useBookSize() {
	const [size, setSize] = useState({ width: 600, height: 800 });
	const [isLandscape, setIsLandscape] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const updateSize = () => {
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;

			setIsLandscape(false);
			setIsMobile(false);

			if (screenWidth < 600) {
				// pure mobile
				setSize({ width: screenWidth, height: screenHeight * 0.8 });
				setIsMobile(true);
			} else {
				if (screenWidth / screenHeight < 1) {
					// For tablet
					setSize({
						width: screenWidth * 0.9,
						height: screenHeight * 0.8,
					});
					setIsMobile(true);
				} else {
					const totalBookWidth = Math.min(screenWidth * 0.9, 1300); // total width for both pages
					let pageWidth = Math.round(totalBookWidth / 2);
					let pageHeight = Math.round(pageWidth * (4 / 3)); // 3:4 ratio

					if (pageWidth < 500) {
						// landscape mobile orinetation
						setSize({
							width: screenWidth * 0.8,
							height: screenWidth,
						});
						setIsLandscape(true);
						setIsMobile(true);
					} else {
						// Don't make it too tall
						const maxHeight = Math.floor(screenHeight * 0.85);
						if (pageHeight > maxHeight) {
							pageHeight = maxHeight;
							pageWidth = Math.round(pageHeight * (3 / 4));
						}
						setSize({ width: pageWidth, height: pageHeight });
					}
				}
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);

		return () => window.removeEventListener("resize", updateSize);
	}, []);

	return { size, isLandscape, isMobile };
}
