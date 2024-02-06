import { GtmProperty } from "./GtmProperty";

export interface GtmBuiltInVariable extends GtmProperty {
  /** The type of built-in variable to enable */
  type: string;
}
