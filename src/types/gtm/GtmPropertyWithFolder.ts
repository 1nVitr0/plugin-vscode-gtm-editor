import { GtmProperty } from "./GtmProperty";

export interface GtmPropertyWithFolder extends GtmProperty {
  /** Parent folder id */
  parentFolderId?: `${number}`;
}
