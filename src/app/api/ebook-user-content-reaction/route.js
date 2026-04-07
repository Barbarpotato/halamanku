import { NextResponse } from "next/server";
import {
	getReactionsByContentId,
	getHighlightedReactionsByContentId,
	getReactionById,
} from "@/services/UserContentReaction/get";
import { createReaction } from "@/services/UserContentReaction/create";
import { updateReaction } from "@/services/UserContentReaction/update";
import { authorRespond } from "@/services/UserContentReaction/respond";
import {
	highlightReaction,
	unhighlightReaction,
} from "@/services/UserContentReaction/highlight";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const contentId = searchParams.get("contentId");
		const reactionId = searchParams.get("reactionId");
		const highlighted = searchParams.get("highlighted");

		if (reactionId) {
			const reaction = await getReactionById(reactionId);
			return NextResponse.json({ data: reaction });
		} else if (highlighted === "true") {
			const reactions =
				await getHighlightedReactionsByContentId(contentId);
			return NextResponse.json({ data: reactions });
		} else {
			const reactions = await getReactionsByContentId(contentId);
			return NextResponse.json({ data: reactions });
		}
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const body = await req.json();
		const { action, ...data } = body;

		switch (action) {
			case "create":
				const reaction = await createReaction(data);
				return NextResponse.json({ data: reaction });
			case "update":
				const updatedReaction = await updateReaction(data);
				return NextResponse.json({ data: updatedReaction });
			case "respond":
				const respondedReaction = await authorRespond(data);
				return NextResponse.json({ data: respondedReaction });
			case "highlight":
				const highlighted = await highlightReaction(data.reactionId);
				return NextResponse.json({ data: highlighted });
			case "unhighlight":
				const unhighlighted = await unhighlightReaction(
					data.reactionId,
				);
				return NextResponse.json({ data: unhighlighted });
			default:
				return NextResponse.json(
					{ error: "Invalid action" },
					{ status: 400 },
				);
		}
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
