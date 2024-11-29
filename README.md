# RN4OH CLI

RN4OH CLI 是一个命令行工具，用于快速创建和初始化 React Native for OpenHarmony 项目。

## 使用方式

### 方式一：使用 npx（推荐）

无需安装，直接使用：

```bash
npx rn4oh init my-project
```

指定版本：
```bash
npx rn4oh init my-project -v 1.0.0
```

查看版本：
```bash
npx rn4oh versions
```

### 方式二：全局安装

1. 安装：
```bash
npm install -g rn4oh
```

2. 使用：
```bash
# 查看版本
rn4oh --version

# 查看可用的模板版本
rn4oh versions

# 创建最新版本的项目
rn4oh init my-project

# 创建指定版本的项目
rn4oh init my-project -v 1.0.0
```

## 项目结构

初始化后的项目包含以下主要部分：
- iOS 应用
- Android 应用
- OpenHarmony 应用
- React Native 代码

## 开发流程

1. 进入项目目录：
```bash
cd my-project
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

4. 运行应用：

iOS：
```bash
npm run ios
```

Android：
```bash
npm run android
```

OpenHarmony：
```bash
npm run oh:dev
```

## 注意事项

1. 确保已安装必要的开发环境：
   - Node.js (推荐 v14 或更高版本)
   - Git
   - Xcode (用于 iOS 开发)
   - Android Studio (用于 Android 开发)
   - DevEco Studio (用于 OpenHarmony 开发)

2. 项目名称要求：
   - 只能包含小写字母、数字和连字符
   - 不能以数字或连字符开头
   - 不能包含大写字母或特殊字符

3. 版本选择：
   - 使用 `rn4oh versions` 查看所有可用版本
   - 不指定版本时将使用最新版本
   - 指定的版本必须存在，否则会报错

## 常见问题

1. 如果遇到权限问题，请确保已正确配置 Git SSH 密钥。

2. 如果安装过程中断，请删除已创建的项目目录后重试。

3. 确保目标目录不存在同名文件夹。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持项目初始化
- 支持版本选择
- 支持模板更新

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request。
