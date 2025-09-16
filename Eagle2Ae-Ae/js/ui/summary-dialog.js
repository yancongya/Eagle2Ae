(function(){
    'use strict';

    function ensureStylesInjected() {
        if (document.getElementById('e2a-summary-dialog-styles')) return;
        var style = document.createElement('style');
        style.id = 'e2a-summary-dialog-styles';
        style.textContent = "\n.e2a-modal{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;}\n.e2a-dialog{background:#1e1e1e;color:#eee;border:1px solid #333;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.5);width:380px;max-width:90vw;max-height:80vh;display:flex;flex-direction:column;}\n.e2a-header{padding:8px 12px;border-bottom:1px solid #2a2a2a;font-weight:600;display:flex;align-items:center;justify-content:space-between;}\n.e2a-title{font-size:14px}\n.e2a-body{padding:8px 8px 0 8px;overflow:auto;}\n.e2a-summary{border:1px solid #2a2a2a;border-radius:6px;padding:6px;margin-bottom:8px}\n.e2a-summary-line{font-size:12px;margin:2px 0}\n.e2a-list{border:1px solid #2a2a2a;border-radius:6px;padding:6px;margin-bottom:8px}\n.e2a-row{display:flex;align-items:center;gap:6px;margin:2px 0}\n.e2a-row-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}\n.e2a-row-text.link{color:#6aa8ff;text-decoration:underline;}\n.e2a-row-text.link:hover{color:#8fc1ff}\n.e2a-row-text.link:focus{outline:1px dashed #6aa8ff;outline-offset:2px}\n.e2a-footer{padding:8px;border-top:1px solid #2a2a2a;display:flex;gap:8px;justify-content:center}\n.e2a-btn{background:#2b2b2b;border:1px solid #3a3a3a;border-radius:4px;color:#eee;padding:5px 12px;font-size:12px;cursor:pointer}\n.e2a-btn:hover{background:#343434}\n.e2a-detail{min-width:420px;max-width:90vw}\n";
        document.head.appendChild(style);
    }

    function generateSummaryLines(detectionResults) {
        var stats = calculateLayerStatistics(detectionResults);
        var lines = [];

        // 直接基于数据统计导出/不可导出分类，避免策略差异导致“无”
        var exportableCounts = { 设计:0, 文本:0, 形状:0, 其他:0 };
        var nonExportableCounts = { 设计:0, 视频:0, 图片:0, 音频:0, 矢量:0, 纯色:0, 预合成:0, 调整:0, 其他:0 };

        for (var i = 0; i < detectionResults.length; i++) {
            var layer = detectionResults[i];
            if (layer.canExport) {
                if (layer.materialType === 'design') {
                    exportableCounts['设计']++;
                } else if (layer.layerType === 'text') {
                    exportableCounts['文本']++;
                } else if (layer.layerType === 'shape') {
                    exportableCounts['形状']++;
                } else {
                    exportableCounts['其他']++;
                }
            } else {
                switch (layer.materialType) {
                    case 'design': nonExportableCounts['设计']++; break;
                    case 'video': nonExportableCounts['视频']++; break;
                    case 'image': nonExportableCounts['图片']++; break;
                    case 'audio': nonExportableCounts['音频']++; break;
                    case 'vector': nonExportableCounts['矢量']++; break;
                    default:
                        switch (layer.layerType) {
                            case 'solid': nonExportableCounts['纯色']++; break;
                            case 'precomp': nonExportableCounts['预合成']++; break;
                            case 'adjustment': nonExportableCounts['调整']++; break;
                            default: nonExportableCounts['其他']++; break;
                        }
                }
            }
        }

        var exportableParts = [];
        if (exportableCounts['设计'] > 0) exportableParts.push('设计:' + exportableCounts['设计']);
        if (exportableCounts['文本'] > 0) exportableParts.push('文本:' + exportableCounts['文本']);
        if (exportableCounts['形状'] > 0) exportableParts.push('形状:' + exportableCounts['形状']);
        if (exportableCounts['其他'] > 0) exportableParts.push('其他:' + exportableCounts['其他']);
        var exportableLine = '▶ 可导出: ' + (exportableParts.length > 0 ? exportableParts.join(', ') : '无');
        lines.push(exportableLine);

        var nonExportableParts = [];
        if (nonExportableCounts['设计'] > 0) nonExportableParts.push('设计:' + nonExportableCounts['设计']);
        if (nonExportableCounts['视频'] > 0) nonExportableParts.push('视频:' + nonExportableCounts['视频']);
        if (nonExportableCounts['图片'] > 0) nonExportableParts.push('图片:' + nonExportableCounts['图片']);
        if (nonExportableCounts['音频'] > 0) nonExportableParts.push('音频:' + nonExportableCounts['音频']);
        if (nonExportableCounts['矢量'] > 0) nonExportableParts.push('矢量:' + nonExportableCounts['矢量']);
        if (nonExportableCounts['纯色'] > 0) nonExportableParts.push('纯色:' + nonExportableCounts['纯色']);
        if (nonExportableCounts['预合成'] > 0) nonExportableParts.push('预合成:' + nonExportableCounts['预合成']);
        if (nonExportableCounts['调整'] > 0) nonExportableParts.push('调整:' + nonExportableCounts['调整']);
        if (nonExportableCounts['其他'] > 0) nonExportableParts.push('其他:' + nonExportableCounts['其他']);
        var nonExportableLine = '✖ 不可导出: ' + (nonExportableParts.length > 0 ? nonExportableParts.join(', ') : '无');
        lines.push(nonExportableLine);

        var summaryLine = '● 总结: 共检测 ' + stats.overall.totalLayers + ' 个图层，' +
                          stats.overall.exportableLayers + ' 个可导出，' +
                          stats.overall.nonExportableLayers + ' 个不可导出';
        lines.push(summaryLine);
        return lines;
    }

    function calculateLayerStatistics(detectionResults) {
        var stats = {
            overall: { totalLayers: 0, exportableLayers: 0, nonExportableLayers: 0 },
            materials: { designs: 0, videos: 0, images: 0, audios: 0, vectors: 0 },
            otherLayers: { solid: 0, precomp: 0, text: 0, shape: 0, adjustment: 0 }
        };
        for (var i = 0; i < detectionResults.length; i++) {
            var layer = detectionResults[i];
            stats.overall.totalLayers++;
            if (layer.canExport) {
                stats.overall.exportableLayers++;
                switch (layer.layerType) {
                    case 'text': stats.otherLayers.text++; break;
                    case 'shape': stats.otherLayers.shape++; break;
                }
            } else {
                stats.overall.nonExportableLayers++;
                switch (layer.materialType) {
                    case 'design': stats.materials.designs++; break;
                    case 'video': stats.materials.videos++; break;
                    case 'image': stats.materials.images++; break;
                    case 'audio': stats.materials.audios++; break;
                    case 'vector': stats.materials.vectors++; break;
                }
                switch (layer.layerType) {
                    case 'solid': stats.otherLayers.solid++; break;
                    case 'precomp': stats.otherLayers.precomp++; break;
                    case 'adjustment': stats.otherLayers.adjustment++; break;
                }
            }
        }
        return stats;
    }

    function getLayerCategory(layer) {
        if (layer.materialType) {
            switch (layer.materialType) {
                case 'design': return '设计';
                case 'video': return '视频';
                case 'image': return '图片';
                case 'audio': return '音频';
                case 'vector': return '矢量';
                default: return '素材';
            }
        }
        switch (layer.layerType) {
            case 'solid': return '纯色';
            case 'precomp': return '合成';
            case 'text': return '文本';
            case 'shape': return '形状';
            case 'adjustment': return '调整';
            case 'camera': return '摄像机';
            case 'light': return '灯光';
            case 'null': return '空对象';
            default: return '其他';
        }
    }

    function formatLayerText(layer) {
        var prefix = layer.canExport ? '[√]' : '[×]';
        var category = getLayerCategory(layer);
        var fileName = layer.name || '未命名图层';
        return prefix + '【' + category + '】' + fileName;
    }

    function getLayerPath(layer) {
        if (layer && layer.tooltipInfo && layer.tooltipInfo.originalPath) return layer.tooltipInfo.originalPath;
        if (layer && layer.sourceInfo && layer.sourceInfo.originalPath) return layer.sourceInfo.originalPath;
        if (layer && layer.source && layer.source.file && (layer.source.file.fsName || layer.source.file.fullName)) return (layer.source.file.fsName || layer.source.file.fullName);
        if (layer && layer.originalPath) return layer.originalPath;
        return null;
    }

    function tryOpenFolderInCEP(filePath) {
        try {
            if (!filePath) return false;
            if (typeof CSInterface === 'undefined') return false;
            var cs = new CSInterface();
            var escaped = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            var script = 'openFolderByFilePath("' + escaped + '")';
            cs.evalScript(script);
            return true;
        } catch (e) {
            return false;
        }
    }

    function tryExportDesignLayer(layer) {
        try {
            // 优先走现有应用方法（不新增导出实现）
            if (window.aeExtension && typeof window.aeExtension.handleLayerExport === 'function') {
                window.aeExtension.handleLayerExport(layer);
                return true;
            }
            if (window.eagle2ae && typeof window.eagle2ae.handleLayerExport === 'function') {
                window.eagle2ae.handleLayerExport(layer);
                return true;
            }
        } catch (e) {}
        return false;
    }

    function generateTooltip(layer) {
        var lines = [];
        var category = getLayerCategory(layer);
        var isMaterialLike = (layer && (
            layer.materialType === 'design' || layer.materialType === 'image' || layer.materialType === 'video' ||
            layer.materialType === 'audio' || layer.materialType === 'vector' || layer.materialType === 'sequence' ||
            layer.materialType === 'animation' || layer.materialType === 'raw' || layer.materialType === 'document'
        ));
        var isDesign = !!(layer && layer.materialType === 'design');
        if (isMaterialLike) {
            lines.push(category + (isDesign ? ' - 点击导出该图层' : ' - 点击打开所在文件夹'));
        } else {
            lines.push(category + (layer.canExport ? ' - 可导出' : ' - 不可导出'));
        }

        var pathAdded = false;
        if (layer.tooltipInfo && layer.tooltipInfo.originalPath) {
            lines.push('路径: ' + layer.tooltipInfo.originalPath);
            pathAdded = true;
            if (layer.tooltipInfo.fileSize) lines.push('大小: ' + layer.tooltipInfo.fileSize);
            if (layer.tooltipInfo.fileDate) lines.push('修改时间: ' + layer.tooltipInfo.fileDate);
            if (layer.tooltipInfo.dimensions) lines.push('尺寸: ' + layer.tooltipInfo.dimensions);
            if (layer.tooltipInfo.duration) lines.push('时长: ' + layer.tooltipInfo.duration);
        }
        if (!pathAdded && layer.sourceInfo && layer.sourceInfo.originalPath) {
            lines.push('路径: ' + layer.sourceInfo.originalPath);
            pathAdded = true;
            if (layer.sourceInfo.fileName) lines.push('文件名: ' + layer.sourceInfo.fileName);
            if (layer.sourceInfo.width && layer.sourceInfo.height) lines.push('尺寸: ' + layer.sourceInfo.width + 'x' + layer.sourceInfo.height);
            if (layer.sourceInfo.duration) lines.push('时长: ' + layer.sourceInfo.duration);
        }
        if (!pathAdded && layer.originalPath) {
            lines.push('路径: ' + layer.originalPath);
            pathAdded = true;
        }
        if (!isMaterialLike && !layer.canExport && layer.reason) {
            if (!pathAdded && (layer.type === 'MaterialLayer' || layer.type === 'VideoLayer' || layer.type === 'ImageLayer')) {
                lines.push('路径: 路径信息不可用');
            }
            lines.push('导出说明: ' + layer.reason);
        }
        return lines.join('\n');
    }

    function showDetailDialog(text) {
        ensureStylesInjected();
        var overlay = document.createElement('div');
        overlay.className = 'e2a-modal';
        var dialog = document.createElement('div');
        dialog.className = 'e2a-dialog e2a-detail';
        dialog.innerHTML = ''+
            '<div class="e2a-header"><div class="e2a-title">图层详细信息</div></div>'+
            '<div class="e2a-body"></div>'+
            '<div class="e2a-footer">'+
                '<button class="e2a-btn" data-action="close">关闭</button>'+
            '</div>';
        overlay.appendChild(dialog);
        var body = dialog.querySelector('.e2a-body');
        text.split('\n').forEach(function(line){
            if (!line.trim()) return;
            var div = document.createElement('div');
            div.textContent = line;
            div.style.fontSize = '12px';
            div.style.margin = '2px 0';
            body.appendChild(div);
        });
        dialog.querySelector('[data-action="close"]').onclick = function(){ document.body.removeChild(overlay); };
        document.body.appendChild(overlay);
    }

    function SummaryDialog() {}
    SummaryDialog.prototype.show = function(detectionResults) {
        return new Promise(function(resolve){
            ensureStylesInjected();

            var overlay = document.createElement('div');
            overlay.className = 'e2a-modal';
            var dialog = document.createElement('div');
            dialog.className = 'e2a-dialog';
            dialog.innerHTML = ''+
                '<div class="e2a-header">'+
                    '<div class="e2a-title">@Eagle2Ae</div>'+
                '</div>'+
                '<div class="e2a-body">'+
                    '<div class="e2a-summary"></div>'+
                    '<div class="e2a-list" aria-label="图层详情"></div>'+
                '</div>'+
                '<div class="e2a-footer">'+
                    '<button class="e2a-btn" data-action="ok">确定</button>'+
                    '<button class="e2a-btn" data-action="close">关闭</button>'+
                '</div>';
            overlay.appendChild(dialog);

            // Summary lines
            var summaryBox = dialog.querySelector('.e2a-summary');
            generateSummaryLines(detectionResults).forEach(function(line){
                var p = document.createElement('div');
                p.className = 'e2a-summary-line';
                p.textContent = line;
                summaryBox.appendChild(p);
            });

            // List
            var listBox = dialog.querySelector('.e2a-list');
            detectionResults.forEach(function(layer){
                var row = document.createElement('div');
                row.className = 'e2a-row';

                var label = document.createElement('div');
                label.className = 'e2a-row-text';
                label.textContent = formatLayerText(layer);
                label.title = generateTooltip(layer);
                // 超链接交互：素材/设计类显示下划线蓝色，支持键盘回车
                var isMaterialLike = (layer && (
                    layer.materialType === 'design' || layer.materialType === 'image' || layer.materialType === 'video' ||
                    layer.materialType === 'audio' || layer.materialType === 'vector' || layer.materialType === 'sequence' ||
                    layer.materialType === 'animation' || layer.materialType === 'raw' || layer.materialType === 'document'
                ));
                var isDesign = !!(layer && layer.materialType === 'design');
                if (isMaterialLike) {
                    label.classList.add('link');
                    label.setAttribute('role', 'link');
                    label.setAttribute('tabindex', '0');
                }
                label.onclick = function(){
                    try {
                        if (isMaterialLike) {
                            if (isDesign) {
                                if (tryExportDesignLayer(layer)) return;
                                // 无法直接导出，则回退显示详情
                                showDetailDialog(label.title);
                                return;
                            }
                            var path = getLayerPath(layer);
                            if (path && tryOpenFolderInCEP(path)) {
                                return;
                            }
                            // CEP 不可用或失败：回退提示路径
                            if (path) {
                                alert('文件夹路径: \n' + path);
                                return;
                            }
                        }
                        // 其他类型或没有路径：显示详情
                        showDetailDialog(label.title);
                    } catch (e) {
                        showDetailDialog(label.title);
                    }
                };
                label.onkeydown = function(e){ if ((e.key === 'Enter' || e.keyCode === 13) && isMaterialLike) { label.click(); } };

                row.appendChild(label);
                listBox.appendChild(row);
            });

            function closeWith(result) {
                if (overlay.parentNode) document.body.removeChild(overlay);
                resolve(result);
            }

            dialog.querySelector('[data-action="ok"]').onclick = function(){ closeWith(true); };
            dialog.querySelector('[data-action="close"]').onclick = function(){ closeWith(false); };

            overlay.addEventListener('click', function(e){ if (e.target === overlay) closeWith(false); });

            document.body.appendChild(overlay);
        });
    };

    window.SummaryDialog = SummaryDialog;
})();


