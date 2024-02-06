import { GtmParameterType } from "../enums/GtmParameterType";
import { GtmParameter } from "./GtmParameter";

export interface GtmReferenceParameter
  extends GtmParameter<GtmParameterType.tagReference | GtmParameterType.triggerReference> {
  value: string;
}
