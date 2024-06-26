import { Uri, workspace } from "vscode";
import { GtmExport } from "../types/gtm/GtmExport";
import { GtmContainer } from "../types/gtm/GtmContainer";
import { GtmTag } from "../types/gtm/GtmTag";
import { GtmTrigger } from "../types/gtm/GtmTrigger";
import { GtmVariable } from "../types/gtm/GtmVariable";
import { GtmFolder } from "../types/gtm/GtmFolder";
import { GtmBuiltInVariable } from "../types/gtm/GtmBuiltInVariable";
import {
  CustomTemplateDataSectionsLines,
  GtmCustomTemplate,
  GtmCustomTemplateDataSections,
  GtmCustomTemplateParsed,
} from "../types/gtm/GtmCustomTemplate";

export class GtmExportContentProvider {
  /* eslint-disable @typescript-eslint/naming-convention */
  private static customTemplateMarkerMap: { [k: string]: keyof GtmCustomTemplateDataSections } = {
    ___TERMS_OF_SERVICE___: "termsOfService",
    ___INFO___: "info",
    ___TEMPLATE_PARAMETERS___: "templateParameters",
    ___SANDBOXED_JS_FOR_WEB_TEMPLATE___: "sandboxedJs",
    ___WEB_PERMISSIONS___: "webPermissions",
    ___TESTS___: "tests",
    ___NOTES___: "notes",
  };
  /* eslint-enable @typescript-eslint/naming-convention */

  public static async create(uri: Uri) {
    const data = await workspace.fs.readFile(uri);
    return new GtmExportContentProvider(uri, data.toString());
  }

  private static parseTemplateSections(templateData: string): GtmCustomTemplateDataSections {
    let currentKey: keyof GtmCustomTemplateDataSections | undefined = undefined;
    const templateLines = templateData.split(/\r?\n/).reduce((templateData, line) => {
      const newKey = GtmExportContentProvider.customTemplateMarkerMap[line];
      currentKey = newKey || currentKey;

      if (newKey) templateData[newKey] = [];
      else if (currentKey) templateData[currentKey]!.push(line);

      return templateData;
    }, {} as CustomTemplateDataSectionsLines);

    return Object.fromEntries(
      Object.entries(templateLines).map(([key, value]) => [
        key,
        value.slice(1, value[value.length - 1] === "" ? -1 : value.length).join("\n"),
      ]) as [keyof GtmCustomTemplateDataSections, string][]
    );
  }

  private static mapTemplateDataSections(customTemplate: GtmCustomTemplateParsed) {
    const invertedMap = Object.fromEntries(
      Object.entries(GtmExportContentProvider.customTemplateMarkerMap).map(([key, value]) => [value, key])
    );

    const { templateDataSections, ...rest } = customTemplate;

    return {
      ...rest,
      templateData: Object.entries(templateDataSections)
        .map(([key, value]) => `${invertedMap[key]}\n${value}\n`)
        .join("\n"),
    };
  }

  public readonly exportTime: Date;

  public get updateTime(): Date {
    return new Date(this._data.exportTime);
  }

  public get accountId(): string {
    return this._data.containerVersion.accountId;
  }

  public get containerId(): string {
    return this._data.containerVersion.containerId;
  }

  public get containerVersionId(): string {
    return this._data.containerVersion.containerVersionId;
  }

  public get fingerprint(): string {
    return this._data.containerVersion.fingerprint;
  }

  public get tagManagerUrl(): string | undefined {
    return this._data.containerVersion.tagManagerUrl;
  }

  private _data: GtmExport;
  private _container: GtmContainer;
  private _tags: GtmTag[];
  private _triggers: GtmTrigger[];
  private _variables: GtmVariable[];
  private _folders: GtmFolder[];
  private _builtInVariables: GtmBuiltInVariable[];
  private _customTemplates: GtmCustomTemplateParsed[];
  private _saveSoonHandle?: NodeJS.Timer;

  private set updateTime(value: Date) {
    this._data.exportTime = value.toISOString();
  }

  constructor(private gtmExportUri: Uri, initialContent: string) {
    this._data = JSON.parse(initialContent.toString());

    const {
      exportTime,
      containerVersion: { container, tag, trigger, variable, folder, builtInVariable, customTemplate },
    } = this._data;

    this.exportTime = new Date(exportTime);

    this._container = container;
    this._tags = tag;
    this._triggers = trigger;
    this._variables = variable;
    this._folders = folder;
    this._builtInVariables = builtInVariable;
    this._customTemplates = customTemplate.map(({ templateData, ...rest }) => {
      const templateDataSections = GtmExportContentProvider.parseTemplateSections(templateData);
      return { ...rest, templateData, templateDataSections };
    });
  }

  public async reload() {
    const data = await workspace.fs.readFile(this.gtmExportUri);
    this._data = JSON.parse(data.toString());

    const {
      containerVersion: { container, tag, trigger, variable, folder, builtInVariable, customTemplate },
    } = this._data;

    this._container = container;
    this._tags = tag;
    this._triggers = trigger;
    this._variables = variable;
    this._folders = folder;
    this._builtInVariables = builtInVariable;
    this._customTemplates = customTemplate.map(({ templateData, ...rest }) => {
      const templateDataSections = GtmExportContentProvider.parseTemplateSections(templateData);
      return { ...rest, templateData, templateDataSections };
    });
  }

  public getContainer(): GtmContainer {
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
    const tags = folderId ? this._tags.filter((tag) => tag.parentFolderId === folderId) : this._tags;

    if (name) return tags.find((tag) => tag.name === name);
    else return tags;
  }

  public getTrigger(folder: string | undefined | null, name: string): GtmTrigger | undefined;
  public getTrigger(folder?: string | null): GtmTrigger[];
  public getTrigger(folder?: string | null, name?: string): GtmTrigger[] | GtmTrigger | undefined {
    const folderId = folder ? this._folders.find((f) => f.name === folder)?.folderId : null;
    const triggers = folderId
      ? this._triggers.filter((trigger) => trigger.parentFolderId === folderId)
      : this._triggers;

    if (name) return triggers.find((trigger) => trigger.name === name);
    else return triggers;
  }

  public getVariable(folder: string | undefined | null, name: string): GtmVariable | undefined;
  public getVariable(folder?: string | null): GtmVariable[];
  public getVariable(folder?: string | null, name?: string): GtmVariable[] | GtmVariable | undefined {
    const folderId = folder ? this._folders.find((f) => f.name === folder)?.folderId : null;
    const variables = folderId
      ? this._variables.filter((variable) => variable.parentFolderId === folderId)
      : this._variables;

    if (name) return variables.find((variable) => variable.name === name);
    else return variables;
  }

  public getBuiltInVariable(name: string): GtmBuiltInVariable | undefined;
  public getBuiltInVariable(): GtmBuiltInVariable[];
  public getBuiltInVariable(name?: string): GtmBuiltInVariable[] | GtmBuiltInVariable | undefined {
    if (name) return this._builtInVariables.find((variable) => variable.name === name);
    else return this._builtInVariables;
  }

  public getCustomTemplate(name: string): GtmCustomTemplateParsed | undefined;
  public getCustomTemplate(): GtmCustomTemplateParsed[];
  public getCustomTemplate(name?: string): GtmCustomTemplateParsed[] | GtmCustomTemplateParsed | undefined {
    if (name) return this._customTemplates.find((template) => template.name === name);
    else return this._customTemplates;
  }

  public getCustomTemplateSection(name: string, section: keyof GtmCustomTemplateDataSections): string | undefined {
    const template = this.getCustomTemplate(name);
    return template?.templateDataSections[section];
  }

  public setContainer(data: GtmContainer) {
    Object.assign(this._container, data);
    return this.saveSoon();
  }

  public setFolder(name: string, data: GtmFolder) {
    const folder = this.getFolder(name);
    if (folder) {
      Object.assign(folder, data);
    } else {
      const occupiedIds = this._folders.map((folder) => parseInt(folder.folderId));
      data.folderId = occupiedIds.includes(parseInt(data.folderId))
        ? ((Math.max(...occupiedIds) + 1).toString() as `${number}`)
        : data.folderId;
      this._folders.push(data);
    }

    return this.saveSoon();
  }

  public setTag(name: string, data: GtmTag) {
    const tag = this.getTag(null, name);
    if (tag) {
      Object.assign(tag, data);
    } else {
      const occupiedIds = this._tags.map((tag) => parseInt(tag.tagId));
      data.tagId = occupiedIds.includes(parseInt(data.tagId))
        ? ((Math.max(...occupiedIds) + 1).toString() as `${number}`)
        : data.tagId;
      this._tags.push(data);
    }

    return this.saveSoon();
  }

  public setTrigger(name: string, data: GtmTrigger) {
    const trigger = this.getTrigger(null, name);
    if (trigger) {
      Object.assign(trigger, data);
    } else {
      const occupiedIds = this._triggers.map((trigger) => parseInt(trigger.triggerId));
      data.triggerId = occupiedIds.includes(parseInt(data.triggerId))
        ? ((Math.max(...occupiedIds) + 1).toString() as `${number}`)
        : data.triggerId;
      this._triggers.push(data);
    }

    return this.saveSoon();
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

    return this.saveSoon();
  }

  public setBuiltInVariable(name: string, data: GtmBuiltInVariable) {
    const variable = this.getBuiltInVariable(name);
    if (variable) Object.assign(variable, data);
    else this._builtInVariables.push(data);

    return this.saveSoon();
  }

  public setCustomTemplate(name: string, data: GtmCustomTemplateParsed) {
    const template = this.getCustomTemplate(name);
    if (template) Object.assign(template, data);
    else this._customTemplates.push(data);

    return this.saveSoon();
  }

  public setCustomTemplateSection(name: string, section: keyof GtmCustomTemplateDataSections, data: string) {
    const template = this.getCustomTemplate(name);
    if (template) template.templateDataSections[section] = data;

    return this.saveSoon();
  }

  public deleteTag(name: string) {
    const index = this._tags.findIndex((tag) => tag.name === name);
    if (index !== -1) this._tags.splice(index, 1);

    return this.saveSoon();
  }

  public deleteTrigger(name: string) {
    const index = this._triggers.findIndex((trigger) => trigger.name === name);
    if (index !== -1) this._triggers.splice(index, 1);

    return this.saveSoon();
  }

  public deleteVariable(name: string) {
    const index = this._variables.findIndex((variable) => variable.name === name);
    if (index !== -1) this._variables.splice(index, 1);

    return this.saveSoon();
  }

  public deleteBuiltInVariable(name: string) {
    const index = this._builtInVariables.findIndex((variable) => variable.name === name);
    if (index !== -1) this._builtInVariables.splice(index, 1);

    return this.saveSoon();
  }

  public deleteCustomTemplate(name: string) {
    const index = this._customTemplates.findIndex((template) => template.name === name);
    if (index !== -1) this._customTemplates.splice(index, 1);

    return this.saveSoon();
  }

  public deleteCustomTemplateSection(name: string, section: keyof GtmCustomTemplateDataSections) {
    const template = this.getCustomTemplate(name);
    if (template) delete template.templateDataSections[section];

    return this.saveSoon();
  }

  public setParentFolder(item: any, folder: string | null) {
    const folderId = folder ? this._folders.find((f) => f.name === folder)?.folderId : null;
    item.parentFolderId = folderId;
    return this.saveSoon();
  }

  public setAccountId(accountId: `${number}`) {
    this._data.containerVersion.accountId = accountId;
  }

  public setContainerId(containerId: `${number}`) {
    this._data.containerVersion.containerId = containerId;
  }

  private save() {
    this.updateTime = new Date();

    const data = JSON.stringify(
      {
        ...this._data,
        containerVersion: {
          ...this._data.containerVersion,
          customTemplate: this._customTemplates.map(GtmExportContentProvider.mapTemplateDataSections),
        },
      },
      null,
      2
    );
    return workspace.fs.writeFile(this.gtmExportUri, Buffer.from(data));
  }

  private saveSoon() {
    if (this._saveSoonHandle) clearTimeout(this._saveSoonHandle);

    this._saveSoonHandle = setTimeout(() => {
      this.save();
    }, 5);
  }
}
