import { Uri } from "vscode";

export interface GtmPath {
  sourceUri: Uri;
  accountId?: string;
  containerId?: string;
  folder?: string;
  itemType?: string;
  id?: string;
  accounts?: boolean;
  containers?: boolean;
}
