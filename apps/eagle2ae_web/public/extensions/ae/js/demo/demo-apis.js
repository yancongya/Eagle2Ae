// Eagle2Ae 演示模式 API 模拟器
// 模拟所有与AE和Eagle交互的API调用

class DemoAPIs {
    constructor(config) {
        this.config = config;
        this.demoData = config.demoData;
        this.operations = config.demoData.operations;
        this.t = window.i18n?.translations || {};
        this.state = { isConnected: false, currentProject: null, importProgress: 0, lastPingTime: 0 };
        this.init();
    }
    
    init() {
        console.log(this.t.demo.logs.apiSimulatorInit);
        this.state.isConnected = false;
        this.state.lastPingTime = this.demoData.connection.pingTime;
    }
    
    async testConnection() {
        console.log(this.t.demo.logs.testConnection);
        await this.delay(this.operations.connectionDelay);
        if (Math.random() > this.operations.successRate && this.operations.simulateErrors) {
            throw new Error(this.t.demo.logs.connectionFailed);
        }
        this.state.isConnected = true;
        this.state.lastPingTime = this.generateRandomPing();
        return { success: true, status: 'connected', pingTime: this.state.lastPingTime, message: this.t.demo.logs.noResponseMessage, service: 'Eagle2Ae-Demo', version: this.demoData.eagle.version };
    }

    async disconnect() {
        console.log(this.t.demo.logs.mockWSDisconnect);
        await this.delay(300);
        this.state.isConnected = false;
        this.state.lastPingTime = 0;
        return { success: true, status: 'disconnected', message: this.t.demo.logs.disconnected };
    }

    getConnectionState() {
        return { isConnected: this.state.isConnected, status: this.state.isConnected ? 'connected' : 'disconnected', pingTime: this.state.lastPingTime };
    }
    
    async getProjectInfo() {
        console.log(this.t.demo.logs.getProjectInfo);
        await this.delay(200);
        return { success: true, project: { name: this.demoData.ae.projectName, path: this.demoData.ae.projectPath, activeComp: this.demoData.ae.activeComp, duration: this.demoData.ae.compDuration, frameRate: this.demoData.ae.frameRate, resolution: this.demoData.ae.resolution }, ae: { version: this.demoData.ae.version } };
    }
    
    async getEagleFiles() {
        console.log(this.t.demo.logs.getEagleFiles);
        await this.delay(300);
        return { success: true, files: this.demoData.files, library: { path: this.demoData.eagle.libraryPath, totalItems: this.demoData.eagle.totalItems, selectedFolder: this.demoData.eagle.selectedFolder } };
    }
    
    async importFiles(files) {
        console.log(this.t.demo.logs.importFiles, files);
        this.state.importProgress = 0;
        for (let i = 0; i <= 100; i += 10) {
            this.state.importProgress = i;
            this.dispatchProgressEvent(i);
            await this.delay(this.operations.importDelay / 10);
        }
        if (Math.random() > this.operations.successRate && this.operations.simulateErrors) {
            throw new Error(this.t.demo.logs.importFailed);
        }
        return { success: true, importedFiles: files.map(file => ({ ...file, imported: true, importTime: new Date().toISOString(), layerName: `${file.name}_layer` })), message: this.demoData.ui.messages.imported, totalFiles: files.length, successCount: files.length, failCount: 0 };
    }
    
    async getConnectionStatus() {
        return { connected: this.state.isConnected, pingTime: this.state.lastPingTime, lastConnected: this.demoData.connection.lastConnected, autoReconnect: this.demoData.connection.autoReconnect };
    }
    
    async pollMessages() {
        return { messages: [], timestamp: Date.now(), clientId: 'demo_client', websocketCompatible: true };
    }
    
    async sendMessage(type, data) {
        console.log(this.t.demo.logs.sendMessage.replace('{type}', type), data);
        await this.delay(100);
        return { success: true, messageId: this.generateMessageId(), timestamp: Date.now(), response: this.t.demo.logs.responseMessage.replace('{type}', type) };
    }
    
    async detectSelectedLayers() {
        console.log(this.t.demo.logs.detectLayers);
        await this.delay(800);
        const layerData = this.demoData.layerDetection;
        if (!layerData || !layerData.selectedLayers) {
            console.error(this.t.demo.logs.layerDataNotFound);
            return { success: false, error: this.t.demo.logs.layerDataNotFound, compName: this.t.demo.logs.compName, selectedLayers: [], totalSelected: 0, exportableCount: 0, nonExportableCount: 0, logs: [this.t.demo.logs.layerDataNotFound] };
        }
        const selectedLayers = layerData.selectedLayers;
        const totalSelected = selectedLayers.length;
        const exportableCount = selectedLayers.filter(layer => layer.exportable).length;
        const nonExportableCount = totalSelected - exportableCount;
        const logs = [ this.t.demo.logs.compNameLog.replace('{name}', layerData.compName), this.t.demo.logs.detectedLayersLog.replace('{count}', totalSelected) ];
        selectedLayers.forEach((layer, index) => {
            let logMessage = `${index + 1}. [${this.getLayerTypeIcon(layer.type)}] ${layer.name}`;
            if (layer.exportable) {
                if (layer.sourceInfo && layer.sourceInfo.materialType) {
                    const materialIcon = this.getMaterialTypeIcon(layer.sourceInfo.materialType);
                    logMessage += ` ${materialIcon}${this.getMaterialTypeName(layer.sourceInfo.materialType)}`;
                }
                logMessage += this.t.demo.logs.exportable;
            } else {
                logMessage += this.t.demo.logs.notExportable.replace('{reason}', layer.reason);
            }
            logs.push(logMessage);
        });
        logs.push(this.t.demo.logs.detectionResult.replace('{exportable}', exportableCount).replace('{nonExportable}', nonExportableCount));
        if (layerData.materialStats.totalMaterials > 0) {
            logs.push(this.t.demo.logs.materialStats.replace('{total}', layerData.materialStats.totalMaterials));
            const statsDetails = [];
            if (layerData.materialStats.design > 0) statsDetails.push(`${this.t.demo.labels.design}:${layerData.materialStats.design}`);
            if (layerData.materialStats.image > 0) statsDetails.push(`${this.t.demo.labels.image}:${layerData.materialStats.image}`);
            if (layerData.materialStats.video > 0) statsDetails.push(`${this.t.demo.labels.video}:${layerData.materialStats.video}`);
            if (layerData.materialStats.audio > 0) statsDetails.push(`${this.t.demo.labels.audio}:${layerData.materialStats.audio}`);
            if (layerData.materialStats.animation > 0) statsDetails.push(`${this.t.demo.labels.animation}:${layerData.materialStats.animation}`);
            if (layerData.materialStats.vector > 0) statsDetails.push(`${this.t.demo.labels.vector}:${layerData.materialStats.vector}`);
            if (layerData.materialStats.raw > 0) statsDetails.push(`${this.t.demo.labels.raw}:${layerData.materialStats.raw}`);
            if (layerData.materialStats.document > 0) statsDetails.push(`${this.t.demo.labels.document}:${layerData.materialStats.document}`);
            if (layerData.materialStats.sequence > 0) statsDetails.push(`${this.t.demo.labels.sequence}:${layerData.materialStats.sequence}`);
            if (statsDetails.length > 0) {
                logs.push(this.t.demo.logs.typeDistribution.replace('{details}', statsDetails.join(', ')));
            }
        }
        return { success: true, compName: layerData.compName, selectedLayers: selectedLayers, totalSelected: totalSelected, exportableCount: exportableCount, nonExportableCount: nonExportableCount, materialStats: layerData.materialStats, logs: logs };
    }
}

// 导出类
window.DemoAPIs = DemoAPIs;
