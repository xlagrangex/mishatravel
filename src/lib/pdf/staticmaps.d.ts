declare module "staticmaps" {
  interface StaticMapsOptions {
    width: number;
    height: number;
    paddingX?: number;
    paddingY?: number;
    tileUrl?: string;
  }

  interface MarkerOptions {
    coord: [number, number];
    img?: string;
    width?: number;
    height?: number;
  }

  interface LineOptions {
    coords: [number, number][];
    color?: string;
    width?: number;
  }

  class StaticMaps {
    constructor(options: StaticMapsOptions);
    addMarker(options: MarkerOptions): void;
    addLine(options: LineOptions): void;
    render(): Promise<void>;
    image: {
      buffer(format: string): Promise<Buffer>;
    };
  }

  export default StaticMaps;
}
