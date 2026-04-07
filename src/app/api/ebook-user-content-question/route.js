import { NextResponse } from "next/server";
import {
	getQuestionsByContentId,
	getQuestionByPage,
} from "@/services/UserContentQuestion/get";
import { createQuestion } from "@/services/UserContentQuestion/create";
import { updateQuestion } from "@/services/UserContentQuestion/update";
import { deleteQuestion } from "@/services/UserContentQuestion/delete";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const contentId = searchParams.get("contentId");
		const pageNumber = searchParams.get("pageNumber");

		if (pageNumber) {
			const question = await getQuestionByPage(
				contentId,
				parseInt(pageNumber),
			);
			return NextResponse.json({ data: question });
		} else {
			const questions = await getQuestionsByContentId(contentId);
			return NextResponse.json({ data: questions });
		}
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const body = await req.json();
		const { action, ...data } = body; // action: 'create' or 'update'

		if (action === "create") {
			const question = await createQuestion(data);
			return NextResponse.json({ data: question });
		} else if (action === "update") {
			const question = await updateQuestion(data);
			return NextResponse.json({ data: question });
		} else if (action === "delete") {
			const result = await deleteQuestion(data.questionId);
			return NextResponse.json({ data: result });
		} else {
			return NextResponse.json(
				{ error: "Invalid action" },
				{ status: 400 },
			);
		}
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
