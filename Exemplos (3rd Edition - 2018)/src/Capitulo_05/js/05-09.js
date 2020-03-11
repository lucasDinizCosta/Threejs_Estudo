/**
 * 
 * radialSegments: número de segmentos ao longo do tamanho do torus. Default: 8.0
 * tube: Define o raio do tubo (formato de uma rosquinha). Default: 4.0
 * radius: valor do raio completo do torus. Default: 100.0
 * tubularSegments: Numero de partições usadas no comprimento do torus. Default: 6
 * arc: Controla a angulação que o torus será gerado. Default: 2*PI
 */

function init() {

    // Utiliza padrões de camera, status e renderizador
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    // Adiciona uma iluminação padrão de cena
    var scene = new THREE.Scene();
    var groundPlane = addLargeGroundPlane(scene)
    groundPlane.position.y = -30;
    initDefaultLighting(scene);
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
      var self = this;
  
      // Inicia a geometria e material de base a serem controlados pelo menu interativo
      this.appliedMaterial = applyMeshNormalMaterial;
      this.castShadow = true;
      this.groundPlaneVisible = true;
  
      var baseGeom = new THREE.TorusGeometry(10, 10, 8, 6, Math.PI * 2);    // radius, tube, radialSegments, tubularSegments, arc
      this.radius = baseGeom.parameters.radius;
      this.tube = baseGeom.parameters.tube;
      this.radialSegments = baseGeom.parameters.radialSegments;
      this.tubularSegments = baseGeom.parameters.tubularSegments;
      this.arc = baseGeom.parameters.arc;
      
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {

        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return new THREE.TorusGeometry(controls.radius, controls.tube, Math.round(controls.radialSegments),
                  Math.round(controls.tubularSegments), controls.arc)
        });
      };
    };
  
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();
    gui.add(controls, 'radius', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'tube', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'radialSegments', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'tubularSegments', 1, 20).onChange(controls.redraw);
    gui.add(controls, 'arc', 0, Math.PI * 2).onChange(controls.redraw);
  
    // Cria uma seção de materiais aplicados
    gui.add(controls, 'appliedMaterial', {
      meshNormal: applyMeshNormalMaterial, 
      meshStandard: applyMeshStandardMaterial
    }).onChange(controls.redraw)
  
    gui.add(controls, 'castShadow').onChange(function(e) {controls.mesh.castShadow = e})
    gui.add(controls, 'groundPlaneVisible').onChange(function(e) {groundPlane.material.visible = e})
  
    // Inicializa o primeiro redesenho de modo que tudo é inicializado
    // Ao fazer isso é criado o parametro "mesh" dentro de controls, assim podendo
    // atribuir os materiais desejados
    controls.redraw();
    var step = 0;

    // Inicia o loop de animação
    render();
    function render() {
      stats.update();
      controls.mesh.rotation.y = step += 0.01;
      controls.mesh.rotation.x = step;
      controls.mesh.rotation.z = step;
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
}