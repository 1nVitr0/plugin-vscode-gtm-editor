import { GtmBuiltinVariable } from "./GtmBuiltinVariable";
import { GtmContainer } from "./GtmContainer";
import { GtmCustomTemplate } from "./GtmCustomTemplate";
import { GtmFolder } from "./GtmFolder";
import { GtmProperty } from "./GtmProperty";
import { GtmTag } from "./GtmTag";
import { GtmTrigger } from "./GtmTrigger";
import { GtmVariable } from "./GtmVariable";

export interface GtmContainerVersion extends GtmProperty {
  path: string;
  containerVersionId: string;
  fingerprint: string;
  tagManagerUrl: string;
  container: GtmContainer;
  tag: GtmTag[];
  trigger: GtmTrigger[];
  variable: GtmVariable[];
  folder: GtmFolder[];
  builtInVariable: GtmBuiltinVariable[];
  customTemplate: GtmCustomTemplate[];
}
