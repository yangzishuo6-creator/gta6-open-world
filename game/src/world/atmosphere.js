import * as T from 'three';
export function lightWaterfront(scene) {
  scene.fog = new T.FogExp2(0xf5ba9f,.0036);
  const sky = new T.Mesh(new T.SphereGeometry(460,32,16), new T.ShaderMaterial({
    side:T.BackSide, depthWrite:false,
    vertexShader:`varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec3 v;
      void main(){
        vec3 d=normalize(v);
        float h=max(0.,d.y);
        vec3 color=mix(vec3(1.,.64,.42),vec3(.30,.66,.84),smoothstep(0.,.62,h));
        float cloud=sin(d.x*24.+sin(d.z*13.)*1.4)+sin(d.z*24.-d.x*12.)*.55;
        color=mix(color,vec3(1.,.83,.76),smoothstep(.88,1.48,cloud)*smoothstep(.03,.17,h)*(1.-smoothstep(.17,.42,h))*.66);
        float sun=length(d-normalize(vec3(.48,.15,1.)));
        color+=vec3(.30,.16,.07)*exp(-sun*9.);
        color=mix(color,vec3(1.,.98,.78),1.-smoothstep(.028,.032,sun));
        gl_FragColor=vec4(color,1.);
      }`
  }));
  scene.add(sky,new T.HemisphereLight(0xd9f4ff,0xb67762,2.05));
  const sun = new T.DirectionalLight(0xffcf99,2.25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-63,right:63,top:63,bottom:-63,near:1,far:230});
  sun.shadow.normalBias=.12;
  sun.shadow.bias=-.00015;
  scene.add(sun,sun.target);
  return (x,z) => {
    sky.position.set(x,0,z);
    sun.position.set(x+45,63,z+22);
    sun.target.position.set(x,0,z);
  };
}
