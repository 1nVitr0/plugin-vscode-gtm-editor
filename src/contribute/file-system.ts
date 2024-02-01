import { workspace } from "vscode";
import { GtmFileSystemProvider } from "../providers/GtmFileSystemProvider";

export default function contributeFileSystemProviders(gtmFs: GtmFileSystemProvider) {
  return [workspace.registerFileSystemProvider("gtm", gtmFs, { isReadonly: false })];
}
