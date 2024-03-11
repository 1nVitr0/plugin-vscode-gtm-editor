import * as assert from "assert";
import { GtmFileSystemProvider } from "../../providers/GtmFileSystemProvider";
import { Uri, FileType, workspace } from "vscode";
import { GtmExportContentProvider } from "../../providers/GtmExportContentsProvider";
import { resolve } from "path";
import { before } from "mocha";

suite("Unit Tests for GtmFileSystemProvider", async () => {
  const fixtureDir = resolve(__dirname, "../../../test/fixtures");
  const fixturePath = resolve(fixtureDir, "wordpress.gtm-export.json");
  const fixtureFileUri = Uri.file(fixturePath);
  const gtmUri = Uri.from({
    scheme: "gtm",
    fragment: encodeURIComponent(encodeURIComponent(fixtureFileUri.toString())),
    path: "/",
  });
  const containerPath = "/accounts/124588580/containers/6899612";

  let gtmFileSystem: GtmFileSystemProvider;

  before(() => {
    gtmFileSystem = new GtmFileSystemProvider();
  });

  test("should create a GtmFileSystemProvider", async () => {
    const contentProvider = await gtmFileSystem.load(gtmUri);
    assert.ok(
      contentProvider instanceof GtmExportContentProvider,
      "Content provider is not an instance of GtmExportContentProvider"
    );
  });

  test("should stat folders", async () => {
    const folderUri = gtmUri.with({ path: `${containerPath}/_folders` });
    const folder = await gtmFileSystem.stat(folderUri);
    assert.equal(folder.type, FileType.Directory);
  });

  test("should stat container", async () => {
    const containerUri = gtmUri.with({ path: `${containerPath}/_container` });
    const container = await gtmFileSystem.stat(containerUri);
    assert.equal(container.type, FileType.Directory);
  });

  test("should stat tags", async () => {
    const tagsUri = gtmUri.with({ path: `${containerPath}/_tags` });
    const tags = await gtmFileSystem.stat(tagsUri);
    assert.equal(tags.type, FileType.Directory);
  });

  test("should stat triggers", async () => {
    const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers` });
    const triggers = await gtmFileSystem.stat(triggersUri);
    assert.equal(triggers.type, FileType.Directory);
  });

  test("should stat variables", async () => {
    const variablesUri = gtmUri.with({ path: `${containerPath}/_variables` });
    const variables = await gtmFileSystem.stat(variablesUri);
    assert.equal(variables.type, FileType.Directory);
  });

  test("should stat builtInVariables", async () => {
    const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables` });
    const builtInVariables = await gtmFileSystem.stat(builtInVariablesUri);
    assert.equal(builtInVariables.type, FileType.Directory);
  });

  test("should stat customTemplates", async () => {
    const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates` });
    const customTemplates = await gtmFileSystem.stat(customTemplatesUri);
    assert.equal(customTemplates.type, FileType.Directory);
  });

  test("should stat single folder globally", async () => {
    const folderUri = gtmUri.with({ path: `${containerPath}/_folders/GTM4WP.json` });
    const folder = await gtmFileSystem.stat(folderUri);
    assert.equal(folder.type, FileType.File);
  });

  test("should stat single tag globally", async () => {
    const tagUri = gtmUri.with({ path: `${containerPath}/_tags/UA Enhanced Ecommerce WOO.json` });
    const tag = await gtmFileSystem.stat(tagUri);
    assert.equal(tag.type, FileType.File);
  });

  test("should stat single trigger globally", async () => {
    const triggerUri = gtmUri.with({ path: `${containerPath}/_triggers/Ecommerce events.json` });
    const trigger = await gtmFileSystem.stat(triggerUri);
    assert.equal(trigger.type, FileType.File);
  });

  test("should stat single variable globally", async () => {
    const variableUri = gtmUri.with({ path: `${containerPath}/_variables/Reading - Time to Scroll.json` });
    const variable = await gtmFileSystem.stat(variableUri);
    assert.equal(variable.type, FileType.File);
  });

  test("should stat single builtInVariable globally", async () => {
    const builtInVariableUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Page URL.json` });
    const builtInVariable = await gtmFileSystem.stat(builtInVariableUri);
    assert.equal(builtInVariable.type, FileType.File);
  });

  test("should stat single customTemplate globally", async () => {
    const customTemplateUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Custom HTML Tag.json` });
    const customTemplate = await gtmFileSystem.stat(customTemplateUri);
    assert.equal(customTemplate.type, FileType.File);
  });

  test("should stat single tag in folder", async () => {
    const tagUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Enhanced Ecommerce WOO.json` });
    const tag = await gtmFileSystem.stat(tagUri);
    assert.equal(tag.type, FileType.File);
  });

  test("should stat single trigger in folder", async () => {
    const triggerUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Ecommerce events.json` });
    const trigger = await gtmFileSystem.stat(triggerUri);
    assert.equal(trigger.type, FileType.File);
  });

  test("should stat single variable in folder", async () => {
    const variableUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/Reading - Time to Scroll.json` });
    const variable = await gtmFileSystem.stat(variableUri);
    assert.equal(variable.type, FileType.File);
  });
});
