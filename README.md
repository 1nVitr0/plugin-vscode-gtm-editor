# Google Tag Manager Editor

[![Visual Studio Code extension 1nVitr0.gtm-editor](https://img.shields.io/visual-studio-marketplace/v/1nVitr0.gtm-editor?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.gtm-editor)
[![Open VSX extension 1nVitr0.gtm-editor](https://img.shields.io/open-vsx/v/1nVitr0/gtm-editor)](https://open-vsx.org/extension/1nVitr0/gtm-editor)
[![Installs for Visual Studio Code extension 1nVitr0.gtm-editor](https://img.shields.io/visual-studio-marketplace/i/1nVitr0.gtm-editor?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.gtm-editor)
[![Rating for Visual Studio Code extension 1nVitr0.gtm-editor](https://img.shields.io/visual-studio-marketplace/r/1nVitr0.gtm-editor?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.gtm-editor)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Preview

**This extension is not yet feature complete and may include various bugs and issues. Use at your own risk.**

## Features

GTM Editor provides a structured view of a Google Tag Manager export file. You can open it by right clicking, the context menu entry is "`Open GTM Export`".

The extension works by transforming the export into a file-system with directories for tags, triggers, variables, folders and more. You can move "files" between folders, edit and save them separately.

### List of Features

- Display GTM export as a file-system
- Move triggers, tags and variables between folders
- Edit properties separately with intellisense
- Intellisense for separate items or entire GTM exports
- Auto-update folder when editing them in-the file
- Deleting and moving properties and entire folders

### Known Issues

- No renaming of `accountId` or `containerId`
- No safe moving or copying items between multiple exports
