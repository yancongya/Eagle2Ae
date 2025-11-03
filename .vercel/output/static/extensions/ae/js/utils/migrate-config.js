/**
 * Eagle2Ae 配置迁移工具
 * 在浏览器控制台中运行此脚本来迁移配置
 * 
 * 使用方法:
 * 1. 在浏览器中打开扩展
 * 2. 打开开发者工具控制台
 * 3. 运行: migrateConfig()
 */

(function() {
    'use strict';

    // 确保 ConfigGenerator 已加载
    if (typeof ConfigGenerator === 'undefined') {
        console.error('❌ ConfigGenerator 未加载，请先加载 ConfigGenerator.js');
        return;
    }

    /**
     * 迁移配置文件
     */
    window.migrateConfig = async function() {
        console.log('🔄 开始迁移配置...');

        try {
            const generator = new ConfigGenerator();

            // 尝试加载现有配置
            let oldConfig = null;
            try {
                const response = await fetch('resources/reference/Eagle2Ae-Presets.json');
                if (response.ok) {
                    oldConfig = await response.json();
                    console.log('📋 已加载现有配置文件');
                }
            } catch (error) {
                console.log('⚠️ 无法加载现有配置，将生成新配置');
            }

            // 生成新配置
            let newConfig;
            if (oldConfig) {
                console.log('🔄 迁移现有配置...');
                newConfig = generator.migrateFromOldConfig(oldConfig);
            } else {
                console.log('✨ 生成默认配置...');
                newConfig = generator.generateDefaultConfig();
            }

            // 验证配置
            console.log('✅ 验证配置...');
            const validation = generator.validateConfig(newConfig);
            
            if (!validation.valid) {
                console.error('❌ 配置验证失败:');
                validation.errors.forEach(error => console.error('  -', error));
                return null;
            }

            console.log('✅ 配置验证通过');

            // 输出新配置
            const configJSON = generator.toJSON(newConfig, true);
            console.log('📄 新配置文件:');
            console.log(configJSON);

            // 提供下载
            downloadConfig(configJSON, 'Eagle2Ae-Presets-New.json');

            console.log('✅ 迁移完成！');
            console.log('💾 配置文件已下载为: Eagle2Ae-Presets-New.json');
            console.log('📝 请将此文件替换 resources/reference/Eagle2Ae-Presets.json');

            return newConfig;

        } catch (error) {
            console.error('❌ 迁移失败:', error);
            return null;
        }
    };

    /**
     * 验证现有配置
     */
    window.validateCurrentConfig = async function() {
        console.log('🔍 验证现有配置...');

        try {
            const generator = new ConfigGenerator();
            
            // 加载现有配置
            const response = await fetch('resources/reference/Eagle2Ae-Presets.json');
            if (!response.ok) {
                console.error('❌ 无法加载配置文件');
                return;
            }

            const config = await response.json();
            console.log('📋 已加载配置文件');

            // 验证配置
            const validation = generator.validateConfig(config);
            
            if (validation.valid) {
                console.log('✅ 配置验证通过！');
            } else {
                console.error('❌ 配置验证失败:');
                validation.errors.forEach(error => console.error('  -', error));
            }

            return validation;

        } catch (error) {
            console.error('❌ 验证失败:', error);
            return null;
        }
    };

    /**
     * 生成默认配置
     */
    window.generateDefaultConfig = function() {
        console.log('✨ 生成默认配置...');

        try {
            const generator = new ConfigGenerator();
            const config = generator.generateDefaultConfig();
            const configJSON = generator.toJSON(config, true);

            console.log('📄 默认配置:');
            console.log(configJSON);

            // 提供下载
            downloadConfig(configJSON, 'Eagle2Ae-Presets-Default.json');

            console.log('✅ 生成完成！');
            console.log('💾 配置文件已下载为: Eagle2Ae-Presets-Default.json');

            return config;

        } catch (error) {
            console.error('❌ 生成失败:', error);
            return null;
        }
    };

    /**
     * 下载配置文件
     */
    function downloadConfig(configJSON, filename) {
        const blob = new Blob([configJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 显示帮助信息
    console.log('🛠️ Eagle2Ae 配置迁移工具已加载');
    console.log('');
    console.log('可用命令:');
    console.log('  migrateConfig()          - 迁移现有配置到新格式');
    console.log('  validateCurrentConfig()  - 验证现有配置');
    console.log('  generateDefaultConfig()  - 生成默认配置');
    console.log('');

})();
