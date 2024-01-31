import { Uri, workspace } from "vscode";

export class GtmExportContentProvider {
  public readonly accountId: string;
  public readonly containerId: string;
  public readonly containerVersionId: string;
  public readonly fingerprint: string;
  public readonly tagManagerUrl: string;
  public readonly exportTime: Date;

  private _data: any;
  private _container: any;
  private _tags: any[];
  private _triggers: any[];
  private _variables: any[];
  private _folders: any[];
  private _builtInVariables: any[];
  private _customTemplates: any[];

  constructor(private gtmExportUri: Uri) {
    const content = workspace.fs.readFile(gtmExportUri);
    this._data = JSON.parse(content.toString());

    const {
      exportTime,
      containerVersion: {
        accountId,
        containerId,
        containerVersionId,
        fingerprint,
        tagManagerUrl,
        container,
        tag,
        trigger,
        variable,
        folder,
        builtInVariable,
        customTemplate,
      },
    } = this._data;

    this.accountId = accountId;
    this.containerId = containerId;
    this.containerVersionId = containerVersionId;
    this.fingerprint = fingerprint;
    this.tagManagerUrl = tagManagerUrl;
    this.exportTime = new Date(exportTime);

    this._container = container;
    this._tags = tag;
    this._triggers = trigger;
    this._variables = variable;
    this._folders = folder;
    this._builtInVariables = builtInVariable;
    this._customTemplates = customTemplate;
  }

  public getContainer(): any {
    return this._container;
  }

  public getFolder(id: string): string | undefined;
  public getFolder(): string[];
  public getFolder(id?: string) {
    if (id) return this._folders.find((folder) => folder.folderId === id)?.name;
    else return this._folders.map((folder) => folder.name);
  }

  public getTag(folder: string | null, name: string): any | undefined;
  public getTag(folder?: string | null): any[];
  public getTag(folder?: string | null, name?: string) {
    if (name) return this._tags.find((tag) => tag.name === name);
    else if (folder) return this._tags.filter((tag) => tag.parentFolderId === folder);
    else return this._tags;
  }

  public getTrigger(folder: string | null, name: string): any | undefined;
  public getTrigger(folder?: string | null): any[];
  public getTrigger(folder?: string | null, name?: string) {
    if (name) return this._triggers.find((trigger) => trigger.name === name);
    else if (folder) return this._triggers.filter((trigger) => trigger.parentFolderId === folder);
    else return this._triggers;
  }

  public getVariable(folder: string | null, name: string): any | undefined;
  public getVariable(folder?: string | null): any[];
  public getVariable(folder?: string | null, name?: string) {
    if (name) return this._variables.find((variable) => variable.name === name);
    else if (folder) return this._variables.filter((variable) => variable.parentFolderId === folder);
    else return this._variables;
  }

  public getBuiltInVariable(name: string): any | undefined;
  public getBuiltInVariable(): any[];
  public getBuiltInVariable(name?: string) {
    if (name) return this._builtInVariables.find((variable) => variable.name === name);
    else return this._builtInVariables;
  }

  public getCustomTemplate(name: string): any | undefined;
  public getCustomTemplate(): any[];
  public getCustomTemplate(name?: string) {
    if (name) return this._customTemplates.find((template) => template.name === name);
    else return this._customTemplates;
  }

  public setTag(name: string, data: any) {
    const tag = this.getTag(null, name);
    if (tag) Object.assign(tag, data);
    else this._tags.push(data);

    return this.save();
  }

  public setTrigger(name: string, data: any) {
    const trigger = this.getTrigger(null, name);
    if (trigger) Object.assign(trigger, data);
    else this._triggers.push(data);

    return this.save();
  }

  public setVariable(name: string, data: any) {
    const variable = this.getVariable(null, name);
    if (variable) Object.assign(variable, data);
    else this._variables.push(data);

    return this.save();
  }

  public setBuiltInVariable(name: string, data: any) {
    const variable = this.getBuiltInVariable(name);
    if (variable) Object.assign(variable, data);
    else this._builtInVariables.push(data);

    return this.save();
  }

  public setCustomTemplate(name: string, data: any) {
    const template = this.getCustomTemplate(name);
    if (template) Object.assign(template, data);
    else this._customTemplates.push(data);

    return this.save();
  }

  public setParentFolder(item: any, folder: string | null) {
    item.parentFolderId = folder;
    return this.save();
  }

  private save() {
    const data = JSON.stringify(this._data, null, 2);
    return workspace.fs.writeFile(this.gtmExportUri, Buffer.from(data));
  }
}
