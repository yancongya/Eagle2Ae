// Adobe After Effects 脚本：预合成项目面板中选中的素材
// 此脚本为项目面板中每个选中的素材文件创建一个新的合成，使用原始素材名称，
// 保留所有原始属性，并在控制台输出处理结果。

function precomposeSelectedFootage() {
    app.beginUndoGroup("预合成选中的素材");

    // 检查是否有打开的项目
    if (!app.project) {
        $.writeln("错误：没有打开的项目。请打开一个项目并选择素材文件。");
        app.endUndoGroup();
        return;
    }

    // 获取项目面板中选中的素材
    var selectedItems = app.project.selection;
    if (selectedItems.length === 0) {
        $.writeln("错误：未选择任何素材文件。请在项目面板中选择一个或多个素材文件。");
        app.endUndoGroup();
        return;
    }

    // 验证并处理每个选中的素材
    var validFootageCount = 0;
    for (var i = 0; i < selectedItems.length; i++) {
        var item = selectedItems[i];

        // 检查是否为有效的素材文件（排除固态层、占位符、合成或文件夹）
        if (!(item instanceof FootageItem) || item.mainSource instanceof SolidSource || item.mainSource instanceof PlaceholderSource) {
            $.writeln("跳过项目：" + item.name + "。仅支持有效的素材文件（不支持固态层、占位符、合成或文件夹）。");
            continue;
        }

        try {
            // 使用原始素材名称创建新合成
            var compName = item.name;
            var newComp = app.project.items.addComp(
                compName,
                item.width,
                item.height,
                item.pixelAspect,
                item.duration,
                item.frameRate
            );

            // 将素材添加到新合成中
            var layer = newComp.layers.add(item);

            // 保留原始属性（默认情况下，添加到新合成的素材会保留其固有属性）
            // 如需复制其他属性（例如来自其他图层的属性），可在此处添加

            validFootageCount++;
            $.writeln("成功预合成素材：" + item.name);
        } catch (error) {
            $.writeln("预合成素材失败：" + item.name + "。错误：" + error.toString());
        }
    }

    if (validFootageCount === 0) {
        $.writeln("没有处理任何有效的素材文件。请选择有效的素材文件。");
    } else {
        $.writeln("成功预合成 " + validFootageCount + " 个素材文件。");
    }

    app.endUndoGroup();
}

// 运行函数
precomposeSelectedFootage();