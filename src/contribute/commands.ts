import { Uri, commands } from "vscode";
import { GtmFileSystemProvider } from "../providers/GtmFileSystemProvider";

export default function contributeCommands(gtmFs: GtmFileSystemProvider) {
  return [
    commands.registerCommand("gtm-editor.openGtmExport", (uri: Uri) => {
      console.log("openGtmExport", uri);
      gtmFs.load(uri);
    }),
  ];
}
