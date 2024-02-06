import { GtmParameterType } from "../enums/GtmParameterType";

export interface GtmParameter<Type extends GtmParameterType> {
  /** The parameter type */
  type: Type;
  /** The named key that uniquely identifies a parameter */
  key?: string;
  /**
   * Whether or not a reference type parameter is strongly or weakly referenced.
   * Only used by Transformations
   */
  isWeakReference?: boolean;
}
