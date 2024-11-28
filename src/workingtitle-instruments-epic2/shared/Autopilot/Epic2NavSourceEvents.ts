import { NavSourceId } from '@microsoft/msfs-sdk';

/**
 * Interface for Epic2 Navigation Source Events
 */
export interface Epic2NavigationSourceEvents {
  /** Left PFD Course Needle NavSource */
  epic2_navsource_course_needle_left_source: NavSourceId
  /** Right PFD Course Needle NavSource */
  epic2_navsource_course_needle_right_source: NavSourceId

  /** Left PFD Course Needle NavSource Set Event */
  epic2_navsource_course_needle_left_source_set: NavSourceId
  /** Right PFD Course Needle NavSource Set Event */
  epic2_navsource_course_needle_right_source_set: NavSourceId
}
