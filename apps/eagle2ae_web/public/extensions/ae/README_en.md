# Eagle2AE AE Extension — Installation Guide

This extension offers two installation methods: automatic installation and manual installation (recommended). The instructions below also include additional system/permission steps (such as registry settings, administrator installation, and AE preferences) to minimize common installation failures.

## Method 1: Automatic Install (install for current user)

1. Locate ZXPInstaller in the package (this distribution includes `ZXPInstaller-1.8.2.dmg`; the Windows installer is listed as `ZXPInstaller-Setup-1.8.2 exe`).
2. Run and install ZXPInstaller. If prompted for permissions, run the installer as an administrator.
3. Open ZXPInstaller and drag the extension package (for example `eagle2ae_ae_vX.X.X.zxp`) into the ZXPInstaller window to install.
4. After installation completes, restart After Effects. Make sure AE was closed during installation.

## Method 2: Manual Install (recommended for global/admin install)

Follow these steps to manually install the extension:

1. Copy the extension folder (for example `Eagle2Ae-Ae_vX.X.X`) into the Adobe CEP extensions directory:
   - Windows: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
   - macOS: `/Library/Application Support/Adobe/CEP/extensions/`
2. On Windows: run the provided registry file `Add Keys.reg` as administrator (right-click -> Run as administrator) to add the required registry keys so After Effects recognizes the extension.
   On macOS: run the provided `install-as-admin` script with administrator privileges if present.
3. After copying files and running the admin steps, fully exit After Effects and then restart it.

## After Effects preferences you may need to enable

If the extension does not appear in AE after installation and restart, check and adjust these preferences:

- Open Preferences -> Scripting & Expressions:
  - Windows: `Edit` -> `Preferences` -> `Scripting & Expressions`
  - macOS: `After Effects` -> `Preferences` -> `Scripting & Expressions`
- Check `Allow Scripts to Write Files and Access Network`. This permission is required for many extensions to function correctly.

If the extension still does not appear, verify that:

- You installed with administrator privileges where required (Windows: ran `Add Keys.reg` as admin).
- The extension folder was placed in the correct CEP directory.
- You fully restarted After Effects (sometimes a system restart is required for registry/permissions to take effect).

## How to open the extension in After Effects

Open the extension from the AE menu:

`Window` -> `Extensions` -> choose `Eagle2AE1 @烟囱鸭`, `Eagle2AE2 @烟囱鸭` or `Eagle2AE3 @烟囱鸭` (use the exact extension names shown; names with Chinese characters must not be translated).

## Troubleshooting — common issues

- Extension not visible: check CEP path, run registry/admin script (Windows), enable script permissions in AE, and restart AE.
- Permission errors or cannot copy files: run file manager or installer as administrator, or adjust folder permissions.
- Installation fails: try the automatic install via ZXPInstaller, or re-copy the extension folder and restart AE.

## Uninstalling old versions

Before installing a new version, remove the old extension folder from the CEP directory (paths above). After removal, restart After Effects and then install the new version.

## Additional notes

- Package contents: this distribution may include `ZXPInstaller-1.8.2.dmg`, `Add Keys.reg` (Windows), and `install-as-admin` (macOS). Use the appropriate files for your platform.
- If problems persist, consult the plugin author site or other documentation included in the package for support.

---

Quick recap: prefer the automatic install (ZXPInstaller). For a global/admin installation, copy the extension folder to the CEP directory and run the provided admin/registry scripts. Ensure AE preferences allow script file/network access, then restart AE. Good luck and enjoy using the extension!
