import { createClient } from "@/lib/supabase/server";

export const getEbookTemplateById = async (templateId) => {
	const supabase = await createClient();

	const { data: template } = await supabase
		.from("ebook_template")
		.select("*")
		.eq("id", templateId)
		.single();

	return template;
};

export const getEbookTemplateList = async () => {
	const supabase = await createClient();

	const { data: templates } = await supabase
		.from("ebook_template")
		.select("*")
		.order("created", { ascending: false });

	return templates || [];
};
