/**
 * ConvexGeometry.js === Precisa ser importada
 */
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
  
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {
        
        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return generatePoints();
        });
      };
    };
  
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();

    // Cria uma seção de materiais aplicados
    gui.add(controls, 'appliedMaterial', {
      meshNormal: applyMeshNormalMaterial, 
      meshStandard: applyMeshStandardMaterial
    }).onChange(controls.redraw);
  
    gui.add(controls, 'redraw');
    gui.add(controls, 'castShadow').onChange(function(e) {controls.mesh.castShadow = e});
    gui.add(controls, 'groundPlaneVisible').onChange(function(e) {groundPlane.material.visible = e});
  
    controls.redraw();
    var step = 0;
    render();
  
    function generatePoints() {
  
      if (spGroup) scene.remove(spGroup)

      // Adiciona 10 pontos aleatórios com formatos esféricos
      var points = [];
      for (var i = 0; i < 20; i++) {
        var randomX = -15 + Math.round(Math.random() * 30);
        var randomY = -15 + Math.round(Math.random() * 30);
        var randomZ = -15 + Math.round(Math.random() * 30);
  
        points.push(new THREE.Vector3(randomX, randomY, randomZ));
      }
  
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

      // Adiciona o grupo de pontos na cena
      scene.add(spGroup);
  
      // Usa os mesmos pontos para criar o objeto geometrico convexo
      var convexGeometry = new THREE.ConvexGeometry(points);        // Utiliza a biblioteca especial de geometria convexa
      convexGeometry.computeVertexNormals();                        // Computa as normais
      convexGeometry.computeFaceNormals();                          // Computa as normais de cada face
      convexGeometry.normalsNeedUpdate = true;
      return convexGeometry;
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