function createRobotViewer(container, options = {}) {
    if (!container) {
      throw new Error('Container do viewer não foi informado.');
    }
  
    const width = () => container.clientWidth || 1;
    const height = () => container.clientHeight || 1;
  
    // ---------- CONFIG ----------
    const config = {
      background: 0x11151a,
      fogNear: 14,
      fogFar: 26,
      autoRotateSpeed: 0.0035,
      minRadius: 3.2,
      maxRadius: 14,
      startTheta: 0.7,
      startPhi: 1.05,
      startRadius: 7.4,
      ...options
    };
  
    // ---------- SCENE ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.background);
    scene.fog = new THREE.Fog(config.background, config.fogNear, config.fogFar);
  
    const camera = new THREE.PerspectiveCamera(40, width() / height(), 0.1, 100);
  
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });
  
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  
    container.appendChild(renderer.domElement);
  
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'grab';
  
    // ---------- LIGHTS ----------
    const hemi = new THREE.HemisphereLight(0xfff3d6, 0x4a3712, 0.65);
    scene.add(hemi);
  
    const sun = new THREE.DirectionalLight(0xfff3da, 1.15);
    sun.position.set(5, 9, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -8;
    sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 25;
    sun.shadow.bias = -0.0015;
    scene.add(sun);
  
    const fill = new THREE.DirectionalLight(0xcfe3ff, 0.35);
    fill.position.set(-6, 4, -5);
    scene.add(fill);
  
    // ---------- HELPERS ----------
    const materials = [];
    const geometries = [];
  
    function trackMaterial(material) {
      materials.push(material);
      return material;
    }
  
    function trackGeometry(geometry) {
      geometries.push(geometry);
      return geometry;
    }
  
    function mat(color, roughness, metalness) {
      return trackMaterial(
        new THREE.MeshStandardMaterial({ color, roughness, metalness })
      );
    }
  
    function addEdges(mesh, opacity = 0.3) {
      const eg = trackGeometry(new THREE.EdgesGeometry(mesh.geometry));
      const lm = trackMaterial(
        new THREE.LineBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity
        })
      );
      const lines = new THREE.LineSegments(eg, lm);
      mesh.add(lines);
    }
  
    function box(x, y, z, color, rough, metal) {
      const geometry = trackGeometry(new THREE.BoxGeometry(x, y, z));
      const mesh = new THREE.Mesh(geometry, mat(color, rough, metal));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }
  
    function wireTube(p0, p1, pmid, radius, color) {
      const curve = new THREE.QuadraticBezierCurve3(p0, pmid, p1);
      const geo = trackGeometry(new THREE.TubeGeometry(curve, 16, radius, 8, false));
      const mesh = new THREE.Mesh(geo, mat(color, 0.55, 0.1));
      mesh.castShadow = true;
      return mesh;
    }
    
    // ---------- DIMENSIONS ----------
    const WHEEL_R = 0.78, WHEEL_W = 0.42;
    const CH_LEN = 4.6, CH_WID = 2.5, CH_THK = 0.14;
    const CH_BOTTOM_Y = WHEEL_R;
    const CH_TOP_Y = CH_BOTTOM_Y + CH_THK;
    const REAR_X = -1.55;
    const FRONT_X = 1.7;
  
    const car = new THREE.Group();
  
    // ---------- CHASSIS ----------
    const chassis = box(CH_LEN, CH_THK, CH_WID, 0x9c6b43, 0.85, 0.05);
    chassis.position.set(0, CH_BOTTOM_Y + CH_THK / 2, 0);
    addEdges(chassis, 0.35);
    car.add(chassis);
  
    for (let i = -1.8; i <= 1.8; i += 0.45) {
      const grain = box(0.01, 0.002, CH_WID * 0.92, 0x6e4a2c, 0.9, 0);
      grain.position.set(i, CH_TOP_Y + 0.001, 0);
      car.add(grain);
    }
  
    // ---------- WHEELS ----------
    function buildWheel(z) {
      const wheelGroup = new THREE.Group();
  
      const tireGeo = trackGeometry(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, WHEEL_W, 28));
      const tire = new THREE.Mesh(tireGeo, mat(0x1c1c1c, 0.85, 0.05));
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      tire.receiveShadow = true;
      wheelGroup.add(tire);
  
      const hubGeo = trackGeometry(new THREE.CylinderGeometry(WHEEL_R * 0.55, WHEEL_R * 0.55, WHEEL_W * 1.06, 20));
      const hub = new THREE.Mesh(hubGeo, mat(0xf2c200, 0.4, 0.35));
      hub.rotation.x = Math.PI / 2;
      hub.castShadow = true;
      wheelGroup.add(hub);
  
      const capGeo = trackGeometry(new THREE.CylinderGeometry(WHEEL_R * 0.12, WHEEL_R * 0.12, WHEEL_W * 1.1, 12));
      const cap = new THREE.Mesh(capGeo, mat(0x8a6200, 0.4, 0.4));
      cap.rotation.x = Math.PI / 2;
      wheelGroup.add(cap);
  
      wheelGroup.position.set(REAR_X, WHEEL_R, z);
      return wheelGroup;
    }
  
    const wheelL = buildWheel(-(CH_WID / 2 + WHEEL_W / 2 + 0.06));
    const wheelR = buildWheel(CH_WID / 2 + WHEEL_W / 2 + 0.06);
    car.add(wheelL, wheelR);
  
    function buildMotor(z) {
      const g = new THREE.Group();
      const body = box(0.36, 0.36, 0.58, 0xf3e000, 0.45, 0.25);
      addEdges(body, 0.3);
      g.add(body);
  
      const shaftGeo = trackGeometry(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 12));
      const shaft = new THREE.Mesh(shaftGeo, mat(0xc9c9c9, 0.3, 0.8));
      shaft.rotation.x = Math.PI / 2;
      shaft.position.set(0, 0, z > 0 ? 0.5 : -0.5);
      g.add(shaft);
  
      g.position.set(REAR_X, WHEEL_R, z > 0 ? 1.0 : -1.0);
      return g;
    }
  
    car.add(buildMotor(1), buildMotor(-1));
  
    // ---------- CASTER ----------
    const casterGroup = new THREE.Group();
    const bracket = box(0.3, 0.34, 0.3, 0xaab0b6, 0.4, 0.6);
    bracket.position.set(0, CH_BOTTOM_Y - 0.17, 0);
    addEdges(bracket, 0.3);
    casterGroup.add(bracket);
  
    const forkGeo = trackGeometry(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 10));
    const fork = new THREE.Mesh(forkGeo, mat(0x8d9298, 0.4, 0.6));
    fork.position.set(0, CH_BOTTOM_Y - 0.42, 0);
    casterGroup.add(fork);
  
    const casterTireGeo = trackGeometry(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 20));
    const casterTire = new THREE.Mesh(casterTireGeo, mat(0xf1ecdf, 0.6, 0.1));
    casterTire.rotation.x = Math.PI / 2;
    casterTire.position.set(0, 0.3, 0);
    casterTire.castShadow = true;
    casterTire.receiveShadow = true;
    casterGroup.add(casterTire);
  
    casterGroup.position.set(FRONT_X, 0, 0);
    car.add(casterGroup);
  
    // ---------- BATTERY ----------
    const battery = box(1.7, 0.42, 0.95, 0x15130f, 0.7, 0.1);
    battery.position.set(-0.6, CH_TOP_Y + 0.21, 0);
    addEdges(battery, 0.4);
    car.add(battery);
  
    for (let i = -1; i <= 1; i += 2) {
      const capGeo = trackGeometry(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 14));
      const cellCap = new THREE.Mesh(capGeo, mat(0x3a3a26, 0.5, 0.3));
      cellCap.position.set(-0.6 + i * 0.55, CH_TOP_Y + 0.421, 0.32);
      car.add(cellCap);
  
      const cellCap2 = cellCap.clone();
      cellCap2.position.z = -0.32;
      car.add(cellCap2);
    }
  
    // ---------- DRIVER BOARD ----------
    const pcb = box(1.05, 0.07, 0.85, 0xb5281f, 0.45, 0.15);
    pcb.position.set(0.75, CH_TOP_Y + 0.035, 0.04);
    addEdges(pcb, 0.45);
    car.add(pcb);
  
    function terminal(x, z) {
      const t = box(0.28, 0.13, 0.18, 0x1f5fa8, 0.4, 0.2);
      t.position.set(x, CH_TOP_Y + 0.135, z);
      car.add(t);
    }
  
    terminal(0.35, 0.28);
    terminal(0.35, -0.28);
  
    const heatsink = box(0.18, 0.12, 0.2, 0x8a8f94, 0.3, 0.6);
    heatsink.position.set(1.1, CH_TOP_Y + 0.13, 0.04);
    car.add(heatsink);
  
    // ---------- WIRES ----------
    car.add(wireTube(
      new THREE.Vector3(-0.1, CH_TOP_Y + 0.18, 0.2),
      new THREE.Vector3(0.25, CH_TOP_Y + 0.08, 0.22),
      new THREE.Vector3(0.1, CH_TOP_Y + 0.32, 0.3), 0.028, 0xcc2b2b
    ));
  
    car.add(wireTube(
      new THREE.Vector3(-0.1, CH_TOP_Y + 0.18, -0.2),
      new THREE.Vector3(0.25, CH_TOP_Y + 0.08, -0.22),
      new THREE.Vector3(0.1, CH_TOP_Y + 0.32, -0.3), 0.028, 0x1c1c1c
    ));
  
    car.add(wireTube(
      new THREE.Vector3(1.3, CH_TOP_Y + 0.07, 0.25),
      new THREE.Vector3(REAR_X + 0.3, WHEEL_R + 0.1, 1.0),
      new THREE.Vector3(0.4, CH_TOP_Y + 0.5, 0.7), 0.026, 0xcc2b2b
    ));
  
    car.add(wireTube(
      new THREE.Vector3(1.3, CH_TOP_Y + 0.07, -0.25),
      new THREE.Vector3(REAR_X + 0.3, WHEEL_R + 0.1, -1.0),
      new THREE.Vector3(0.4, CH_TOP_Y + 0.5, -0.7), 0.026, 0xe9e4d6
    ));
  
    scene.add(car);
  
    // ---------- CAMERA ----------
    const DEFAULT_RADIUS = 12;

    const target = new THREE.Vector3(0, CH_TOP_Y * 0.55, 0);
    
    const state = {
      theta: config.startTheta ?? 0.7,
      phi: config.startPhi ?? 1.05,
      radius: config.startRadius ?? DEFAULT_RADIUS
    };
    
    const desired = {
      theta: state.theta,
      phi: state.phi,
      radius: state.radius
    };
    
    const PHI_MIN = 0.12;
    const PHI_MAX = Math.PI - 0.12;
    const RAD_MIN = config.minRadius ?? 8;
    const RAD_MAX = config.maxRadius ?? 18;
    
    function updateCamera() {
      const sinPhi = Math.sin(state.phi);
    
      const x = target.x + state.radius * sinPhi * Math.cos(state.theta);
      const y = target.y + state.radius * Math.cos(state.phi);
      const z = target.z + state.radius * sinPhi * Math.sin(state.theta);
    
      camera.position.set(x, y, z);
      camera.lookAt(target);
    }
    
    function shortestDelta(a, b) {
      let d = b - a;
      d -= Math.PI * 2 * Math.round(d / (Math.PI * 2));
      return d;
    }
    
    function onWheel(e) {
      const goingCloser = e.deltaY < 0;
      const goingFarther = e.deltaY > 0;
    
      if (
        (desired.radius <= RAD_MIN && goingCloser) ||
        (desired.radius >= RAD_MAX && goingFarther)
      ) {
        return;
      }
    
      e.preventDefault();
    
      desired.radius *= 1 + e.deltaY * 0.0012;
      desired.radius = Math.max(RAD_MIN, Math.min(RAD_MAX, desired.radius));
    }
    
    canvas.addEventListener('wheel', onWheel, { passive: false });
  
    // ---------- INTERACTION ----------
    let dragging = false;
    let autoRotate = false;
    let lastX = 0;
    let lastY = 0;
    let rafId = 0;
  
    function onPointerDown(e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture?.(e.pointerId);
    }
  
    function onPointerMove(e) {
      if (!dragging) return;
  
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
  
      lastX = e.clientX;
      lastY = e.clientY;
  
      desired.theta -= dx * 0.0055;
      desired.phi -= dy * 0.0055;
      desired.phi = Math.max(PHI_MIN, Math.min(PHI_MAX, desired.phi));
  
      autoRotate = false;
    }
  
    function onPointerUp() {
      dragging = false;
      canvas.style.cursor = 'grab';
    }
  
    function onWheel(e) {
      e.preventDefault();
      desired.radius *= (1 + e.deltaY * 0.0012);
      desired.radius = Math.max(RAD_MIN, Math.min(RAD_MAX, desired.radius));
    }
  
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
  
    // ---------- PRESET VIEWS ----------
    const ELEV = 1.12;
    const presets = {
      front: { theta: 0, phi: ELEV, radius: 7.4 },
      back: { theta: Math.PI, phi: ELEV, radius: 7.4 },
      right: { theta: Math.PI / 2, phi: ELEV, radius: 7.4 },
      left: { theta: -Math.PI / 2, phi: ELEV, radius: 7.4 },
      top: { theta: null, phi: PHI_MIN, radius: 7.4 },
      bottom: { theta: null, phi: PHI_MAX, radius: 7.4 }
    };
  
    function setView(name) {
      const p = presets[name];
      if (!p) return;
      desired.theta = p.theta === null ? state.theta : p.theta;
      desired.phi = p.phi;
      desired.radius = p.radius;
      autoRotate = false;
    }
  
    function resetView() {
      desired.theta = config.startTheta;
      desired.phi = config.startPhi;
      desired.radius = config.startRadius;
      autoRotate = false;
    }
  
    function setAutoRotate(value) {
      autoRotate = Boolean(value);
    }
  
    // ---------- RESIZE ----------
    function resize() {
      const w = width();
      const h = height();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
  
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  
    // ---------- ANIMATION ----------
    function animate() {
      rafId = requestAnimationFrame(animate);
  
      if (autoRotate && !dragging) {
        desired.theta += config.autoRotateSpeed;
      }
  
      state.theta += shortestDelta(state.theta, desired.theta) * 0.09;
      state.phi += (desired.phi - state.phi) * 0.09;
      state.radius += (desired.radius - state.radius) * 0.09;
  
      updateCamera();
      renderer.render(scene, camera);
    }
  
    resize();
    updateCamera();
    animate();
  
    // ---------- API ----------
    return {
      scene,
      camera,
      renderer,
      setView,
      resetView,
      setAutoRotate,
      dispose() {
        cancelAnimationFrame(rafId);
  
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('wheel', onWheel);
        window.removeEventListener('pointerup', onPointerUp);
  
        resizeObserver.disconnect();
  
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose?.();
  
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose?.());
            } else {
              obj.material.dispose?.();
            }
          }
        });
  
        renderer.dispose();
  
        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }
      }
    };
  }