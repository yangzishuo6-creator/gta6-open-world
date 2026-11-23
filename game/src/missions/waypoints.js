import * as T from 'three';
export function makeWaypoint(scene, color=0xffc25c) {
  const root=new T.Group();
  const ring=new T.Mesh(new T.TorusGeometry(2.8,.13,8,40),new T.MeshBasicMaterial({color}));
  ring.rotation.x=Math.PI/2;
  const pillar=new T.Mesh(new T.CylinderGeometry(2.75,2.75,6,32,1,true),new T.MeshBasicMaterial({
    color,transparent:true,opacity:.095,depthWrite:false,side:T.DoubleSide
  }));
  pillar.position.y=3;
  const marker=new T.Mesh(new T.OctahedronGeometry(.63),new T.MeshBasicMaterial({color}));
  root.add(ring,pillar,marker);
  scene.add(root);
  return (point,time)=>{
    root.visible=!!point;
    if(!point)return;
    root.position.set(point.x,.12,point.z);
    marker.position.y=5.5+Math.sin(time*3)*.5;
    marker.rotation.y=time*1.8;
  };
}
