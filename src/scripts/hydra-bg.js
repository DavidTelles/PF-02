/* ==============================================================
   SEPTEM RACING — Hidra 3D de fundo (Three.js)
   --------------------------------------------------------------
   Renderiza uma hidra dourada/sombria de 7 cabeças como elemento
   decorativo fixo no fundo da landing page. A criatura permanece
   majoritariamente oculta nas sombras e "emerge" sutilmente
   conforme o usuário rola a página (opacidade, leve subida e
   leve giro de câmera). As cabeças têm um movimento procedural
   contínuo e independente, como se respirassem/observassem.

   Não depende de nenhum asset externo (.glb/.fbx): toda a
   geometria é construída via primitivas Three.js, então a única
   dependência de rede é a própria biblioteca Three.js via CDN.
================================================================ */
(function () {
    'use strict';
  
    if (typeof window === 'undefined') return;
  
    // Respeita usuários que pedem menos animação no sistema
    var prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    function init() {
      var THREE = window.THREE;
      if (!THREE) return; // CDN falhou ou bloqueada — degrada graciosamente (sem fundo 3D)
  
      var mount = document.getElementById('hydra-bg');
      if (!mount) return;
  
      // ------------------------------------------------------------
      // Paleta — alinhada ao design system (--gold / --black do projeto)
      // ------------------------------------------------------------
      var COLOR_GOLD = 0xc9a030;
      var COLOR_GOLD_BRIGHT = 0xe6c35c;
      var COLOR_SCALE_DARK = 0x0c0a07;
      var COLOR_SCALE_MID = 0x1c1712;
      var COLOR_EYE = 0xffce5c;
      var COLOR_FOG = 0x050505;
  
      // ------------------------------------------------------------
      // Cena / Câmera / Renderer
      // ------------------------------------------------------------
      var scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(COLOR_FOG, 0.00052);
  
      var camera = new THREE.PerspectiveCamera(
        42,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.set(0, 1.6, 13);
      camera.lookAt(0, 2.4, 0);
  
      var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);
  
      // ------------------------------------------------------------
      // Luzes — escuras e dramáticas, só os dourados se destacam
      // ------------------------------------------------------------
      scene.add(new THREE.AmbientLight(0x171310, 0.9));
  
      var rim = new THREE.DirectionalLight(0x4a3d1f, 0.5);
      rim.position.set(6, 8, 4);
      scene.add(rim);
  
      var keyGlow = new THREE.PointLight(COLOR_GOLD, 2, 28, 2);
      keyGlow.position.set(0, 5, 4);
      scene.add(keyGlow);
  
      // ------------------------------------------------------------
      // Materiais reutilizados
      // ------------------------------------------------------------
      var matScaleDark = new THREE.MeshStandardMaterial({
        color: COLOR_SCALE_DARK,
        roughness: 0.35,
        metalness: 0.75
      });
      var matScaleMid = new THREE.MeshStandardMaterial({
        color: COLOR_SCALE_MID,
        roughness: 0.6,
        metalness: 0.4
      });
      var matGold = new THREE.MeshStandardMaterial({
        color: COLOR_GOLD,
        roughness: 0.35,
        metalness: 0.75,
        emissive: COLOR_GOLD,
        emissiveIntensity: 0.4
      });
      var matHorn = new THREE.MeshStandardMaterial({
        color: 0x12100c,
        roughness: 0.4,
        metalness: 0.6
      });
      var matEye = new THREE.MeshStandardMaterial({
        color: COLOR_EYE,
        emissive: COLOR_EYE,
        emissiveIntensity: 2.2,
        roughness: 0.3,
        metalness: 0
      });
  
      // ------------------------------------------------------------
      // Grupo raiz da hidra inteira (permite mover o conjunto)
      // ------------------------------------------------------------
      var hydra = new THREE.Group();
      scene.add(hydra);
  
      // Corpo central / torso emergindo da escuridão (parte inferior
      // intencionalmente "perdida" no fog para reforçar a sensação
      // de algo enorme que continua além do que se vê)
      var torsoGeo = new THREE.CylinderGeometry(1.4, 2.6, 7, 16, 6, true);
      var torso = new THREE.Mesh(torsoGeo, matScaleDark);
      torso.position.set(0, -1.5, -1.5);
      hydra.add(torso);
  
      // Cristas dorsais ao longo do torso (pequenas "espinhas" douradas)
      for (var s = 0; s < 6; s++) {
        var spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.6, 5),
          matGold
        );
        var sy = -4.5 + s * 1.3;
        spike.position.set(0, sy, -2.4 + Math.sin(s) * 0.1);
        spike.rotation.x = Math.PI * 0.92;
        hydra.add(spike);
      }
  
      // ------------------------------------------------------------
      // Fábrica de "pescoço + cabeça" reutilizável para as 7 cabeças
      // ------------------------------------------------------------
      function buildNeckCurve(originX, originZ, height, lean) {
        // Curva em S sutil, como um pescoço serpentino real
        var p0 = new THREE.Vector3(originX * 0.3, 2.2, originZ * 0.3 - 1.2);
        var p1 = new THREE.Vector3(originX * 0.6, 0.4, originZ * 0.55 - 0.6);
        var p2 = new THREE.Vector3(originX * 0.85 + lean * 0.4, height * 0.65, originZ * 0.7);
        var p3 = new THREE.Vector3(originX + lean, height, originZ * 0.8 + 0.4);
        return new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
      }
  
      function buildHead(scale) {
        var headGroup = new THREE.Group();
  
        // Crânio
        var skull = new THREE.Mesh(
          new THREE.ConeGeometry(0.42, 1.05, 6),
          matScaleMid
        );
        skull.rotation.x = Math.PI * 0.55;
        skull.scale.set(1, 1, 1.35);
        headGroup.add(skull);
  
        // Mandíbula inferior
        var jaw = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 0.7, 6),
          matScaleDark
        );
        jaw.rotation.x = Math.PI * 0.4;
        jaw.position.set(0, -0.18, 0.32);
        jaw.scale.set(0.85, 0.6, 1.1);
        headGroup.add(jaw);
  
        // Par de chifres curvos (dourados)
        [-1, 1].forEach(function (side) {
          var horn = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 1, 5),
            matHorn
          );
          horn.position.set(side * 0.22, 0.28, -0.15);
          horn.rotation.set(0.6, 0, side * 0.55);
          headGroup.add(horn);
        });
  
        // Olhos brilhantes (pontos de luz dourados — a única coisa
        // que realmente "brilha" na escuridão, reforçando o conceito
        // de criatura escondida nas sombras)
        [-1, 1].forEach(function (side) {
          var eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), matEye);
          eye.position.set(side * 0.16, 0.05, 0.38);
          headGroup.add(eye);
  
          var eyeLight = new THREE.PointLight(COLOR_EYE, 0.55, 2.4, 2);
          eyeLight.position.copy(eye.position);
          headGroup.add(eyeLight);
        });
  
        headGroup.scale.setScalar(scale);
        return headGroup;
      }
  
      // Tubo (pescoço) construído a partir de uma curva, com leve
      // afunilamento da base (grossa) até a cabeça (mais fina)
      function buildNeckMesh(curve) {
        var geo = new THREE.TubeGeometry(curve, 24, 0.34, 8, false);
        var mesh = new THREE.Mesh(geo, matScaleDark);
        return mesh;
      }
  
      // ------------------------------------------------------------
      // Monta as 7 cabeças distribuídas em leque, como na referência
      // visual (cabeça central mais alta, demais decrescendo
      // simetricamente para as laterais)
      // ------------------------------------------------------------
      var HEAD_COUNT = 7;
      var heads = []; // guarda referências para animação procedural
  
      for (var i = 0; i < HEAD_COUNT; i++) {
        var t = (i - (HEAD_COUNT - 1) / 2); // -3 .. 0 .. 3
        var spread = 1.55;
        var originX = t * spread;
        var originZ = -Math.abs(t) * 0.35;
        // cabeça central mais alta, laterais um pouco mais baixas
        var height = 6.1 - Math.abs(t) * 0.55;
        var lean = t * 0.5;
  
        var curve = buildNeckCurve(originX, originZ, height, lean);
        var neck = buildNeckMesh(curve);
        hydra.add(neck);
  
        var headScale = 1.05 - Math.abs(t) * 0.06;
        var head = buildHead(headScale);
        var headPos = curve.getPoint(1);
        head.position.copy(headPos);
  
        // Orienta a cabeça para "olhar" levemente para frente/baixo,
        // na direção aproximada da tangente final do pescoço
        var tangent = curve.getTangent(0.98);
        var lookTarget = headPos.clone().add(tangent);
        head.lookAt(lookTarget);
        head.rotateX(Math.PI * 0.08);
  
        hydra.add(head);
  
        heads.push({
          group: head,
          basePos: headPos.clone(),
          baseQuat: head.quaternion.clone(),
          phase: Math.random() * Math.PI * 2,
          speed: 0.35 + Math.random() * 0.25,
          swayAmp: 0.05 + Math.random() * 0.03,
          nodAmp: 0.04 + Math.random() * 0.03
        });
      }
  
      // Posiciona a hidra inteira mais ao fundo/alto, parcialmente
      // fora do topo da viewport — reforça "espreitando nas sombras"
      hydra.position.set(0, -1.2, -3);
  
      // ------------------------------------------------------------
      // Scroll: controla o quanto a hidra "emerge" das sombras
      // (opacidade dos materiais + leve aproximação/rotação de câmera)
      // ------------------------------------------------------------
      var allMaterials = [matScaleDark, matScaleMid, matGold, matHorn, matEye];
      allMaterials.forEach(function (m) { m.transparent = true; });
  
      var scrollProgress = 0; // 0 = totalmente nas sombras, 1 = mais revelada
      var targetProgress = 0;
  
      function updateScrollProgress() {
        var doc = document.documentElement;
        var maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
        var current = window.pageYOffset || doc.scrollTop || 0;
        // Pico de visibilidade na primeira metade da página, depois
        // a hidra volta a se dissolver na escuridão perto do rodapé
        var raw = current / maxScroll;
        var reveal = Math.sin(Math.min(raw, 1) * Math.PI); // 0 -> 1 -> 0
        targetProgress = reveal;
      }
  
      window.addEventListener('scroll', updateScrollProgress, { passive: true });
      updateScrollProgress();
  
      // ------------------------------------------------------------
      // Resize responsivo
      // ------------------------------------------------------------
      function onResize() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);
  
      // ------------------------------------------------------------
      // Loop de animação
      // ------------------------------------------------------------
      var clock = new THREE.Clock();
      var rafId = null;
      var isVisible = true;
  
      document.addEventListener('visibilitychange', function () {
        isVisible = document.visibilityState === 'visible';
      });
  
      function animate() {
        rafId = requestAnimationFrame(animate);
        if (!isVisible) return;
  
        var dt = Math.min(clock.getDelta(), 0.05);
        var elapsed = clock.elapsedTime;
  
        // Suaviza a transição de opacidade/revelação (easing exponencial)
        scrollProgress += (targetProgress - scrollProgress) * Math.min(dt * 3, 1);
  
        // Opacidade base: nunca totalmente invisível (sempre uma
        // presença fantasmagórica), mas bem mais nítida ao "emergir"
        var baseOpacity = 0.16 + scrollProgress * 0.62;
        allMaterials.forEach(function (m) { m.opacity = baseOpacity; });
  
        // Intensidade do brilho dos olhos acompanha a revelação
        matEye.emissiveIntensity = 1.4 + scrollProgress * 2.2;
        keyGlow.intensity = 0.6 + scrollProgress * 1.1;
  
        // Leve deslocamento vertical do conjunto + aproximação de
        // câmera conforme a hidra "emerge"
        hydra.position.y = -2.1 + scrollProgress * 1.0;
        camera.position.z = 13 - scrollProgress * 1.6;
  
        // Movimento procedural contínuo e independente de cada
        // cabeça — pequenas oscilações de "respiração"/observação,
        // sem nunca repetir exatamente o mesmo ciclo entre as 7
        if (!prefersReducedMotion) {
          heads.forEach(function (h) {
            var p = h.phase + elapsed * h.speed;
            var sway = Math.sin(p) * h.swayAmp;
            var nod = Math.cos(p * 0.7) * h.nodAmp;
            h.group.position.x = h.basePos.x + sway;
            h.group.position.y = h.basePos.y + nod;
            h.group.rotation.z = sway * 0.4;
            h.group.rotation.x = h.baseQuat ? h.group.rotation.x : 0;
          });
  
          // Leve "respiração" do torso inteiro
          hydra.rotation.y = Math.sin(elapsed * 0.08) * 0.04;
        }
  
        renderer.render(scene, camera);
      }
  
      animate();
  
      // Limpa recursos se a página for descartada (SPA-safe, embora
      // este projeto seja multi-página)
      window.addEventListener('beforeunload', function () {
        if (rafId) cancelAnimationFrame(rafId);
        renderer.dispose();
      });
    }
  
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init);
    }
  })();