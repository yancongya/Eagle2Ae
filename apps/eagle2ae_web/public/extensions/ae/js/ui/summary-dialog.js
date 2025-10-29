(function(){
    'use strict';

    function t(key, fallback) {
        try {
            var v = (window.i18n && typeof window.i18n.getText === 'function') ? window.i18n.getText(key) : null;
            return v || fallback || key;
        } catch (e) {
            return fallback || key;
        }
    }

    function getCategoryLabel(key) {
        return t('categories.' + key, key);
    }

    function formatTemplate(template, params) {
        return template
            .replace('{total}', params.total)
            .replace('{exportable}', params.exportable)
            .replace('{nonExportable}', params.nonExportable);
    }

    function ensureStylesInjected() {
        if (document.getElementById('e2a-summary-dialog-styles')) return;
        var style = document.createElement('style');
        style.id = 'e2a-summary-dialog-styles';
        style.textContent = "\n.e2a-modal{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;}\n.e2a-dialog{background:#1e1e1e;color:#eee;border:1px solid #333;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.5);width:380px;max-width:90vw;max-height:80vh;display:flex;flex-direction:column;}\n.e2a-header{padding:8px 12px;border-bottom:1px solid #2a2a2a;font-weight:600;display:flex;align-items:center;justify-content:space-between;}\n.e2a-title{font-size:14px}\n.e2a-body{padding:8px 8px 0 8px;overflow:auto;}\n.e2a-summary{border:1px solid #2a2a2a;border-radius:6px;padding:6px;margin-bottom:8px}\n.e2a-summary-line{font-size:12px;margin:2px 0}\n.e2a-list{border:1px solid #2a2a2a;border-radius:6px;padding:6px;margin-bottom:8px}\n.e2a-row{display:flex;align-items:center;gap:6px;margin:2px 0}\n.e2a-row-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}\n.e2a-row-text.link{color:#6aa8ff;text-decoration:underline;}\n.e2a-row-text.link:hover{color:#8fc1ff}\n.e2a-row-text.link:focus{outline:1px dashed #6aa8ff;outline-offset:2px}\n.e2a-footer{padding:8px;border-top:1px solid #2a2a2a;display:flex;gap:8px;justify-content:center}\n.e2a-btn{background:#2b2b2b;border:1px solid #3a3a3a;border-radius:4px;color:#eee;padding:5px 12px;font-size:12px;cursor:pointer}\n.e2a-btn:hover{background:#343434}\n.e2a-detail{min-width:420px;max-width:90vw}\n";
        document.head.appendChild(style);
        // Append responsive rules for small screens
        style.textContent += "\n/* Responsive tweaks for small screens */\n@media (max-width: 480px){\n  .e2a-dialog{width:340px;max-width:96vw;}\n  .e2a-header{padding:6px 10px;}\n  .e2a-title{font-size:13px;}\n  .e2a-body{padding:6px 6px 0;}\n  .e2a-summary,.e2a-list{padding:5px;}\n  .e2a-summary-line{font-size:11px;}\n  .e2a-row{gap:4px;}\n  .e2a-row-text{font-size:12px;}\n  .e2a-footer{padding:6px;gap:6px;}\n  .e2a-btn{padding:4px 10px;font-size:12px;}\n  .e2a-detail{min-width:320px;}\n}\n@media (max-width: 360px){\n  .e2a-dialog{width:300px;max-width:96vw;}\n  .e2a-title{font-size:12px;}\n  .e2a-summary-line{font-size:10.5px;}\n  .e2a-row-text{font-size:11px;}\n  .e2a-btn{padding:3px 8px;font-size:11px;}\n  .e2a-detail{min-width:280px;}\n}\n@media (max-width: 320px){\n  .e2a-dialog{width:280px;max-width:96vw;}\n  .e2a-btn{padding:0;width:28px;height:28px;font-size:0;display:flex;align-items:center;justify-content:center;}\n  .e2a-btn[data-action=ok]::before{content:\"✔\";font-size:16px;line-height:1;}\n  .e2a-btn[data-action=close]::before{content:\"❌\";font-size:16px;line-height:1;}\n  .e2a-detail{min-width:240px;}\n}\n";

        // Add fluid, smooth responsive scaling (overrides stepwise feels)
        style.textContent += "\n/* Fluid responsive scaling */\n.e2a-dialog{\n  width: clamp(280px, 62vw, 380px);\n  --fs-title: clamp(12px, 1.6vw, 14px);\n  --fs-line: clamp(10px, 1.3vw, 12px);\n  --fs-row: clamp(10px, 1.3vw, 12px);\n  --pad-outer: clamp(6px, 1.2vw, 8px);\n  --pad-inner: clamp(4px, 1vw, 6px);\n  --gap: clamp(4px, 1vw, 8px);\n  --btn-px: clamp(8px, 2.2vw, 12px);\n  --btn-py: clamp(3px, 1vw, 6px);\n  --btn-fs: clamp(11px, 1.4vw, 12px);\n}\n.e2a-header{padding: var(--pad-outer) calc(var(--pad-outer) + 4px);}\n.e2a-title{font-size: var(--fs-title);}\n.e2a-body{padding: var(--pad-outer) var(--pad-outer) 0 var(--pad-outer); min-width: 0;}\n.e2a-summary,.e2a-list{padding: var(--pad-inner);}\n.e2a-summary{min-width: 0;}\n.e2a-summary-line{font-size: var(--fs-line); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}\n.e2a-row{gap: var(--gap);}\n.e2a-row-text{font-size: var(--fs-row); min-width: 0;}\n.e2a-footer{padding: var(--pad-outer); gap: var(--gap);}\n.e2a-btn{padding: var(--btn-py) var(--btn-px); font-size: var(--btn-fs);}\n.e2a-detail{min-width: clamp(240px, 56vw, 420px);}\n";
        // Ensure button sizing overrides apply in all cases
        style.textContent += "\n/* Fluid override for buttons */\n.e2a-btn{ padding: var(--btn-py) var(--btn-px) !important; font-size: var(--btn-fs) !important; box-sizing: border-box; }\n";
        // Icon-only mode on very small screens: hide text span, show symbols
        style.textContent += "\n@media (max-width: 360px){\n  .e2a-btn{ width: 28px; height: 28px; padding: 0 !important; font-size: 0 !important; display: inline-flex; align-items: center; justify-content: center; }\n  .e2a-btn .e2a-btn-text{ display: none !important; }\n  .e2a-btn[data-action=ok]::before{ content: \"✔\"; font-size: 16px; line-height: 1; }\n  .e2a-btn[data-action=close]::before{ content: \"❌\"; font-size: 16px; line-height: 1; }\n}\n";
    }

    function generateSummaryLines(detectionResults) {
        var stats = calculateLayerStatistics(detectionResults);
        var lines = [];

        // 直接基于数据统计导出/不可导出分类，避免策略差异导致“无”
        // 将“合成”归类为可导出
        var exportableCounts = { design:0, text:0, shape:0, precomp:0, other:0 };
        var nonExportableCounts = { design:0, video:0, image:0, audio:0, vector:0, solid:0, adjustment:0, other:0 };

        for (var i = 0; i < detectionResults.length; i++) {
            var layer = detectionResults[i];
            if (layer.canExport) {
                if (layer.materialType === 'design') {
                    exportableCounts['design']++;
                } else if (layer.layerType === 'text') {
                    exportableCounts['text']++;
                } else if (layer.layerType === 'shape') {
                    exportableCounts['shape']++;
                } else if (layer.layerType === 'precomp') {
                    exportableCounts['precomp']++;
                } else {
                    exportableCounts['other']++;
                }
            } else {
                switch (layer.materialType) {
                    case 'design': nonExportableCounts['design']++; break;
                    case 'video': nonExportableCounts['video']++; break;
                    case 'image': nonExportableCounts['image']++; break;
                    case 'audio': nonExportableCounts['audio']++; break;
                    case 'vector': nonExportableCounts['vector']++; break;
                    default:
                        switch (layer.layerType) {
                            case 'solid': nonExportableCounts['solid']++; break;
                            case 'adjustment': nonExportableCounts['adjustment']++; break;
                            default: nonExportableCounts['other']++; break;
                        }
                }
            }
        }

        var exportableParts = [];
        if (exportableCounts['design'] > 0) exportableParts.push(getCategoryLabel('design') + ':' + exportableCounts['design']);
        if (exportableCounts['text'] > 0) exportableParts.push(getCategoryLabel('text') + ':' + exportableCounts['text']);
        if (exportableCounts['shape'] > 0) exportableParts.push(getCategoryLabel('shape') + ':' + exportableCounts['shape']);
        if (exportableCounts['precomp'] > 0) exportableParts.push(getCategoryLabel('precomp') + ':' + exportableCounts['precomp']);
        if (exportableCounts['other'] > 0) exportableParts.push(getCategoryLabel('other') + ':' + exportableCounts['other']);
        var exportableLine = t('summaryDialog.exportablePrefix', '▶ 可导出: ') + (exportableParts.length > 0 ? exportableParts.join(', ') : t('summaryDialog.none', '无'));
        lines.push(exportableLine);

        var nonExportableParts = [];
        if (nonExportableCounts['design'] > 0) nonExportableParts.push(getCategoryLabel('design') + ':' + nonExportableCounts['design']);
        if (nonExportableCounts['video'] > 0) nonExportableParts.push(getCategoryLabel('video') + ':' + nonExportableCounts['video']);
        if (nonExportableCounts['image'] > 0) nonExportableParts.push(getCategoryLabel('image') + ':' + nonExportableCounts['image']);
        if (nonExportableCounts['audio'] > 0) nonExportableParts.push(getCategoryLabel('audio') + ':' + nonExportableCounts['audio']);
        if (nonExportableCounts['vector'] > 0) nonExportableParts.push(getCategoryLabel('vector') + ':' + nonExportableCounts['vector']);
        if (nonExportableCounts['solid'] > 0) nonExportableParts.push(getCategoryLabel('solid') + ':' + nonExportableCounts['solid']);
        if (nonExportableCounts['adjustment'] > 0) nonExportableParts.push(getCategoryLabel('adjustment') + ':' + nonExportableCounts['adjustment']);
        if (nonExportableCounts['other'] > 0) nonExportableParts.push(getCategoryLabel('other') + ':' + nonExportableCounts['other']);
        var nonExportableLine = t('summaryDialog.nonExportablePrefix', '✖ 不可导出: ') + (nonExportableParts.length > 0 ? nonExportableParts.join(', ') : t('summaryDialog.none', '无'));
        lines.push(nonExportableLine);

        var summaryTemplate = t('summaryDialog.summaryTemplate', '● 总结: 共检测 {total} 个图层，{exportable} 个可导出，{nonExportable} 个不可导出');
        var summaryLine = formatTemplate(summaryTemplate, {
            total: stats.overall.totalLayers,
            exportable: stats.overall.exportableLayers,
            nonExportable: stats.overall.nonExportableLayers
        });
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

    function getLayerCategoryKey(layer) {
        if (layer && layer.materialType) {
            switch (layer.materialType) {
                case 'design': return 'design';
                case 'video': return 'video';
                case 'image': return 'image';
                case 'audio': return 'audio';
                case 'vector': return 'vector';
                default: return 'material';
            }
        }
        if (layer && layer.layerType) {
            switch (layer.layerType) {
                case 'solid': return 'solid';
                case 'precomp': return 'precomp';
                case 'text': return 'text';
                case 'shape': return 'shape';
                case 'adjustment': return 'adjustment';
                case 'camera': return 'camera';
                case 'light': return 'light';
                case 'null': return 'null';
                default: return 'other';
            }
        }
        return 'other';
    }

    function getLayerCategory(layer) {
        return getCategoryLabel(getLayerCategoryKey(layer));
    }

    function formatLayerText(layer) {
        var prefix = layer.canExport ? '[√]' : '[×]';
        var category = getLayerCategory(layer);
        var fileName = layer.name || t('summaryDialog.unnamedLayer', '未命名图层');
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
        var isComposition = !!(layer && layer.layerType === 'precomp');
        if (isMaterialLike) {
            lines.push(category + (isDesign ? t('summaryDialog.tipExportDesign', ' - 点击导出该图层') : t('summaryDialog.tipOpenFolder', ' - 点击打开所在文件夹')));
        } else if (isComposition) {
            lines.push(category + t('summaryDialog.tipExportCurrentFrame', ' - 点击导出当前时间帧'));
        } else {
            lines.push(category + (layer.canExport ? (' - ' + t('summaryDialog.statusExportable', '可导出')) : (' - ' + t('summaryDialog.statusNonExportable', '不可导出'))));
        }

        var pathAdded = false;
        if (layer.tooltipInfo && layer.tooltipInfo.originalPath) {
            lines.push(t('summaryDialog.tipPathPrefix', '路径: ') + layer.tooltipInfo.originalPath);
            pathAdded = true;
            if (layer.tooltipInfo.fileSize) lines.push(t('summaryDialog.tipSizePrefix', '大小: ') + layer.tooltipInfo.fileSize);
            if (layer.tooltipInfo.fileDate) lines.push(t('summaryDialog.tipModifiedDatePrefix', '修改时间: ') + layer.tooltipInfo.fileDate);
            if (layer.tooltipInfo.dimensions) lines.push(t('summaryDialog.tipDimensionsPrefix', '尺寸: ') + layer.tooltipInfo.dimensions);
            if (layer.tooltipInfo.duration) lines.push(t('summaryDialog.tipDurationPrefix', '时长: ') + layer.tooltipInfo.duration);
        }
        if (!pathAdded && layer.sourceInfo && layer.sourceInfo.originalPath) {
            lines.push(t('summaryDialog.tipPathPrefix', '路径: ') + layer.sourceInfo.originalPath);
            pathAdded = true;
            if (layer.sourceInfo.fileName) lines.push(t('summaryDialog.tipFileNamePrefix', '文件名: ') + layer.sourceInfo.fileName);
            if (layer.sourceInfo.width && layer.sourceInfo.height) lines.push(t('summaryDialog.tipDimensionsPrefix', '尺寸: ') + layer.sourceInfo.width + 'x' + layer.sourceInfo.height);
            if (layer.sourceInfo.duration) lines.push(t('summaryDialog.tipDurationPrefix', '时长: ') + layer.sourceInfo.duration);
        }
        if (!pathAdded && layer.originalPath) {
            lines.push(t('summaryDialog.tipPathPrefix', '路径: ') + layer.originalPath);
            pathAdded = true;
        }
        if (!isMaterialLike && !layer.canExport && layer.reason) {
            if (!pathAdded && (layer.type === 'MaterialLayer' || layer.type === 'VideoLayer' || layer.type === 'ImageLayer')) {
                lines.push(t('summaryDialog.tipPathPrefix', '路径: ') + t('summaryDialog.tipPathUnavailable', '路径信息不可用'));
            }
            lines.push(t('summaryDialog.tipExportNotePrefix', '导出说明: ') + layer.reason);
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
            '<div class="e2a-header"><div class="e2a-title">' + t('summaryDialog.detailTitle', '图层详细信息') + '</div></div>'+
            '<div class="e2a-body"></div>'+
            '<div class="e2a-footer">'+
                '<button class="e2a-btn" data-action="close" aria-label="' + t('summaryDialog.close', '关闭') + '" title="' + t('summaryDialog.close', '关闭') + '"><span class="e2a-btn-text">' + t('summaryDialog.close', '关闭') + '</span></button>'+
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
                    '<div class="e2a-list" aria-label="' + t('summaryDialog.listAriaLabel', '图层详情') + '"></div>'+
                '</div>'+
                '<div class="e2a-footer">'+
                    '<button class="e2a-btn" data-action="ok" aria-label="' + t('common.confirm', '确定') + '" title="' + t('common.confirm', '确定') + '"><span class="e2a-btn-text">' + t('common.confirm', '确定') + '</span></button>'+
                    '<button class="e2a-btn" data-action="close" aria-label="' + t('summaryDialog.close', '关闭') + '" title="' + t('summaryDialog.close', '关闭') + '"><span class="e2a-btn-text">' + t('summaryDialog.close', '关闭') + '</span></button>'+
                '</div>';
            overlay.appendChild(dialog);

            // Summary lines（只显示前两行；总计行移动到悬浮提示节省空间）
            var summaryBox = dialog.querySelector('.e2a-summary');
            var allLines = generateSummaryLines(detectionResults);
            var totalLine = allLines.length > 0 ? allLines[allLines.length - 1] : '';
            var visibleLines = allLines.slice(0, Math.max(0, allLines.length - 1));
            visibleLines.forEach(function(line){
                var p = document.createElement('div');
                p.className = 'e2a-summary-line';
                p.textContent = line;
                summaryBox.appendChild(p);
            });
            if (totalLine) {
                var tip = totalLine.replace(/^●\s*/, '');
                summaryBox.setAttribute('title', tip);
            }

            // List
            var listBox = dialog.querySelector('.e2a-list');
            detectionResults.forEach(function(layer){
                var row = document.createElement('div');
                row.className = 'e2a-row';

                var label = document.createElement('div');
                label.className = 'e2a-row-text';
                label.textContent = formatLayerText(layer);
                label.title = generateTooltip(layer);
                // 超链接交互：素材/设计/合成类显示下划线蓝色，支持键盘回车
                var isMaterialLike = (layer && (
                    layer.materialType === 'design' || layer.materialType === 'image' || layer.materialType === 'video' ||
                    layer.materialType === 'audio' || layer.materialType === 'vector' || layer.materialType === 'sequence' ||
                    layer.materialType === 'animation' || layer.materialType === 'raw' || layer.materialType === 'document'
                ));
                var isDesign = !!(layer && layer.materialType === 'design');
                var isComposition = !!(layer && layer.layerType === 'precomp');
                if (isMaterialLike || isComposition) {
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
                                alert(t('summaryDialog.tipFolderPathPrefix', '文件夹路径: ') + '\n' + path);
                                return;
                            }
                        } else if (isComposition) {
                            // 合成：导出当前时间帧（复用现有导出通道）
                            if (tryExportDesignLayer(layer)) return;
                            showDetailDialog(t('summaryDialog.compExportFailed', '无法导出合成帧，请检查扩展状态') + "\n" + label.title);
                            return;
                        }
                        // 其他类型或没有路径：显示详情
                        showDetailDialog(label.title);
                    } catch (e) {
                        showDetailDialog(label.title);
                    }
                };
                label.onkeydown = function(e){ if ((e.key === 'Enter' || e.keyCode === 13) && (isMaterialLike || isComposition)) { label.click(); } };

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


