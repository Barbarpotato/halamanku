"use client";

import React from "react";
import Link from "next/link";
import { useGlobalLoader } from "./GlobalLoaderProvider";

const LoadingLink = ({ href, children, ...props }) => {
	const { startLoading } = useGlobalLoader();

	const handleClick = (e) => {
		startLoading();
		// Call any onClick passed in props
		if (props.onClick) {
			props.onClick(e);
		}
	};

	return (
		<Link href={href} {...props} onClick={handleClick}>
			{children}
		</Link>
	);
};

export default LoadingLink;
