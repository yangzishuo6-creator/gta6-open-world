import * as T from 'three';

const cube = new T.BoxGeometry();
const materials = new Map();
export function material(color) {
  if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({color, roughness:.77}));
  return materials.get(color);
}
export function box(parent, color, x,y,z,w,h,d) {
  const mesh = new T.Mesh(cube, material(color));
  mesh.position.set(x,y,z);
  mesh.scale.set(w,h,d);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function seededRandom(seed) {
  return () => ((seed = (Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
}
export function batchBoxes(group) {
  const batches = new Map();
  group.updateMatrixWorld(true);
  group.traverse(o => {
    if (o.geometry !== cube) return;
    if (!batches.has(o.material)) batches.set(o.material,[]);
    batches.get(o.material).push(o.matrixWorld.clone());
  });
  const root = new T.Group();
  for (const [mat, matrices] of batches) {
    const mesh = new T.InstancedMesh(cube,mat,matrices.length);
    matrices.forEach((m,i) => mesh.setMatrixAt(i,m));
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
  }
  return root;
}
