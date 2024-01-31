import { Disposable, Event, EventEmitter, FileChangeEvent, FileStat, FileSystemProvider, FileType, Uri } from "vscode";

export class GtmFileSystemProvider implements FileSystemProvider {
  private _emitter = new EventEmitter<FileChangeEvent[]>();
  private _bufferedEvents: FileChangeEvent[] = [];
  private _fireSoonHandle?: NodeJS.Timer;

  readonly onDidChangeFile: Event<FileChangeEvent[]> = this._emitter.event;

  load(workspaceFileUri: Uri) {}

  watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[] }): Disposable {
    // ignore, fires for all changes...
    return new Disposable(() => {});
  }

  stat(uri: Uri): FileStat | Thenable<FileStat> {
    throw new Error("Method not implemented.");
  }

  readDirectory(uri: Uri): [string, FileType][] | Thenable<[string, FileType][]> {
    throw new Error("Method not implemented.");
  }

  createDirectory(uri: Uri): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }

  readFile(uri: Uri): Uint8Array | Thenable<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  writeFile(
    uri: Uri,
    content: Uint8Array,
    options: { readonly create: boolean; readonly overwrite: boolean }
  ): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }

  delete(uri: Uri, options: { readonly recursive: boolean }): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }

  rename(oldUri: Uri, newUri: Uri, options: { readonly overwrite: boolean }): void | Thenable<void> {
    throw new Error("Method not implemented.");
  }

  copy?(source: Uri, destination: Uri, options: { readonly overwrite: boolean }): void | Thenable<void> {
    throw new Error("Method not implemented.");
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
