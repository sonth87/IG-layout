import type Konva from "konva";

// While a layout block is dragged / pinched / transformed, its cells follow it live
// (M14). Positions are imperative (no React render per frame); the document is
// updated once at the end and the cells are re-laid out from it.

interface Follower {
  node: Konva.Node;
  x: number;
  y: number;
  rotation: number;
}

export interface Follow {
  block: Konva.Node;
  x: number;
  y: number;
  rotation: number;
  cells: Follower[];
}

export function startFollow(block: Konva.Node, cellIds: string[]): Follow {
  const stage = block.getStage();
  const cells = cellIds
    .map((id) => stage?.findOne(`#${id}`))
    .filter((n): n is Konva.Node => !!n)
    .map((node) => ({ node, x: node.x(), y: node.y(), rotation: node.rotation() }));
  return { block, x: block.x(), y: block.y(), rotation: block.rotation(), cells };
}

/** Moves the cells by the block's change since the start: translate, turn, scale (per block axis). */
export function follow(f: Follow) {
  const b = f.block;
  const sx = b.scaleX();
  const sy = b.scaleY();
  const r0 = (-f.rotation * Math.PI) / 180;
  const r1 = (b.rotation() * Math.PI) / 180;
  for (const c of f.cells) {
    // Offset from the block centre, in the block's own axes at the start.
    const ox = c.x - f.x;
    const oy = c.y - f.y;
    const lx = (ox * Math.cos(r0) - oy * Math.sin(r0)) * sx;
    const ly = (ox * Math.sin(r0) + oy * Math.cos(r0)) * sy;
    c.node.position({ x: b.x() + lx * Math.cos(r1) - ly * Math.sin(r1), y: b.y() + lx * Math.sin(r1) + ly * Math.cos(r1) });
    c.node.rotation(c.rotation + b.rotation() - f.rotation);
    c.node.scale({ x: sx, y: sy });
  }
}

/** Puts the cells back where they started (before the document update re-lays them out). */
export function endFollow(f: Follow) {
  for (const c of f.cells) {
    c.node.position({ x: c.x, y: c.y });
    c.node.rotation(c.rotation);
    c.node.scale({ x: 1, y: 1 });
  }
}
