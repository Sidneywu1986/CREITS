import { getSupabaseClient } from './client';
import { AES256 } from '../crypto/aes-256';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  permissions: string[];
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * 用户注册
 */
export async function registerUser(
  username: string,
  email: string,
  password: string,
  roleId: string
): Promise<AuthResult> {
  try {
    const supabase = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { success: false, error: '用户名已存在' };
    }

    // 检查邮箱是否已存在
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return { success: false, error: '邮箱已被注册' };
    }

    // 哈希密码
    const passwordHash = AES256.hashPassword(password);

    // 创建用户
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        role_id: roleId,
      })
      .select('*, roles(*)')
      .single();

    if (error) {
      console.error('注册失败:', error);
      return { success: false, error: '注册失败，请稍后重试' };
    }

    // 加载用户权限
    const permissions = await loadUserPermissions(user.role_id);

    // 创建 AuthUser 对象
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      roleName: user.roles?.name || '',
      roleCode: user.roles?.code || '',
      permissions,
    };

    return { success: true, user: authUser };
  } catch (error) {
    console.error('注册错误:', error);
    return { success: false, error: '系统错误，请稍后重试' };
  }
}

/**
 * 用户登录
 */
export async function loginUser(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = getSupabaseClient();

    // 获取用户信息
    const { data: user, error } = await supabase
      .from('users')
      .select('*, roles(*)')
      .eq('username', username)
      .single();

    if (error || !user) {
      // 记录登录失败
      await logLoginAttempt(null, username, false);
      return { success: false, error: '用户名或密码错误' };
    }

    // 检查账户是否锁定
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return {
        success: false,
        error: `账户已锁定，请在 ${new Date(user.locked_until).toLocaleString()} 后重试`,
      };
    }

    // 检查账户是否激活
    if (!user.is_active) {
      return { success: false, error: '账户已被禁用' };
    }

    // 验证密码
    const isValid = AES256.verifyPassword(password, user.password_hash);

    await logLoginAttempt(user.id, username, isValid);

    if (!isValid) {
      // 增加失败计数
      const newAttempts = (user.login_attempts || 0) + 1;
      const updates: any = { login_attempts: newAttempts };

      // 如果失败次数达到5次，锁定账户30分钟
      if (newAttempts >= 5) {
        updates.locked_until = new Date(Date.now() + 30 * 60 * 1000);
      }

      await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      return { success: false, error: '用户名或密码错误' };
    }

    // 登录成功，重置失败计数
    await supabase
      .from('users')
      .update({
        login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 加载用户权限
    const permissions = await loadUserPermissions(user.role_id);

    // 创建 AuthUser 对象
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      roleName: user.roles?.name || '',
      roleCode: user.roles?.code || '',
      permissions,
    };

    // 记录登录成功审计日志
    await logAuditAction(user.id, user.username, 'login', 'user', user.id, null, {
      login_time: new Date().toISOString(),
    });

    return { success: true, user: authUser };
  } catch (error) {
    console.error('登录错误:', error);
    return { success: false, error: '系统错误，请稍后重试' };
  }
}

/**
 * 加载用户权限
 */
export async function loadUserPermissions(roleId: string): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();

    const { data: permissions } = await supabase
      .from('permissions')
      .select('resource, action')
      .eq('role_id', roleId);

    if (!permissions) {
      return [];
    }

    // 将权限转换为 "resource:action" 格式
    return permissions.map((p) => `${p.resource}:${p.action}`);
  } catch (error) {
    console.error('加载权限失败:', error);
    return [];
  }
}

/**
 * 记录登录尝试
 */
async function logLoginAttempt(
  userId: string | null,
  username: string,
  success: boolean
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const clientIp = await getClientIp();
    const userAgent = navigator.userAgent;

    await supabase.from('login_attempts').insert({
      user_id: userId,
      username,
      success,
      ip_address: clientIp,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('记录登录尝试失败:', error);
  }
}

/**
 * 记录审计日志
 */
export async function logAuditAction(
  userId: string,
  username: string,
  action: string,
  resourceType: string,
  resourceId: string | null = null,
  oldValue: any = null,
  newValue: any = null,
  result: 'success' | 'failure' = 'success',
  errorMessage: string | null = null
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const clientIp = await getClientIp();
    const userAgent = navigator.userAgent;

    await supabase.from('audit_logs').insert({
      user_id: userId,
      username,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: clientIp,
      user_agent: userAgent,
      result,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error('记录审计日志失败:', error);
  }
}

/**
 * 获取客户端IP
 */
async function getClientIp(): Promise<string> {
  // 在浏览器端，我们无法直接获取真实的客户端IP
  // 这里返回一个占位符，实际IP应该从API路由的请求头中获取
  return '0.0.0.0';
}

/**
 * 检查用户是否有权限
 */
export async function checkUserPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // 获取用户的角色ID
    const { data: user } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', userId)
      .single();

    if (!user) {
      return false;
    }

    // 检查是否有对应权限
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('role_id', user.role_id)
      .eq('resource', resource)
      .eq('action', action)
      .single();

    return !!permission;
  } catch (error) {
    console.error('检查权限失败:', error);
    return false;
  }
}
