/**
 * 文件夹打开工具函数
 * 从 dialog-summary.jsx 中提取的打开文件夹功能
 * 
 * 功能：
 * - 解码URI编码的文件路径
 * - 使用JSX原生Folder对象打开文件夹
 * - 处理中文路径编码问题
 * - 提供详细的错误处理和用户提示
 * 
 * @author 烟囱鸭
 * @date 2025-01-12
 * @version 1.0.0
 */

/**
 * 解码 URI 编码的字符串的函数
 * 参考7zhnegli3.jsx脚本中的编解码功能
 * @param {string} str - 需要解码的字符串
 * @returns {string} 解码后的字符串，失败时返回原字符串
 */
function decodeStr(str) {
    try {
        return decodeURIComponent(str);
    } catch(e) {
        return str;
    }
}

/**
 * 打开图层文件所在文件夹（使用JSX原生Folder对象和URI解码）
 * 参考7zhnegli3.jsx脚本的编解码和文件夹打开功能
 * @param {Object} layer - 图层对象
 */
function openLayerFolder(layer) {
    try {
        $.writeln('[INFO] [openLayerFolder] 📁 正在打开文件夹...');
        $.writeln('[DEBUG] [openLayerFolder] 处理图层: ' + (layer.name || 'Unknown'));
        
        var filePath = null;
        
        // 尝试从不同位置获取文件路径
        if (layer.tooltipInfo && layer.tooltipInfo.originalPath) {
            filePath = layer.tooltipInfo.originalPath;
        } else if (layer.sourceInfo && layer.sourceInfo.originalPath) {
            filePath = layer.sourceInfo.originalPath;
        } else if (layer.source && layer.source.file) {
            filePath = layer.source.file.fsName || layer.source.file.fullName;
        } else if (layer.originalPath) {
            filePath = layer.originalPath;
        }
        
        if (!filePath || filePath === '未知' || filePath === '获取失败') {
            $.writeln('[ERROR] [openLayerFolder] 无法获取文件路径');
            alert('❌ 无法获取文件路径\n图层: ' + (layer.name || 'Unknown') + '\n\n可能原因：\n• 图层不是素材文件\n• 素材文件路径丢失\n• 图层类型不支持');
            return;
        }
        
        $.writeln('[DEBUG] [openLayerFolder] 原始文件路径: ' + filePath);
        
        // 使用decodeStr函数进行URI解码，处理中文路径编码问题
        var decodedPath = decodeStr(filePath);
        $.writeln('[DEBUG] [openLayerFolder] URI解码后路径: ' + decodedPath);
        
        // 检查解码后的路径是否仍包含编码问题（问号字符）
        if (decodedPath.indexOf('?') !== -1) {
            $.writeln('[WARN] [openLayerFolder] 解码后仍检测到路径编码问题');
            alert('❌ 路径编码错误\n\n检测到路径包含乱码字符（?），这通常是由于：\n• 文件名包含特殊中文字符\n• 系统编码设置问题\n• 文件路径过长或格式异常\n\n建议：\n• 重命名文件，避免特殊字符\n• 检查系统区域和语言设置\n• 将文件移动到简单路径下');
            
            // 显示解码后的路径供用户参考
            alert('📁 解码后路径:\n' + decodedPath + '\n\n💡 解决方法:\n1. 重命名文件，避免特殊字符\n2. 检查系统区域和语言设置\n3. 将文件移动到简单路径下\n4. 手动复制路径到文件管理器');
            return;
        }
        
        // 获取文件夹路径（去掉文件名）
        var folderPath = decodedPath.substring(0, Math.max(decodedPath.lastIndexOf('\\'), decodedPath.lastIndexOf('/')));
        
        if (!folderPath || folderPath === decodedPath) {
            $.writeln('[ERROR] [openLayerFolder] 无法解析文件夹路径');
            alert('❌ 无法解析文件夹路径\n原始路径: ' + decodedPath + '\n\n请检查文件路径格式是否正确');
            return;
        }
        
        $.writeln('[INFO] [openLayerFolder] 文件夹路径: ' + folderPath);
        
        // 使用JSX原生Folder对象打开文件夹（参考7zhnegli3.jsx的outputFolder.execute()方法）
        var success = openFolderWithJSX(folderPath);
        
        if (!success) {
            $.writeln('[WARN] [openLayerFolder] 打开文件夹失败，显示路径供手动操作');
            
            // 打开失败时，显示路径供用户手动操作
            alert('📁 文件夹路径:\n' + folderPath + '\n\n❌ 无法自动打开文件夹\n\n💡 解决方法:\n1. 手动复制路径到文件管理器地址栏\n2. 检查文件夹是否存在\n3. 确认文件夹访问权限\n4. 尝试使用Windows资源管理器直接导航');
        } else {
            $.writeln('[SUCCESS] [openLayerFolder] ✅ 文件夹已成功打开');
        }
        
    } catch (error) {
        $.writeln('[ERROR] [openLayerFolder] 处理出错: ' + (error.message || error));
        alert('❌ 处理文件夹路径时发生错误\n错误信息: ' + (error.message || error));
    }
}

/**
 * 使用JSX原生Folder对象打开文件夹
 * 参考7zhnegli3.jsx脚本中的outputFolder.execute()方法
 * 专门处理中文编码问题，使用JSX原生API确保编码正确
 * @param {string} folderPath - 文件夹路径
 * @returns {boolean} 是否成功打开
 */
function openFolderWithJSX(folderPath) {
    try {
        $.writeln('[INFO] [openFolderWithJSX] 尝试使用JSX原生Folder对象打开文件夹: ' + folderPath);
        
        // 创建JSX原生Folder对象
        var targetFolder = new Folder(folderPath);
        
        // 检查文件夹是否存在
        if (!targetFolder.exists) {
            $.writeln('[ERROR] [openFolderWithJSX] 文件夹不存在: ' + folderPath);
            return false;
        }
        
        $.writeln('[DEBUG] [openFolderWithJSX] 文件夹存在，正在执行打开操作...');
        
        // 使用JSX原生的execute()方法打开文件夹（参考7zhnegli3.jsx的实现）
        var result = targetFolder.execute();
        
        if (result) {
            $.writeln('[SUCCESS] [openFolderWithJSX] ✅ 文件夹打开成功');
            return true;
        } else {
            $.writeln('[ERROR] [openFolderWithJSX] ❌ 文件夹打开失败');
            return false;
        }
        
    } catch (error) {
        $.writeln('[ERROR] [openFolderWithJSX] 执行失败: ' + (error.message || error));
        return false;
    }
}

/**
 * 通过文件路径直接打开文件夹
 * 适用于已知文件路径的情况
 * @param {string} filePath - 文件路径
 */
function openFolderByFilePath(filePath) {
    if (!filePath) {
        alert('❌ 文件路径为空');
        return;
    }
    
    // 创建一个模拟的图层对象
    var mockLayer = {
        name: '指定路径',
        originalPath: filePath
    };
    
    // 调用主要的打开文件夹功能
    openLayerFolder(mockLayer);
}

// 导出函数供外部调用
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 环境
    module.exports = {
        openLayerFolder: openLayerFolder,
        openFolderByFilePath: openFolderByFilePath,
        decodeStr: decodeStr,
        openFolderWithJSX: openFolderWithJSX
    };
} else {
    // ExtendScript 环境 - 函数已经定义在全局作用域
    $.writeln('[INFO] 文件夹打开工具函数已加载到全局作用域');
}