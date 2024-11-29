#!/usr/bin/env node

import { program } from 'commander';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import ora from 'ora';
import chalk from 'chalk';

const REPO_URL = 'git@github.com:Kayshen-X/rn4oh-template.git';
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const VERSION = packageJson.version;

async function replaceInFile(filePath: string, projectName: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/rn4oh/g, projectName.toLowerCase());
    content = content.replace(/RN4OH/g, projectName.toUpperCase());
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`替换文件 ${filePath} 内容失败`);
  }
}

async function updateProjectFiles(targetPath: string, projectName: string) {
  try {
    // 递归获取所有文件
    function getAllFiles(dir: string): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            // 处理目录名
            let newDirPath = fullPath;
            if (entry.name.toLowerCase().includes('rn4oh')) {
              const newDirName = entry.name
                .replace(/rn4oh/gi, projectName.toLowerCase())
                .replace(/RN4OH/g, projectName.toUpperCase());
              newDirPath = path.join(dir, newDirName);
              fs.renameSync(fullPath, newDirPath);
            }
            files.push(...getAllFiles(newDirPath));
          }
        } else {
          // 处理文件名
          let filePath = fullPath;
          const patterns = [/rn4oh/gi, /RN4OH/g, /Rn4oh/g, /rN4oh/g];
          let newFileName = entry.name;
          
          let hasMatch = false;
          for (const pattern of patterns) {
            if (pattern.test(entry.name)) {
              hasMatch = true;
              newFileName = newFileName.replace(pattern, (match) => {
                if (match === match.toUpperCase()) return projectName.toUpperCase();
                if (match === match.toLowerCase()) return projectName.toLowerCase();
                if (match[0] === match[0].toUpperCase()) {
                  return projectName.charAt(0).toUpperCase() + projectName.slice(1).toLowerCase();
                }
                return projectName.toLowerCase();
              });
            }
          }
          
          if (hasMatch) {
            const newFilePath = path.join(dir, newFileName);
            fs.renameSync(filePath, newFilePath);
            filePath = newFilePath;
          }
          files.push(filePath);
        }
      }
      return files;
    }

    // 获取所有需要处理的文件
    const files = getAllFiles(targetPath);

    // 更新 package.json
    const projectPackageJsonPath = path.join(targetPath, 'package.json');
    const projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, 'utf8'));
    projectPackageJson.name = projectName.toLowerCase();
    fs.writeFileSync(
      projectPackageJsonPath,
      JSON.stringify(projectPackageJson, null, 2),
      'utf8'
    );

    // 处理所有文本文件内容
    for (const file of files) {
      await replaceInFile(file, projectName);
    }
  } catch (error) {
    throw new Error('更新项目配置文件失败: ' + error);
  }
}

async function initProject(projectName: string, version?: string) {
  const git = simpleGit();
  const targetPath = path.join(process.cwd(), projectName);

  // 检查目录是否已存在
  if (fs.existsSync(targetPath)) {
    console.error(chalk.red(`错误: 目录 ${projectName} 已存在`));
    process.exit(1);
  }

  const spinner = ora();
  
  try {
    if (version) {
      // 检查tag是否存在
      spinner.start('检查版本是否存在...');
      const remote = await git.listRemote(['--tags', REPO_URL]);
      if (!remote.includes(version)) {
        spinner.fail();
        console.error(chalk.red(`错误: 版本 ${version} 不存在`));
        process.exit(1);
      }
      spinner.succeed('版本检查通过');
      
      // 克隆指定版本
      spinner.start(`正在克隆项目 (${version})...`);
      await git.clone(REPO_URL, targetPath);
      await git.cwd(targetPath);
      await git.checkout(version);
      spinner.succeed(`成功克隆项目 (${version})`);
    } else {
      // 克隆master分支最新版本
      spinner.start('正在克隆最新版本...');
      await git.clone(REPO_URL, targetPath);
      spinner.succeed('成功克隆最新版本');
    }

    // 更新项目文件
    spinner.start('正在更新项目配置...');
    await updateProjectFiles(targetPath, projectName);
    spinner.succeed('项目配置更新完成');
    
    // 删除 .git 目录
    const gitDir = path.join(targetPath, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }
    
    console.log(chalk.green(`\n✨ 项目 ${projectName} 初始化成功！`));
    
    // 添加后续步骤提示
    console.log(chalk.cyan('\n接下来你可以：'));
    console.log(chalk.white(`\n  cd ${projectName}`));
    console.log(chalk.white('  npm install'));
    console.log(chalk.white('  npm start'));
    
    console.log(chalk.yellow('\n提示：'));
    console.log(chalk.white('- 使用 npm start 启动开发服务器'));
    console.log(chalk.white('- 使用 npm run ios 运行 iOS 模拟器'));
    console.log(chalk.white('- 使用 npm run android 运行 Android 模拟器'));
    console.log(chalk.white('- 使用 npm run oh:dev 运行 openharmony 开发服务器'));
    
  } catch (error) {
    spinner.fail();
    console.error(chalk.red('初始化项目时发生错误:'), error);
    process.exit(1);
  }
}

async function listVersions() {
  const spinner = ora('正在获取可用版本...').start();
  const git = simpleGit();
  
  try {
    const remote = await git.listRemote(['--tags', REPO_URL]);
    spinner.succeed('获取版本成功');
    
    // 解析标签
    const tags = remote
      .split('\n')
      .filter(line => line.includes('refs/tags/'))
      .map(line => {
        const tag = line.split('refs/tags/')[1];
        return tag.replace(/\^\{\}$/, ''); // 移除 ^{} 后缀
      })
      .filter((tag, index, self) => self.indexOf(tag) === index) // 去重
      .sort((a, b) => {
        // 版本号排序
        const versionA = a.replace(/^v/, '').split('.').map(Number);
        const versionB = b.replace(/^v/, '').split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (versionA[i] !== versionB[i]) {
            return versionB[i] - versionA[i];
          }
        }
        return 0;
      });

    if (tags.length === 0) {
      console.log(chalk.yellow('\n暂无可用版本'));
      return;
    }

    console.log(chalk.cyan('\n可用版本：'));
    tags.forEach(tag => {
      console.log(chalk.white(`  ${tag}`));
    });
    
    console.log(chalk.yellow('\n使用方法：'));
    console.log(chalk.white('  rn4oh init <project-name> -v <version>'));
    console.log(chalk.white('例如：rn4oh init my-project -v 1.0.0'));
    
  } catch (error) {
    spinner.fail();
    console.error(chalk.red('获取版本列表失败:'), error);
    process.exit(1);
  }
}

program
  .name('rn4oh')
  .description('RN4OH project initialization tool')
  .version(VERSION);

program
  .command('init')
  .description('Initialize a new RN4OH project')
  .argument('<project-name>', 'Name of the project')
  .option('-v, --version <version>', 'Specific version to use')
  .action((projectName, options) => {
    initProject(projectName, options.version);
  });

// 添加新的命令
program
  .command('versions')
  .description('List all available versions')
  .action(() => {
    listVersions();
  });

program.parse(); 