"use client";

import dynamic from "next/dynamic";

const VerticalStepper = dynamic(() => import("./VerticalStepper"), {
	ssr: false,
});

export default function ClientStepperWrapper({ totalPages }) {
	return <VerticalStepper totalPages={totalPages} />;
}
