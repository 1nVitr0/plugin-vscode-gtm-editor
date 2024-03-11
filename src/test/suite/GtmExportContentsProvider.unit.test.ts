import { Uri } from "vscode";
import { GtmExportContentProvider } from "../../providers/GtmExportContentsProvider";
import { join, resolve } from "path";
import { strict as assert } from "assert";

suite("Unit Tests for GtmExportContentsProvider", async () => {
  const fixtureDir = resolve(__dirname, "../../../test/fixtures");
  const exportFilePath = resolve(__dirname, join(fixtureDir, "wordpress.gtm-export.json"));
  const uri = Uri.parse(`file://${exportFilePath}`);

  const contentsProvider: GtmExportContentProvider = await GtmExportContentProvider.create(uri);

  test("should create a GtmExportContentProvider", async () => {
    assert.ok(contentsProvider);
  });

  test("should have a valid exportTime", async () => {
    assert.equal(contentsProvider.exportTime.toISOString(), "2018-02-15T09:45:11.000Z");
  });

  test("should have a valid accountId", async () => {
    assert.equal(contentsProvider.accountId, "124588580");
  });

  test("should have a valid containerId", async () => {
    assert.equal(contentsProvider.containerId, "6899612");
  });

  test("should have a valid containerVersionId", async () => {
    assert.equal(contentsProvider.containerVersionId, "2");
  });

  test("should have a valid fingerprint", async () => {
    assert.equal(contentsProvider.fingerprint, "1518687838097");
  });

  test("should contain valid container", async () => {
    assert.equal(contentsProvider.getContainer().accountId, "124588580");
    assert.equal(contentsProvider.getContainer().containerId, "6899612");
    assert.equal(contentsProvider.getContainer().name, "gtm4wp container - WIP");
    assert.equal(contentsProvider.getContainer().publicId, "GTM-N87D32T");
    assert.equal(contentsProvider.getContainer().usageContext, ["WEB"]);
    assert.equal(contentsProvider.getContainer().fingerprint, "1518687838097");
    assert.equal(
      contentsProvider.getContainer().tagManagerUrl,
      "https://tagmanager.google.com/#/container/accounts/124588580/containers/6899612/workspaces?apiLink=container"
    );
  });

  test("should contain all folders", async () => {
    assert.equal(contentsProvider.getFolder().length, 1);
    assert.equal(contentsProvider.getFolder()[0].folderId, "14");
    assert.equal(contentsProvider.getFolder()[0].name, "GTM4WP");
  });

  test("should get single folder", async () => {
    assert.equal(contentsProvider.getFolder("GTM4WP")?.folderId, "GTM4WP");
  });

  test("should contain all tags", async () => {
    assert.equal(contentsProvider.getTag().length, 8);
  });

  test("should get all tags in folder", async () => {
    assert.equal(contentsProvider.getTag("GTM4WP").length, 7);
  });
});
