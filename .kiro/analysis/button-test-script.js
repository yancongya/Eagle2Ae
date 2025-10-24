// 在浏览器控制台运行此脚本来测试按钮

console.log('=== 按钮测试脚本 ===');

// 1. 检查按钮是否存在
const downloadBtn = document.getElementById('download-preset-btn');
const openBtn = document.getElementById('open-preset-btn');

console.log('下载按钮:', downloadBtn);
console.log('打开按钮:', openBtn);

// 2. 检查按钮是否可见
if (downloadBtn) {
    const style = window.getComputedStyle(downloadBtn);
    console.log('下载按钮样式:');
    console.log('  display:', style.display);
    console.log('  visibility:', style.visibility);
    console.log('  opacity:', style.opacity);
    console.log('  pointer-events:', style.pointerEvents);
    console.log('  z-index:', style.zIndex);
}

if (openBtn) {
    const style = window.getComputedStyle(openBtn);
    console.log('打开按钮样式:');
    console.log('  display:', style.display);
    console.log('  visibility:', style.visibility);
    console.log('  opacity:', style.opacity);
    console.log('  pointer-events:', style.pointerEvents);
    console.log('  z-index:', style.zIndex);
}

// 3. 手动绑定测试事件
if (downloadBtn) {
    downloadBtn.addEventListener('click', function testClick(e) {
        console.log('!!! 测试：下载按钮被点击 !!!', e);
        alert('下载按钮点击测试成功！');
    });
    console.log('✓ 已为下载按钮添加测试事件');
}

if (openBtn) {
    openBtn.addEventListener('click', function testClick(e) {
        console.log('!!! 测试：打开按钮被点击 !!!', e);
        alert('打开按钮点击测试成功！');
    });
    console.log('✓ 已为打开按钮添加测试事件');
}

console.log('=== 测试脚本执行完成，请点击按钮 ===');
