// 检查 AE Preview 页面的控制台日志
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // 收集控制台日志
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });
    console.log(`[${msg.type()}] ${text}`);
  });
  
  // 访问页面
  await page.goto('http://localhost:5174/ae-preview', { waitUntil: 'networkidle2' });
  
  // 等待几秒钟收集日志
  await page.waitForTimeout(5000);
  
  // 分析重复日志
  const logCounts = {};
  logs.forEach(log => {
    const key = log.text;
    logCounts[key] = (logCounts[key] || 0) + 1;
  });
  
  console.log('\n=== 重复日志统计 ===');
  Object.entries(logCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .forEach(([text, count]) => {
      console.log(`${count}次: ${text.substring(0, 100)}`);
    });
  
  await browser.close();
})();
