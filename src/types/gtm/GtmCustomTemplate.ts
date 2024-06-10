import { GtmProperty } from "./GtmProperty";

export interface GtmCustomTemplate extends GtmProperty {
  /** The relative resource name of the custom template to create */
  templateId: `${number}`;
  /** The custom template data */
  templateData: string;
}

export interface GtmCustomTemplateDataSections {
  termsOfService?: string;
  info?: string;
  templateParameters?: string;
  sandboxedJs?: string;
  webPermissions?: string;
  tests?: string;
  notes?: string;
}

export interface GtmCustomTemplateParsed extends GtmCustomTemplate {
  /** The parsed sections of the template */
  templateDataSections: GtmCustomTemplateDataSections;
}

export type CustomTemplateDataSectionsLines = {
  [key in keyof GtmCustomTemplateDataSections]?: string[];
};
