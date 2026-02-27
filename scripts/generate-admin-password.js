#!/usr/bin/env node

/**
 * 生成超级管理员密码哈希脚本
 * 使用项目中的 AES256 密码哈希算法
 */

const CryptoJS = require('crypto-js');

const CJS = CryptoJS;

class PasswordHasher {
  static hashPassword(password) {
    const salt = CJS.lib.WordArray.random(128 / 8).toString();
    const hash = CJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    return `${salt}:${hash}`;
  }

  static verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const computedHash = CJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    return computedHash === hash;
  }
}

// 主程序
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  node generate-admin-password.js <password>');
    console.log('');
    console.log('示例:');
    console.log('  node generate-admin-password.js Admin@123');
    process.exit(1);
  }

  const password = args[0];

  console.log('========================================');
  console.log('  生成超级管理员密码哈希');
  console.log('========================================');
  console.log('');

  const passwordHash = PasswordHasher.hashPassword(password);

  console.log('密码:', password);
  console.log('哈希:', passwordHash);
  console.log('');

  // 验证
  const isValid = PasswordHasher.verifyPassword(password, passwordHash);
  console.log('验证:', isValid ? '✅ 通过' : '❌ 失败');
  console.log('');

  console.log('========================================');
  console.log('  SQL 插入语句');
  console.log('========================================');
  console.log('');
  console.log(`-- 用户名: admin`);
  console.log(`-- 密码: ${password}`);
  console.log(`INSERT INTO users (username, email, password_hash, role_id, is_active)`);
  console.log(`VALUES (`);
  console.log(`  'admin',`);
  console.log(`  'admin@reits.local',`);
  console.log(`  '${passwordHash}',`);
  console.log(`  (SELECT id FROM roles WHERE code = 'super_admin' LIMIT 1),`);
  console.log(`  true`);
  console.log(`)`);
  console.log(`ON CONFLICT (username) DO NOTHING;`);
  console.log('');
}

main();
