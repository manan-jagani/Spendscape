export interface TreemapCategory {
  name: string;
  value: number;
  color: string;
}

export interface TreemapNode extends TreemapCategory {
  x: number;
  y: number;
  width: number;
  height: number;
}
