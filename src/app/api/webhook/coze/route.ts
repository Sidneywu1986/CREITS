import { NextRequest, NextResponse } from 'next/server';

/**
 * 扣子平台Webhook接收端点
 *
 * 使用方法：
 * 1. 在扣子平台配置Webhook，指向此地址
 * 2. 本地开发时需要使用内网穿透工具（如ngrok）
 * 3. 生产环境使用实际的域名
 *
 * 扣子平台会向此端点推送消息
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证Webhook签名（推荐）
    // const signature = request.headers.get('x-coze-signature');
    // const isValid = verifySignature(body, signature, process.env.COZE_WEBHOOK_SECRET);

    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // 根据消息类型处理
    switch (body.type) {
      case 'message':
        // 处理新消息
        await handleMessage(body.data);
        break;

      case 'event':
        // 处理事件
        await handleEvent(body.data);
        break;

      default:
        console.log('Unknown webhook type:', body.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * 处理消息
 */
async function handleMessage(data: any) {
  // 保存消息到数据库
  // 触发相应的处理逻辑
  console.log('Processing message:', data);
}

/**
 * 处理事件
 */
async function handleEvent(data: any) {
  // 处理各种事件（如对话结束、用户离开等）
  console.log('Processing event:', data);
}

/**
 * 验证签名
 */
function verifySignature(
  body: any,
  signature: string | null,
  secret: string | undefined
): boolean {
  // 实现签名验证逻辑
  // 参考扣子平台的文档实现
  return true;
}
