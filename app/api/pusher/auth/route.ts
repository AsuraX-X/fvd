import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

const CHANNEL_PATTERN = /^private-conversation-(.+)$/;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const socketId = String(formData.get("socket_id") || "");
  const channel = String(formData.get("channel_name") || "");

  const match = channel.match(CHANNEL_PATTERN);
  if (!socketId || !match) {
    return NextResponse.json({ error: "Invalid channel." }, { status: 400 });
  }
  const conversationId = match[1];

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participantOneId: true, participantTwoId: true },
  });

  if (
    !profile ||
    !conversation ||
    (conversation.participantOneId !== profile.id &&
      conversation.participantTwoId !== profile.id)
  ) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channel);
  return NextResponse.json(authResponse);
}
