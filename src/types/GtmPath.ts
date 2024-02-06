import { Uri } from "vscode";

export interface GtmPath {
  sourceUri: Uri;
  accountId?: string;
  containerId?: string;
  folder?: string;
  itemType?: "folders" | "tags" | "triggers" | "variables" | "builtInVariables" | "customTemplates" | "container";
  itemName?: string;
  accounts?: boolean;
  containers?: boolean;
}
