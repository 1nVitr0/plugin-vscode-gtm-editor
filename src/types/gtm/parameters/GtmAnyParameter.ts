import { GtmBooleanParameter } from "./GtmBooleanParameter";
import { GtmIntegerParameter } from "./GtmIntegerParameter";
import { GtmListParameter } from "./GtmListParameter";
import { GtmMapParameter } from "./GtmMapParameter";
import { GtmReferenceParameter } from "./GtmReferenceParameter";
import { GtmTemplateParameter } from "./GtmTemplateParameter";

export type GtmAnyValueParameter =
  | GtmBooleanParameter
  | GtmTemplateParameter
  | GtmIntegerParameter
  | GtmReferenceParameter;
export type GtmAnyMapParameter = GtmMapParameter<GtmAnyValueParameter>;
export type GtmAnyListParameter = GtmListParameter<GtmAnyValueParameter>;
export type GtmAnyParameter = GtmAnyValueParameter | GtmAnyMapParameter | GtmAnyListParameter;
export type GtmAnyDeepParameter =
  | GtmAnyValueParameter
  | GtmMapParameter<GtmAnyDeepParameter>
  | GtmListParameter<GtmAnyDeepParameter>;
