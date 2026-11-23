import * as T from 'three';

const cube = new T.BoxGeometry(1, 1, 1);
const materials = new Map();
export function paint(color) {
  if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({color, roughness: .79}));
  return materials.get(color);
}

export function box(parent, color, x, y, z, w, h, d) {
  const mesh = new T.Mesh(cube, paint(color));
  mesh.position.set(x, y, z);
  mesh.scale.set(w, h, d);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  parent.add(mesh);
  return mesh;
}

export function batchBoxes(scene) {
  const rows = [];
  const stamp = new T.Object3D();
  const color = new T.Color();
  return {
    add(tint, x, y, z, w, h, d, tilt = 0) {
      rows.push([tint, x, y, z, w, h, d, tilt]);
    },
    finish() {
      const casts = row => row[2] > .19;
      for (const castShadow of [false,true]) {
        const entries=rows.filter(row=>casts(row)===castShadow);
        const mesh = new T.InstancedMesh(cube, paint(0xffffff), entries.length);
        entries.forEach(([tint,x,y,z,w,h,d,tilt], i) => {
          stamp.position.set(x,y,z);
          stamp.scale.set(w,h,d);
          stamp.rotation.y = tilt;
          stamp.updateMatrix();
          mesh.setMatrixAt(i, stamp.matrix);
          mesh.setColorAt(i, color.set(tint));
        });
        mesh.receiveShadow = true;
        mesh.castShadow = castShadow;
        scene.add(mesh);
      }
    },
  };
}

export function lettering(parent, words, ink, fill, w, h, x, y, z, angle = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = fill;
  ctx.fillRect(0,0,512,128);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(7,8,498,112);
  ctx.fillStyle = ink;
  ctx.font = 'bold 58px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(words,256,67,465);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const mesh = new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshBasicMaterial({map:texture}));
  mesh.position.set(x,y,z);
  mesh.rotation.y = angle;
  parent.add(mesh);
  return mesh;
}

export function noise(i) {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}
