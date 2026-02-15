/**
 * 飞书集成测试脚本
 *
 * 使用方法：
 * node scripts/test-feishu-connection.js
 */

require('dotenv').config({ path: '.env.local' });

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查环境变量
function checkEnvironment() {
  log('\n========== 检查环境变量 ==========', 'blue');

  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId) {
    log('❌ FEISHU_APP_ID 未配置', 'red');
    log('请在 .env.local 文件中添加:', 'yellow');
    log('FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx', 'yellow');
    return false;
  }

  if (!appSecret) {
    log('❌ FEISHU_APP_SECRET 未配置', 'red');
    log('请在 .env.local 文件中添加:', 'yellow');
    log('FEISHU_APP_SECRET=your_app_secret', 'yellow');
    return false;
  }

  log('✅ 环境变量配置正确', 'green');
  log(`   App ID: ${appId}`, 'cyan');
  log(`   App Secret: ${appSecret.substring(0, 10)}...${appSecret.substring(appSecret.length - 5)}`, 'cyan');

  return true;
}

// 测试获取访问令牌
async function testAccessToken() {
  log('\n========== 测试访问令牌 ==========', 'blue');

  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  try {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      log('❌ 获取访问令牌失败:', 'red');
      log(`   错误代码: ${error.code}`, 'red');
      log(`   错误信息: ${error.msg}`, 'red');
      return false;
    }

    const data = await response.json();
    log('✅ 获取访问令牌成功', 'green');
    log(`   Token: ${data.app_access_token.substring(0, 20)}...`, 'cyan');
    log(`   过期时间: ${data.expire}秒`, 'cyan');

    return data.app_access_token;
  } catch (err) {
    log('❌ 访问令牌请求异常:', 'red');
    log(`   ${err.message}`, 'red');
    return false;
  }
}

// 测试发送消息
async function testSendMessage(token) {
  log('\n========== 测试发送消息 ==========', 'blue');

  const userId = process.env.TEST_FEISHU_USER_ID;

  if (!userId) {
    log('⚠️  跳过消息发送测试', 'yellow');
    log('如需测试，请设置环境变量 TEST_FEISHU_USER_ID', 'yellow');
    return null;
  }

  try {
    const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: userId,
        msg_type: 'text',
        content: JSON.stringify({
          text: '🎉 飞书集成测试成功！\n\n这是一条来自REITs智能助手的测试消息。',
        }),
        receive_id_type: 'open_id',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      log('❌ 发送消息失败:', 'red');
      log(`   错误代码: ${error.code}`, 'red');
      log(`   错误信息: ${error.msg}`, 'red');
      return false;
    }

    log('✅ 消息发送成功', 'green');
    log(`   接收人: ${userId}`, 'cyan');
    return true;
  } catch (err) {
    log('❌ 消息发送异常:', 'red');
    log(`   ${err.message}`, 'red');
    return false;
  }
}

// 测试审批功能
async function testApproval(token) {
  log('\n========== 测试审批功能 ==========', 'blue');

  const approvalCode = process.env.FEISHU_REITS_APPROVAL_CODE;
  const userId = process.env.TEST_FEISHU_USER_ID;

  if (!approvalCode) {
    log('⚠️  跳过审批测试', 'yellow');
    log('如需测试，请设置环境变量 FEISHU_REITS_APPROVAL_CODE', 'yellow');
    return null;
  }

  if (!userId) {
    log('⚠️  跳过审批测试', 'yellow');
    log('如需测试，请设置环境变量 TEST_FEISHU_USER_ID', 'yellow');
    return null;
  }

  try {
    const response = await fetch('https://open.feishu.cn/open-apis/approval/v4/instances', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        approval_code: approvalCode,
        user_id: userId,
        node_list: [
          {
            type: 'NONE',
            node_id: 'node_1',
            approve_users: [
              {
                approve_type: 'USER',
                user_ids: [userId],
              },
            ],
          },
        ],
        instance: {
          title: 'REITs智能助手-测试审批',
          summary: '这是一条测试审批',
        },
        form_map: {
          reit_code: 'TEST001.SH',
          reit_name: '测试REIT',
          fund_manager: '测试管理人',
          total_assets: 10.0,
          approval_type: 'REITs发行',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      log('❌ 创建审批失败:', 'red');
      log(`   错误代码: ${error.code}`, 'red');
      log(`   错误信息: ${error.msg}`, 'red');
      return false;
    }

    const data = await response.json();
    log('✅ 创建审批成功', 'green');
    log(`   实例代码: ${data.data.instance.instance_code}`, 'cyan');
    log(`   标题: ${data.data.instance.title}`, 'cyan');
    return data.data.instance.instance_code;
  } catch (err) {
    log('❌ 创建审批异常:', 'red');
    log(`   ${err.message}`, 'red');
    return false;
  }
}

// 生成测试报告
function generateReport(envOk, tokenOk, messageResult, approvalResult) {
  log('\n========== 测试报告 ==========', 'blue');

  const allPassed = envOk && tokenOk;

  if (allPassed) {
    log('🎉 基础连接测试通过！', 'green');
  } else {
    log('⚠️  部分测试未通过，请检查以下问题:', 'yellow');
  }

  log('\n测试结果汇总:', 'cyan');
  log(`  环境变量: ${envOk ? '✅ 通过' : '❌ 失败'}`, envOk ? 'green' : 'red');
  log(`  访问令牌: ${tokenOk ? '✅ 通过' : '❌ 失败'}`, tokenOk ? 'green' : 'red');
  log(`  消息发送: ${messageResult === true ? '✅ 通过' : messageResult === false ? '❌ 失败' : '⏭️ 跳过'}`,
    messageResult === true ? 'green' : messageResult === false ? 'red' : 'yellow');
  log(`  审批功能: ${approvalResult ? '✅ 通过' : approvalResult === false ? '❌ 失败' : '⏭️ 跳过'}`,
    approvalResult ? 'green' : approvalResult === false ? 'red' : 'yellow');

  log('\n下一步操作:', 'yellow');
  if (!envOk) {
    log('  1. 配置 .env.local 文件中的飞书凭证', 'yellow');
  }
  if (envOk && tokenOk) {
    log('  1. 配置 TEST_FEISHU_USER_ID 测试消息发送', 'green');
    log('  2. 配置 FEISHU_REITS_APPROVAL_CODE 测试审批功能', 'green');
    log('  3. 开始使用飞书API服务', 'green');
  }
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  飞书集成测试', 'blue');
  log('========================================\n', 'blue');

  // 1. 检查环境变量
  const envOk = checkEnvironment();
  if (!envOk) {
    process.exit(1);
  }

  // 2. 测试获取访问令牌
  const token = await testAccessToken();
  if (!token) {
    generateReport(envOk, false, null, null);
    process.exit(1);
  }

  // 3. 测试发送消息
  const messageResult = await testSendMessage(token);

  // 4. 测试审批功能
  const approvalResult = await testApproval(token);

  // 5. 生成测试报告
  generateReport(envOk, !!token, messageResult, approvalResult);

  log('\n========================================\n', 'blue');
}

// 执行测试
main().catch(err => {
  console.error('测试执行失败:', err);
  process.exit(1);
});
