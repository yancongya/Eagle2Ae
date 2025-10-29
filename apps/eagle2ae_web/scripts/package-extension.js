import { execSync } from 'child_process';
import fs from 'fs';
import fsExtra from 'fs-extra'; // 重新导入 fs-extra
import path from 'path';
import archiver from 'archiver';

// 定义路径
const extensionSourcePath = path.resolve('./public/extensions/ae');
const versionFilePath = path.join(extensionSourcePath, 'version.json');
const tempBuildPath = path.resolve('./temp_build');
const distPath = path.resolve('./dist');

// 要排除的文件和文件夹 (从 extensionSourcePath 复制到 tempBuildPath 时排除)
const excludeList = ['.kiro', '.vercel', '.debug', 'version.json', 'README.md', 'README_en.md', 'ZXPInstaller-1.8.2.dmg', 'ZXPInstaller-Setup-1.8.2.exe'];

async function recursiveCopyAndProcess(source, destination) {
  const stats = fs.statSync(source);
  const relativePath = path.relative(extensionSourcePath, source);

  if (excludeList.some(ex => relativePath.startsWith(ex))) {
    return;
  }

  if (stats.isDirectory()) {
    fsExtra.mkdirSync(destination, { recursive: true }); // 使用 fsExtra.mkdirSync
    for (const item of fs.readdirSync(source)) {
      await recursiveCopyAndProcess(path.join(source, item), path.join(destination, item));
    }
  } else {
    if (path.extname(source) === '.jsx') {
      const destPathBin = destination.replace(/\.jsx$/, '.jsxbin');
      console.log(`  正在转换: ${relativePath}`);
      execSync(`npx jsxbin -i "${source}" -o "${destPathBin}"`);
    } else {
      fsExtra.copyFileSync(source, destination); // 使用 fsExtra.copyFileSync
    }
  }
}

async function createZip(sourceDir, outputPath, archiveName) {
  console.log(`正在创建 ${archiveName}...`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const closePromise = new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`${archiveName} 创建完成: ${outputPath}`);
      resolve();
    });
    archive.on('error', reject);
  });

  archive.pipe(output);
  archive.directory(sourceDir, false); // false 表示不包含源目录本身，只包含其内容
  await archive.finalize();
  return closePromise; // 返回 Promise 以便 await
}

async function packageExtension() {
  console.log('开始打包AE扩展...');

  // 定义在整个函数作用域内可见的变量
  let manualInstallFolderPath;
  let finalContentsTempPath;
  let zxpPath;
  let version = '1.0.0'; // 将 version 声明移到顶部

  try {
    // 1. 清理并创建临时目录和输出目录
    if (fs.existsSync(tempBuildPath)) fsExtra.removeSync(tempBuildPath); // 使用 fsExtra.removeSync
    fsExtra.mkdirSync(tempBuildPath, { recursive: true });
    if (!fs.existsSync(distPath)) fsExtra.mkdirSync(distPath, { recursive: true });

    // 2. 读取版本号
    let version = '1.0.0';
    if (fs.existsSync(versionFilePath)) {
      const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      version = versionData.version || version;
    }
    console.log(`扩展版本: ${version}`);

    // 3. 处理文件并转换 .jsx 到 tempBuildPath
    console.log('处理文件并转换 .jsx...');
    await recursiveCopyAndProcess(extensionSourcePath, tempBuildPath);

    // 4. 动态修改 manifest.xml
    console.log('动态修改 manifest.xml...');
    const manifestPath = path.join(tempBuildPath, 'CSXS', 'manifest.xml');
    if (!fs.existsSync(manifestPath)) throw new Error('错误: 在临时目录中找不到 manifest.xml。');
    let manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifestContent = manifestContent.replace(/<ScriptPath>(.*)\.jsx<\/ScriptPath>/g, '<ScriptPath>$1.jsxbin</ScriptPath>');
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');

    // --- 5. 创建各种打包文件 --- 
    const zxpName = `Eagle2Ae-Ae__v${version}.zxp`; // 新的 ZXP 文件名
    const manualInstallFolderName = `Eagle2Ae-Ae_v${version}`; // 新的手动安装文件夹名
    const finalZipName = `Eagle2AE_Installer_v${version}.zip`;

    const zxpPath = path.join(distPath, zxpName);
    const manualInstallFolderPath = path.join(distPath, manualInstallFolderName); // 手动安装文件夹的完整路径
    const finalZipPath = path.join(distPath, finalZipName);

    // 5.1. 创建 ZXP 文件
    await createZip(tempBuildPath, zxpPath, 'ZXP 包');

    // 5.2. 创建手动安装文件夹 (直接复制 tempBuildPath 的内容)
    console.log(`正在创建手动安装文件夹: ${manualInstallFolderName}...`);
    fsExtra.copySync(tempBuildPath, manualInstallFolderPath, { recursive: true }); // 递归复制
    console.log(`手动安装文件夹 ${manualInstallFolderName} 创建完成: ${manualInstallFolderPath}`);

    // --- 6. 创建最终的发布压缩包 --- 
    const finalContentsFolderName = manualInstallFolderName; // 最终总包内的文件夹名应与手动安装文件夹名一致
    const finalContentsTempPath = path.join(distPath, 'final_staging_temp'); // 独立的临时目录，用于暂存最终包内容

    // 确保 finalContentsTempPath 存在，并将所有最终内容复制到其中
    if (fs.existsSync(finalContentsTempPath)) fsExtra.removeSync(finalContentsTempPath); // 清理旧的
    fsExtra.mkdirSync(finalContentsTempPath, { recursive: true });

    // 将所有文件复制到 finalContentsTempPath
    fsExtra.copySync(zxpPath, path.join(finalContentsTempPath, zxpName));
    fsExtra.copySync(manualInstallFolderPath, path.join(finalContentsTempPath, manualInstallFolderName));
    fsExtra.copySync(path.resolve('./public/extensions/ae/README.md'), path.join(finalContentsTempPath, 'README.md'));
    fsExtra.copySync(path.resolve('./public/extensions/ae/README_en.md'), path.join(finalContentsTempPath, 'README_en.md'));
    fsExtra.copySync(path.resolve('./public/extensions/ae/ZXPInstaller-1.8.2.dmg'), path.join(finalContentsTempPath, 'ZXPInstaller-1.8.2.dmg'));
    fsExtra.copySync(path.resolve('./public/extensions/ae/ZXPInstaller-Setup-1.8.2.exe'), path.join(finalContentsTempPath, 'ZXPInstaller-Setup-1.8.2.exe'));

    console.log('创建最终的发布压缩包...');
    const finalOutput = fs.createWriteStream(finalZipPath);
    const finalArchive = archiver('zip', { zlib: { level: 9 } });

    const finalClosePromise = new Promise((resolve, reject) => {
      finalOutput.on('close', () => {
        console.log(`最终打包完成: ${finalZipPath}`);
        resolve();
      });
      finalArchive.on('error', reject);
    });

    finalArchive.pipe(finalOutput);
    finalArchive.glob('**/*', { cwd: finalContentsTempPath, prefix: finalContentsFolderName }); // 将整个文件夹的内容添加到压缩包中，并设置前缀
    await finalArchive.finalize();
    await finalClosePromise;

  } catch (error) {
    console.error('打包过程中出现错误:', error);
    process.exit(1);
  } finally {
    // 7. 清理所有临时文件和文件夹
    // 确保这些路径在 finally 块中是可访问的
    const currentZxpPath = path.join(distPath, `Eagle2Ae-Ae__v${version}.zxp`);
    const currentManualInstallFolderPath = path.join(distPath, `Eagle2Ae-Ae_v${version}`);
    const currentFinalContentsTempPath = path.join(distPath, 'final_staging_temp');
    const currentTempBuildPath = tempBuildPath; // tempBuildPath 已经在顶部定义

    if (fs.existsSync(currentTempBuildPath)) fsExtra.removeSync(currentTempBuildPath); // 清理 tempBuildPath
    if (fs.existsSync(currentManualInstallFolderPath)) fsExtra.removeSync(currentManualInstallFolderPath); // 清理手动安装文件夹
    if (fs.existsSync(currentZxpPath)) fsExtra.removeSync(currentZxpPath); // 清理 ZXP 文件
    if (fs.existsSync(currentFinalContentsTempPath)) fsExtra.removeSync(currentFinalContentsTempPath); // 清理最终内容临时文件夹

    console.log('所有临时文件和文件夹清理完成!');
  }
}

packageExtension().catch(console.error);