//@flow strict
export type TRegion = {|
  "title": string,
  "code": string,
  "titleParams"?: {|
    "offset": [number, number],
    "width"?: number,
    "size"?: number,
  |},
|}
