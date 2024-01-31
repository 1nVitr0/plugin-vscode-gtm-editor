import { ExtensionContext, commands, workspace } from "vscode";
import contributeCommands from "./contribute/commands";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(...contributeCommands());
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
