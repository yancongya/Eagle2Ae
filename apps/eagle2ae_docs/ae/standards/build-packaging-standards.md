# 构建和打包规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的构建和打包规范，包括构建流程、打包策略、代码优化和发布准备等方面的标准。

## 构建流程规范

### 构建脚本结构

构建脚本应遵循标准的 Node.js 模块结构，包含以下核心组件：

```javascript
/**
 * 构建 CEP 扩展
 */
class ExtensionBuilder {
    constructor() {
        this.sourceDir = path.resolve(__dirname, '..');
        this.buildDir = path.resolve(__dirname, '../dist');
        this.tempDir = path.resolve(__dirname, '../temp');
    }
    
    async build() {
        console.log('开始构建 CEP 扩展...');
        
        try {
            // 1. 清理构建目录
            await this.cleanBuildDir();
            
            // 2. 创建构建目录
            await this.createBuildDir();
            
            // 3. 复制源文件
            await this.copySourceFiles();
            
            // 4. 处理配置文件
            await this.processConfigFiles();
            
            // 5. 优化资源文件
            await this.optimizeAssets();
            
            // 6. 验证构建结果
            await this.validateBuild();
            
            console.log('构建完成！');
            
        } catch (error) {
            console.error('构建失败:', error);
            process.exit(1);
        }
    }
}
```

### 构建阶段要求

#### 清理阶段
- 删除旧的构建输出目录
- 清理临时文件和缓存
- 确保构建环境干净

#### 复制阶段
- 准确复制所有必需的源文件
- 保持目录结构一致性
- 排除开发相关文件

#### 处理阶段
- 替换配置文件中的版本号
- 处理环境特定的配置
- 优化资源配置

#### 验证阶段
- 验证必需文件存在
- 检查文件完整性
- 确认构建结果符合规范

## 打包策略规范

### 打包格式

扩展应打包为标准的 ZXP 格式，支持 Adobe Extension Manager 和命令行工具安装。

### 打包脚本实现

```javascript
/**
 * 打包 CEP 扩展为 ZXP 文件
 */
class ExtensionPackager {
    constructor() {
        this.buildDir = path.resolve(__dirname, '../dist');
        this.packageDir = path.resolve(__dirname, '../packages');
    }
    
    async package() {
        console.log('开始打包 CEP 扩展...');
        
        try {
            // 1. 先构建项目
            const builder = new ExtensionBuilder();
            await builder.build();
            
            // 2. 创建打包目录
            if (!fs.existsSync(this.packageDir)) {
                fs.mkdirSync(this.packageDir, { recursive: true });
            }
            
            // 3. 读取版本信息
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(this.buildDir, 'package.json'), 'utf8')
            );
            
            // 4. 创建 ZXP 包
            const packageName = `Eagle2Ae-AE-v${packageJson.version}.zxp`;
            const packagePath = path.join(this.packageDir, packageName);
            
            await this.createZXP(this.buildDir, packagePath);
            
            console.log(`打包完成: ${packageName}`);
            console.log(`文件位置: ${packagePath}`);
            
        } catch (error) {
            console.error('打包失败:', error);
            process.exit(1);
        }
    }
}
```

### 打包验证

- 验证 ZXP 文件完整性
- 检查文件大小合理性
- 确认包含所有必需文件
- 测试安装兼容性

## 代码优化规范

### JavaScript 优化

#### 代码压缩
- 使用 UglifyJS 或 Terser 进行代码压缩
- 移除未使用的代码和变量
- 优化函数和变量命名

#### 模块合并
- 合并相关功能模块
- 减少 HTTP 请求次数
- 优化加载顺序

### 资源优化

#### 图片优化
- 压缩 PNG 和 JPEG 图片
- 转换为 WebP 格式（如支持）
- 使用适当的图片尺寸

#### CSS 优化
- 压缩 CSS 文件
- 移除未使用的样式
- 合并多个样式文件

#### HTML 优化
- 压缩 HTML 文件
- 移除不必要的空格和注释
- 优化标签结构

## 版本管理规范

### 版本号格式

遵循语义化版本控制 (SemVer) 标准：
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 版本文件更新

#### package.json
```json
{
    "name": "eagle2ae-ae-extension",
    "version": "1.0.0",
    "description": "Eagle2Ae After Effects CEP Extension"
}
```

#### manifest.xml
```xml
<ExtensionManifest Version="7.0" ExtensionBundleId="com.eagle2ae.ae.extension" ExtensionBundleVersion="1.0.0">
    <ExtensionList>
        <Extension Id="com.eagle2ae.ae.extension" Version="1.0.0"/>
    </ExtensionList>
</ExtensionManifest>
```

## 发布准备规范

### 发布检查清单

#### 代码质量
- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] ESLint 检查通过
- [ ] 代码格式化完成

#### 功能验证
- [ ] 核心功能正常工作
- [ ] 错误处理正确
- [ ] 性能满足要求
- [ ] 兼容性测试通过

#### 文档更新
- [ ] README.md 更新
- [ ] CHANGELOG.md 更新
- [ ] API 文档更新
- [ ] 用户手册更新

#### 打包验证
- [ ] 构建成功
- [ ] ZXP 包创建成功
- [ ] 安装测试通过
- [ ] 版本号正确

### 发布流程

1. 更新版本号
2. 运行完整测试套件
3. 执行构建和打包
4. 验证打包结果
5. 更新 CHANGELOG.md
6. 创建 Git 标签
7. 上传发布包

## 最佳实践

### 构建性能优化

#### 并行处理
- 并行执行不相关的构建任务
- 使用多进程处理大型文件
- 优化资源依赖关系

#### 缓存机制
- 缓存构建结果
- 避免重复处理未变更文件
- 使用增量构建策略

### 错误处理

#### 构建错误
- 提供清晰的错误信息
- 记录错误日志
- 支持错误恢复机制

#### 打包错误
- 验证打包结果
- 提供打包失败原因
- 支持重试机制

## 相关文档

- [项目结构规范](./project-structure-standards.md)
- [配置管理规范](./configuration-management-standards.md)
- [版本控制规范](./version-control-standards.md)
- [测试规范](./testing-standards.md)

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始版本 | 开发团队 |