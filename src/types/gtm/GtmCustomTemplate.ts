import { GtmProperty } from "./GtmProperty";

export interface GtmCustomTemplate extends GtmProperty {
  /** The relative resource name of the custom template to create */
  templateId: `${number}`;
  /** The custom template data */
  templateData: string;
}
