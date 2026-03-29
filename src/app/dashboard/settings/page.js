// page.js (Server Component)
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import PageHeader from "@/components/PageHeader";
import CopyWebhook from "./components/CopyWebhook";

export default async function SettingsPage() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const { data: ebookUser } = await supabase
		.from("ebook_user")
		.select("*")
		.eq("auth_user_id", user.id)
		.single();

	const webhookUrl = `https://halamanku.vercel.app/webhook/${ebookUser?.user_number}`;

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
					<p className="page-header-description">
						Kelola pengaturan Anda
					</p>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-md border">
					<h3 className="text-lg font-semibold mb-4 text-gray-800">
						URL Webhook
					</h3>

					<p className="text-sm text-gray-600 mb-3">
						Gunakan URL ini untuk menerima informasi pesanan dari Lynk.id:
					</p>

					<CopyWebhook url={webhookUrl} />
				</div>
			</main>
		</div>
	);
}
