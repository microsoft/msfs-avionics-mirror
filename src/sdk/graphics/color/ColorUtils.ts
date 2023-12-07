import { MathUtils } from '../../math/MathUtils';

/**
 * A utility class for working with colors.
 */
export class ColorUtils {
  private static readonly HEX_REGEX = /^#?([0-9a-fA-F]{6})$/;

  private static readonly BYTE_0_MASK = ((1 << 8) - 1) << 0;
  private static readonly BYTE_1_MASK = ((1 << 8) - 1) << 8;
  private static readonly BYTE_2_MASK = ((1 << 8) - 1) << 16;

  private static readonly MASK_24 = (1 << 24) - 1;

  private static readonly rgbCache = new Float64Array(3);

  /**
   * Reverses the order of concatenation of the red, green, and blue components in a numeric hex color. A value equal
   * to `(red << 16) + (green << 8) + (blue << 0)` will be converted to `(blue << 16) + (green << 8) + (red << 0)` and
   * vice versa.
   * @param hex The numeric hex color to reverse.
   * @returns The specified numeric hex color with the concatenation order of red, green, and blue components reversed.
   */
  public static reverseHexNumber(hex: number): number {
    return ((hex & ColorUtils.BYTE_2_MASK) >> 16) | (hex & ColorUtils.BYTE_1_MASK) | ((hex & ColorUtils.BYTE_0_MASK) << 16);
  }

  /**
   * Converts a hex color string to its numeric representation. The numeric hex color is equal to
   * `(red << 16) + (green << 8) + (blue << 0)`.
   * @param hex The hex color string to convert. The string should be a sequence of exactly six hexadecimal characters
   * optionally prefixed with `#`.
   * @param reverse Whether to reverse the order in which the red, green, and blue components are concatenated in the
   * numeric representation. If `true`, then the numeric hex color will equal
   * `(blue << 16) + (green << 8) + (red << 0)`. Defaults to `false`.
   * @returns The numeric representation of the specified hex color string.
   * @throws Error if the string is improperly formatted.
   */
  public static hexStringToNumber(hex: string, reverse = false): number {
    if (!ColorUtils.HEX_REGEX.test(hex)) {
      throw new Error(`ColorUtils: invalid hex string: '${hex}'`);
    }

    if (hex.indexOf('#') === 0) {
      hex = hex.substring(1);
    }

    const value = parseInt(hex, 16);

    if (reverse) {
      return ColorUtils.reverseHexNumber(value);
    } else {
      return value;
    }
  }

  /**
   * Converts a numeric representation of a hex color to a string.
   * @param hex The numeric hex color to convert. The color will be interpreted as an integer with the value
   * `(red << 16) + (green << 8) + (blue << 0)`. Bits with value greater than or equal to `1 << 24` will be discarded.
   * @param reverse Whether to interpret the numeric hex color with reversed components. If `true`, then the numeric
   * hex color will be interpreted as `(blue << 16) + (green << 8) + (red << 0)`. Defaults to `false`.
   * @returns The string form of the specified numeric hex color.
   */
  public static hexNumberToString(hex: number, reverse = false): string {
    if (reverse) {
      hex = ColorUtils.reverseHexNumber(hex);
    }

    return (hex & ColorUtils.MASK_24).toString(16).padStart(6, '0');
  }

  /**
   * Converts a hex color to red, green, and blue (RGB) components. Each component is expressed in the range 0 to 255.
   * @param hex The hex color to convert, either as a string containing a sequence of exactly six hexadecimal
   * characters optionally prefixed with `#` or a numeric value equal to `(red << 16) + (green << 8) + (blue << 0)`
   * (bits with value greater than or equal to `1 << 24` will be discarded).
   * @param out The array to which to write the results.
   * @param reverse Whether to interpret the numeric hex color with reversed components. If `true`, then the numeric
   * hex color will be interpreted as `(blue << 16) + (green << 8) + (red << 0)`. Ignored if `hex` is a string.
   * Defaults to `false`.
   * @returns The red, green, and blue (RGB) components of the specified hex color, as `[r, g, b]`.
   * @throws Error if the specified hex color is an improperly formatted string.
   */
  public static hexToRgb<T extends number[] | Float64Array>(hex: number | string, out: T, reverse = false): T {
    let hexValue: number;

    if (typeof hex === 'string') {
      hexValue = ColorUtils.hexStringToNumber(hex);
    } else {
      hexValue = Math.abs(Math.trunc(hex));

      if (reverse) {
        hexValue = ColorUtils.reverseHexNumber(hex);
      }
    }

    out[0] = (hexValue >> 16) % 256;
    out[1] = (hexValue >> 8) % 256;
    out[2] = hexValue % 256;

    return out;
  }

  /**
   * Converts red, green, and blue (RGB) color components to a numeric hex color. The numeric hex color is equal to
   * `(red << 16) + (green << 8) + (blue << 0)`.
   * @param rgb The RGB color to convert, as `[r, g, b]`. Each component should be in the range 0 to 255.
   * @param reverse Whether to reverse the order in which the red, green, and blue components are concatenated in the
   * numeric representation. If `true`, then the numeric hex color will equal
   * `(blue << 16) + (green << 8) + (red << 0)`. Defaults to `false`.
   * @returns The numeric hex color representation of the specified RGB color.
   */
  public static rgbToHex(rgb: number[] | Float64Array, reverse?: boolean): number;
  /**
   * Converts red, green, and blue (RGB) color components to a numeric hex color. The numeric hex color is equal to
   * `(red << 16) + (green << 8) + (blue << 0)`.
   * @param r The red component of the color to convert, in the range 0 to 255.
   * @param g The green component of the color to convert, in the range 0 to 255.
   * @param b The blue component of the color to convert, in the range 0 to 255.
   * @param reverse Whether to reverse the order in which the red, green, and blue components are concatenated in the
   * numeric representation. If `true`, then the numeric hex color will equal
   * `(blue << 16) + (green << 8) + (red << 0)`. Defaults to `false`.
   * @returns The numeric hex color representation of the specified RGB color.
   */
  public static rgbToHex(r: number, g: number, b: number, reverse?: boolean): number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static rgbToHex(
    arg1: number | number[] | Float64Array,
    arg2?: number | boolean,
    arg3?: number,
    arg4?: boolean
  ): number {
    let r: number, g: number, b: number;
    let reverse: boolean;

    if (typeof arg1 === 'number') {
      r = arg1;
      g = arg2 as number;
      b = arg3 as number;
      reverse = arg4 as boolean;
    } else {
      r = arg1[0];
      g = arg1[1];
      b = arg1[2];
      reverse = arg2 as boolean;
    }

    r = MathUtils.clamp(Math.round(r), 0, 255);
    g = MathUtils.clamp(Math.round(g), 0, 255);
    b = MathUtils.clamp(Math.round(b), 0, 255);

    return reverse
      ? (b << 16) | (g << 8) | r
      : (r << 16) | (g << 8) | b;
  }

  /**
   * Converts red, green, and blue (RGB) color components to hue, saturation, and lightness (HSL) components. Hue is
   * expressed in degrees (0 to 360), and saturation and lightness are expressed as fractions (0 to 1).
   * @param rgb The RGB color to convert, as `[r, g, b]`. Each component should be in the range 0 to 255.
   * @param out The array to which to write the results.
   * @returns The hue, saturation, and lightness (HSL) color components of the specified RGB color, as `[h, s, l]`.
   */
  public static rgbToHsl<T extends number[] | Float64Array>(rgb: number[] | Float64Array, out: T): T;
  /**
   * Converts red, green, and blue (RGB) color components to hue, saturation, and lightness (HSL) components. Hue is
   * expressed in degrees (0 to 360), and saturation and lightness are expressed as fractions (0 to 1).
   * @param r The red component of the color to convert, in the range 0 to 255.
   * @param g The green component of the color to convert, in the range 0 to 255.
   * @param b The blue component of the color to convert, in the range 0 to 255.
   * @param out The array to which to write the results.
   * @returns The hue, saturation, and lightness (HSL) color components of the specified RGB color, as `[h, s, l]`.
   */
  public static rgbToHsl<T extends number[] | Float64Array>(r: number, g: number, b: number, out: T): T;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static rgbToHsl<T extends number[] | Float64Array>(
    arg1: number | number[] | Float64Array,
    arg2: number | T,
    arg3?: number,
    arg4?: T
  ): T {
    let r: number, g: number, b: number;
    let out: T;

    if (typeof arg1 === 'number') {
      r = arg1;
      g = arg2 as number;
      b = arg3 as number;
      out = arg4 as T;
    } else {
      r = arg1[0];
      g = arg1[1];
      b = arg1[2];
      out = arg2 as T;
    }

    r = MathUtils.clamp(r / 255, 0, 1);
    g = MathUtils.clamp(g / 255, 0, 1);
    b = MathUtils.clamp(b / 255, 0, 1);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

    const l = (max + min) / 2;
    const s = l === 0 || l === 1 ? 0 : chroma / (1 - Math.abs(max + min - 1));
    const h = 60 * (
      chroma === 0 ? 0
        : max === r ? ((g - b) / chroma) % 6
          : max === g ? (b - r) / chroma + 2
            : (r - g) / chroma + 4
    );

    out[0] = h;
    out[1] = s;
    out[2] = l;

    return out;
  }

  /**
   * Converts hue, saturation, and lightness (HSL) color components to red, green, and blue (RGB) components. Each RGB
   * component is expressed in the range 0 to 255.
   * @param hsl The HSL color to convert, as `[h, s, l]`. Hue should be expressed in degrees, and saturation and
   * lightness should be expressed as fractions in the range 0 to 1.
   * @param out The array to which to write the results.
   * @returns The red, green, and blue (RGB) color components of the specified HSL color, as `[r, g, b]`.
   */
  public static hslToRgb<T extends number[] | Float64Array>(hsl: number[] | Float64Array, out: T): T;
  /**
   * Converts hue, saturation, and lightness (HSL) color components to red, green, and blue (RGB) components. Each RGB
   * component is expressed in the range 0 to 255.
   * @param h The hue component of the color to convert, in degrees.
   * @param s The saturation component of the color to convert, as a fraction in the range 0 to 1.
   * @param l The lightness component of the color to convert, as a fraction in the range 0 to 1.
   * @param out The array to which to write the results.
   * @returns The red, green, and blue (RGB) color components of the specified HSL color, as `[r, g, b]`.
   */
  public static hslToRgb<T extends number[] | Float64Array>(h: number, s: number, l: number, out: T): T;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static hslToRgb<T extends number[] | Float64Array>(
    arg1: number | number[] | Float64Array,
    arg2: number | T,
    arg3?: number,
    arg4?: T
  ): T {
    let h: number, s: number, l: number;
    let out: T;

    if (typeof arg1 === 'number') {
      h = arg1;
      s = arg2 as number;
      l = arg3 as number;
      out = arg4 as T;
    } else {
      h = arg1[0];
      s = arg1[1];
      l = arg1[2];
      out = arg2 as T;
    }

    h = h % 360;
    s = MathUtils.clamp(s, 0, 1);
    l = MathUtils.clamp(l, 0, 1);

    const chroma = s * (1 - Math.abs(2 * l - 1));
    const side = h / 60;
    const x = chroma * (1 - Math.abs(side % 2 - 1));
    const m = l - chroma / 2;

    if (side <= 1) {
      out[0] = chroma;
      out[1] = x;
      out[2] = 0;
    } else if (side <= 2) {
      out[0] = x;
      out[1] = chroma;
      out[2] = 0;
    } else if (side <= 3) {
      out[0] = 0;
      out[1] = chroma;
      out[2] = x;
    } else if (side <= 4) {
      out[0] = 0;
      out[1] = x;
      out[2] = chroma;
    } else if (side <= 5) {
      out[0] = x;
      out[1] = 0;
      out[2] = chroma;
    } else {
      out[0] = chroma;
      out[1] = 0;
      out[2] = x;
    }

    out[0] = Math.round((out[0] + m) * 255);
    out[1] = Math.round((out[1] + m) * 255);
    out[2] = Math.round((out[2] + m) * 255);

    return out;
  }

  /**
   * Converts a hex color to hue, saturation, and lightness (HSL) components. Hue is expressed in degrees (0 to 360),
   * and saturation and lightness are expressed as fractions (0 to 1).
   * @param hex The hex color to convert, either as a string containing a sequence of exactly six hexadecimal
   * characters optionally prefixed with `#` or a numeric value equal to `(red << 16) + (green << 8) + (blue << 0)`
   * (bits with value greater than or equal to `1 << 24` will be discarded).
   * @param out The array to which to write the results.
   * @param reverse Whether to interpret the numeric hex color with reversed components. If `true`, then the numeric
   * hex color will be interpreted as `(blue << 16) + (green << 8) + (red << 0)`. Ignored if `hex` is a string.
   * Defaults to `false`.
   * @returns The hue, saturation, and lightness (HSL) color components of the specified hex color, as `[h, s, l]`.
   * @throws Error if the specified hex color is an improperly formatted string.
   */
  public static hexToHsl<T extends number[] | Float64Array>(hex: number | string, out: T, reverse = false): T {
    const rgb = ColorUtils.hexToRgb(hex, ColorUtils.rgbCache, reverse);

    return ColorUtils.rgbToHsl(rgb, out);
  }

  /**
   * Converts hue, saturation, and lightness (HSL) color components to a numeric hex color. The numeric hex color is
   * equal to `(red << 16) + (green << 8) + (blue << 0)`.
   * @param hsl The HSL color to convert, as `[h, s, l]`. Hue should be expressed in degrees, and saturation and
   * lightness should be expressed as fractions in the range 0 to 1.
   * @param reverse Whether to reverse the order in which the red, green, and blue components are concatenated in the
   * numeric representation. If `true`, then the numeric hex color will equal
   * `(blue << 16) + (green << 8) + (red << 0)`. Defaults to `false`.
   * @returns The numeric hex color representation of the specified HSL color.
   */
  public static hslToHex(hsl: number[] | Float64Array, reverse?: boolean): number;
  /**
   * Converts hue, saturation, and lightness (HSL) color components to a numeric hex color. The numeric hex color is
   * equal to `(red << 16) + (green << 8) + (blue << 0)`.
   * @param h The hue component of the color to convert, in degrees.
   * @param s The saturation component of the color to convert, as a fraction in the range 0 to 1.
   * @param l The lightness component of the color to convert, as a fraction in the range 0 to 1.
   * @param reverse Whether to reverse the order in which the red, green, and blue components are concatenated in the
   * numeric representation. If `true`, then the numeric hex color will equal
   * `(blue << 16) + (green << 8) + (red << 0)`. Defaults to `false`.
   * @returns The numeric hex color representation of the specified HSL color.
   */
  public static hslToHex(h: number, s: number, l: number, reverse?: boolean): number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static hslToHex(
    arg1: number | number[] | Float64Array,
    arg2?: number | boolean,
    arg3?: number,
    arg5?: boolean,
  ): number {
    if (typeof arg1 === 'number') {
      return ColorUtils.rgbToHex(ColorUtils.hslToRgb(arg1, arg2 as number, arg3 as number, ColorUtils.rgbCache), arg5);
    } else {
      return ColorUtils.rgbToHex(ColorUtils.hslToRgb(arg1, ColorUtils.rgbCache), arg2 as boolean | undefined);
    }
  }

  /**
   * Linearly interpolates between two hex colors in the RGB colorspace.
   * @param color1 The first color to interpolate between.
   * @param color2 The second color to interpolate between.
   * @param fraction The position between the two colors at which to generate the interpolated color, as a number in
   * the range `[0, 1]`. A value of `0` is equivalent to the first color, and a value of `1` is equivalent to the
   * second color.
   * @returns The color that is the result of interpolating between the two specified colors at the specified position.
   */
  public static interpolateHex<T = number | string>(color1: T, color2: T, fraction: number): T;
  /**
   * Linearly interpolates between two hex colors in the RGB colorspace.
   * @param color1 The first color to interpolate between.
   * @param color2 The second color to interpolate between.
   * @param fraction An array of positions between the two colors at which to generate interpolated colors. Each
   * position is a number in the range `[0, 1]`. A value of `0` is equivalent to the first color, and a value of `1` is
   * equivalent to the second color.
   * @param out The array to which to write the interpolated colors.
   * @returns An array of colors that are the result of interpolating between the two specified colors at the positions
   * specified by `fraction`. The index of each color in the array matches the index of the position used to generate
   * it in `fraction`.
   */
  public static interpolateHex<T = number | string>(color1: T, color2: T, fraction: readonly number[], out?: T[]): T[];
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static interpolateHex<T = number | string>(color1: T, color2: T, fraction: number | readonly number[], out?: T[]): T | T[] {
    const useString = typeof color1 === 'string';

    const color1Number = useString ? ColorUtils.hexStringToNumber(color1 as unknown as string) : color1 as unknown as number;
    const color2Number = useString ? ColorUtils.hexStringToNumber(color2 as unknown as string) : color2 as unknown as number;

    const interp = typeof fraction === 'object'
      ? ColorUtils.interpolateRgbSpace(color1Number, color2Number, fraction, out as number[] | undefined)
      : ColorUtils.interpolateRgbSpace(color1Number, color2Number, fraction);

    if (useString) {
      if (Array.isArray(interp)) {
        for (let i = 0; i < interp.length; i++) {
          (interp as unknown as string[])[i] = ColorUtils.hexNumberToString(interp[i]);
        }
        return interp as unknown as T;
      } else {
        return ColorUtils.hexNumberToString(interp as number) as unknown as T;
      }
    } else {
      return interp as unknown as T;
    }
  }

  /**
   * Linearly interpolates between two numeric hex colors in the RGB colorspace.
   * @param color1 The first color to interpolate between.
   * @param color2 The second color to interpolate between.
   * @param fraction The position between the two colors at which to generate the interpolated color, as a number in
   * the range `[0, 1]`. A value of `0` is equivalent to the first color, and a value of `1` is equivalent to the
   * second color.
   * @returns The color that is the result of interpolating between the two specified colors at the specified position.
   */
  private static interpolateRgbSpace(color1: number, color2: number, fraction: number): number;
  /**
   * Linearly interpolates between two numeric hex colors in the RGB colorspace.
   * @param color1 The first color to interpolate between.
   * @param color2 The second color to interpolate between.
   * @param fraction An array of positions between the two colors at which to generate interpolated colors. Each
   * position is a number in the range `[0, 1]`. A value of `0` is equivalent to the first color, and a value of `1` is
   * equivalent to the second color.
   * @param out The array to which to write the interpolated colors.
   * @returns An array of colors that are the result of interpolating between the two specified colors at the positions
   * specified by `fraction`. The index of each color in the array matches the index of the position used to generate
   * it in `fraction`.
   */
  private static interpolateRgbSpace(color1: number, color2: number, fraction: readonly number[], out?: number[]): number[]
  // eslint-disable-next-line jsdoc/require-jsdoc
  private static interpolateRgbSpace(color1: number, color2: number, fraction: number | readonly number[], out?: number[]): number | number[] {
    const r1 = (color1 & ColorUtils.BYTE_2_MASK) >> 16;
    const g1 = (color1 & ColorUtils.BYTE_1_MASK) >> 8;
    const b1 = (color1 & ColorUtils.BYTE_0_MASK);

    const r2 = (color2 & ColorUtils.BYTE_2_MASK) >> 16;
    const g2 = (color2 & ColorUtils.BYTE_1_MASK) >> 8;
    const b2 = (color2 & ColorUtils.BYTE_0_MASK);

    if (typeof fraction === 'number') {
      const r = Math.round(MathUtils.lerp(fraction, 0, 1, r1, r2, true, true));
      const g = Math.round(MathUtils.lerp(fraction, 0, 1, g1, g2, true, true));
      const b = Math.round(MathUtils.lerp(fraction, 0, 1, b1, b2, true, true));
      return (r << 16) | (g << 8) | b;
    } else {
      out ??= [];

      for (let i = 0; i < fraction.length; i++) {
        const r = Math.round(MathUtils.lerp(fraction[i], 0, 1, r1, r2, true, true));
        const g = Math.round(MathUtils.lerp(fraction[i], 0, 1, g1, g2, true, true));
        const b = Math.round(MathUtils.lerp(fraction[i], 0, 1, b1, b2, true, true));
        out[i] = (r << 16) | (g << 8) | b;
      }

      out.length = fraction.length;

      return out;
    }
  }

  /**
   * Creates a function that linearly interpolates between two colors in the RGB colorspace.
   * @param color1 The first color to interpolate between.
   * @param color2 The second color to interpolate between.
   * @returns A function that linearly interpolates between the two specified colors in the RGB colorspace.
   */
  public static gradientHex<T = number | string>(color1: T, color2: T): (fraction: number) => T {
    const useString = typeof color1 === 'string';

    const color1Number = useString ? ColorUtils.hexStringToNumber(color1 as unknown as string) : color1 as unknown as number;
    const color2Number = useString ? ColorUtils.hexStringToNumber(color2 as unknown as string) : color2 as unknown as number;

    if (useString) {
      const interpFunc = ColorUtils.gradientRgbSpace(color1Number, color2Number);
      return ((fraction: number): string => {
        return ColorUtils.hexNumberToString(interpFunc(fraction));
      }) as unknown as (fraction: number) => T;
    } else {
      return ColorUtils.gradientRgbSpace(color1Number, color2Number) as unknown as (fraction: number) => T;
    }
  }

  /**
   * Creates a function that linearly interpolates between two numeric hex colors in the RGB colorspace.
   * @param color1 The first color to interpolate between.
   * @param color2 The second color to interpolate between.
   * @returns A function that linearly interpolates between the two specified colors in the RGB colorspace.
   */
  private static gradientRgbSpace(color1: number, color2: number): (fraction: number) => number {
    const r1 = (color1 & ColorUtils.BYTE_2_MASK) >> 16;
    const g1 = (color1 & ColorUtils.BYTE_1_MASK) >> 8;
    const b1 = (color1 & ColorUtils.BYTE_0_MASK);

    const r2 = (color2 & ColorUtils.BYTE_2_MASK) >> 16;
    const g2 = (color2 & ColorUtils.BYTE_1_MASK) >> 8;
    const b2 = (color2 & ColorUtils.BYTE_0_MASK);

    return (fraction: number): number => {
      const r = Math.round(MathUtils.lerp(fraction, 0, 1, r1, r2, true, true));
      const g = Math.round(MathUtils.lerp(fraction, 0, 1, g1, g2, true, true));
      const b = Math.round(MathUtils.lerp(fraction, 0, 1, b1, b2, true, true));
      return (r << 16) | (g << 8) | b;
    };
  }
}