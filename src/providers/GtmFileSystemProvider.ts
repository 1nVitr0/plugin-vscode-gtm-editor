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
    id,
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
    if (id) paths.push(id);

    const { scheme } = GtmFileSystemProvider;
    const fragment = GtmFileSystemProvider.encodeAuthorityUri(sourceUri);
    const path = `/${paths.join("/")}`;

    return Uri.from({ scheme, fragment, path });
  }

  async load(uri: Uri): Promise<GtmExportContentProvider> {
    const { fragment } = uri;
    const sourceUri = GtmFileSystemProvider.decodeAuthorityUri(fragment);
    const sourceKey = sourceUri.toString();

    if (this._contentProviders.has(sourceKey)) return await this._contentProviders.get(sourceKey)!;

    const provider = new Promise<GtmExportContentProvider>(async (resolve, reject) => {
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
      this._fireSoon({ type: FileChangeType.Created, uri: GtmFileSystemProvider.buildPath({ sourceUri }) });

      resolve(contentProvider);
    });

    this._contentProviders.set(sourceKey, provider);
    return await provider;
  }

  watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[] }): Disposable {
    // ignore, fires for all changes...
    return new Disposable(() => {});
  }

  async stat(uri: Uri): Promise<FileStat> {
    const content = await this.load(uri);
    const { accountId, containerId, folder, itemType, id } = await this.resolvePath(uri);

    const ctime = content.exportTime.getTime();
    const mtime = content.updateTime.getTime();

    if (accountId && accountId !== content.accountId) throw FileSystemError.FileNotFound(uri);
    if (containerId && containerId !== content.containerId) throw FileSystemError.FileNotFound(uri);

    if (id) {
      const data =
        itemType === "folders"
          ? content.getFolder(id)
          : itemType === "tags"
          ? content.getTag(folder, id)
          : itemType === "triggers"
          ? content.getTrigger(folder, id)
          : itemType === "variables"
          ? content.getVariable(folder, id)
          : itemType === "builtInVariables"
          ? content.getBuiltInVariable(id)
          : itemType === "customTemplates"
          ? content.getCustomTemplate(id)
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
    const { accountId, containerId, folder, itemType, accounts, containers, id } = await this.resolvePath(uri);

    if (id) throw FileSystemError.FileNotADirectory(uri);
    if (!accounts) return [["accounts", FileType.Directory]];
    if (!accountId) return [[content.accountId, FileType.Directory]];
    if (!containers) return [["containers", FileType.Directory]];
    if (!containerId) return [[content.containerId, FileType.Directory]];

    if (itemType) {
      switch (itemType) {
        case "folders":
          return content.getFolder().map((t) => [`${t.name}.json`, FileType.File]);
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
    const { accountId, containerId, folder, itemType, id } = await this.resolvePath(uri);

    if (stat.type === FileType.Directory) throw FileSystemError.FileIsADirectory(uri);
    if (!accountId || !containerId || !itemType || !id) throw FileSystemError.FileNotFound(uri);

    switch (itemType) {
      case "folders":
        return Buffer.from(JSON.stringify(content.getFolder(id), null, 2));
      case "tags":
        return Buffer.from(JSON.stringify(content.getTag(folder, id), null, 2));
      case "triggers":
        return Buffer.from(JSON.stringify(content.getTrigger(folder, id), null, 2));
      case "variables":
        return Buffer.from(JSON.stringify(content.getVariable(folder, id), null, 2));
      case "builtInVariables":
        return Buffer.from(JSON.stringify(content.getBuiltInVariable(id), null, 2));
      case "customTemplates":
        return Buffer.from(JSON.stringify(content.getCustomTemplate(id), null, 2));
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
    const stat = create ? null : await this.stat(uri); // Will throw Error if file doesn't exist
    const { sourceUri, accounts, accountId, containers, containerId, itemType, id } = await this.resolvePath(uri);

    if (stat?.type === FileType.Directory) throw FileSystemError.FileIsADirectory();
    if (stat && !overwrite) throw FileSystemError.FileExists(uri);
    if (!accountId || !containerId || !itemType || !id) throw FileSystemError.Unavailable(uri);

    const event = { type: create ? FileChangeType.Created : FileChangeType.Changed, uri };

    switch (itemType) {
      case "folders":
        const originalFolder = content.getFolder(id);
        const updatedFolder = JSON.parse(data.toString());

        if (originalFolder && originalFolder.name !== updatedFolder.name) {
          const baseFolderEvent = { sourceUri, accountId, accounts, containerId, containers };
          this._fireSoon(
            event,
            {
              type: FileChangeType.Deleted,
              uri: GtmFileSystemProvider.buildPath({ ...baseFolderEvent, folder: originalFolder.name }),
            },
            {
              type: FileChangeType.Created,
              uri: GtmFileSystemProvider.buildPath({ ...baseFolderEvent, folder: updatedFolder.name }),
            }
          );
        }

        return content.setFolder(id, updatedFolder).then(() => this._fireSoon(event));
      case "tags":
        return content.setTag(id, JSON.parse(data.toString())).then(() => this._fireSoon(event));
      case "triggers":
        return content.setTrigger(id, JSON.parse(data.toString())).then(() => this._fireSoon(event));
      case "variables":
        return content.setVariable(id, JSON.parse(data.toString())).then(() => this._fireSoon(event));
      case "builtInVariables":
        return content.setBuiltInVariable(id, JSON.parse(data.toString())).then(() => this._fireSoon(event));
      case "customTemplates":
        return content.setCustomTemplate(id, JSON.parse(data.toString())).then(() => this._fireSoon(event));
      default:
        throw FileSystemError.Unavailable(uri);
    }
  }

  async delete(uri: Uri, options: { readonly recursive: boolean }): Promise<void> {
    const content = await this.load(uri);
    const event = { type: FileChangeType.Deleted, uri };
    const { accountId, containerId, folder, itemType, id } = await this.resolvePath(uri);

    if (!accountId || !containerId || !itemType || !id) throw FileSystemError.FileNotFound(uri);

    // TODO: Delete folders and entire directories

    switch (itemType) {
      case "tags":
        await content.deleteTag(id);
        return this._fireSoon(event);
      case "triggers":
        await content.deleteTrigger(id);
        return this._fireSoon(event);
      case "variables":
        await content.deleteVariable(id);
        return this._fireSoon(event);
      case "builtInVariables":
        await content.deleteBuiltInVariable(id);
        return this._fireSoon(event);
      case "customTemplates":
        await content.deleteCustomTemplate(id);
        return this._fireSoon(event);
      default:
        throw FileSystemError.FileNotFound(uri);
    }
  }

  async rename(oldUri: Uri, newUri: Uri, { overwrite }: { readonly overwrite: boolean }): Promise<void> {
    const content = await this.load(oldUri);
    const { itemType: oldItemType, id: oldId } = await this.resolvePath(oldUri);
    const { folder: newFolder, itemType: newItemType, id: newId } = await this.resolvePath(newUri);
    const events = [
      { type: FileChangeType.Deleted, uri: oldUri },
      { type: FileChangeType.Created, uri: newUri },
    ];

    if (oldItemType !== newItemType) throw FileSystemError.Unavailable(newUri);
    if (!oldId || !newId) throw FileSystemError.Unavailable(newUri);
    if (!overwrite && (await this.exists(newUri))) throw FileSystemError.FileExists(newUri);

    const item = JSON.parse(this.readFile(oldUri).toString()); // Will throw Error if file doesn't exist
    if (newFolder) item.parentFolderId = newFolder;
    else delete item.parentFolderId;
    item.name = newId;

    switch (oldItemType) {
      case "folders":
        return this.writeFile(oldUri, Buffer.from(JSON.stringify(item)), { create: false, overwrite: true });
      case "tags":
        await content.setTag(newId, item);
        await content.deleteTag(oldId);
        return this._fireSoon(...events);
      case "triggers":
        await content.setTrigger(newId, item);
        await content.deleteTrigger(oldId);
        return this._fireSoon(...events);
      case "variables":
        await content.setVariable(newId, item);
        await content.deleteVariable(oldId);
        return this._fireSoon(...events);
      case "builtInVariables":
        await content.setBuiltInVariable(newId, item);
        await content.deleteBuiltInVariable(oldId);
        return this._fireSoon(...events);
      case "customTemplates":
        await content.setCustomTemplate(newId, item);
        await content.deleteCustomTemplate(oldId);
        return this._fireSoon(...events);
      default:
        throw FileSystemError.Unavailable(oldUri);
    }
  }

  private async resolvePath(uri: Uri): Promise<GtmPath> {
    // Format: /accounts/[accountId]/containers/[containerId]/[folder?]/[itemtype?]/[id?]
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
      result.itemType = (result.folder ? itemTypeOrId : folderOrItemType)?.replace("_", "");
      result.id = (result.folder ? id : itemTypeOrId)?.replace(".json", "");
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
