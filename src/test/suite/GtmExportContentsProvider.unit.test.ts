import { URI } from "vscode-uri";
import { GtmExportContentProvider } from "../../providers/GtmExportContentsProvider";
import { join, resolve } from "path";
import * as assert from "assert";
import { before } from "mocha";

suite("Unit Tests for GtmExportContentsProvider", async () => {
  const fixtureDir = resolve(__dirname, "../../../test/fixtures");
  const exportFilePath = resolve(__dirname, join(fixtureDir, "wordpress.gtm-export.json"));
  const uri = URI.parse(`file://${exportFilePath}`);

  let contentsProvider: GtmExportContentProvider;

  before(async () => {
    contentsProvider = await GtmExportContentProvider.create(uri);
  });

  test("should create a GtmExportContentProvider", () => {
    assert.ok(contentsProvider);
  });

  test("should have a valid exportTime", () => {
    const compareDate = new Date("2018-02-15T09:45:11.000");
    assert.equal(contentsProvider.exportTime.toISOString(), compareDate.toISOString());
  });

  test("should have a valid accountId", () => {
    assert.equal(contentsProvider.accountId, "124588580");
  });

  test("should have a valid containerId", () => {
    assert.equal(contentsProvider.containerId, "6899612");
  });

  test("should have a valid containerVersionId", () => {
    assert.equal(contentsProvider.containerVersionId, "2");
  });

  test("should have a valid fingerprint", () => {
    assert.equal(contentsProvider.fingerprint, "1518687892025");
  });

  test("should contain valid container", () => {
    assert.equal(contentsProvider.getContainer().accountId, "124588580");
    assert.equal(contentsProvider.getContainer().containerId, "6899612");
    assert.equal(contentsProvider.getContainer().name, "gtm4wp container - WIP");
    assert.equal(contentsProvider.getContainer().publicId, "GTM-WRMHSB8");
    assert.deepEqual(contentsProvider.getContainer().usageContext, ["WEB"]);
    assert.equal(contentsProvider.getContainer().fingerprint, "1518687838097");
    assert.equal(
      contentsProvider.getContainer().tagManagerUrl,
      "https://tagmanager.google.com/#/container/accounts/124588580/containers/6899612/workspaces?apiLink=container"
    );
  });

  test("should get all folders", () => {
    assert.equal(contentsProvider.getFolder().length, 1);
    assert.equal(contentsProvider.getFolder()[0].folderId, "14");
    assert.equal(contentsProvider.getFolder()[0].name, "GTM4WP");
  });

  test("should get single folder", () => {
    assert.equal(contentsProvider.getFolder("GTM4WP")?.folderId, "14");
  });

  test("should get all tags", () => {
    assert.equal(contentsProvider.getTag().length, 8);
  });

  test("should get all tags in folder", () => {
    assert.equal(contentsProvider.getTag("GTM4WP").length, 7);
  });

  test("should get single tag", () => {
    assert.equal(contentsProvider.getTag("GTM4WP", "UA Enhanced Ecommerce WOO")?.tagId, "8");
    assert.equal(contentsProvider.getTag(null, "UA Enhanced Ecommerce WOO")?.tagId, "8");
  });

  test("should get all triggers", () => {
    assert.equal(contentsProvider.getTrigger().length, 11);
  });

  test("should get all triggers in folder", () => {
    assert.equal(contentsProvider.getTrigger("GTM4WP").length, 10);
  });

  test("should get single trigger", () => {
    assert.equal(contentsProvider.getTrigger("GTM4WP", "Ecommerce events")?.triggerId, "13");
    assert.equal(contentsProvider.getTrigger(null, "Ecommerce events")?.triggerId, "13");
  });

  test("should get all variables", () => {
    assert.equal(contentsProvider.getVariable().length, 57);
  });

  test("should get all variables in folder", () => {
    assert.equal(contentsProvider.getVariable("GTM4WP").length, 56);
  });

  test("should get single variable", () => {
    assert.equal(contentsProvider.getVariable("GTM4WP", "Reading - Time to Scroll")?.variableId, "2");
    assert.equal(contentsProvider.getVariable(null, "Reading - Time to Scroll")?.variableId, "2");
  });

  test("should get all builtin variables", () => {
    assert.equal(contentsProvider.getBuiltInVariable().length, 5);
  });

  test("should get single builtin variable", () => {
    assert.equal(contentsProvider.getBuiltInVariable("Page URL")?.type, "PAGE_URL");
  });

  test("should get all custom templates", () => {
    assert.equal(contentsProvider.getCustomTemplate().length, 1);
  });

  test("should get single custom template", () => {
    assert.equal(contentsProvider.getCustomTemplate("Custom HTML Tag")?.templateId, "0");
  });
});