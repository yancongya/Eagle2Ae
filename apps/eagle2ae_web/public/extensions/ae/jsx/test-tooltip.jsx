/**
 * 测试CEP环境下JSX弹窗的悬浮提示功能
 * 用于验证dialog-summary.jsx中的悬浮提示修复
 */

// 引入dialog-summary.jsx
#include "dialog-summary.jsx"

/**
 * 测试悬浮提示功能
 */
function testTooltipFunctionality() {
    try {
        // 创建测试数据
        var testLayers = [
            {
                name: "测试素材图层",
                canExport: false,
                materialType: "image",
                source: {
                    file: {
                        fsName: "C:\\Users\\Test\\image.jpg",
                        fullName: "C:\\Users\\Test\\image.jpg",
                        exists: true,
                        length: 1024000,
                        modified: new Date()
                    }
                },
                reason: "素材文件不可导出"
            },
            {
                name: "测试设计文件",
                canExport: true,
                materialType: "design",
                source: {
                    file: {
                        fsName: "C:\\Users\\Test\\design.psd",
                        fullName: "C:\\Users\\Test\\design.psd",
                        exists: true,
                        length: 5120000,
                        modified: new Date()
                    }
                }
            },
            {
                name: "测试文本图层",
                canExport: true,
                layerType: "text",
                textContent: "这是一个测试文本图层的内容"
            }
        ];
        
        // 显示测试弹窗
        showDetectionSummaryDialog(testLayers);
        
        alert("测试完成！\n\n请检查以下功能：\n1. 图层列表项是否显示helpTip悬浮提示\n2. 点击图层项是否弹出详细信息对话框\n3. 悬浮提示内容是否包含路径、大小等信息");
        
    } catch (error) {
        alert("测试过程中出现错误：\n" + error.toString());
    }
}

/**
 * 测试悬浮提示文本生成
 */
function testTooltipTextGeneration() {
    try {
        var testLayer = {
            name: "测试图层",
            materialType: "image",
            source: {
                file: {
                    fsName: "C:\\Users\\Test\\test.jpg",
                    exists: true,
                    length: 2048000,
                    modified: new Date()
                }
            },
            reason: "测试原因"
        };
        
        var tooltipText = generateLayerTooltipText(testLayer, false);
        alert("生成的悬浮提示文本：\n\n" + tooltipText);
        
    } catch (error) {
        alert("测试悬浮提示文本生成时出现错误：\n" + error.toString());
    }
}

// 运行测试
if (confirm("是否运行悬浮提示功能测试？\n\n点击'确定'运行完整测试\n点击'取消'仅测试文本生成")) {
    testTooltipFunctionality();
} else {
    testTooltipTextGeneration();
}