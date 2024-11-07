import { l10n, window } from "vscode";
import { GtmFileSystemProvider } from "../providers/GtmFileSystemProvider";

export default async function openGtmExportDialog() {
  const [selectedUri] =
    (await window.showOpenDialog({
      title: l10n.t("Open Google Tag Manager Export"),
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      /* eslint-disable @typescript-eslint/naming-convention */
      filters: {
        "GTM Export": ["gtm"],
      },
      /* eslint-enable @typescript-eslint/naming-convention */
    })) ?? [];

  if (selectedUri) GtmFileSystemProvider.openSource(selectedUri);
}
