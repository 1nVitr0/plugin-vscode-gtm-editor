import { Uri, commands } from "vscode";
import { GtmFileSystemProvider } from "../providers/GtmFileSystemProvider";

export default function contributeCommands() {
  return [commands.registerCommand("gtm-editor.openGtmExport", GtmFileSystemProvider.openSource)];
}
