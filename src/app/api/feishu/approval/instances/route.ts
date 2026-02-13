import { NextRequest, NextResponse } from 'next/server';
import { createApprovalInstance, getApprovalInstanceStatus, getApprovalTemplates } from '@/services/feishu/approval';

// 创建审批实例
export async function POST(request: NextRequest) {
  try {
    const { approvalCode, title, formData, options } = await request.json();

    if (!approvalCode || !title) {
      return NextResponse.json(
        { error: '审批模板代码和标题不能为空' },
        { status: 400 }
      );
    }

    // 创建审批实例
    const instance = await createApprovalInstance(approvalCode, title, formData, options);

    return NextResponse.json({
      success: true,
      instance,
    });
  } catch (error) {
    console.error('创建审批实例失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建审批实例失败' },
      { status: 500 }
    );
  }
}

// 获取审批模板列表
export async function GET() {
  try {
    const templates = await getApprovalTemplates();

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('获取审批模板失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取审批模板失败' },
      { status: 500 }
    );
  }
}
