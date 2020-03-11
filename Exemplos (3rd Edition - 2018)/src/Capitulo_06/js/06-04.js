function init() {

    // Utiliza padrões de camera, status e renderizador
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    // Adiciona uma iluminação padrão de cena
    var scene = new THREE.Scene();
    initDefaultLighting(scene);
    var groundPlane = addLargeGroundPlane(scene);
    groundPlane.position.y = -30;
  
    var step = 0;
    var spGroup;
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
  
      // Inicia a geometria e material de base a serem controlados pelo menu interativo
      this.appliedMaterial = applyMeshNormalMaterial;
      this.castShadow = true;
      this.groundPlaneVisible = true;
  
      this.numberOfPoints = 5;
      this.segments = 64;
      this.radius = 1;
      this.radiusSegments = 8;
      this.closed = false;
      this.points = [];
      // we need the first child, since it's a multimaterial
  
      this.newPoints = function () {
        var points = [];
        for (var i = 0; i < controls.numberOfPoints; i++) {
          var randomX = -20 + Math.round(Math.random() * 50);
          var randomY = -15 + Math.round(Math.random() * 40);
          var randomZ = -20 + Math.round(Math.random() * 40);
  
          points.push(new THREE.Vector3(randomX, randomY, randomZ));
        }
        controls.points = points;
        controls.redraw();
      };
  
      this.redraw = function () {
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return generatePoints(controls.points, controls.segments, controls.radius, controls.radiusSegments,
            controls.closed);
        });
      };
  
    };
  
    var gui = new dat.GUI();
    gui.add(controls, 'newPoints');
    gui.add(controls, 'numberOfPoints', 2, 15).step(1).onChange(controls.newPoints);
    gui.add(controls, 'segments', 0, 200).step(1).onChange(controls.redraw);
    gui.add(controls, 'radius', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'radiusSegments', 0, 100).step(1).onChange(controls.redraw);
    gui.add(controls, 'closed').onChange(controls.redraw);
  
    gui.add(controls, 'appliedMaterial', {
      meshNormal: applyMeshNormalMaterial, 
      meshStandard: applyMeshStandardMaterial
    }).onChange(controls.redraw)
  
    gui.add(controls, 'castShadow').onChange(function(e) {controls.mesh.castShadow = e})
    gui.add(controls, 'groundPlaneVisible').onChange(function(e) {groundPlane.material.visible = e})
  
  
    controls.newPoints();       //Cria a primeira estrutura de pontos que definirão o tubo
  
    render();
  
    function generatePoints(points, segments, radius, radiusSegments, closed) {
      // Adiciona n esferas aleatórias
  
      if (spGroup) scene.remove(spGroup)
      spGroup = new THREE.Object3D();
      var material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: false
      });
      points.forEach(function (point) {
  
        var spGeom = new THREE.SphereGeometry(0.2);
        var spMesh = new THREE.Mesh(spGeom, material);
        spMesh.position.copy(point);
        spGroup.add(spMesh);
      });

      // Adiciona os pontos agrupados na cena
      scene.add(spGroup);
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, radiusSegments, closed);
    }
  
    function render() {
      stats.update();
      controls.mesh.rotation.y = step += 0.005;
      controls.mesh.rotation.x = step;
      controls.mesh.rotation.z = step;
  
      if (spGroup) {
        spGroup.rotation.y = step;
        spGroup.rotation.x = step;
        spGroup.rotation.z = step;
      }
  
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
}