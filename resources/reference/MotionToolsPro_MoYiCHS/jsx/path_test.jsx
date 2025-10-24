(function () {
    app.beginUndoGroup("path test"); {
        test();
    }
    app.endUndoGroup();

    function test() {
        const AUTHOR_NAME = "MDS";
        const MTP_Name = "Motion_Tools_Pro";
        var userDataFolder = getUserDataFolder();
        var accessToWriteFile = tryToCreateSubFolder(userDataFolder, "test");

        var tempFolder = tryToCreateTempFolder();

        var tempFileMessage = ""
        if (tempFolder.exists) {
            var tempTestFile = tryToCreateSubFolder(tempFolder, "test");
            tempFileMessage = "\nTemp Folder: " + File.decode(tempFolder) + "\nTemp File created: " + tempTestFile;
        }

        alert("Make a screenshot for the support\n" +
            "Security Settings Enabled: " +
            !!isSecurityPrefSet() +

            "\nMDS Folder created: " +
            !!userDataFolder.exists +

            "\nMTP Folder exist: " +
            !!checkMDSFolder().exists +

            "\nUser Folder: " +
            File.decode(userDataFolder) +

            "\nFile created: " +
            !!accessToWriteFile +
            
            "\nTemp Folder created: " +
            !!tempFolder.exists + tempFileMessage
        );

        function getUserDataFolder(path) {
            if (!checkPrefs()) return null;

            // const SCRIPT_NAME = "MDS";
            var motionScriptFolder;
            if (path) {
                motionScriptFolder = new Folder(path);
            } else {
                var userDataFolder = Folder.userData;
                if (!userDataFolder || !(userDataFolder instanceof Folder)) {
                    userDataFolder = Folder.appData;
                }
                motionScriptFolder = new Folder(userDataFolder.toString() + "/" + AUTHOR_NAME);
                if (!motionScriptFolder.exists) {
                    motionScriptFolder.create();
                    // if (!motionScriptFolder.exists) {
                    //     alert("Settings folder could't be created on this computer due the security settings. Please contact administrator")
                    // } else {
                    //     alert("Error creating settings folder. The folder will be created in the\n" + Folder.temp.toString() + "\nfolder");
                    // }
                }
            }
            return motionScriptFolder;
        }

        function tryToCreateSubFolder(folder, subFolderName) {
            var subFolder = new Folder(folder.toString() + "/" + subFolderName);
            var folderCreated = false;
            if (!subFolder.exists) {
                subFolder.create();
                if (subFolder.exists) {
                    folderCreated = true;
                    subFolder.remove()
                };
            } else {
                folderCreated = true;
                subFolder.remove();
            }
            return folderCreated;
        }

        function tryToCreateTempFolder() {
            var tempFolder = new Folder(Folder.temp.toString() + "/" + AUTHOR_NAME);
            if (!tempFolder.exists) {
                tempFolder.create();
            }

            // alert("Temp Folder: " + File.decode(tempFolder) + "\nTemp File created: " + tempFolder.exists);
            return tempFolder;
        }

        function checkMDSFolder() {
            var MDSFolder = new Folder(Folder.userData.toString() + "/" + AUTHOR_NAME + "/" + MTP_Name);
            // if (!MDSFolder.exists) {
            //     MDSFolder.create();
            // }
            return MDSFolder;
        }

        function checkPrefs() {
            if (!isSecurityPrefSet()) {
                alert("Network access disabled. To allow, please go to Preferences > General and check off 'Allow Scripts to Write Files and Access Network' to resolve.");
                try {
                    app.executeCommand(2359);
                } catch (e) {

                    alert(e);
                }
                if (!isSecurityPrefSet()) {
                    return false;
                }
            } else {
                return true;
            }
        };

        function isSecurityPrefSet() {
            var securitySetting;
            try {
                securitySetting = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
                return securitySetting;
            } catch (e) {
                return false;
            }
        }
    }
})();

