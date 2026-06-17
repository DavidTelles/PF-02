// Mock simplificado de THREE para testar fluxo lógico do hydra-bg.js sem WebGL real
class Vector3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  setScalar(s){this.x=this.y=this.z=s;return this;}
  clone(){return new Vector3(this.x,this.y,this.z);}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
}
class Euler {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
}
class Quaternion { clone(){return new Quaternion();} }
class Object3D {
  constructor(){
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1,1,1);
    this.children = [];
    this.quaternion = new Quaternion();
  }
  add(obj){ this.children.push(obj); return this; }
  lookAt(){ return this; }
  rotateX(){ return this; }
  copy(v){ this.position.copy(v); return this;}
}
class Group extends Object3D {}
class Mesh extends Object3D { constructor(geo,mat){ super(); this.geometry=geo; this.material=mat; } }
class Scene extends Object3D { constructor(){super(); this.fog=null;} }
class PerspectiveCamera extends Object3D { constructor(){super();} updateProjectionMatrix(){} }
class WebGLRenderer {
  constructor(){ this.domElement = { style:{} }; }
  setSize(){}
  setPixelRatio(){}
  setClearColor(){}
  render(){}
  dispose(){}
}
class FogExp2 { constructor(){} }
class AmbientLight extends Object3D {}
class DirectionalLight extends Object3D {}
class PointLight extends Object3D { constructor(){super(); this.intensity=1;} }
class MeshStandardMaterial { constructor(opts){ Object.assign(this, opts); } }
class CylinderGeometry {}
class ConeGeometry {}
class SphereGeometry {}
class TubeGeometry { constructor(curve){ this.curve = curve; } }
class CatmullRomCurve3 {
  constructor(points){ this.points = points; }
  getPoint(t){ return this.points[this.points.length-1].clone(); }
  getTangent(t){ return new Vector3(0,1,0); }
}
class Clock {
  constructor(){ this.elapsedTime=0; }
  getDelta(){ return 0.016; }
}

global.THREE = {
  Scene, PerspectiveCamera, WebGLRenderer, FogExp2, AmbientLight, DirectionalLight,
  PointLight, MeshStandardMaterial, CylinderGeometry, ConeGeometry, SphereGeometry,
  TubeGeometry, CatmullRomCurve3, Vector3, Group, Mesh, Clock
};