import { Uri, workspace } from "vscode";
import { GtmProperty } from "../types/gtm/GtmProperty";
import { GtmExport } from "../types/gtm/GtmExport";
import { GtmContainer } from "../types/gtm/GtmContainer";
import { GtmTag } from "../types/gtm/GtmTag";
import { GtmTrigger } from "../types/gtm/GtmTrigger";
import { GtmVariable } from "../types/gtm/GtmVariable";
import { GtmFolder } from "../types/gtm/GtmFolder";
import { GtmBuiltinVariable } from "../types/gtm/GtmBuiltinVariable";
import { GtmCustomTemplate } from "../types/gtm/GtmCustomTemplate";

export class GtmExportContentProvider {
  public readonly accountId: string;
  public readonly containerId: string;
  public readonly containerVersionId: string;
  public readonly fingerprint: string;
  public readonly tagManagerUrl: string;
  public readonly exportTime: Date;

  public get updateTime(): Date {
    return new Date(this._data.exportTime);
  }

  private _data: GtmExport;
  private _container: GtmContainer;
  private _tags: GtmTag[];
  private _triggers: GtmTrigger[];
  private _variables: GtmVariable[];
  private _folders: GtmFolder[];
  private _builtInVariables: GtmBuiltinVariable[];
  private _customTemplates: GtmCustomTemplate[];

  private set updateTime(value: Date) {
    this._data.exportTime = value.toISOString();
  }

  constructor(private gtmExportUri: Uri, initialContent: string) {
    this._data = JSON.parse(initialContent.toString());

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

  public getFolder(id: string): GtmFolder | undefined;
  public getFolder(): GtmFolder[];
  public getFolder(id?: string): GtmFolder | GtmFolder[] | undefined {
    if (id) return this._folders.find((folder) => folder.name === id);
    else return this._folders;
  }

  public getTag(folder: string | undefined | null, name: string): GtmTag | undefined;
  public getTag(folder?: string | null): GtmTag[];
  public getTag(folder?: string | null, name?: string): GtmTag[] | GtmTag | undefined {
    const folderId = folder ? this._folders.find((f) => f.name === folder)?.folderId : null;
    if (name) return this._tags.find((tag) => tag.name === name);
    else if (folderId) return this._tags.filter((tag) => tag.parentFolderId === folderId);
    else return this._tags;
  }

  public getTrigger(folder: string | undefined | null, name: string): GtmTrigger | undefined;
  public getTrigger(folder?: string | null): GtmTrigger[];
  public getTrigger(folder?: string | null, name?: string): GtmTrigger[] | GtmTrigger | undefined {
    const folderId = folder ? this._folders.find((f) => f.name === folder)?.folderId : null;
    if (name) return this._triggers.find((trigger) => trigger.name === name);
    else if (folderId) return this._triggers.filter((trigger) => trigger.parentFolderId === folderId);
    else return this._triggers;
  }

  public getVariable(folder: string | undefined | null, name: string): GtmVariable | undefined;
  public getVariable(folder?: string | null): GtmVariable[];
  public getVariable(folder?: string | null, name?: string): GtmVariable[] | GtmVariable | undefined {
    const folderId = folder ? this._folders.find((f) => f.name === folder)?.folderId : null;
    if (name) return this._variables.find((variable) => variable.name === name);
    else if (folderId) return this._variables.filter((variable) => variable.parentFolderId === folderId);
    else return this._variables;
  }

  public getBuiltInVariable(name: string): GtmBuiltinVariable | undefined;
  public getBuiltInVariable(): GtmBuiltinVariable[];
  public getBuiltInVariable(name?: string): GtmBuiltinVariable[] | GtmBuiltinVariable | undefined {
    if (name) return this._builtInVariables.find((variable) => variable.name === name);
    else return this._builtInVariables;
  }

  public getCustomTemplate(name: string): GtmCustomTemplate | undefined;
  public getCustomTemplate(): GtmCustomTemplate[];
  public getCustomTemplate(name?: string): GtmCustomTemplate[] | GtmCustomTemplate | undefined {
    if (name) return this._customTemplates.find((template) => template.name === name);
    else return this._customTemplates;
  }

  public setFolder(name: string, data: GtmFolder) {
    const folder = this.getFolder(name);
    if (folder) {
      Object.assign(folder, data);
    } else {
      const occupiedIds = this._folders.map((folder) => parseInt(folder.folderId));
      data.folderId = occupiedIds.includes(parseInt(data.folderId))
        ? (Math.max(...occupiedIds) + 1).toString()
        : data.folderId;
      this._folders.push(data);
    }

    return this.save();
  }

  public setTag(name: string, data: GtmTag) {
    const tag = this.getTag(null, name);
    if (tag) {
      Object.assign(tag, data);
    } else {
      const occupiedIds = this._tags.map((tag) => parseInt(tag.tagId));
      data.tagId = occupiedIds.includes(parseInt(data.tagId)) ? (Math.max(...occupiedIds) + 1).toString() : data.tagId;
      this._tags.push(data);
    }

    return this.save();
  }

  public setTrigger(name: string, data: GtmTrigger) {
    const trigger = this.getTrigger(null, name);
    if (trigger) {
      Object.assign(trigger, data);
    } else {
      const occupiedIds = this._triggers.map((trigger) => parseInt(trigger.triggerId));
      data.triggerId = occupiedIds.includes(parseInt(data.triggerId))
        ? (Math.max(...occupiedIds) + 1).toString()
        : data.triggerId;
      this._triggers.push(data);
    }

    return this.save();
  }

  public setVariable(name: string, data: GtmVariable) {
    const variable = this.getVariable(null, name);
    if (variable) {
      Object.assign(variable, data);
    } else {
      const occupiedIds = this._variables.map((variable) => parseInt(variable.variableId));
      data.variableId = occupiedIds.includes(parseInt(data.variableId))
        ? (Math.max(...occupiedIds) + 1).toString()
        : data.variableId;
      this._variables.push(data);
    }

    return this.save();
  }

  public setBuiltInVariable(name: string, data: GtmBuiltinVariable) {
    const variable = this.getBuiltInVariable(name);
    if (variable) Object.assign(variable, data);
    else  this._builtInVariables.push(data);

    return this.save();
  }

  public setCustomTemplate(name: string, data: GtmCustomTemplate) {
    const template = this.getCustomTemplate(name);
    if (template) Object.assign(template, data);
    else this._customTemplates.push(data);

    return this.save();
  }

  public deleteTag(name: string) {
    const index = this._tags.findIndex((tag) => tag.name === name);
    if (index !== -1) this._tags.splice(index, 1);

    return this.save();
  }

  public deleteTrigger(name: string) {
    const index = this._triggers.findIndex((trigger) => trigger.name === name);
    if (index !== -1) this._triggers.splice(index, 1);

    return this.save();
  }

  public deleteVariable(name: string) {
    const index = this._variables.findIndex((variable) => variable.name === name);
    if (index !== -1) this._variables.splice(index, 1);

    return this.save();
  }

  public deleteBuiltInVariable(name: string) {
    const index = this._builtInVariables.findIndex((variable) => variable.name === name);
    if (index !== -1) this._builtInVariables.splice(index, 1);

    return this.save();
  }

  public deleteCustomTemplate(name: string) {
    const index = this._customTemplates.findIndex((template) => template.name === name);
    if (index !== -1) this._customTemplates.splice(index, 1);

    return this.save();
  }

  public setParentFolder(item: any, folder: string | null) {
    const folderId = folder ? this._folders.find((f) => f.name === folder)?.folderId : null;
    item.parentFolderId = folderId;
    return this.save();
  }

  private save() {
    this.updateTime = new Date();

    const data = JSON.stringify(this._data, null, 2);
    return workspace.fs.writeFile(this.gtmExportUri, Buffer.from(data));
  }
}
