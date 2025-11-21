# Quick Start - API Integration

## 🚀 快速开始

### 1. 启动后端 API
```bash
# 确保 FastAPI 后端运行在 http://localhost:8000
cd /path/to/backend
uvicorn main:app --reload
```

### 2. 配置前端
```bash
# 在项目根目录
cd /Users/Evan/Documents/Project/DSP

# 确保有 .env.local 文件
# 内容: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# 启动开发服务器
npm run dev
# 或
bun dev
```

### 3. 访问应用
- Admin: http://localhost:3000/login
- Driver: http://localhost:3000/driver-login

## 📋 测试清单

### Admin 功能测试

1. **登录**
   - [ ] 访问 `/login`
   - [ ] 输入邮箱和密码
   - [ ] 成功登录并重定向到主页

2. **驾驶员管理** (`/drivers`)
   - [ ] 查看驾驶员列表
   - [ ] 搜索驾驶员
   - [ ] 查看文档到期警报
   - [ ] 点击驾驶员查看详情（如果详情页已实现）

3. **车辆管理** (`/vehicles`)
   - [ ] 查看车辆列表
   - [ ] 按状态筛选（Ready/Needs Repair/Unavailable）
   - [ ] 查看维护警报
   - [ ] 搜索车辆

4. **资产管理** (`/assets`)
   - [ ] 查看库存列表
   - [ ] 借出资产给驾驶员
   - [ ] 归还资产
   - [ ] 查看低库存警报
   - [ ] 查看借用历史

### Driver 功能测试

1. **登录** (`/driver-login`)
   - [ ] 使用 Amazon ID 登录
   - [ ] 测试凭证: `AMZ-1001` / `encrypted_password_1`

2. **车辆检查** (`/driver-inspection`)
   - [ ] 上传车辆照片（最多6张）
   - [ ] 输入里程表读数
   - [ ] 选择车辆状态
   - [ ] 添加备注
   - [ ] 提交检查报告

## 🔑 测试账号

### Admin 账号
根据后端数据库中的用户数据

### Driver 账号
```
Amazon ID: AMZ-1001
Password: encrypted_password_1

Amazon ID: AMZ-1002
Password: encrypted_password_2
```

## 🐛 常见问题

### 1. API 连接失败
```
Error: Network Error
```
**解决方案**:
- 确保后端 API 运行在 `http://localhost:8000`
- 检查 `.env.local` 中的 `NEXT_PUBLIC_API_BASE_URL`
- 确保后端配置了 CORS 允许 `http://localhost:3000`

### 2. 401 Unauthorized
```
Error: 401 Unauthorized
```
**解决方案**:
- Token 可能过期，重新登录
- 检查 localStorage (admin) 或 sessionStorage (driver) 中是否有 token
- 清除浏览器缓存并重新登录

### 3. 页面一直加载
```
Loading... (无限加载)
```
**解决方案**:
- 打开浏览器控制台查看错误
- 检查 API 响应格式是否匹配
- 确认后端返回正确的数据结构

### 4. 文件上传失败
```
Error: Failed to upload
```
**解决方案**:
- 检查文件大小限制
- 确认后端支持 multipart/form-data
- 检查后端文件存储路径权限

## 📊 数据流程

### 页面加载
```
1. 用户访问页面
   ↓
2. React 组件挂载
   ↓
3. Hook 调用 API 客户端
   ↓
4. API 客户端添加 JWT token
   ↓
5. 发送请求到后端
   ↓
6. 后端返回数据
   ↓
7. 转换器转换数据格式
   ↓
8. 更新组件状态
   ↓
9. 渲染 UI
```

### 数据更新
```
1. 用户操作（如提交表单）
   ↓
2. 调用 API 客户端方法
   ↓
3. 发送 POST/PUT/DELETE 请求
   ↓
4. 后端处理并返回
   ↓
5. 调用 refetch() 刷新数据
   ↓
6. 更新 UI
```

## 🔍 调试技巧

### 1. 查看网络请求
```javascript
// 打开浏览器开发者工具
// Network 标签
// 筛选 XHR/Fetch
// 查看请求和响应
```

### 2. 查看 Token
```javascript
// Admin token
console.log(localStorage.getItem('admin_token'));

// Driver token
console.log(sessionStorage.getItem('driver_token'));
```

### 3. 测试 API 直接调用
```javascript
// 在浏览器控制台
import { apiClient } from '@/lib/api/client';

// 获取驾驶员
const drivers = await apiClient.getDrivers();
console.log(drivers);
```

### 4. 查看 Hook 状态
```javascript
// 在组件中添加
console.log({
  drivers,
  isLoading,
  error
});
```

## 📝 下一步开发

1. **实现详情页面**
   - `/drivers/[id]` - 驾驶员详情
   - `/vehicles/[id]` - 车辆详情

2. **实现创建/编辑功能**
   - 添加驾驶员对话框
   - 添加车辆对话框
   - 添加资产对话框

3. **集成主页排班日历**
   - 使用 `useSchedules()` hook
   - Deputy 同步
   - 车辆分配

4. **实现设置页面**
   - 使用 `useSettings()` hook
   - 系统配置管理

## 🎯 性能优化建议

1. **使用 React Query** (可选)
   - 更好的缓存管理
   - 自动重新获取
   - 乐观更新

2. **分页加载**
   - 驾驶员列表分页
   - 车辆列表分页
   - 借用历史分页

3. **虚拟滚动**
   - 大列表使用虚拟滚动
   - 提高性能

4. **图片优化**
   - 上传前压缩图片
   - 使用 WebP 格式
   - 添加图片预览缓存

## 🔐 安全注意事项

1. **Token 管理**
   - Admin token 存储在 localStorage
   - Driver token 存储在 sessionStorage
   - 关闭标签页时 driver token 自动清除

2. **API 调用**
   - 所有请求自动包含 token
   - 401 错误自动重定向到登录页
   - 不在客户端存储敏感信息

3. **文件上传**
   - 验证文件类型
   - 限制文件大小
   - 服务端验证

## 📚 相关文档

- **完整 API 集成文档**: `API_INTEGRATION.md`
- **集成总结**: `API_INTEGRATION_SUMMARY.md`
- **项目说明**: `CLAUDE.md`
