import { GtmProperty } from "./GtmProperty";

export interface GtmContainer extends GtmProperty {
  publicId: string;
  path: string;
  tagIds: string[];
}
