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
  workspace,
} from "vscode";
import { GtmExportContentProvider } from "./GtmExportContentsProvider";

export class GtmFileSystemProvider implements FileSystemProvider {
  public static schema = "gtm";

  private _emitter = new EventEmitter<FileChangeEvent[]>();
  private _bufferedEvents: FileChangeEvent[] = [];
  private _fireSoonHandle?: NodeJS.Timer;
  private _contentProviders: Map<string, Map<string, GtmExportContentProvider>> = new Map();

  readonly onDidChangeFile: Event<FileChangeEvent[]> = this._emitter.event;

  load(workspaceFileUri: Uri) {
    const content = new GtmExportContentProvider(workspaceFileUri);
    const { accountId, containerId } = content;

    if (!accountId || !containerId) throw new Error("Invalid file");

    const updateWorkspace = this._contentProviders.has(accountId);
    const containers = this._contentProviders.get(accountId) ?? new Map();
    containers.set(containerId, content);
    this._contentProviders.set(accountId, containers);

    if (updateWorkspace) {
      workspace.updateWorkspaceFolders(0, 0, {
        uri: Uri.parse(`${GtmFileSystemProvider.schema}:/${accountId}`),
        name: `Google Tag Manager Account ${accountId}`,
      });
    }
  }

  watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[] }): Disposable {
    // ignore, fires for all changes...
    return new Disposable(() => {});
  }

  stat(uri: Uri): FileStat {
    const { accountId, containerId, folder, itemType, id } = this.resolvePath(uri);

    const containers = accountId && this._contentProviders.get(accountId);
    const content = containers && containerId && containers.get(containerId);

    const ctime = content ? content.exportTime.getTime() : 0;
    const mtime = content ? content.updateTime.getTime() : 0;

    if (!containers && accountId) throw FileSystemError.FileNotFound(uri);
    else if (!containers) return { type: FileType.Directory, ctime, mtime, size: 0 };

    if (!content && containerId) throw FileSystemError.FileNotFound(uri);
    else if (!content) return { type: FileType.Directory, ctime, mtime, size: 0 };

    if (id) {
      const data =
        itemType === "tags"
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
      const folders = content.getFolder();

      if (!folders.includes(folder)) throw FileSystemError.FileNotFound(uri);
      return { type: FileType.Directory, ctime, mtime, size: 0 };
    } else {
      return { type: FileType.Directory, ctime, mtime, size: 0 };
    }
  }

  readDirectory(uri: Uri): [string, FileType][] {
    const { accountId, containerId, folder, itemType } = this.resolvePath(uri);

    const containers = accountId && this._contentProviders.get(accountId);
    const content = containers && containerId && containers.get(containerId);

    if (!containers) return Array.from(this._contentProviders.keys()).map((k) => [k, FileType.Directory]);
    if (!content) return Array.from(containers.keys()).map((k) => [k, FileType.Directory]);

    if (itemType) {
      switch (itemType) {
        case "folders":
          return content.getFolder().map((t) => [t, FileType.Directory]);
        case "tags":
          return content.getTag(folder).map((t) => [t, FileType.File]);
        case "triggers":
          return content.getTrigger(folder).map((t) => [t, FileType.File]);
        case "variables":
          return content.getVariable(folder).map((t) => [t, FileType.File]);
        case "builtInVariables":
          return content.getBuiltInVariable().map((t) => [t, FileType.File]);
        case "customTemplates":
          return content.getCustomTemplate().map((t) => [t, FileType.File]);
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
        ...content.getFolder().map((t): [string, FileType] => [t, FileType.Directory]),
        ["tags", FileType.Directory],
        ["triggers", FileType.Directory],
        ["variables", FileType.Directory],
        ["builtInVariables", FileType.Directory],
        ["customTemplates", FileType.Directory],
      ];
    }
  }

  createDirectory(uri: Uri): void {
    throw new Error("Method not implemented.");
  }

  readFile(uri: Uri): Uint8Array {
    const { accountId, containerId, folder, itemType, id } = this.resolvePath(uri);

    const containers = accountId && this._contentProviders.get(accountId);
    const content = containers && containerId && containers.get(containerId);

    if (!containers || !content || !itemType || !id) throw new Error("File not found");

    switch (itemType) {
      case "tags":
        return content.getTag(folder, id);
      case "triggers":
        return content.getTrigger(folder, id);
      case "variables":
        return content.getVariable(folder, id);
      case "builtInVariables":
        return content.getBuiltInVariable(id);
      case "customTemplates":
        return content.getCustomTemplate(id);
      default:
        throw FileSystemError.FileNotFound(uri);
    }
  }

  writeFile(
    uri: Uri,
    data: Uint8Array,
    { create, overwrite }: { readonly create: boolean; readonly overwrite: boolean }
  ): Thenable<void> {
    const { accountId, containerId, folder, itemType, id } = this.resolvePath(uri);

    const containers = accountId && this._contentProviders.get(accountId);
    const content = containers && containerId && containers.get(containerId);
    let stat = null;

    if (!containers || !content || !itemType || !id) throw FileSystemError.FileNotFound(uri);
    if (!create) stat = this.stat(uri); // Throws FileNotFound if file doesn't exist
    if (stat?.type === FileType.Directory) throw FileSystemError.FileIsADirectory();
    if (stat && !overwrite) throw FileSystemError.FileExists(uri);

    switch (itemType) {
      case "tags":
        return content.setTag(id, data);
      case "triggers":
        return content.setTrigger(id, data);
      case "variables":
        return content.setVariable(id, data);
      case "builtInVariables":
        return content.setBuiltInVariable(id, data);
      case "customTemplates":
        return content.setCustomTemplate(id, data);
      default:
        throw FileSystemError.Unavailable(uri);
    }
  }

  delete(uri: Uri, options: { readonly recursive: boolean }): Thenable<void> {
    const { accountId, containerId, folder, itemType, id } = this.resolvePath(uri);

    const containers = accountId && this._contentProviders.get(accountId);
    const content = containers && containerId && containers.get(containerId);

    if (!containers || !content || !itemType || !id) throw FileSystemError.FileNotFound(uri);

    // TODO: Delete folders

    switch (itemType) {
      case "tags":
        return content.deleteTag(id);
      case "triggers":
        return content.deleteTrigger(id);
      case "variables":
        return content.deleteVariable(id);
      case "builtInVariables":
        return content.deleteBuiltInVariable(id);
      case "customTemplates":
        return content.deleteCustomTemplate(id);
      default:
        throw FileSystemError.FileNotFound(uri);
    }
  }

  async rename(oldUri: Uri, newUri: Uri, options: { readonly overwrite: boolean }): Promise<void> {
    const {
      accountId: oldAccountId,
      containerId: oldContainerId,
      itemType: oldItemType,
      id: oldId,
    } = this.resolvePath(oldUri);
    const {
      accountId: newAccountId,
      containerId: newContainerId,
      folder: newFolder,
      itemType: newItemType,
      id: newId,
    } = this.resolvePath(newUri);

    if (oldItemType !== newItemType) throw new Error("Incompatible file types");

    const itemType = oldItemType;
    const item = JSON.parse(this.readFile(oldUri).toString());

    const oldContainers = oldAccountId && this._contentProviders.get(oldAccountId);
    const oldContent = oldContainers && oldContainerId && oldContainers.get(oldContainerId);

    const newContainers = newAccountId && this._contentProviders.get(newAccountId);
    const newContent = newContainers && newContainerId && newContainers.get(newContainerId);

    if (!oldContainers || !oldContent || !oldId || !newContainers || !newContent || !newId || !item)
      throw FileSystemError.FileNotFound(oldUri);

    item.accountId = newAccountId;
    item.containerId = newContainerId;
    if (newFolder) item.parentFolderId = newFolder;
    else delete item.parentFolderId;
    item.name = newId;

    switch (oldItemType) {
      case "tags":
        await newContent.setTag(newId, item);
        return oldContent.deleteTag(oldId);
      case "triggers":
        await newContent.setTrigger(newId, item);
        return oldContent.deleteTrigger(oldId);
      case "variables":
        await newContent.setVariable(newId, item);
        return oldContent.deleteVariable(oldId);
      case "builtInVariables":
        await newContent.setBuiltInVariable(newId, item);
        return oldContent.deleteBuiltInVariable(oldId);
      case "customTemplates":
        await newContent.setCustomTemplate(newId, item);
        return oldContent.deleteCustomTemplate(oldId);
      default:
        throw FileSystemError.Unavailable(oldUri);
    }
  }

  private resolvePath(uri: Uri): {
    accountId?: string;
    containerId?: string;
    folder?: string;
    itemType?: string;
    id?: string;
  } {
    // Format: accounts/[accountId]/containers/[containerId]/[folder?]/[itemtype?]/[id?]
    const [accounts, accountId, containers, containerId, folderOrItemType, itemTypeOrId, id] = uri.path.split("/");
    const result: {
      accountId?: string;
      containerId?: string;
      folder?: string;
      itemType?: string;
      id?: string;
    } = {};

    if (accounts && accounts !== "accounts") throw FileSystemError.Unavailable(uri);
    if (containers && containers !== "containers") throw FileSystemError.Unavailable(uri);

    if (accountId) result.accountId = accountId;
    if (containerId) result.containerId = containerId;

    if (folderOrItemType) {
      const content = this._contentProviders.get(accountId)?.get(containerId);
      const folders = content?.getFolder() ?? [];

      result.folder = folders.find((f) => f === folderOrItemType);
      result.itemType = result.folder ? itemTypeOrId : folderOrItemType;
      result.id = result.folder ? id : itemTypeOrId;
    }

    return result;
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
