import { GtmPropertyWithFolder } from "./GtmPropertyWithFolder";

export interface GtmFolder extends GtmPropertyWithFolder {
  /** The Folder ID uniquely identifies the GTM Folder */
  folderId: `${number}`;
}
