import { NextRequest, NextResponse } from 'next/server';
import { getApprovalInstanceStatus, getApprovalDetail } from '@/services/feishu/approval';

// 查询审批状态
export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const instanceId = params.instanceId;

    if (!instanceId) {
      return NextResponse.json(
        { error: '审批实例ID不能为空' },
        { status: 400 }
      );
    }

    // 获取审批状态
    const status = await getApprovalInstanceStatus(instanceId);

    // 获取审批详情
    const detail = await getApprovalDetail(instanceId);

    return NextResponse.json({
      success: true,
      status,
      detail,
    });
  } catch (error) {
    console.error('查询审批状态失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '查询审批状态失败' },
      { status: 500 }
    );
  }
}
