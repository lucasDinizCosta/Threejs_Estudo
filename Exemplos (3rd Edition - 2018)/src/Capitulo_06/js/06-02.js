/**
 *                  Nativo do Three.js
 * LatheGeometry - Permite criar formas mais suaves
 * A curva é definida por um número de pontos, também chamados de (knots) 
 * 
 * phiStart: Angulação inicial da forma circular
 * phiLength: Angulação máxima da forma circular
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
  
    // Agrupamento de pontos
    var spGroup;
  
    // Funções de controle dos objetos em cena
    var controls = new function () {    

      // Inicia a geometria e material de base a serem controlados pelo menu interativo
      this.appliedMaterial = applyMeshNormalMaterial;s
      this.castShadow = true;
      this.groundPlaneVisible = true;
  
      this.segments = 12;
      this.phiStart = 0;
      this.phiLength = 2 * Math.PI;
  
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {
        
        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return generatePoints(controls.segments, controls.phiStart, controls.phiLength);
        });
      };
    };

    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();
    gui.add(controls, 'segments', 0, 50).step(1).onChange(controls.redraw);
    gui.add(controls, 'phiStart', 0, 2 * Math.PI).onChange(controls.redraw);
    gui.add(controls, 'phiLength', 0, 2 * Math.PI).onChange(controls.redraw);
  
    // Cria uma seção de materiais aplicados
    gui.add(controls, 'appliedMaterial', {
      meshNormal: applyMeshNormalMaterial, 
      meshStandard: applyMeshStandardMaterial
    }).onChange(controls.redraw)
  
    gui.add(controls, 'castShadow').onChange(function(e) {controls.mesh.castShadow = e})
    gui.add(controls, 'groundPlaneVisible').onChange(function(e) {groundPlane.material.visible = e})
    gui.add(controls, 'redraw');
  
  
    function generatePoints(segments, phiStart, phiLength) {
  
      if (spGroup) scene.remove(spGroup);
  
      var points = [];
      var height = 5;
      var count = 30;
      for (var i = 0; i < count; i++) {
        points.push(new THREE.Vector2((Math.sin(i * 0.2) + Math.cos(i * 0.3)) * height + 12, (i - count) +
          count / 2));
      }
  
      spGroup = new THREE.Object3D();
      var material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: false
      });
      points.forEach(function (point) {
  
        var spGeom = new THREE.SphereGeometry(0.2);
        var spMesh = new THREE.Mesh(spGeom, material);
        spMesh.position.set(point.x, point.y, 0);
  
        spGroup.add(spMesh);
      });

      // Adiciona o grupo de pontos na cena
      scene.add(spGroup);
  
      // Usa os mesmos pontos para criar a LatheGeometry
      var latheGeometry = new THREE.LatheGeometry(points, segments, phiStart, phiLength);   
      return latheGeometry;
    }
  
    var step = 0;
    controls.redraw();
    render();
    
    function render() {
      stats.update();
      controls.mesh.rotation.y = step+=0.005
      controls.mesh.rotation.x = step
      controls.mesh.rotation.z = step
  
      if (spGroup) {
        spGroup.rotation.y = step
        spGroup.rotation.x = step
        spGroup.rotation.z = step
      }
  
      // render using requestAnimationFrame
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
}