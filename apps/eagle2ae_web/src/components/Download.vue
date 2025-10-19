<template>
  <div class="download-page">
    <div class="content">
      <div class="logo-wrapper">
        <img class="logo" src="https://via.placeholder.com/100x100?text=" alt="Eagle Logo" />
        <div class="download-icon">↓</div>
      </div>
      <h1 class="title">客户端下载</h1>
      <p class="description">立即下载 Eagle 客户端，开箱即用 30 天免费试用，体验高效设计素材管理、分类、搜索与视觉安全全方位功能。</p>
      <div class="download-box">
        <div class="platforms">
          <button class="platform active">
            <span class="icon windows">□</span> Windows
          </button>
          <button class="platform">
            <span class="icon mac"></span> macOS (Apple 处理器)
          </button>
          <button class="platform">
            <span class="icon mac"></span> macOS (Intel 处理器)
          </button>
        </div>
        <div class="info">
          <div class="info-item">
            <span class="label">版本</span>
            <span class="value">111111.0.0 Build16</span>
          </div>
          <div class="info-item">
            <span class="label">系统要求</span>
            <span class="value">Windows 10+</span>
          </div>
          <div class="info-item">
            <span class="label">文件大小</span>
            <span class="value">124.75 MB</span>
          </div>
        </div>
        <button class="download-button" @click="download">
          ↓ 下载
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const download = () => {
  // Handle download logic, e.g., window.location.href = 'https://cn.eagle.cool/download/windows';
  alert('Downloading...');
}
</script>

<style scoped>
.download-page {
  background-color: #000015;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.content {
  text-align: center;
  max-width: 800px;
  padding: 0 20px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1e90ff, #00bfff);
}

.download-icon {
  position: absolute;
  bottom: -10px;
  right: -10px;
  background-color: #1e90ff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.title {
  font-size: 48px;
  font-weight: 300;
  margin: 0 0 10px;
}

.description {
  font-size: 16px;
  color: #a0a0a0;
  margin: 0 0 40px;
  line-height: 1.5;
}

.download-box {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.platforms {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.platform {
  background: transparent;
  border: none;
  color: #a0a0a0;
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.platform.active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.icon {
  margin-right: 8px;
  font-size: 16px;
}

.windows {
  font-size: 12px; /* Adjust for square icon */
}

.mac {
  font-size: 18px;
}

.info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.info-item {
  flex: 1;
  text-align: center;
}

.label {
  display: block;
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 4px;
}

.value {
  font-size: 16px;
  font-weight: 500;
}

.download-button {
  width: 100%;
  background: linear-gradient(135deg, #1e90ff, #00bfff);
  color: white;
  border: none;
  padding: 15px;
  font-size: 18px;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.download-button:hover {
  opacity: 0.9;
}
</style>