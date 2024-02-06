import { GtmContainerVersion } from "./GtmContainerVersion";

export interface GtmExport {
  exportFormatVersion: 2;
  exportTime: string;
  containerVersion: GtmContainerVersion;
}
