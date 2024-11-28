import { FSComponent, ObjectSubject, VNode } from '@microsoft/msfs-sdk';
import { CourseNeedle } from './CourseNeedle';

import './ActiveNavNeedle.css';

/**
 * An HSI course needle for the active nav source, consisting of an arrow, to/from flag, and a course deviation
 * indicator (CDI) with hollow dot markers representing full- and half-scale deviation.
 *
 * The course needle supports four different styles: regular HSI rose style, HSI map style, and a closed (solid color)
 * style and an open (color outline with transparent middle) style for each of the first two. The HSI rose style
 * includes a course deviation indicator, while the HSI map style does not.
 */
export class ActiveNavNeedle extends CourseNeedle {
  /** @inheritdoc */
  protected getRootCssClass(): string {
    return 'hsi-course-needle-active';
  }

  /** @inheritdoc */
  protected renderRoseNeedle(rotationStyle: ObjectSubject<any>, deviationStyle: ObjectSubject<any>, toFromStyle: ObjectSubject<any>): VNode {
    return (
      <div class="hsi-course-needle-active-rose" style={rotationStyle}>
        <svg viewBox="0 0 368 368" class="hsi-course-needle-active-closed">
          <path class="hsi-course-needle-active-fill" d="M 183 53 l -13.5 13.5 c -0.5 0.5 -0.5 1.5 1.5 1.5 l 8.5 0 c 1.5 0 2 1 2 2 l 0 46 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -46 c 0 -1 0.5 -2 2 -2 l 8.5 0 c 2 0 2 -1 1.5 -1.5 l -13.5 -13.5 c -1 -1 -2 0 -2 0 z M 184 249 l -1 0 c -0.5 0 -1.5 0 -1.5 2 l 0 62 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -62 c 0 -2 -1 -2 -1.5 -2 z" />
        </svg>
        <svg viewBox="0 0 368 368" class="hsi-course-needle-active-open">
          <path class="hsi-course-needle-active-outline" d="M 183 54 l -11.5 11.5 c -1.5 1.5 -0.5 1.5 1.5 1.5 l 6 0 c 1 0 2 1 2 2 l 0 47 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -47 c 0 -1 1 -2 2 -2 l 7 0 c 1 0 2 0 0.5 -1.5 l -11.5 -11.5 c -1 -1 -1 -1 -2 0 M 184 249 l -1 0 c -2 0 -2 1 -2 2 l 0 62 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -62 c 0 -1 0 -2 -2 -2 l -1 0" />
          <path class="hsi-course-needle-active-fill" d="M 183 54 l -11.5 11.5 c -1.5 1.5 -0.5 1.5 1.5 1.5 l 6 0 c 1 0 2 1 2 2 l 0 47 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -47 c 0 -1 1 -2 2 -2 l 7 0 c 1 0 2 0 0.5 -1.5 l -11.5 -11.5 c -1 -1 -1 -1 -2 0 M 184 249 l -1 0 c -2 0 -2 1 -2 2 l 0 62 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -62 c 0 -1 0 -2 -2 -2 l -1 0" />
        </svg>

        <svg viewBox="0 0 368 368" class="hsi-course-needle-active-dots">
          <circle cx="120" cy="185" r="4" />
          <circle cx="152" cy="185" r="4" />
          <circle cx="216" cy="185" r="4" />
          <circle cx="248" cy="185" r="4" />
        </svg>

        <div class="hsi-course-needle-active-tofrom" style={toFromStyle}>
          <svg viewBox="0 0 368 368">
            <path class="hsi-course-needle-active-fill" d="M 184 113 l -12 12 l 24 0 l -12 -12 z" />
          </svg>
        </div>

        <div class="hsi-course-needle-active-deviation" style={deviationStyle}>
          <svg viewBox="0 0 368 368" class="hsi-course-needle-active-closed">
            <path class="hsi-course-needle-active-fill" d="M 184 130 l -1 0 c -1 0 -1.5 1 -1.5 2 l 0 109 c 0 1 0.5 2 1.5 2 l 2 0 c 1 0 1.5 -1 1.5 -2 l 0 -109 c 0 -1 -0.5 -2 -1.5 -2 z" />
          </svg>
          <svg viewBox="0 0 368 368" class="hsi-course-needle-active-open">
            <path class="hsi-course-needle-active-outline" d="M 184 130 l -1 0 c -2 0 -2 1 -2 2 l 0 109 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -109 c 0 -1 0 -2 -2 -2 l -1 0" />
            <path class="hsi-course-needle-active-fill" d="M 184 130 l -1 0 c -2 0 -2 1 -2 2 l 0 109 c 0 1 0 2 2 2 l 2 0 c 2 0 2 -1 2 -2 l 0 -109 c 0 -1 0 -2 -2 -2 l -1 0" />
          </svg>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  protected renderMapNeedle(rotationStyle: ObjectSubject<any>): VNode {
    return (
      <div class="hsi-course-needle-active-map" style={rotationStyle}>
        <svg viewBox="0 0 350 350" class="hsi-course-needle-active-closed">
          <path class="hsi-course-needle-active-fill" d="M 172.5 48 l 0 -18 c 0.003 -0.811 -0.406 -1.62 -1.635 -1.619 l -6.385 0 c -1.62 0 -1.62 -0.81 -1.215 -1.215 l 10.935 -10.935 c 0 0 0.809 -0.812 1.62 0 l 10.935 10.935 c 0.405 0.405 0.405 1.215 -1.215 1.215 l -6.385 0 c -1.215 0 -1.62 0.81 -1.62 1.62 l 0 18 M 172.5 308 l 0 24.3 c 0 0.81 0.405 1.62 1.215 1.62 l 2.62 0 c 0.81 0 1.215 -0.81 1.215 -1.62 l 0 -24.3" />
        </svg>
        <svg viewBox="0 0 350 350" class="hsi-course-needle-active-open">
          <path class="hsi-course-needle-active-outline" d="M 172 48 l 0 -18 c 0.003 -0.811 -0.406 -1.62 -1.635 -1.619 l -5.885 0 c -1.62 0 -1.62 -0.81 -1.215 -1.215 l 10.935 -10.935 c 0 0 0.809 -0.812 1.62 0 l 10.935 10.935 c 0.405 0.405 0.405 1.215 -1.215 1.215 l -5.885 0 c -1.215 0 -1.62 0.81 -1.62 1.62 l 0 18 M 172 308 l 0 24.3 c 0 0.81 0.405 1.62 1.215 1.62 l 3.62 0 c 0.81 0 1.215 -0.81 1.215 -1.62 l 0 -24.3" />
          <path class="hsi-course-needle-active-fill" d="M 172 48 l 0 -18 c 0.003 -0.811 -0.406 -1.62 -1.635 -1.619 l -5.885 0 c -1.62 0 -1.62 -0.81 -1.215 -1.215 l 10.935 -10.935 c 0 0 0.809 -0.812 1.62 0 l 10.935 10.935 c 0.405 0.405 0.405 1.215 -1.215 1.215 l -5.885 0 c -1.215 0 -1.62 0.81 -1.62 1.62 l 0 18 M 172 308 l 0 24.3 c 0 0.81 0.405 1.62 1.215 1.62 l 3.62 0 c 0.81 0 1.215 -0.81 1.215 -1.62 l 0 -24.3" />
        </svg>
      </div>
    );
  }
}