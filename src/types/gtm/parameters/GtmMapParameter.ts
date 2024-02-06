import { GtmParameterType } from "../enums/GtmParameterType";
import { GtmParameter } from "./GtmParameter";

export interface GtmMapParameter<Items extends GtmParameter<GtmParameterType>>
  extends GtmParameter<GtmParameterType.map> {
  map: Items[];
}
