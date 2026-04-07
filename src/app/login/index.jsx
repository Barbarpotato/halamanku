"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage({ next }) {
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);

			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(
						next,
					)}`,
				},
			});

			if (error) {
				console.error("Error signing in:", error.message);
				setLoading(false);
			}
		} catch (error) {
			console.error("Error:", error);
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<div className={styles.header}>
					<div className={styles.logo}>
						<img
							src="/halamanku.png"
							alt="Halamanku"
							width="90"
							height="90"
						/>
					</div>
					<h1>Selamat datang di Halamanku</h1>
					<p>Masuk untuk mengelola ebook Anda</p>
				</div>

				<div className={styles.content}>
					<button
						onClick={handleGoogleSignIn}
						disabled={loading}
						className={styles.googleButton}
					>
						{loading ? (
							<span className={styles.spinner}></span>
						) : (
							<>
								<FcGoogle size={20} />
								Lanjutkan dengan Google
							</>
						)}
					</button>
				</div>

				<div className={styles.footer}>
					<p>
						Dengan masuk, Anda setuju dengan Syarat Layanan dan
						Kebijakan Privasi kami
					</p>
				</div>
			</div>
		</div>
	);
}
