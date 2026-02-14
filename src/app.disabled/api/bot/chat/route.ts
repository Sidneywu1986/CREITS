import { NextRequest, NextResponse } from 'next/server';
import { callCozeBot } from '@/config/coze';

export async function POST(request: NextRequest) {
  try {
    const { botKey, message, conversationId } = await request.json();

    if (!botKey || !message) {
      return NextResponse.json(
        { error: 'botKey and message are required' },
        { status: 400 }
      );
    }

    // 调用扣子Bot
    const response = await callCozeBot(botKey, message, conversationId);

    return NextResponse.json({
      content: response,
      conversationId,
    });
  } catch (error) {
    console.error('Bot chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to call bot', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
