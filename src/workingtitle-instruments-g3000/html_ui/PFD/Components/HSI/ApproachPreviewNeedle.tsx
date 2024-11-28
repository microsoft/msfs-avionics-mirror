import { FSComponent, ObjectSubject, VNode } from '@microsoft/msfs-sdk';
import { CourseNeedle } from './CourseNeedle';

import './ApproachPreviewNeedle.css';

/**
 * An HSI approach preview course needle, consisting of an arrow and course deviation indicator (CDI).
 *
 * The course needle supports four different styles: regular HSI rose style, HSI map style, and a closed (solid color)
 * style and an open (color outline with transparent middle) style for each of the first two. The HSI rose style
 * includes a course deviation indicator, while the HSI map style does not.
 */
export class ApproachPreviewNeedle extends CourseNeedle {
  /** @inheritdoc */
  protected getRootCssClass(): string {
    return 'hsi-course-needle-preview';
  }

  /** @inheritdoc */
  protected renderRoseNeedle(rotationStyle: ObjectSubject<any>, deviationStyle: ObjectSubject<any>): VNode {
    return (
      <div class="hsi-course-needle-preview-rose" style={rotationStyle}>
        <svg viewBox="0 0 368 368" class="hsi-course-needle-preview-closed">
          <path class="hsi-course-needle-preview-fill" d="M 182.5 54 l 0 10 q 0 1.36 -0.5 2 l -12.5 16.5 c -0.5 0.66 -0.5 1.5 1.5 1.5 l 8.5 0 c 1.5 0 2 1 2 2 l 0 7 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -7 c 0 -1 0.5 -2 2 -2 l 8.5 0 c 2 0 2 -0.83 1.5 -1.5 l -12.5 -16.5 q -0.5 -0.64 -0.5 -2 l 0 -10 c 0 -0.5 0 -1 -0.5 -1 l -2 0 c -0.5 0 -0.5 0.5 -0.5 1 M 184 99 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 259 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 279 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 299 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z" />
        </svg>
        <svg viewBox="0 0 368 368" class="hsi-course-needle-preview-open">
          <path class="hsi-course-needle-preview-outline" d="M 187 95 l 0 -10 c 0 -1 1 -2 2 -2 l 6.5 0 c 2 0 2.65 0 1.5 -1.5 l -12 -15.82 c -1 -1 -1 -1 -2 0 l -12 15.82 c -1.15 1.5 -0.5 1.5 1.5 1.5 l 6.5 0 c 1 0 2 1 2 2 l 0 10 M 181 99 l 0 16 M 187 99 l 0 16 M 181 259 l 0 16 M 187 259 l 0 16 M 181 279 l 0 16 M 187 279 l 0 16 M 181 299 l 0 13 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -13 M 184 53 l 0 12.5" />
          <path class="hsi-course-needle-preview-fill" d="M 187 95 l 0 -10 c 0 -1 1 -2 2 -2 l 6.5 0 c 2 0 2.65 0 1.5 -1.5 l -12 -15.82 c -1 -1 -1 -1 -2 0 l -12 15.82 c -1.15 1.5 -0.5 1.5 1.5 1.5 l 6.5 0 c 1 0 2 1 2 2 l 0 10 M 181 99 l 0 16 M 187 99 l 0 16 M 181 259 l 0 16 M 187 259 l 0 16 M 181 279 l 0 16 M 187 279 l 0 16 M 181 299 l 0 13 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -13 M 184 53 l 0 12.5" />
        </svg>

        <div class="hsi-course-needle-preview-deviation" style={deviationStyle}>
          <svg viewBox="0 0 368 368" class="hsi-course-needle-preview-closed">
            <path class="hsi-course-needle-preview-fill" d="M 184 119 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 139 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 159 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 179 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 199 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 219 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z M 184 239 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 12 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -12 c 0 -2 -1 -2 -1.5 -2 z" />
          </svg>
          <svg viewBox="0 0 368 368" class="hsi-course-needle-preview-open">
            <path class="hsi-course-needle-preview-outline" d="M 181 119 l 0 16 M 187 119 l 0 16 M 181 139 l 0 16 M 187 139 l 0 16 M 181 159 l 0 16 M 187 159 l 0 16 M 181 179 l 0 16 M 187 179 l 0 16 M 181 199 l 0 16 M 187 199 l 0 16 M 181 219 l 0 16 M 187 219 l 0 16 M 181 239 l 0 16 M 187 239 l 0 16" />
            <path class="hsi-course-needle-preview-fill" d="M 181 119 l 0 16 M 187 119 l 0 16 M 181 139 l 0 16 M 187 139 l 0 16 M 181 159 l 0 16 M 187 159 l 0 16 M 181 179 l 0 16 M 187 179 l 0 16 M 181 199 l 0 16 M 187 199 l 0 16 M 181 219 l 0 16 M 187 219 l 0 16 M 181 239 l 0 16 M 187 239 l 0 16" />
          </svg>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  protected renderMapNeedle(rotationStyle: ObjectSubject<any>): VNode {
    return (
      <div class="hsi-course-needle-preview-map" style={rotationStyle}>
        <svg viewBox="0 0 350 350" class="hsi-course-needle-preview-closed">
          <path class="hsi-course-needle-preview-fill" d="M 172.5 48 l 0 -13 c 0.003 -0.811 -0.406 -1.62 -1.635 -1.619 l -6.385 0 c -1.62 0 -1.62 -0.81 -1.215 -1.215 l 10.935 -10.935 c 0 0 0.809 -0.812 1.62 0 l 10.935 10.935 c 0.405 0.405 0.405 1.215 -1.215 1.215 l -6.385 0 c -1.215 0 -1.62 0.81 -1.62 1.62 l 0 13 M 172.5 308 l 0 24.3 c 0 0.81 0.405 1.62 1.215 1.62 l 2.62 0 c 0.81 0 1.215 -0.81 1.215 -1.62 l 0 -24.3" />
        </svg>
        <svg viewBox="0 0 350 350" class="hsi-course-needle-preview-open">
          <path class="hsi-course-needle-preview-outline" d="M 172 48 l 0 -13 c 0.003 -0.811 -0.406 -1.62 -1.635 -1.619 l -5.885 0 c -1.62 0 -1.62 -0.81 -1.215 -1.215 l 10.935 -10.935 c 0 0 0.809 -0.812 1.62 0 l 10.935 10.935 c 0.405 0.405 0.405 1.215 -1.215 1.215 l -5.885 0 c -1.215 0 -1.62 0.81 -1.62 1.62 l 0 13 M 172 308 l 0 24.3 c 0 0.81 0.405 1.62 1.215 1.62 l 3.62 0 c 0.81 0 1.215 -0.81 1.215 -1.62 l 0 -24.3" />
          <path class="hsi-course-needle-preview-fill" d="M 172 48 l 0 -13 c 0.003 -0.811 -0.406 -1.62 -1.635 -1.619 l -5.885 0 c -1.62 0 -1.62 -0.81 -1.215 -1.215 l 10.935 -10.935 c 0 0 0.809 -0.812 1.62 0 l 10.935 10.935 c 0.405 0.405 0.405 1.215 -1.215 1.215 l -5.885 0 c -1.215 0 -1.62 0.81 -1.62 1.62 l 0 13 M 172 308 l 0 24.3 c 0 0.81 0.405 1.62 1.215 1.62 l 3.62 0 c 0.81 0 1.215 -0.81 1.215 -1.62 l 0 -24.3" />
        </svg>
      </div>
    );
  }
}