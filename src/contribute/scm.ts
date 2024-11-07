import { l10n, scm } from "vscode";

export default async function contributeScm() {
  const sourceControl = scm.createSourceControl("gtm", l10n.t("Google Tag Manager"));
}
