import { GtmParameterType } from "../enums/GtmParameterType";
import { GtmParameter } from "./GtmParameter";

export interface GtmIntegerParameter extends GtmParameter<GtmParameterType.integer> {
  value: `${number}`;
}
