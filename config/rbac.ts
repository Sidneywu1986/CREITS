// RBAC 权限配置

export type Role = 'super_admin' | 'admin' | 'editor' | 'viewer' | 'guest';

export type Resource =
  | 'reits:product'
  | 'reits:property'
  | 'reits:financial'
  | 'reits:operational'
  | 'reits:market'
  | 'reits:investor'
  | 'reits:dividend'
  | 'reits:risk'
  | 'reits:all'
  | 'abs:data'
  | 'system:users'
  | 'system:logs'
  | 'system:settings';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'export';

export interface Permission {
  resource: Resource;
  actions: Action[];
}

// 角色权限映射
export const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    { resource: 'reits:all', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { resource: 'abs:data', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { resource: 'system:users', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { resource: 'system:logs', actions: ['read', 'export'] },
    { resource: 'system:settings', actions: ['read', 'update'] },
  ],
  admin: [
    { resource: 'reits:all', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { resource: 'abs:data', actions: ['read', 'update', 'export'] },
    { resource: 'system:users', actions: ['read'] },
    { resource: 'system:logs', actions: ['read'] },
  ],
  editor: [
    { resource: 'reits:product', actions: ['read', 'update'] },
    { resource: 'reits:property', actions: ['read', 'update'] },
    { resource: 'reits:financial', actions: ['read', 'update'] },
    { resource: 'reits:operational', actions: ['read', 'update'] },
    { resource: 'reits:market', actions: ['read', 'update'] },
    { resource: 'reits:investor', actions: ['read', 'update'] },
    { resource: 'reits:dividend', actions: ['read', 'update'] },
    { resource: 'reits:risk', actions: ['read', 'update'] },
    { resource: 'abs:data', actions: ['read'] },
  ],
  viewer: [
    { resource: 'reits:product', actions: ['read'] },
    { resource: 'reits:property', actions: ['read'] },
    { resource: 'reits:financial', actions: ['read'] },
    { resource: 'reits:operational', actions: ['read'] },
    { resource: 'reits:market', actions: ['read'] },
    { resource: 'reits:investor', actions: ['read'] },
    { resource: 'reits:dividend', actions: ['read'] },
    { resource: 'reits:risk', actions: ['read'] },
    { resource: 'abs:data', actions: ['read'] },
  ],
  guest: [
    { resource: 'reits:product', actions: ['read'] },
    { resource: 'reits:market', actions: ['read'] },
  ],
};

// 资源中文名称映射
export const resourceLabels: Record<Resource, string> = {
  'reits:product': 'REITs产品信息',
  'reits:property': 'REITs资产信息',
  'reits:financial': 'REITs财务指标',
  'reits:operational': 'REITs运营数据',
  'reits:market': 'REITs市场表现',
  'reits:investor': 'REITs投资者结构',
  'reits:dividend': 'REITs收益分配',
  'reits:risk': 'REITs风险指标',
  'reits:all': 'REITs全部数据',
  'abs:data': 'ABS数据中心',
  'system:users': '系统用户管理',
  'system:logs': '系统日志',
  'system:settings': '系统设置',
};

// 角色中文名称映射
export const roleLabels: Record<Role, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  editor: '编辑',
  viewer: '查看者',
  guest: '访客',
};

// 动作中文名称映射
export const actionLabels: Record<Action, string> = {
  create: '创建',
  read: '查看',
  update: '更新',
  delete: '删除',
  export: '导出',
};

// 检查角色是否具有某个权限
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  const permissions = rolePermissions[role] || [];

  // 检查是否有全部数据的权限
  const allPermission = permissions.find(p => p.resource === 'reits:all');
  if (allPermission && allPermission.actions.includes(action)) {
    return true;
  }

  // 检查具体资源的权限
  const resourcePermission = permissions.find(p => p.resource === resource);
  if (resourcePermission) {
    return resourcePermission.actions.includes(action);
  }

  return false;
}

// 获取角色的所有权限
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

// 检查角色是否为管理员
export function isAdmin(role: Role): boolean {
  return role === 'super_admin' || role === 'admin';
}
