// page.js (Client Component)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Breadcrumb from "@/components/body/Breadcrumb";
import PageHeader from "@/components/body/PageHeader";
import CopyWebhook from "./components/CopyWebhook";
import MerchantKeyInput from "./components/MerchantKeyInput";
import DetailLoading from "@/components/skeletons/Detail";

export default function SettingsPage() {
	const [user, setUser] = useState(null);
	const [ebookUser, setEbookUser] = useState(null);
	const [merchantKey, setMerchantKey] = useState("");
	const [loading, setLoading] = useState(true);
	const [keySaved, setKeySaved] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchData = async () => {
			const supabase = createClient();

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push("/login");
				return;
			}

			setUser(user);

			const { data: ebookUser } = await supabase
				.from("ebook_user")
				.select("*")
				.eq("auth_user_id", user.id)
				.single();

			setEbookUser(ebookUser);

			// Fetch decrypted merchant key
			const keyResponse = await fetch("/api/settings/merchant-key");
			if (keyResponse.ok) {
				const keyData = await keyResponse.json();
				setMerchantKey(keyData.merchantKey || "");
			}

			setKeySaved(!!ebookUser?.lynk_id_merchant_key);
			setLoading(false);
		};

		fetchData();
	}, [router]);

	const handleKeySaved = async () => {
		// Refetch the data
		const supabase = createClient();
		const { data: ebookUser } = await supabase
			.from("ebook_user")
			.select("*")
			.eq("auth_user_id", user.id)
			.single();

		setEbookUser(ebookUser);

		// Refetch decrypted merchant key
		const keyResponse = await fetch("/api/settings/merchant-key");
		if (keyResponse.ok) {
			const keyData = await keyResponse.json();
			setMerchantKey(keyData.merchantKey || "");
		}

		setKeySaved(!!ebookUser?.lynk_id_merchant_key);
	};

	if (loading) {
		return <DetailLoading title={"Pengaturan"} />;
	}

	const webhookUrl = `https://halamanku.vercel.app/webhook/lynk/${ebookUser?.user_number}`;

	return (
		<div className="page-container">
			<PageHeader user={user} ebookUser={ebookUser} showUserInfo />

			<main className="main">
				<div>
					<Breadcrumb
						items={[
							{ label: "Dasbor", href: "/dashboard" },
							{
								label: "Pengaturan",
							},
						]}
					/>
				</div>

				<div className="page-header">
					<h1 className="page-header-title">Pengaturan</h1>
					<p className="page-header-description text-sm md:text-base">
						Kelola pengaturan Anda
					</p>
				</div>

				{/* Tabs Navigation */}
				<div className="tabs-container">
					<button className="tab-button active">Integrasi</button>
				</div>

				{/* Tab Content */}
				<div className="tab-content active">
					<div className="bg-white p-6 rounded-lg shadow-md border">
						<h3 className="text-lg font-semibold text-gray-800 flex items-center">
							<img
								src="/lynk-logo.png"
								alt="LYNK Logo"
								className="h-24 w-auto"
							/>
						</h3>

						<div className="space-y-6">
							<MerchantKeyInput
								onKeySaved={handleKeySaved}
								currentKey={merchantKey}
							/>

							{keySaved && (
								<div>
									<h4 className="text-md font-semibold mb-4 text-gray-800">
										URL Webhook
									</h4>

									<p className="text-sm text-gray-600 mb-3">
										Gunakan URL ini untuk menerima informasi
										pesanan dari LYNK:
									</p>

									<CopyWebhook url={webhookUrl} />
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
