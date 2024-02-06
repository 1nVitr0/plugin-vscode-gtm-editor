import {
  Disposable,
  Event,
  EventEmitter,
  FileChangeEvent,
  FileChangeType,
  FileStat,
  FileSystemError,
  FileSystemProvider,
  FileType,
  Uri,
  window,
  workspace,
} from "vscode";
import { GtmExportContentProvider } from "./GtmExportContentsProvider";
import { GtmPath } from "../types/GtmPath";
import { GtmPropertyWithFolder } from "../types/gtm/GtmPropertyWithFolder";
import { GtmFolder } from "../types/gtm/GtmFolder";
import { GtmTag } from "../types/gtm/GtmTag";
import { GtmTrigger } from "../types/gtm/GtmTrigger";
import { GtmVariable } from "../types/gtm/GtmVariable";
import { GtmBuiltInVariable } from "../types/gtm/GtmBuiltInVariable";
import { GtmCustomTemplate } from "../types/gtm/GtmCustomTemplate";
import { GtmContainer } from "../types/gtm/GtmContainer";

export class GtmFileSystemProvider implements FileSystemProvider {
  public static scheme = "gtm";

  private _contentProviders: Map<string, GtmExportContentProvider | Promise<GtmExportContentProvider>> = new Map();
  private _emitter = new EventEmitter<FileChangeEvent[]>();
  private _bufferedEvents: FileChangeEvent[] = [];
  private _fireSoonHandle?: NodeJS.Timer;

  readonly onDidChangeFile: Event<FileChangeEvent[]> = this._emitter.event;

  static async openSource(sourceUri: Uri) {
    try {
      const stat = await workspace.fs.stat(sourceUri);
      if (stat.type === FileType.Directory) throw FileSystemError.FileIsADirectory(sourceUri);
    } catch (error) {
      if (error instanceof FileSystemError) window.showErrorMessage(error.message);
      throw error;
    }

    const content = await workspace.fs.readFile(sourceUri);
    const { exportTime } = JSON.parse(content.toString());

    workspace.updateWorkspaceFolders(0, 0, {
      name: `GTM Export ${exportTime}`,
      uri: GtmFileSystemProvider.buildPath({ sourceUri }),
    });
  }

  private static encodeAuthorityUri(uri: Uri): string {
    return encodeURIComponent(encodeURIComponent(uri.toString()));
  }

  private static decodeAuthorityUri(uri: string): Uri {
    return Uri.parse(decodeURIComponent(decodeURIComponent(uri)), true);
  }

  private static buildPath({
    sourceUri,
    accountId,
    containerId,
    folder,
    itemType,
    itemName,
    accounts,
    containers,
  }: GtmPath): Uri {
    const paths = [];
    if (accounts || accountId) paths.push("accounts");
    if (accountId) paths.push(accountId);
    if (containers || containerId) paths.push("containers");
    if (containerId) paths.push(containerId);
    if (folder) paths.push(folder);
    if (itemType) paths.push(itemType);
    if (itemName) paths.push(itemName);

    const { scheme } = GtmFileSystemProvider;
    const fragment = GtmFileSystemProvider.encodeAuthorityUri(sourceUri);
    const path = `/${paths.join("/")}`;

    return Uri.from({ scheme, fragment, path });
  }

  async load(uri: Uri): Promise<GtmExportContentProvider> {
    const { fragment } = uri;
    const sourceUri = GtmFileSystemProvider.decodeAuthorityUri(fragment);
    const rootUri = GtmFileSystemProvider.buildPath({ sourceUri });
    const sourceKey = sourceUri.toString();

    if (this._contentProviders.has(sourceKey)) return await this._contentProviders.get(sourceKey)!;

    const providerPromise = new Promise<GtmExportContentProvider>(async (resolve, reject) => {
      try {
        const stat = await workspace.fs.stat(sourceUri);
        if (stat.type === FileType.Directory) throw FileSystemError.FileIsADirectory(sourceUri);
      } catch (error) {
        if (error instanceof FileSystemError) window.showErrorMessage(error.message);
        return reject(error);
      }

      const content = await workspace.fs.readFile(sourceUri);
      const contentProvider = new GtmExportContentProvider(sourceUri, content.toString());
      this._contentProviders.set(sourceKey, contentProvider);
      this._fireSoon({ type: FileChangeType.Created, uri: rootUri });

      resolve(contentProvider);
    });

    this._contentProviders.set(sourceKey, providerPromise);
    const contentProvider = await providerPromise;

    // reload on sourceUri change
    workspace.onDidSaveTextDocument(async (document) => {
      if (document.uri.toString() === sourceUri.toString()) {
        await contentProvider.reload();
        this._fireSoon({ type: FileChangeType.Changed, uri: rootUri });
      }
    });

    return contentProvider;
  }

  watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[] }): Disposable {
    // ignore, fires for all changes...
    return new Disposable(() => {});
  }

  async stat(uri: Uri): Promise<FileStat> {
    const content = await this.load(uri);
    const { accountId, containerId, folder, itemType, itemName } = await this.resolvePath(uri);

    const ctime = content.exportTime.getTime();
    const mtime = content.updateTime.getTime();

    if (accountId && accountId !== content.accountId) throw FileSystemError.FileNotFound(uri);
    if (containerId && containerId !== content.containerId) throw FileSystemError.FileNotFound(uri);

    if (itemName) {
      const data =
        itemType === "folders"
          ? content.getFolder(itemName)
          : itemType === "container"
          ? content.getContainer()
          : itemType === "tags"
          ? content.getTag(folder, itemName)
          : itemType === "triggers"
          ? content.getTrigger(folder, itemName)
          : itemType === "variables"
          ? content.getVariable(folder, itemName)
          : itemType === "builtInVariables"
          ? content.getBuiltInVariable(itemName)
          : itemType === "customTemplates"
          ? content.getCustomTemplate(itemName)
          : null;
      const size = data ? JSON.stringify(data).length : 0;

      if (!data) throw FileSystemError.FileNotFound(uri);
      return { type: FileType.File, ctime, mtime, size };
    } else if (folder) {
      const folders = content.getFolder().map((f) => f.name);

      if (!folders.includes(folder)) throw FileSystemError.FileNotFound(uri);
      return { type: FileType.Directory, ctime, mtime, size: 0 };
    } else {
      return { type: FileType.Directory, ctime, mtime, size: 0 };
    }
  }

  async readDirectory(uri: Uri): Promise<[string, FileType][]> {
    const content = await this.load(uri);
    const { accountId, containerId, folder, itemType, accounts, containers, itemName } = await this.resolvePath(uri);

    if (itemName) throw FileSystemError.FileNotADirectory(uri);
    if (!accounts) return [["accounts", FileType.Directory]];
    if (!accountId) return [[content.accountId, FileType.Directory]];
    if (!containers) return [["containers", FileType.Directory]];
    if (!containerId) return [[content.containerId, FileType.Directory]];

    if (itemType) {
      switch (itemType) {
        case "folders":
          return content.getFolder().map((t) => [`${t.name}.json`, FileType.File]);
        case "container":
          return [[`${content.getContainer().name}.json`, FileType.File]];
        case "tags":
          return content.getTag(folder).map((t) => [`${t.name}.json`, FileType.File]);
        case "triggers":
          return content.getTrigger(folder).map((t) => [`${t.name}.json`, FileType.File]);
        case "variables":
          return content.getVariable(folder).map((t) => [`${t.name}.json`, FileType.File]);
        case "builtInVariables":
          return content.getBuiltInVariable().map((t) => [`${t.name}.json`, FileType.File]);
        case "customTemplates":
          return content.getCustomTemplate().map((t) => [`${t.name}.json`, FileType.File]);
        default:
          return [];
      }
    } else if (folder) {
      return [
        ["tags", FileType.Directory],
        ["triggers", FileType.Directory],
        ["variables", FileType.Directory],
      ];
    } else {
      return [
        ...content.getFolder().map((t): [string, FileType] => [t.name, FileType.Directory]),
        ["_container", FileType.Directory],
        ["_folders", FileType.Directory],
        ["_tags", FileType.Directory],
        ["_triggers", FileType.Directory],
        ["_variables", FileType.Directory],
        ["_builtInVariables", FileType.Directory],
        ["_customTemplates", FileType.Directory],
      ];
    }
  }

  createDirectory(uri: Uri): void {
    throw new Error("Method not implemented.");
  }

  async readFile(uri: Uri): Promise<Uint8Array> {
    const content = await this.load(uri);
    const stat = await this.stat(uri); // Will throw error if it doesn't exist
    const { accountId, containerId, folder, itemType, itemName } = await this.resolvePath(uri);

    if (stat.type === FileType.Directory) throw FileSystemError.FileIsADirectory(uri);
    if (!accountId || !containerId || !itemType || !itemName) throw FileSystemError.FileNotFound(uri);

    switch (itemType) {
      case "folders":
        return Buffer.from(JSON.stringify(content.getFolder(itemName), null, 2));
      case "container":
        const container = content.getContainer();
        if (itemName !== container.name) throw FileSystemError.FileNotFound(uri);
        return Buffer.from(JSON.stringify(container, null, 2));
      case "tags":
        return Buffer.from(JSON.stringify(content.getTag(folder, itemName), null, 2));
      case "triggers":
        return Buffer.from(JSON.stringify(content.getTrigger(folder, itemName), null, 2));
      case "variables":
        return Buffer.from(JSON.stringify(content.getVariable(folder, itemName), null, 2));
      case "builtInVariables":
        return Buffer.from(JSON.stringify(content.getBuiltInVariable(itemName), null, 2));
      case "customTemplates":
        return Buffer.from(JSON.stringify(content.getCustomTemplate(itemName), null, 2));
      default:
        throw FileSystemError.FileNotFound(uri);
    }
  }

  async writeFile(
    uri: Uri,
    data: Uint8Array,
    { create, overwrite }: { readonly create: boolean; readonly overwrite: boolean }
  ): Promise<void> {
    const content = await this.load(uri);
    const original = await this.readFile(uri).catch((e) => {
      if (e instanceof FileSystemError && e.code === "FileNotFound") return null;
      else throw e;
    });
    const path = await this.resolvePath(uri);
    const { sourceUri, accounts, accountId, containers, containerId, itemType, itemName } = path;

    if (original && !overwrite) throw FileSystemError.FileExists(uri);
    if (!accountId || !containerId || !itemType || !itemName) throw FileSystemError.Unavailable(uri);

    const item = JSON.parse(data.toString()) as GtmPropertyWithFolder;
    const originalItem = original ? (JSON.parse(original.toString()) as GtmPropertyWithFolder) : null;
    const event = { type: create ? FileChangeType.Created : FileChangeType.Changed, uri };

    if (originalItem && (item.accountId !== originalItem.accountId || item.containerId !== originalItem.containerId)) {
      window.showErrorMessage(`Cannot change account or container ID on a ${itemType ?? "file"} basis`);
      throw FileSystemError.Unavailable(uri);
    }

    switch (itemType) {
      case "folders":
        if (originalItem && originalItem.name !== item.name) {
          const baseFolderEvent = { sourceUri, accountId, accounts, containerId, containers };
          this._fireSoon(
            event,
            {
              type: FileChangeType.Deleted,
              uri: GtmFileSystemProvider.buildPath({ ...baseFolderEvent, folder: originalItem.name }),
            },
            {
              type: FileChangeType.Created,
              uri: GtmFileSystemProvider.buildPath({ ...baseFolderEvent, folder: item.name }),
            }
          );
        }

        content.setFolder(itemName, item as GtmFolder);
        this._fireSoon(event);
        break;
      case "container":
        content.setContainer(item as GtmContainer);
        this._fireSoon(event);
        break;
      case "tags":
        content.setTag(itemName, item as GtmTag);
        this._fireSoon(event);
        break;
      case "triggers":
        content.setTrigger(itemName, item as GtmTrigger);
        this._fireSoon(event);
        break;
      case "variables":
        content.setVariable(itemName, item as GtmVariable);
        this._fireSoon(event);
        break;
      case "builtInVariables":
        content.setBuiltInVariable(itemName, item as GtmBuiltInVariable);
        this._fireSoon(event);
        break;
      case "customTemplates":
        content.setCustomTemplate(itemName, item as GtmCustomTemplate);
        this._fireSoon(event);
        break;
      default:
        throw FileSystemError.Unavailable(uri);
    }

    // If path must be change, trigger rename
    if (item.parentFolderId !== originalItem?.parentFolderId || item.name !== originalItem?.name) {
      const folder = content.getFolder().find((f) => f.folderId === item.parentFolderId)?.name;
      const itemName = item.name.replace(".json", "");
      await this.rename(uri, GtmFileSystemProvider.buildPath({ ...path, folder, itemName }), { overwrite: false });
    }
  }

  async delete(uri: Uri, { recursive }: { readonly recursive: boolean }): Promise<void> {
    const content = await this.load(uri);
    const event = { type: FileChangeType.Deleted, uri };
    const { accounts, accountId, containers, containerId, folder, itemType, itemName } = await this.resolvePath(uri);

    // Will throw Error if file doesn't exist
    await this.stat(uri);

    // Cannot delete root directories
    if (!accounts || !accountId || !containers || !containerId) throw FileSystemError.NoPermissions(uri);

    // Cannot delete itemType directories
    if (itemType && !itemName) throw FileSystemError.NoPermissions(uri);

    // Delete entire folders
    if (folder) {
      if (!recursive) throw FileSystemError.NoPermissions(uri);

      content.getTag(folder).map((t) => content.deleteTag(t.name));
      content.getTrigger(folder).map((t) => content.deleteTrigger(t.name));
      content.getVariable(folder).map((t) => content.deleteVariable(t.name));
      content.getBuiltInVariable().map((t) => content.deleteBuiltInVariable(t.name));
    }

    // Should not be possible, but kept for type safety
    if (!itemType || !itemName) throw FileSystemError.NoPermissions(uri);

    switch (itemType) {
      case "folders":
      case "container":
        // Cannot delete container or folder files
        throw FileSystemError.NoPermissions(uri);
      case "tags":
        content.deleteTag(itemName);
        return this._fireSoon(event);
      case "triggers":
        content.deleteTrigger(itemName);
        return this._fireSoon(event);
      case "variables":
        content.deleteVariable(itemName);
        return this._fireSoon(event);
      case "builtInVariables":
        content.deleteBuiltInVariable(itemName);
        return this._fireSoon(event);
      case "customTemplates":
        content.deleteCustomTemplate(itemName);
        return this._fireSoon(event);
      default:
        throw FileSystemError.FileNotFound(uri);
    }
  }

  async rename(oldUri: Uri, newUri: Uri, { overwrite }: { readonly overwrite: boolean }): Promise<void> {
    const content = await this.load(oldUri);
    const { itemType: oldItemType, itemName: oldItemName } = await this.resolvePath(oldUri);
    const { folder: newFolder, itemType: newItemType, itemName: newItemName } = await this.resolvePath(newUri);
    const events = [
      { type: FileChangeType.Deleted, uri: oldUri },
      { type: FileChangeType.Created, uri: newUri },
    ];

    // TODO: rename accountId or containerId

    if (oldItemType !== newItemType) throw FileSystemError.Unavailable(newUri);
    if (!oldItemName || !newItemName) throw FileSystemError.Unavailable(newUri);
    if (!overwrite && (await this.exists(newUri))) throw FileSystemError.FileExists(newUri);

    const item = JSON.parse((await this.readFile(oldUri)).toString()); // Will throw Error if file doesn't exist
    if (newFolder) item.parentFolderId = content.getFolder(newFolder)?.folderId;
    else delete item.parentFolderId;
    item.name = newItemName;

    switch (oldItemType) {
      case "folders":
        return this.writeFile(oldUri, Buffer.from(JSON.stringify(item)), { create: false, overwrite: true });
      case "container":
        content.setContainer(item);
        return this._fireSoon(...events);
      case "tags":
        content.setTag(newItemName, item);
        return this._fireSoon(...events);
      case "triggers":
        content.setTrigger(newItemName, item);
        return this._fireSoon(...events);
      case "variables":
        content.setVariable(newItemName, item);
        return this._fireSoon(...events);
      case "builtInVariables":
        content.setBuiltInVariable(newItemName, item);
        return this._fireSoon(...events);
      case "customTemplates":
        content.setCustomTemplate(newItemName, item);
        return this._fireSoon(...events);
      default:
        throw FileSystemError.Unavailable(oldUri);
    }
  }

  private async resolvePath(uri: Uri): Promise<GtmPath> {
    // gtm:/accounts/[accountId]/containers/[containerId]/[folder?]/[itemType?]/[itemName?]#[sourceUri]
    const content = await this.load(uri);
    const { fragment, path } = uri;
    const [, accounts, accountId, containers, containerId, folderOrItemType, itemTypeOrId, id] = path.split("/");
    const result: GtmPath = { sourceUri: GtmFileSystemProvider.decodeAuthorityUri(fragment) };

    if (accounts && accounts !== "accounts") throw FileSystemError.FileNotFound(uri);
    if (containers && containers !== "containers") throw FileSystemError.FileNotFound(uri);

    if (accounts) result.accounts = true;
    if (accountId) result.accountId = accountId;
    if (containers) result.containers = true;
    if (containerId) result.containerId = containerId;

    if (folderOrItemType) {
      const folders = content.getFolder();

      result.folder = folders.find((f) => f.name === folderOrItemType)?.name;
      result.itemType = (result.folder ? itemTypeOrId : folderOrItemType)?.replace("_", "") as GtmPath["itemType"];
      result.itemName = (result.folder ? id : itemTypeOrId)?.replace(".json", "");
    }

    return result;
  }

  private async exists(uri: Uri): Promise<boolean> {
    try {
      await this.stat(uri);
      return true;
    } catch (error) {
      return false;
    }
  }

  private _fireSoon(...events: FileChangeEvent[]): void {
    this._bufferedEvents.push(...events);

    if (this._fireSoonHandle) clearTimeout(this._fireSoonHandle);

    this._fireSoonHandle = setTimeout(() => {
      this._emitter.fire(this._bufferedEvents);
      this._bufferedEvents.length = 0;
    }, 5);
  }
}
