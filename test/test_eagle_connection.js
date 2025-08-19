// 测试Eagle插件连接的脚本
// 在Node.js环境中运行: node test/test_eagle_connection.js

const http = require('http');

async function testConnection() {
    console.log('=== Eagle插件连接测试 ===\n');
    
    // 测试1: Ping测试
    console.log('1. 测试Ping端点...');
    try {
        const pingResponse = await makeRequest('GET', '/ping');
        console.log('✅ Ping成功:', JSON.stringify(pingResponse, null, 2));
    } catch (error) {
        console.log('❌ Ping失败:', error.message);
        return;
    }
    
    // 测试2: 简单的复制请求测试（使用存在的文件）
    console.log('\n2. 测试复制API端点...');
    const testData = {
        type: 'copy_files',
        filePaths: [
            'F:/插件脚本开发/eagle-extention/exprot to ae/test_files/test1.png',
            'F:/插件脚本开发/eagle-extention/exprot to ae/test_files/test2.png'
        ],
        timestamp: Date.now()
    };

    try {
        const copyResponse = await makeRequest('POST', '/copy-to-clipboard', testData);
        console.log('✅ 复制API响应:', JSON.stringify(copyResponse, null, 2));
    } catch (error) {
        console.log('❌ 复制API失败:', error.message);
    }
    
    // 测试3: 带中文路径的复制请求
    console.log('\n3. 测试中文路径复制...');
    const chineseTestData = {
        type: 'copy_files',
        filePaths: [
            'E:/工作/202508/test/耳朵1.png',
            'E:/工作/202508/test/耳朵2.png'
        ],
        timestamp: Date.now()
    };
    
    try {
        const chineseResponse = await makeRequest('POST', '/copy-to-clipboard', chineseTestData);
        console.log('✅ 中文路径API响应:', JSON.stringify(chineseResponse, null, 2));
    } catch (error) {
        console.log('❌ 中文路径API失败:', error.message);
    }
    
    console.log('\n=== 测试完成 ===');
}

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',  // 使用IPv4地址而不是localhost
            port: 8080,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const result = JSON.parse(body);
                        resolve(result);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                } catch (parseError) {
                    reject(new Error(`解析响应失败: ${parseError.message}, 响应: ${body}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error(`请求失败: ${error.message}`));
        });
        
        if (data && method !== 'GET') {
            const jsonData = JSON.stringify(data);
            console.log(`发送数据: ${jsonData}`);
            req.write(jsonData);
        }
        
        req.end();
    });
}

// 运行测试
testConnection().catch(console.error);
