import { GtmBuiltInVariable } from "./GtmBuiltInVariable";
import { GtmContainer } from "./GtmContainer";
import { GtmCustomTemplate } from "./GtmCustomTemplate";
import { GtmFolder } from "./GtmFolder";
import { GtmProperty } from "./GtmProperty";
import { GtmTag } from "./GtmTag";
import { GtmTrigger } from "./GtmTrigger";
import { GtmVariable } from "./GtmVariable";

export interface GtmContainerVersion extends Omit<GtmProperty, "name"> {
  path: string;
  containerVersionId: `${number}`;
  container: GtmContainer;
  tag: GtmTag[];
  trigger: GtmTrigger[];
  variable: GtmVariable[];
  folder: GtmFolder[];
  builtInVariable: GtmBuiltInVariable[];
  customTemplate: GtmCustomTemplate[];
}
