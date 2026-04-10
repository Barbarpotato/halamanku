import React from "react";

const NotFound = ({ icon, title, description }) => {
	return (
		<div className="bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				{icon}
				<h1 className="mt-4 text-2xl font-semibold text-gray-700">
					{title}
				</h1>
				<p className="mt-2 text-gray-500">{description}</p>
			</div>
		</div>
	);
};

export default NotFound;
