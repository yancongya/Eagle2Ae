// 测试 @crosscopy/clipboard 库的功能
let clipboard;

try {
    // 尝试不同的导入方式
    clipboard = require('@crosscopy/clipboard');
    console.log('导入方式1成功:', typeof clipboard);
    
    if (!clipboard || typeof clipboard.read !== 'function') {
        // 尝试解构导入
        const clipboardModule = require('@crosscopy/clipboard');
        clipboard = clipboardModule.clipboard || clipboardModule.default || clipboardModule;
        console.log('导入方式2:', typeof clipboard);
    }
    
    if (!clipboard || typeof clipboard.read !== 'function') {
        // 尝试直接使用模块
        clipboard = require('@crosscopy/clipboard').default;
        console.log('导入方式3:', typeof clipboard);
    }
    
} catch (error) {
    console.error('导入@crosscopy/clipboard失败:', error.message);
    process.exit(1);
}

async function testClipboard() {
    console.log('开始测试 @crosscopy/clipboard 库...');
    console.log('clipboard对象:', clipboard);
    console.log('clipboard可用方法:', Object.getOwnPropertyNames(clipboard));
    console.log('clipboard原型方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(clipboard)));
    
    try {
        // 检查可用的方法
        const methods = ['read', 'readText', 'readImage', 'readFiles', 'getText', 'getImage', 'getFiles'];
        for (const method of methods) {
            if (typeof clipboard[method] === 'function') {
                console.log(`✅ 找到方法: ${method}`);
            }
        }
        
        // 尝试不同的读取方法
        console.log('正在尝试读取剪贴板内容...');
        
        let content = null;
        
        // 尝试readText方法
        if (typeof clipboard.readText === 'function') {
            try {
                const text = await clipboard.readText();
                console.log('readText结果:', text);
                content = { text };
            } catch (e) {
                console.log('readText失败:', e.message);
            }
        }
        
        // 尝试readFiles方法
        if (typeof clipboard.readFiles === 'function') {
            try {
                const files = await clipboard.readFiles();
                console.log('readFiles结果:', files);
                if (content) {
                    content.files = files;
                } else {
                    content = { files };
                }
            } catch (e) {
                console.log('readFiles失败:', e.message);
            }
        }
        
        // 如果没有找到合适的方法，尝试直接调用
        if (!content) {
            console.log('尝试直接调用clipboard()...');
            if (typeof clipboard === 'function') {
                content = await clipboard();
            }
        }
        
        if (content) {
            console.log('剪贴板内容:', {
                text: content.text || '无文本内容',
                files: content.files ? `${content.files.length} 个文件` : '无文件',
                hasText: !!content.text,
                hasFiles: !!(content.files && content.files.length > 0),
                hasImages: content.hasImages || false,
                hasFilePaths: content.hasFilePaths || false
            });
            
            if (content.files && content.files.length > 0) {
                console.log('文件详情:');
                content.files.forEach((file, index) => {
                    console.log(`  文件 ${index + 1}:`, {
                        name: file.name,
                        displayName: file.displayName,
                        type: file.type,
                        size: file.size,
                        isTemporary: file.isTemporary,
                        wasRenamed: file.wasRenamed
                    });
                });
            }
            
            console.log('✅ @crosscopy/clipboard 库测试成功!');
        } else {
            console.log('⚠️ 剪贴板内容为空或读取失败');
        }
        
    } catch (error) {
        console.error('❌ @crosscopy/clipboard 库测试失败:', error.message);
        console.error('错误详情:', error);
    }
}

// 运行测试
testClipboard();