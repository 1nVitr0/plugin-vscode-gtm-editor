import { GtmParameterType } from "../enums/GtmParameterType";
import { GtmParameter } from "./GtmParameter";

export interface GtmBooleanParameter extends GtmParameter<GtmParameterType.boolean> {
  value: `${boolean}`;
}
