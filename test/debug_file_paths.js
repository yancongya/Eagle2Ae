// 调试文件路径处理的脚本
// 在Node.js环境中运行: node test/debug_file_paths.js

const fs = require('fs');
const path = require('path');

// 测试数据 - 模拟从AE扩展收到的数据
const testData = {
    exportPath: 'E:/工作/202508/20250819 33440钻- 雾拢百妖/33440钻- 雾拢百妖_Export_20250819_124048',
    exportedLayers: [
        {
            fileName: '%E8%80%B3%E6%9C%B51.png',
            layerName: '耳朵1'
        },
        {
            fileName: '%E8%80%B3%E6%9C%B52.png', 
            layerName: '耳朵2'
        }
    ]
};

console.log('=== 文件路径调试测试 ===\n');

console.log('1. 原始数据:');
console.log(JSON.stringify(testData, null, 2));
console.log();

console.log('2. 文件名解码测试:');
testData.exportedLayers.forEach((layer, index) => {
    console.log(`图层 ${index + 1}:`);
    console.log(`  原始文件名: ${layer.fileName}`);
    
    let decodedFileName = layer.fileName;
    if (layer.fileName.includes('%')) {
        try {
            decodedFileName = decodeURIComponent(layer.fileName);
            console.log(`  解码后文件名: ${decodedFileName}`);
        } catch (error) {
            console.log(`  解码失败: ${error.message}`);
        }
    }
    
    const fullPath = `${testData.exportPath}/${decodedFileName}`.replace(/\\/g, '/');
    console.log(`  完整路径: ${fullPath}`);
    console.log(`  路径长度: ${fullPath.length} 字符`);
    console.log();
});

console.log('3. 路径规范化测试:');
const testPaths = [
    'E:/工作/202508/test/耳朵1.png',
    'E:\\工作\\202508\\test\\耳朵2.png',
    'E:/工作/202508/test/%E8%80%B3%E6%9C%B51.png'
];

testPaths.forEach(testPath => {
    console.log(`原始路径: ${testPath}`);
    
    let processedPath = testPath;
    
    // URL解码
    if (processedPath.includes('%')) {
        try {
            processedPath = decodeURIComponent(processedPath);
            console.log(`解码后: ${processedPath}`);
        } catch (error) {
            console.log(`解码失败: ${error.message}`);
        }
    }
    
    // 路径规范化
    processedPath = path.normalize(processedPath);
    console.log(`规范化后: ${processedPath}`);
    
    // 检查文件是否存在（如果路径有效）
    try {
        const exists = fs.existsSync(processedPath);
        console.log(`文件存在: ${exists}`);
        
        if (!exists) {
            // 检查目录是否存在
            const dir = path.dirname(processedPath);
            const dirExists = fs.existsSync(dir);
            console.log(`目录存在: ${dirExists}`);
            
            if (dirExists) {
                try {
                    const files = fs.readdirSync(dir);
                    console.log(`目录中的文件: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
                } catch (readError) {
                    console.log(`读取目录失败: ${readError.message}`);
                }
            }
        }
    } catch (error) {
        console.log(`检查文件失败: ${error.message}`);
    }
    
    console.log('---');
});

console.log('4. JSON序列化测试:');
const requestData = {
    type: 'copy_files',
    filePaths: testData.exportedLayers.map(layer => {
        let fileName = layer.fileName;
        if (fileName.includes('%')) {
            try {
                fileName = decodeURIComponent(fileName);
            } catch (error) {
                console.log(`解码失败: ${error.message}`);
            }
        }
        return `${testData.exportPath}/${fileName}`.replace(/\\/g, '/');
    }),
    timestamp: Date.now()
};

console.log('请求数据:');
console.log(JSON.stringify(requestData, null, 2));

console.log('\n5. 字符编码测试:');
const testString = '耳朵1';
console.log(`原始字符串: ${testString}`);
console.log(`URL编码: ${encodeURIComponent(testString)}`);
console.log(`URL解码: ${decodeURIComponent(encodeURIComponent(testString))}`);

// 测试不同的编码方式
const buffer = Buffer.from(testString, 'utf8');
console.log(`UTF-8字节: ${Array.from(buffer).map(b => b.toString(16)).join(' ')}`);

console.log('\n=== 调试测试完成 ===');
