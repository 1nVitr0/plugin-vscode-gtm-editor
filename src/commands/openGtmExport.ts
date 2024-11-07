import { Uri, window } from "vscode";
import { GtmFileSystemProvider } from "../providers/GtmFileSystemProvider";

export default function openGtmExport(sourceUri: Uri) {
  GtmFileSystemProvider.openSource(sourceUri);
}
