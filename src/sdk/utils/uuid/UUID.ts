/** Utility functions for working with UUIDs. */
export class UUID {
  /**
   * A function to generate a spec-compliand v4 UUID in a 32-bit safe way.
   * @returns A UUID in standard 8-4-4-4-12 notation.
   */
  public static GenerateUuid(): string {
    const scale = 2 ** 32;
    const first = UUID.bytesToHexString(Math.random() * scale);
    const fourth = UUID.bytesToHexString(Math.random() * scale);

    let secondBits = Math.random() * scale;
    let thirdBits = Math.random() * scale;

    // 4 MSB of seventh byte = 0100
    secondBits |= 0b00000000000000000100000000000000;
    secondBits &= 0b11111111111111110100111111111111;
    const second = UUID.bytesToHexString(secondBits);

    // 2 MSB of ninth byte = 10;
    thirdBits |= 0b10000000000000000000000000000000;
    thirdBits &= 0b10111111111111111111111111111111;
    const third = UUID.bytesToHexString(thirdBits);

    return `${first}-${second.substring(0, 4)}-${second.substring(4)}-${third.substring(0, 4)}-${third.substring(4)}${fourth}`;
  }

  /**
   * Take a number and return its hexadecimal representation.
   * @param bits The bytes to format.
   * @returns The input bits as a hexadecimal string.
   */
  private static bytesToHexString(bits: number): string {
    let string = (bits >>> 0).toString(16);
    string = '00000000'.substring(string.length) + string;
    return string;
  }
}