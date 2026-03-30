"use client";

import { useRouter } from "next/navigation";

export default function ErrorPage({
	icon,
	title,
	message,
	buttonText = "Kembali ke Halaman Utama",
	buttonAction,
	background = "bg-gradient-to-br from-gray-50 to-gray-100",
	buttonColor = "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
}) {
	const router = useRouter();

	const handleButtonClick = () => {
		if (buttonAction) {
			buttonAction();
		} else {
			router.push("/");
		}
	};

	return (
		<div
			className={`flex items-center justify-center min-h-screen ${background} p-4`}
		>
			<div className="text-center max-w-md mx-auto">
				<div className="mb-6">{icon}</div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					{title}
				</h1>
				<p className="text-gray-600 mb-8">{message}</p>
				<button
					onClick={handleButtonClick}
					className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
				>
					{buttonText}
				</button>
			</div>
		</div>
	);
}
