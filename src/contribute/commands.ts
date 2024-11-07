import { commands } from "vscode";
import openGtmExport from "../commands/openGtmExport";
import openGtmExportDialog from "../commands/openGtmExportDialog";

export default function contributeCommands() {
  return [
    commands.registerCommand("gtm-editor.openGtmExport", openGtmExport),
    commands.registerCommand("gtm-editor.openGtmExportDialog", openGtmExportDialog),
  ];
}
