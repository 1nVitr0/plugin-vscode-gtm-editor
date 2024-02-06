import { GtmProperty } from "./GtmProperty";
import { GtmFeatures } from "./GtmFeatures";
import { GtmUsageContext } from "./enums/GtmUsageContext";

export interface GtmContainer extends GtmProperty {
  /** Container Public ID */
  publicId: `${number}`;
  /**
   * List of Usage Contexts for the Container.
   * Valid values include: web, android, or ios
   */
  usageContext: GtmUsageContext[];
  /** Read-only Container feature set */
  features: GtmFeatures;
  /** All Tag IDs that refer to this Container */
  tagIds: string[];
}
