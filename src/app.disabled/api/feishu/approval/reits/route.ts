import { NextRequest, NextResponse } from 'next/server';
import { createREITsApproval } from '@/services/feishu/approval';

export async function POST(request: NextRequest) {
  try {
    const {
      projectName,
      projectType,
      projectAmount,
      projectManager,
      description,
    } = await request.json();

    if (!projectName || !projectType || !projectAmount || !projectManager) {
      return NextResponse.json(
        { error: '项目名称、类型、金额和负责人不能为空' },
        { status: 400 }
      );
    }

    // 创建REITs项目审批
    const instance = await createREITsApproval(
      projectName,
      projectType,
      projectAmount,
      projectManager,
      description || ''
    );

    return NextResponse.json({
      success: true,
      instance,
    });
  } catch (error) {
    console.error('创建REITs项目审批失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建REITs项目审批失败' },
      { status: 500 }
    );
  }
}
