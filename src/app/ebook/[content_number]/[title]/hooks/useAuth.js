"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function useAuth(contentNumber, title) {
	const [token, setToken] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const [accessDenied, setAccessDenied] = useState(false);

	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const supabase = createClient();

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push(
					`/login?next=${encodeURIComponent(`/ebook/${contentNumber}/${title}`)}`,
				);
				setLoading(false);
				return;
			}

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				router.push(
					`/login?next=${encodeURIComponent(`/ebook/${contentNumber}/${title}`)}`,
				);
				setLoading(false);
				return;
			}

			setToken(session.access_token);
			setIsAuthenticated(true);
			setLoading(false);
		};

		checkAuth();
	}, [contentNumber, title, router]);

	return { token, isAuthenticated, loading, accessDenied };
}
