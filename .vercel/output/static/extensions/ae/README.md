# Eagle2AE AE 扩展安装指南

本扩展提供两种安装方式：自动安装和手动安装（推荐）。下面的说明同时包含了额外的系统/权限步骤（如注册表、管理员安装、AE 首选项），以减少常见安装失败的问题。

## 方法一：自动安装（安装到当前用户）

1. 在安装包中找到 ZXPInstaller（本包内包含 `ZXPInstaller-1.8.2.dmg`，Windows 版`ZXPInstaller-Setup-1.8.2 exe`）。
2. 运行并安装 ZXPInstaller（如果提示权限，请以管理员身份运行）。
3. 打开 ZXPInstaller，将扩展包（例如 `eagle2ae_ae_vX.X.X.zxp`）拖放到 ZXPInstaller 窗口中进行安装。
4. 安装完成后，重启 After Effects（确保 AE 在安装时已关闭）。

## 方法二：手动安装（⭐推荐全局安装安装到当前管理员）

按以下步骤手动安装扩展：

1. 将扩展文件夹（例如 `Eagle2Ae-Ae_vX.X.X`）复制到 Adobe CEP 扩展目录：
2. - Windows: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
   - macOS: `/Library/Application Support/Adobe/CEP/extensions/`
3. 在 Windows 上： 请以管理员身份运行该注册表文件`Add Keys.reg`，（双击或右键 -> 以管理员身份运行），以添加必要的注册表键，确保扩展能被 AE 识别。
   在 macOS 上： `install-as-admin` 安装脚本`install-as-admin`，请使用管理员权限执行该脚本。
4. 完成后，确保完全退出 After Effects，然后重新启动。

## After Effects 中可能需要的首选项设置

安装并重启 AE 后，如果扩展无法在菜单中看到，请检查并按需调整以下设置：

- 打开首选项：
  - Windows: `Edit` -> `Preferences` -> `Scripting & Expressions`
  - macOS: `After Effects` -> `Preferences` -> `Scripting & Expressions`
- 勾选 "Allow Scripts to Write Files and Access Network"（允许脚本写入文件并访问网络）。这是很多扩展正常工作的必要权限。

注意：如果扩展仍然不可见，请确认已经：

- 使用管理员权限安装（Windows 上右键以管理员身份运行安装程序或运行 `Add Keys.reg`）。
- 扩展文件夹已复制到正确的 CEP 目录。
- 已彻底重启 After Effects（有时需要重启系统以使注册表或权限生效）。

## 打开扩展

在 After Effects 中，通常通过菜单打开已安装的扩展：

`Window` -> `Extensions` -> 选择 `Eagle2AE1 @烟囱鸭`、`Eagle2AE2 @烟囱鸭`或`Eagle2AE3 @烟囱鸭`

## 常见问题与排查

- 扩展不显示：确认扩展目录路径正确、已运行注册表脚本（Windows）、AE 已重启并已启用脚本权限。
- 权限错误或无法复制文件：以管理员身份运行文件管理器或安装程序，或调整目标文件夹权限。
- 安装失败：尝试使用 ZXPInstaller（自动安装）或手动重新复制并重启 AE。

## 卸载旧版本

在安装新版本前，建议先删除旧版本的扩展文件夹（同上 CEP 目录）。删除后重启 After Effects 再安装新版本。

## 其他说明

- 包内工具与文件：本安装包包含 `ZXPInstaller-1.8.2.dmg`、`Add Keys.reg`（Windows）、以及用于 macOS 的 `install-as-admin` 等。请根据平台使用对应文件。
- 如果仍有问题，请访问插件作者网站或查看随包提供的其它文档获取支持。

---

最后简短回顾：自动安装优先（ZXPInstaller），手动安装时复制到 CEP 目录并运行随包提供的注册表/管理员脚本，确保 AE 首选项中允许脚本写入与网络访问，然后重启 AE。祝使用顺利！
