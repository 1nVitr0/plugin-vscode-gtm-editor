import * as assert from "assert";
import { GtmFileSystemProvider } from "../../providers/GtmFileSystemProvider";
import { Uri, FileType, workspace } from "vscode";
import { GtmExportContentProvider } from "../../providers/GtmExportContentsProvider";
import { resolve } from "path";
import { after, afterEach, before, beforeEach } from "mocha";

suite("Unit Tests for GtmFileSystemProvider", async () => {
  const fixtureDir = resolve(__dirname, "../../../test/fixtures");
  const fixturePath = resolve(fixtureDir, "wordpress.gtm-export.json");
  const fixtureUri = Uri.file(fixturePath);
  const gtmUri = Uri.from({
    scheme: "gtm",
    fragment: encodeURIComponent(encodeURIComponent(fixtureUri.toString())),
    path: "/",
  });
  const containerPath = "/accounts/124588580/containers/6899612";
  const containerItemTest = { accountId: "124588580", containerId: "6899612", name: "Test" };

  let gtmFileSystem: GtmFileSystemProvider;
  let originalContent = "";

  before(async () => {
    originalContent = (await workspace.fs.readFile(fixtureUri)).toString();
    gtmFileSystem = new GtmFileSystemProvider();
  });

  after(async () => {
    await workspace.fs.writeFile(fixtureUri, Buffer.from(originalContent));
  });

  test("should create a GtmFileSystemProvider", async () => {
    const contentProvider = await gtmFileSystem.load(gtmUri);
    assert.ok(
      contentProvider instanceof GtmExportContentProvider,
      "Content provider is not an instance of GtmExportContentProvider"
    );
  });

  //#region Unit Tests for GtmFileSystemProvider.stat

  suite("Unit Tests for GtmFileSystemProvider.stat", async () => {
    // Container
    test("should stat container globally", async () => {
      const containerUri = gtmUri.with({ path: `${containerPath}/_container` });
      const container = await gtmFileSystem.stat(containerUri);
      assert.equal(container.type, FileType.Directory);
    });

    test("should stat single container globally", async () => {
      const containerUri = gtmUri.with({ path: `${containerPath}/_container/GTM4WP.json` });
      const container = await gtmFileSystem.stat(containerUri);
      assert.equal(container.type, FileType.File);
    });

    // Folders
    test("should stat folders", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders` });
      const folder = await gtmFileSystem.stat(folderUri);
      assert.equal(folder.type, FileType.Directory);
    });

    test("should stat single folder", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/GTM4WP.json` });
      const folder = await gtmFileSystem.stat(folderUri);
      assert.equal(folder.type, FileType.File);
    });

    // Tags
    test("should stat tags globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags` });
      const tags = await gtmFileSystem.stat(tagsUri);
      assert.equal(tags.type, FileType.Directory);
    });

    test("should stat tags in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags` });
      const tags = await gtmFileSystem.stat(tagsUri);
      assert.equal(tags.type, FileType.Directory);
    });

    test("should stat single tag globally", async () => {
      const tagUri = gtmUri.with({ path: `${containerPath}/_tags/UA Contact Form 7 Submit.json` });
      const tag = await gtmFileSystem.stat(tagUri);
      assert.equal(tag.type, FileType.File);
    });

    test("should stat single tag in folder", async () => {
      const tagUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Form element Enter - Leave.json` });
      const tag = await gtmFileSystem.stat(tagUri);
      assert.equal(tag.type, FileType.File);
    });

    // Triggers
    test("should stat triggers globally", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers` });
      const triggers = await gtmFileSystem.stat(triggersUri);
      assert.equal(triggers.type, FileType.Directory);
    });

    test("should stat triggers in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers` });
      const triggers = await gtmFileSystem.stat(triggersUri);
      assert.equal(triggers.type, FileType.Directory);
    });

    test("should stat single trigger globally", async () => {
      const triggerUri = gtmUri.with({ path: `${containerPath}/_triggers/Contact Form 7 Submitted.json` });
      const trigger = await gtmFileSystem.stat(triggerUri);
      assert.equal(trigger.type, FileType.File);
    });

    test("should stat single trigger in folder", async () => {
      const triggerUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Form Element Enter.json` });
      const trigger = await gtmFileSystem.stat(triggerUri);
      assert.equal(trigger.type, FileType.File);
    });

    // Variables
    test("should stat variables globally", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables` });
      const variables = await gtmFileSystem.stat(variablesUri);
      assert.equal(variables.type, FileType.Directory);
    });

    test("should stat variables in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables` });
      const variables = await gtmFileSystem.stat(variablesUri);
      assert.equal(variables.type, FileType.Directory);
    });

    test("should stat single variable globally", async () => {
      const variableUri = gtmUri.with({ path: `${containerPath}/_variables/GA config - with ecommerce.json` });
      const variable = await gtmFileSystem.stat(variableUri);
      assert.equal(variable.type, FileType.File);
    });

    test("should stat single variable in folder", async () => {
      const variableUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/browserEngineName.json` });
      const variable = await gtmFileSystem.stat(variableUri);
      assert.equal(variable.type, FileType.File);
    });

    // Built-in Variables
    test("should stat builtInVariables", async () => {
      const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables` });
      const builtInVariables = await gtmFileSystem.stat(builtInVariablesUri);
      assert.equal(builtInVariables.type, FileType.Directory);
    });

    test("should stat single builtInVariable", async () => {
      const builtInVariableUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Page Hostname.json` });
      const builtInVariable = await gtmFileSystem.stat(builtInVariableUri);
      assert.equal(builtInVariable.type, FileType.File);
    });

    // Custom Templates
    test("should stat customTemplates", async () => {
      const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates` });
      const customTemplates = await gtmFileSystem.stat(customTemplatesUri);
      assert.equal(customTemplates.type, FileType.Directory);
    });

    test("should stat single customTemplate", async () => {
      const customTemplateUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Custom HTML Tag` });
      const customTemplate = await gtmFileSystem.stat(customTemplateUri);
      assert.equal(customTemplate.type, FileType.Directory);
    });

    test("should stat customTemplate section", async () => {
      const customTemplateSectionUri = gtmUri.with({
        path: `${containerPath}/_customTemplates/Custom HTML Tag/info.json`,
      });
      const customTemplate = await gtmFileSystem.stat(customTemplateSectionUri);
      assert.equal(customTemplate.type, FileType.File);
    });
  });

  //#region Unit Tests for GtmFileSystemProvider.readDirectory

  suite("Unit Tests for GtmFileSystemProvider.readDirectory", async () => {
    //Container
    test("should read container", async () => {
      const containerUri = gtmUri.with({ path: `${containerPath}/_container` });
      const container = await gtmFileSystem.readDirectory(containerUri);
      assert.equal(container.length, 1);
    });

    // Folders
    test("should read folders", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders` });
      const folders = await gtmFileSystem.readDirectory(folderUri);
      assert.equal(folders.length, 1);
    });

    // Tags
    test("should read tags globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags` });
      const tags = await gtmFileSystem.readDirectory(tagsUri);
      assert.equal(tags.length, 8);
    });

    test("should read tags in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags` });
      const tags = await gtmFileSystem.readDirectory(tagsUri);
      assert.equal(tags.length, 7);
    });

    // Triggers
    test("should read triggers globally", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers` });
      const triggers = await gtmFileSystem.readDirectory(triggersUri);
      assert.equal(triggers.length, 11);
    });

    test("should read triggers in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers` });
      const triggers = await gtmFileSystem.readDirectory(triggersUri);
      assert.equal(triggers.length, 10);
    });

    // Variables
    test("should read variables globally", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables` });
      const variables = await gtmFileSystem.readDirectory(variablesUri);
      assert.equal(variables.length, 57);
    });

    test("should read variables in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables` });
      const variables = await gtmFileSystem.readDirectory(variablesUri);
      assert.equal(variables.length, 56);
    });

    // Built-in Variables
    test("should read builtInVariables", async () => {
      const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables` });
      const builtInVariables = await gtmFileSystem.readDirectory(builtInVariablesUri);
      assert.equal(builtInVariables.length, 5);
    });

    // Custom Templates
    test("should read customTemplates", async () => {
      const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates` });
      const customTemplates = await gtmFileSystem.readDirectory(customTemplatesUri);
      assert.equal(customTemplates.length, 1);
    });

    test("should read customTemplate sections", async () => {
      const customTemplateSectionUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Custom HTML Tag` });
      const customTemplate = await gtmFileSystem.readDirectory(customTemplateSectionUri);
      assert.equal(customTemplate.length, 7);
    });
  });

  //#region Unit Tests for GtmFileSystemProvider.readFile

  suite("Unit Tests for GtmFileSystemProvider.readFile", async () => {
    // Container
    test("should read container", async () => {
      const containerUri = gtmUri.with({ path: `${containerPath}/_container/gtm4wp container - WIP.json` });
      const container = await gtmFileSystem.readFile(containerUri);
      assert.ok(Buffer.isBuffer(container), "Container is not a buffer");
    });

    // Folders
    test("should read folders", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/GTM4WP.json` });
      const folder = await gtmFileSystem.readFile(folderUri);
      assert.ok(Buffer.isBuffer(folder), "Folder is not a buffer");
    });

    test("should throw error if folder does not exist", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/NonExistentFolder.json` });
      await assert.rejects(gtmFileSystem.readFile(folderUri), "Expected EntryNotFound Exception");
    });

    // Tags
    test("should read tags globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/UA Contact Form 7 Submit.json` });
      const tags = await gtmFileSystem.readFile(tagsUri);
      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
    });

    test("should read tags in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Form element Enter - Leave.json` });
      const tags = await gtmFileSystem.readFile(tagsUri);
      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
    });

    test("should throw error if tag does not exist", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/NonExistentTag.json` });
      await assert.rejects(gtmFileSystem.readFile(tagsUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if tag does not exist in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Contact Form 7 Submit.json` });
      await assert.rejects(gtmFileSystem.readFile(tagsUri), "Expected EntryNotFound Exception");
    });

    // Triggers
    test("should read triggers globally", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/Contact Form 7 Submitted.json` });
      const triggers = await gtmFileSystem.readFile(triggersUri);
      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
    });

    test("should read triggers in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Form Element Enter.json` });
      const triggers = await gtmFileSystem.readFile(triggersUri);
      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
    });

    test("should throw error if trigger does not exist", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/NonExistentTrigger.json` });
      await assert.rejects(gtmFileSystem.readFile(triggersUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if trigger does not exist in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Contact Form 7 Submitted.json` });
      await assert.rejects(gtmFileSystem.readFile(triggersUri), "Expected EntryNotFound Exception");
    });

    // Variables
    test("should read variables globally", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/GA config - with ecommerce.json` });
      const variables = await gtmFileSystem.readFile(variablesUri);
      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
    });

    test("should read variables in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/browserEngineName.json` });
      const variables = await gtmFileSystem.readFile(variablesUri);
      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
    });

    test("should throw error if variable does not exist", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/NonExistentVariable.json` });
      await assert.rejects(gtmFileSystem.readFile(variablesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if variable does not exist in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/GA config - with ecommerce.json` });
      await assert.rejects(gtmFileSystem.readFile(variablesUri), "Expected EntryNotFound Exception");
    });

    // Built-in Variables
    test("should read builtInVariables", async () => {
      const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Page Hostname.json` });
      const builtInVariables = await gtmFileSystem.readFile(builtInVariablesUri);
      assert.ok(Buffer.isBuffer(builtInVariables), "BuiltInVariables is not a buffer");
    });

    test("should throw error if builtInVariable does not exist", async () => {
      const builtInVariablesUri = gtmUri.with({
        path: `${containerPath}/_builtInVariables/NonExistentBuiltInVariable.json`,
      });
      await assert.rejects(gtmFileSystem.readFile(builtInVariablesUri), "Expected EntryNotFound Exception");
    });

    // Custom Templates
    test("should read customTemplate section", async () => {
      const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Custom HTML Tag/info.json` });
      const customTemplates = await gtmFileSystem.readFile(customTemplatesUri);
      assert.ok(Buffer.isBuffer(customTemplates), "CustomTemplates is not a buffer");
    });

    test("should throw error if customTemplate does not exist", async () => {
      const customTemplatesUri = gtmUri.with({
        path: `${containerPath}/_customTemplates/NonExistentCustomTemplate`,
      });
      await assert.rejects(gtmFileSystem.readFile(customTemplatesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if customTemplate section does not exist", async () => {
      const customTemplatesUri = gtmUri.with({
        path: `${containerPath}/_customTemplates/Custom HTML Tag/nonExistentSection.json`,
      });
      await assert.rejects(gtmFileSystem.readFile(customTemplatesUri), "Expected EntryNotFound Exception");
    });
  });

  //#region Unit Tests for GtmFileSystemProvider.writeFile

  suite("Unit Tests for GtmFileSystemProvider.writeFile", async () => {
    beforeEach(async () => {
      await gtmFileSystem.load(gtmUri, true);
    });

    afterEach(async () => {
      await workspace.fs.writeFile(fixtureUri, Buffer.from(originalContent));
      await new Promise((r) => setTimeout(r, 50));
    });

    // Container
    test("should write container", async () => {
      const containerUri = gtmUri.with({ path: `${containerPath}/_container/gtm4wp container - WIP.json` });
      const originalContent = await gtmFileSystem.readFile(containerUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(containerUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const container = await gtmFileSystem.readFile(containerUri);

      assert.ok(Buffer.isBuffer(container), "Container is not a buffer");
      assert.deepEqual(JSON.parse(container.toString()), JSON.parse(testContent));
    });

    // Folders
    test("should write folders", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/GTM4WP.json` });
      const originalContent = await gtmFileSystem.readFile(folderUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(folderUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const folder = await gtmFileSystem.readFile(folderUri);

      assert.ok(Buffer.isBuffer(folder), "Folder is not a buffer");
      assert.deepEqual(JSON.parse(folder.toString()), JSON.parse(testContent));
    });

    test("should create new folder", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/Test.json` });
      const containerItemTestContent = JSON.stringify(containerItemTest);
      await gtmFileSystem.writeFile(folderUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: false,
      });
      const folder = await gtmFileSystem.readFile(folderUri);

      assert.ok(Buffer.isBuffer(folder), "Folder is not a buffer");
      assert.deepEqual(JSON.parse(folder.toString()), JSON.parse(containerItemTestContent));
    });

    // Tags
    test("should write tags globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/UA Contact Form 7 Submit.json` });
      const originalContent = await gtmFileSystem.readFile(tagsUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(tagsUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const tags = await gtmFileSystem.readFile(tagsUri);

      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
      assert.deepEqual(JSON.parse(tags.toString()), JSON.parse(testContent));
    });

    test("should write tags in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Form element Enter - Leave.json` });
      const originalContent = await gtmFileSystem.readFile(tagsUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(tagsUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const tags = await gtmFileSystem.readFile(tagsUri);

      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
      assert.deepEqual(JSON.parse(tags.toString()), JSON.parse(testContent));
    });

    test("should create new tag globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/Test.json` });
      const containerItemTestContent = JSON.stringify(containerItemTest);
      await gtmFileSystem.writeFile(tagsUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: false,
      });
      const tags = await gtmFileSystem.readFile(tagsUri);

      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
      assert.deepEqual(JSON.parse(tags.toString()), JSON.parse(containerItemTestContent));
    });

    test("should create new tag in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/Test.json` });
      const containerItemTestContent = JSON.stringify({ ...containerItemTest, parentFolderId: "14" });
      await gtmFileSystem.writeFile(tagsUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: true,
      });
      const tags = await gtmFileSystem.readFile(tagsUri);

      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
      assert.deepEqual(JSON.parse(tags.toString()), JSON.parse(containerItemTestContent));
    });

    // Triggers
    test("should write triggers globally", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/Contact Form 7 Submitted.json` });
      const originalContent = await gtmFileSystem.readFile(triggersUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(triggersUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const triggers = await gtmFileSystem.readFile(triggersUri);

      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
      assert.deepEqual(JSON.parse(triggers.toString()), JSON.parse(testContent));
    });

    test("should write triggers in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Form Element Enter.json` });
      const originalContent = await gtmFileSystem.readFile(triggersUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(triggersUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const triggers = await gtmFileSystem.readFile(triggersUri);

      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
      assert.deepEqual(JSON.parse(triggers.toString()), JSON.parse(testContent));
    });

    test("should create new trigger globally", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/Test.json` });
      const containerItemTestContent = JSON.stringify(containerItemTest);
      await gtmFileSystem.writeFile(triggersUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: false,
      });
      const triggers = await gtmFileSystem.readFile(triggersUri);

      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
      assert.deepEqual(JSON.parse(triggers.toString()), JSON.parse(containerItemTestContent));
    });

    test("should create new trigger in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Test.json` });
      const containerItemTestContent = JSON.stringify({ ...containerItemTest, parentFolderId: "14" });
      await gtmFileSystem.writeFile(triggersUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: false,
      });
      const triggers = await gtmFileSystem.readFile(triggersUri);

      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
      assert.deepEqual(JSON.parse(triggers.toString()), JSON.parse(containerItemTestContent));
    });

    // Variables
    test("should write variables globally", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/GA config - with ecommerce.json` });
      const originalContent = await gtmFileSystem.readFile(variablesUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(variablesUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const variables = await gtmFileSystem.readFile(variablesUri);

      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
      assert.deepEqual(JSON.parse(variables.toString()), JSON.parse(testContent));
    });

    test("should write variables in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/browserEngineName.json` });
      const originalContent = await gtmFileSystem.readFile(variablesUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(variablesUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const variables = await gtmFileSystem.readFile(variablesUri);

      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
      assert.deepEqual(JSON.parse(variables.toString()), JSON.parse(testContent));
    });

    test("should create new variable globally", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/Test.json` });
      const containerItemTestContent = JSON.stringify(containerItemTest);
      await gtmFileSystem.writeFile(variablesUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: false,
      });
      const variables = await gtmFileSystem.readFile(variablesUri);

      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
      assert.deepEqual(JSON.parse(variables.toString()), JSON.parse(containerItemTestContent));
    });

    test("should create new variable in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/Test.json` });
      const containerItemTestContent = JSON.stringify({ ...containerItemTest, parentFolderId: "14" });
      await gtmFileSystem.writeFile(variablesUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: false,
      });
      const variables = await gtmFileSystem.readFile(variablesUri);

      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
      assert.deepEqual(JSON.parse(variables.toString()), JSON.parse(containerItemTestContent));
    });

    // Built-in Variables
    test("should write builtInVariables", async () => {
      const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Page Hostname.json` });
      const originalContent = await gtmFileSystem.readFile(builtInVariablesUri);
      const testContent = originalContent.toString().replace(/\}$/, ',"test":true}');

      await gtmFileSystem.writeFile(builtInVariablesUri, Buffer.from(testContent, "utf-8"), {
        create: false,
        overwrite: true,
      });
      const builtInVariables = await gtmFileSystem.readFile(builtInVariablesUri);

      assert.ok(Buffer.isBuffer(builtInVariables), "BuiltInVariables is not a buffer");
      assert.deepEqual(JSON.parse(builtInVariables.toString()), JSON.parse(testContent));
    });

    test("should create new builtInVariable", async () => {
      const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Test.json` });
      const containerItemTestContent = JSON.stringify(containerItemTest);
      await gtmFileSystem.writeFile(builtInVariablesUri, Buffer.from(containerItemTestContent, "utf-8"), {
        create: true,
        overwrite: true,
      });
      const builtInVariables = await gtmFileSystem.readFile(builtInVariablesUri);

      assert.ok(Buffer.isBuffer(builtInVariables), "BuiltInVariables is not a buffer");
      assert.deepEqual(JSON.parse(builtInVariables.toString()), JSON.parse(containerItemTestContent));
    });

    test("should create new customTemplate", async () => {
      const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Test` });
      const customTemplateBaseUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Test/Test.json` });
      const containerItemTestContent = JSON.stringify(containerItemTest);
      await gtmFileSystem.createDirectory(customTemplatesUri);
      const customTemplates = await gtmFileSystem.readFile(customTemplateBaseUri);

      assert.ok(Buffer.isBuffer(customTemplates), "CustomTemplates is not a buffer");
      assert.deepEqual(JSON.parse(customTemplates.toString()), JSON.parse(containerItemTestContent));
    });

    test("should create new customTemplate section", async () => {
      const customTemplateSectionUri = gtmUri.with({
        path: `${containerPath}/_customTemplates/Custom HTML Tag/termsOfService.json`,
      });
      await gtmFileSystem.writeFile(customTemplateSectionUri, Buffer.from("Test\n", "utf-8"), {
        create: true,
        overwrite: false,
      });
      const customTemplateSection = await gtmFileSystem.readFile(customTemplateSectionUri);

      assert.ok(Buffer.isBuffer(customTemplateSection), "CustomTemplateSection is not a buffer");
      assert.equal(customTemplateSection.toString(), "Test\n");
    });
  });

  //#region Unit Tests for GtmFileSystemProvider.createDirectory

  suite("Unit Tests for GtmFileSystemProvider.createDirectory", async () => {
    // Custom Templates
    test("should create customTemplate directory", async () => {
      const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Custom HTML Tag` });

      await gtmFileSystem.createDirectory(customTemplatesUri);
      const customTemplates = await gtmFileSystem.readDirectory(customTemplatesUri);

      assert.deepEqual(customTemplates, [["Custom HTML Tag.json", FileType.File]]);
    });
  });

  //#region Unit Tests for GtmFileSystemProvider.delete

  suite("Unit Tests for GtmFileSystemProvider.delete", async () => {
    beforeEach(async () => {
      await gtmFileSystem.load(gtmUri, true);
    });

    afterEach(async () => {
      await workspace.fs.writeFile(fixtureUri, Buffer.from(originalContent));
      await new Promise((r) => setTimeout(r, 50));
    });

    // Container
    test("should throw error on deleting container", async () => {
      const containerUri = gtmUri.with({ path: `${containerPath}/_container/GTM4WP.json` });
      await assert.rejects(
        gtmFileSystem.delete(containerUri, { recursive: false }),
        "Expected EntryNotFound Exception"
      );
    });

    // Folders
    test("should throw error on deleting folder files", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/GTM4WP.json` });
      await assert.rejects(gtmFileSystem.delete(folderUri, { recursive: false }), "Expected EntryNotFound Exception");
    });

    test("should throw error if folder does not exist", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/NonExistentFolder.json` });
      await assert.rejects(gtmFileSystem.delete(folderUri, { recursive: false }), "Expected EntryNotFound Exception");
    });

    // Tags
    test("should delete tags globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/UA Contact Form 7 Submit.json` });
      await gtmFileSystem.delete(tagsUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(tagsUri), "Expected EntryNotFound Exception");
    });

    test("should delete tags in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Form element Enter - Leave.json` });
      await gtmFileSystem.delete(tagsUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(tagsUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if tag does not exist", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/NonExistentTag.json` });
      await assert.rejects(gtmFileSystem.delete(tagsUri, { recursive: false }), "Expected EntryNotFound Exception");
    });

    test("should throw error if tag does not exist in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Contact Form 7 Submit.json` });
      await assert.rejects(gtmFileSystem.delete(tagsUri, { recursive: false }), "Expected EntryNotFound Exception");
    });

    // Triggers
    test("should delete triggers globally", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/Contact Form 7 Submitted.json` });
      await gtmFileSystem.delete(triggersUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(triggersUri), "Expected EntryNotFound Exception");
    });

    test("should delete triggers in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Form Element Enter.json` });
      await gtmFileSystem.delete(triggersUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(triggersUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if trigger does not exist", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/NonExistentTrigger.json` });
      await assert.rejects(gtmFileSystem.delete(triggersUri, { recursive: false }), "Expected EntryNotFound Exception");
    });

    test("should throw error if trigger does not exist in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Contact Form 7 Submitted.json` });
      await assert.rejects(gtmFileSystem.delete(triggersUri, { recursive: false }), "Expected EntryNotFound Exception");
    });

    // Variables
    test("should delete variables globally", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/GA config - with ecommerce.json` });
      await gtmFileSystem.delete(variablesUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(variablesUri), "Expected EntryNotFound Exception");
    });

    test("should delete variables in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/browserEngineName.json` });
      await gtmFileSystem.delete(variablesUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(variablesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if variable does not exist", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/NonExistentVariable.json` });
      await assert.rejects(
        gtmFileSystem.delete(variablesUri, { recursive: false }),
        "Expected EntryNotFound Exception"
      );
    });

    test("should throw error if variable does not exist in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/GA config - with ecommerce.json` });
      await assert.rejects(
        gtmFileSystem.delete(variablesUri, { recursive: false }),
        "Expected EntryNotFound Exception"
      );
    });

    // Built-in Variables
    test("should delete builtInVariables", async () => {
      const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Page Hostname.json` });
      await gtmFileSystem.delete(builtInVariablesUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(builtInVariablesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if builtInVariable does not exist", async () => {
      const builtInVariablesUri = gtmUri.with({
        path: `${containerPath}/_builtInVariables/NonExistentBuiltInVariable.json`,
      });
      await assert.rejects(
        gtmFileSystem.delete(builtInVariablesUri, { recursive: false }),
        "Expected EntryNotFound Exception"
      );
    });

    // Custom Templates
    test("should delete customTemplates", async () => {
      const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Custom HTML Tag.json` });
      await gtmFileSystem.delete(customTemplatesUri, { recursive: false });
      await assert.rejects(gtmFileSystem.readFile(customTemplatesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if customTemplate does not exist", async () => {
      const customTemplatesUri = gtmUri.with({
        path: `${containerPath}/_customTemplates/NonExistentCustomTemplate.json`,
      });
      await assert.rejects(
        gtmFileSystem.delete(customTemplatesUri, { recursive: false }),
        "Expected EntryNotFound Exception"
      );
    });
  });

  //#region Unit Tests for GtmFileSystemProvider.rename

  suite("Unit Tests for GtmFileSystemProvider.rename", async () => {
    beforeEach(async () => {
      await gtmFileSystem.load(gtmUri, true);
    });

    afterEach(async () => {
      await workspace.fs.writeFile(fixtureUri, Buffer.from(originalContent));
      await new Promise((r) => setTimeout(r, 50));
    });

    // Container
    test("should rename container", async () => {
      const containerUri = gtmUri.with({ path: `${containerPath}/_container/gtm4wp container - WIP.json` });
      const newContainerUri = gtmUri.with({ path: `${containerPath}/_container/Test.json` });
      await gtmFileSystem.rename(containerUri, newContainerUri, { overwrite: true });
      const container = await gtmFileSystem.readFile(newContainerUri);

      assert.ok(Buffer.isBuffer(container), "Container is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(containerUri), "Expected EntryNotFound Exception");
    });

    // Folders
    test("should rename folders", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/GTM4WP.json` });
      const newFolderUri = gtmUri.with({ path: `${containerPath}/_folders/Test.json` });
      await gtmFileSystem.rename(folderUri, newFolderUri, { overwrite: true });
      const folder = await gtmFileSystem.readFile(newFolderUri);

      assert.ok(Buffer.isBuffer(folder), "Folder is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(folderUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if folder does not exist", async () => {
      const folderUri = gtmUri.with({ path: `${containerPath}/_folders/NonExistentFolder.json` });
      const newFolderUri = gtmUri.with({ path: `${containerPath}/_folders/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(folderUri, newFolderUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    // Tags
    test("should rename tags globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/UA Contact Form 7 Submit.json` });
      const newTagsUri = gtmUri.with({ path: `${containerPath}/_tags/Test.json` });
      await gtmFileSystem.rename(tagsUri, newTagsUri, { overwrite: true });
      const tags = await gtmFileSystem.readFile(newTagsUri);

      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(tagsUri), "Expected EntryNotFound Exception");
    });

    test("should rename tags in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Form element Enter - Leave.json` });
      const newTagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/Test.json` });
      await gtmFileSystem.rename(tagsUri, newTagsUri, { overwrite: true });
      const tags = await gtmFileSystem.readFile(newTagsUri);

      assert.ok(Buffer.isBuffer(tags), "Tags is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(tagsUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if tag does not exist", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/NonExistentTag.json` });
      const newTagsUri = gtmUri.with({ path: `${containerPath}/_tags/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(tagsUri, newTagsUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    test("should throw error if tag does not exist in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Contact Form 7 Submit.json` });
      const newTagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(tagsUri, newTagsUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    // Triggers
    test("should rename triggers globally", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/Contact Form 7 Submitted.json` });
      const newTriggersUri = gtmUri.with({ path: `${containerPath}/_triggers/Test.json` });
      await gtmFileSystem.rename(triggersUri, newTriggersUri, { overwrite: true });
      const triggers = await gtmFileSystem.readFile(newTriggersUri);

      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(triggersUri), "Expected EntryNotFound Exception");
    });

    test("should rename triggers in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Form Element Enter.json` });
      const newTriggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Test.json` });
      await gtmFileSystem.rename(triggersUri, newTriggersUri, { overwrite: true });
      const triggers = await gtmFileSystem.readFile(newTriggersUri);

      assert.ok(Buffer.isBuffer(triggers), "Triggers is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(triggersUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if trigger does not exist", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/_triggers/NonExistentTrigger.json` });
      const newTriggersUri = gtmUri.with({ path: `${containerPath}/_triggers/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(triggersUri, newTriggersUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    test("should throw error if trigger does not exist in folder", async () => {
      const triggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Contact Form 7 Submitted.json` });
      const newTriggersUri = gtmUri.with({ path: `${containerPath}/GTM4WP/triggers/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(triggersUri, newTriggersUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    // Variables
    test("should rename variables globally", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/GA config - with ecommerce.json` });
      const newVariablesUri = gtmUri.with({ path: `${containerPath}/_variables/Test.json` });
      await gtmFileSystem.rename(variablesUri, newVariablesUri, { overwrite: true });
      const variables = await gtmFileSystem.readFile(newVariablesUri);

      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(variablesUri), "Expected EntryNotFound Exception");
    });

    test("should rename variables in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/browserEngineName.json` });
      const newVariablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/Test.json` });
      await gtmFileSystem.rename(variablesUri, newVariablesUri, { overwrite: true });
      const variables = await gtmFileSystem.readFile(newVariablesUri);

      assert.ok(Buffer.isBuffer(variables), "Variables is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(variablesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if variable does not exist", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/_variables/NonExistentVariable.json` });
      const newVariablesUri = gtmUri.with({ path: `${containerPath}/_variables/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(variablesUri, newVariablesUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    test("should throw error if variable does not exist in folder", async () => {
      const variablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/GA config - with ecommerce.json` });
      const newVariablesUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(variablesUri, newVariablesUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    // Built-in Variables
    test("should rename builtInVariables", async () => {
      const builtInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Page Hostname.json` });
      const newBuiltInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Test.json` });
      await gtmFileSystem.rename(builtInVariablesUri, newBuiltInVariablesUri, { overwrite: true });
      const builtInVariables = await gtmFileSystem.readFile(newBuiltInVariablesUri);

      assert.ok(Buffer.isBuffer(builtInVariables), "BuiltInVariables is not a buffer");
      await assert.rejects(gtmFileSystem.readFile(builtInVariablesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if builtInVariable does not exist", async () => {
      const builtInVariablesUri = gtmUri.with({
        path: `${containerPath}/_builtInVariables/NonExistentBuiltInVariable.json`,
      });
      const newBuiltInVariablesUri = gtmUri.with({ path: `${containerPath}/_builtInVariables/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(builtInVariablesUri, newBuiltInVariablesUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    // Custom Templates
    test("should rename customTemplates", async () => {
      const customTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Custom HTML Tag` });
      const newCustomTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Test` });
      await gtmFileSystem.rename(customTemplatesUri, newCustomTemplatesUri, { overwrite: true });
      const customTemplates = await gtmFileSystem.readDirectory(newCustomTemplatesUri);

      assert.ok(customTemplates.length, "CustomTemplates is empty");
      await assert.rejects(gtmFileSystem.readDirectory(customTemplatesUri), "Expected EntryNotFound Exception");
    });

    test("should throw error if customTemplate does not exist", async () => {
      const customTemplatesUri = gtmUri.with({
        path: `${containerPath}/_customTemplates/NonExistentCustomTemplate.json`,
      });
      const newCustomTemplatesUri = gtmUri.with({ path: `${containerPath}/_customTemplates/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(customTemplatesUri, newCustomTemplatesUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    // Switching Types
    test("should throw error if types are switched globally", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/_tags/UA Contact Form 7 Submit.json` });
      const newTagsUri = gtmUri.with({ path: `${containerPath}/_folders/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(tagsUri, newTagsUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });

    test("should throw error if types are switched in folder", async () => {
      const tagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/tags/UA Form element Enter - Leave.json` });
      const newTagsUri = gtmUri.with({ path: `${containerPath}/GTM4WP/variables/Test.json` });
      await assert.rejects(
        gtmFileSystem.rename(tagsUri, newTagsUri, { overwrite: true }),
        "Expected EntryNotFound Exception"
      );
    });
  });
});
