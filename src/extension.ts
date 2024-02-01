import { ExtensionContext, workspace } from "vscode";
import contributeCommands from "./contribute/commands";
import { GtmFileSystemProvider } from "./providers/GtmFileSystemProvider";
import contributeFileSystemProviders from "./contribute/file-system";

export function activate(context: ExtensionContext) {
  const gtmFs = new GtmFileSystemProvider();

  context.subscriptions.push(...contributeFileSystemProviders(gtmFs));
  context.subscriptions.push(...contributeCommands(gtmFs));
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((change) => {
      if (change.affectsConfiguration("gtm-editor")) {
        deactivate(context);
        activate(context);
      }
    })
  );
}

function deactivate(context: ExtensionContext) {
  context.subscriptions.forEach((subscription) => subscription.dispose());
}
