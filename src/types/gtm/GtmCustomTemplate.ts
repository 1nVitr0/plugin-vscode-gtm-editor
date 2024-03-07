import { GtmProperty } from "./GtmProperty";

export interface GtmCustomTemplate extends GtmProperty {
  /** The relative resource name of the custom template to create */
  templateId: `${number}`;
  /** The custom template data */
  templateData: {
    tos: string;
    info: string;
    templateParameters: string;
    sandboxedJs: string;
    webPermissions: string;
    tests: string;
    notes: string;
  };
}
