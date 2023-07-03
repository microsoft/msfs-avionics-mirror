/** Takes a number type from 1 to 8 and returns a union type ranging from 1 to E inclusive, 8 is the limit. */
export type NumberToRangeUnion<E extends number | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8> =
  E extends 1 ? 1
  : E extends 2 ? 1 | 2
  : E extends 3 ? 1 | 2 | 3
  : E extends 4 ? 1 | 2 | 3 | 4
  : E extends 5 ? 1 | 2 | 3 | 4 | 5
  : E extends 6 ? 1 | 2 | 3 | 4 | 5 | 6
  : E extends 7 ? 1 | 2 | 3 | 4 | 5 | 6 | 7
  : E extends 8 ? 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  : number;
