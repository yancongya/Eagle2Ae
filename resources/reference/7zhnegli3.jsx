// 解码 URI 编码的字符串的函数
function decodeStr(str) {
    try {
        return decodeURIComponent(str);
    } catch(e) {
        return str;
    }
}

// 字符串命令转换函数
function str2cmd(str, list) {
    var cmd = str;
    for (var i = 0, ii = list.length; i < ii; i++) {
        var tmp = '"' + list[i] + '"';
        cmd = cmd.toString().replace("${" + (i + 1) + "}", tmp);
    }
    return cmd;
}

// 获取脚本所在目录
var jsxPath = File($.fileName).parent.fsName;

// 创建 UI 窗口
var win = new Window("dialog", "输出文件整理");
win.orientation = "column";
win.alignChildren = "left";

// 获取当前项目文件路径
var projectPath = app.project.file;
var defaultPrefix = "";

if (projectPath) {
    // 获取项目文件名（不含后缀）作为默认前缀
    defaultPrefix = decodeStr(projectPath.name.replace(/\.[^\.]+$/, ''));
} else {
    alert("请先保存项目文件");
    // 直接结束脚本，不使用 return
}

// 项目名称输入框
win.add("statictext", undefined, "请输入前缀名称:");
var prefixInput = win.add("edittext", undefined, defaultPrefix); // 默认值为项目名称
prefixInput.characters = 20; // 设置输入框宽度

// 日志文本框
win.add("statictext", undefined, "运行日志:");
var logText = win.add("edittext", undefined, "", {multiline: true, scrolling: true});
logText.preferredSize = [400, 200]; // 设置文本框大小

// 确认和取消按钮
var buttonGroup = win.add("group");
var confirmButton = buttonGroup.add("button", undefined, "确认");
var cancelButton = buttonGroup.add("button", undefined, "取消");

// 处理按钮点击事件
confirmButton.onClick = function() {
    var output_name = prefixInput.text.trim(); // 获取用户输入的前缀名称

    if (projectPath) {
        // 获取项目所在文件夹路径
        var projectFolder = projectPath.parent;
        // 构建输出文件夹路径
        var outputFolder = new Folder(projectFolder.fullName + "/输出");

        // 检查输出文件夹是否存在
        if (outputFolder.exists) {
            // 获取文件夹中的所有文件
            var files = outputFolder.getFiles();
            var pagFiles = [];

            logText.text += "\n========== 开始处理文件 ==========\n";

            // 首先进行文件重命名
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileName = decodeStr(file.name);
                var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

                // 处理需要重命名的文件
                if (fileName === "animated_bmp.pag") {
                    var newFile = new File(file.parent.fsName + "/animated.pag");
                    if (file.rename(newFile)) {
                        logText.text += "重命名成功: animated_bmp.pag -> animated.pag\n";
                        pagFiles.push(newFile);
                    } else {
                        logText.text += "重命名失败: animated_bmp.pag\n";
                        pagFiles.push(file);
                    }
                } else if (fileExt === "pag") {
                    pagFiles.push(file);
                    logText.text += "找到PAG文件: " + fileName + "\n";
                } else if (fileExt === "png") {
                    var newFileName = output_name + "高光图.png";
                    if (file.rename(newFileName)) {
                        logText.text += "重命名成功: " + fileName + " -> " + newFileName + "\n";
                    }
                } else if (fileExt === "svga") {
                    var newFileName = output_name + ".svga";
                    if (file.rename(newFileName)) {
                        logText.text += "重命名成功: " + fileName + " -> " + newFileName + "\n";
                    }
                }
            }

            if (pagFiles.length > 0) {
                // 创建批处理文件
                var batContent = '@echo off\r\n';
                batContent += 'chcp 65001\r\n';
                // 切换到批处理文件所在目录
                batContent += 'cd /d "%~dp0"\r\n';
                // 压缩文件
                batContent += 'powershell -NoProfile -Command "& {';
                batContent += 'Compress-Archive -Path \'animated.pag\',\'banner.pag\' ';
                batContent += '-DestinationPath \'' + output_name + 'PAG.zip\' -Force}"\r\n';
                // 删除PAG文件
                batContent += 'del "animated.pag" "banner.pag"\r\n';
                // 等待1秒确保zip文件创建完成
                batContent += 'timeout /t 1 /nobreak >nul\r\n';
                // 复制所有需要的文件到剪贴板
                batContent += 'powershell -Command "Get-Item \'' + output_name + '.svga\',\'' + output_name + 'PAG.zip\',\'' + output_name + '高光图.png\' | Set-Clipboard"\r\n';
                batContent += 'echo 文件已复制到剪贴板\r\n';
                // 自删除批处理文件
                batContent += '(goto) 2>nul & del "%~f0"\r\n';

                var batFile = new File(outputFolder.fsName + "/compress.bat");
                batFile.encoding = "UTF8";
                if (batFile.open("w")) {
                    batFile.write(batContent);
                    batFile.close();

                    if (batFile.exists) {
                        logText.text += "批处理文件创建成功: " + batFile.fsName + "\n";
                        logText.text += "请手动运行批处理文件来压缩文件并删除源文件。\n";
                        
                        // 打开输出文件夹
                        outputFolder.execute();
                        
                        // 等待3秒后启动企业微信
                        batContent = '@echo off\r\n';
                        batContent += 'timeout /t 6 /nobreak >nul\r\n';
                        batContent += 'start "" "C:\\Program Files (x86)\\WXWork\\WXWork.exe"\r\n';
                        batContent += '(goto) 2>nul & del "%~f0"\r\n';

                        var wxBatFile = new File(outputFolder.fsName + "/start_wxwork.bat");
                        wxBatFile.encoding = "UTF8";
                        if (wxBatFile.open("w")) {
                            wxBatFile.write(batContent);
                            wxBatFile.close();
                            
                            if (wxBatFile.exists) {
                                // 执行启动企业微信的批处理文件
                                wxBatFile.execute();
                            }
                        }
                    } else {
                        logText.text += "批处理文件创建失败\n";
                    }
                }
            }

        } else {
            logText.text += "错误：未找到'输出'文件夹\n";
        }
    }
};

cancelButton.onClick = function() {
    win.close(0); // 关闭窗口并返回 0
    exit(); // 退出脚本
};

// 显示窗口
win.show();

