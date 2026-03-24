import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const getEbookUserContentAccessList = async (
	contentNumber,
	emailFilter = "",
	page = 1,
	limit = 10,
) => {
	let baseQuery = supabase
		.from("ebook_user_content_access")
		.select("*", { count: "exact", head: true })
		.eq("ebook_user_content_number", contentNumber);

	if (emailFilter) {
		baseQuery = baseQuery.ilike("email_address", `%${emailFilter}%`);
	}

	const { count, error: countError } = await baseQuery;

	if (countError) {
		throw countError;
	}

	let dataQuery = supabase
		.from("ebook_user_content_access")
		.select("*")
		.eq("ebook_user_content_number", contentNumber)
		.order("created", { ascending: false });

	if (emailFilter) {
		dataQuery = dataQuery.ilike("email_address", `%${emailFilter}%`);
	}

	const from = (page - 1) * limit;
	const to = from + limit - 1;

	const { data, error: dataError } = await dataQuery.range(from, to);

	if (dataError) {
		throw dataError;
	}

	return {
		data: data || [],
		total: count || 0,
		page,
		limit,
		totalPages: Math.ceil((count || 0) / limit),
	};
};
