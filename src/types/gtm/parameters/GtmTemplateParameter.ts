import { GtmParameterType } from "../enums/GtmParameterType";
import { GtmParameter } from "./GtmParameter";

export interface GtmTemplateParameter extends GtmParameter<GtmParameterType.template> {
  value: string;
}
