import { ExtensionContext, workspace } from "vscode";
import contributeCommands from "./contribute/commands";
import { GtmFileSystemProvider } from "./providers/GtmFileSystemProvider";

export function activate(context: ExtensionContext) {
  const gtmFs = new GtmFileSystemProvider();

  context.subscriptions.push(workspace.registerFileSystemProvider("gtm", gtmFs, { isReadonly: false }));
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
