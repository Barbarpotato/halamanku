import ClientStepperWrapper from "./ClientWrapper";

export default function TestPage() {
	const totalPages = 10;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="p-8 bg-white rounded-lg shadow-lg">
				<ClientStepperWrapper totalPages={totalPages} />
			</div>
		</div>
	);
}
