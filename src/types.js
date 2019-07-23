//@flow strict
export type IPoint = [number, number]

export type TRegion = {|
  "title": string,
  "code": string,
  "titleParams"?: {|
    "offset": IPoint,
    "width"?: number,
    "size"?: number,
  |},
|}
