import { GtmParameterType } from "../enums/GtmParameterType";
import { GtmParameter } from "./GtmParameter";

export interface GtmListParameter<Item extends GtmParameter<GtmParameterType>>
  extends GtmParameter<GtmParameterType.list> {
  list: Omit<Item, "key">[];
}
