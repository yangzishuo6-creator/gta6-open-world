import * as T from 'three';

export function lightHarbor(scene) {
  scene.fog = new T.FogExp2(0xec9168, .0025);
  scene.add(new T.HemisphereLight(0xffdfcd, 0x718fbf, 1.36));
  const key = new T.DirectionalLight(0xffab60, 3.15);
  key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera,{left:-69,right:69,top:69,bottom:-69,near:2,far:260});
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias=-.00022;
  key.shadow.normalBias=.026;
  scene.add(key,key.target);
  const sky = new T.Mesh(new T.SphereGeometry(690,48,24), new T.ShaderMaterial({
    side:T.BackSide, depthWrite:false,
    vertexShader:`
      varying vec3 direction;
      void main(){
        direction = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
      }`,
    fragmentShader:`
      varying vec3 direction;
      void main(){
        vec3 n = normalize(direction);
        vec3 s = normalize(vec3(.12,.105,-.98));
        float d = distance(n,s);
        vec3 c = mix(vec3(1.,.47,.23),vec3(.15,.39,.67),smoothstep(-.08,.47,n.y));
        c += vec3(.32,.21,.09)*exp(-d*4.);
        c += vec3(.30,.17,.08)*exp(-d*22.);
        c = mix(c,vec3(1.,.94,.68),1.-smoothstep(.028,.033,d));
        float bands = sin(n.y*140.+sin(n.x*11.)*1.6+sin(n.x*25.+n.y*19.)*.59)*.5+.5;
        float fragments = sin(n.x*16.+n.z*6.+n.y*8.)*.65+sin(n.x*45.+n.y*11.)*.35;
        float clouds = smoothstep(.55,1.,bands)*smoothstep(-.15,.82,fragments);
        c = mix(c,vec3(1.,.79,.67),clouds*.48*(1.-smoothstep(.19,.45,n.y)));
        gl_FragColor = vec4(c,1.);
      }`,
  }));
  scene.add(sky);
  return {
    follow(p) {
      const x=Math.round(p.x/2)*2;
      const z=Math.round(p.z/2)*2;
      key.position.set(x+65,57,z-89);
      key.target.position.set(x,0,z);
      sky.position.set(x,0,z);
    },
  };
}

export function makeOcean(scene) {
  const water = new T.Mesh(new T.PlaneGeometry(2700,3300),new T.ShaderMaterial({
    transparent:true,
    uniforms:{time:{value:0}},
    vertexShader:`
      varying vec3 p;
      void main(){
        p=(modelMatrix*vec4(position,1.)).xyz;
        gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
      }`,
    fragmentShader:`
      uniform float time;
      varying vec3 p;
      void main(){
        float wave=sin(p.x*.61+sin(p.z*.112)*2.+time)+sin(p.z*.75+p.x*.42-time*.6);
        vec3 sea=mix(vec3(.075,.39,.49),vec3(.38,.76,.71),exp(-max(0.,p.x-53.)*.024));
        sea+=wave*.022;
        float glint=pow(max(0.,sin(p.z*2.2+wave+p.x*.39)),19.);
        float sparkle=exp(-abs(p.x-cameraPosition.x+(p.z-cameraPosition.z)*.52)*.027);
        sea+=vec3(.68,.41,.20)*glint*.67*sparkle;
        float shore=p.x-54.-sin(p.z*.19)*.62;
        float surf=sin(shore*2.+sin(p.z*.32)-time);
        sea=mix(sea,vec3(.88,.96,.83),smoothstep(.64,1.,surf)*exp(-abs(shore)*.34)*.85);
        sea=mix(sea,vec3(.90,.63,.51),smoothstep(73.,950.,distance(cameraPosition,p)));
        gl_FragColor=vec4(sea,1.-smoothstep(480.,1440.,distance(cameraPosition,p)));
      }`,
  }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(330,-.21,0);
  scene.add(water);
  return water.material.uniforms.time;
}
