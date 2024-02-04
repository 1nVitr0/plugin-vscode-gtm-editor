import { workspace } from "vscode";
import { GtmFileSystemProvider } from "../providers/GtmFileSystemProvider";

export default function contributeFileSystemProviders() {
  return [workspace.registerFileSystemProvider("gtm", new GtmFileSystemProvider(), { isReadonly: false })];
}
