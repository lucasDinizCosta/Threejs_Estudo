/**
 * thetaStart: Angulo inicial de geracao da esfera em relacao ao eixo x
 * thetaLength: Até qual angulação a esfera vai atingir 0, 0.5*pi (para esfera cheia), ou mais;
 * phiStart: Angulo inicial de geração da esfera em relação ao eixo x
 * phiLength: Até qual angulação a esfera vai atingir (0, 2pi) ou mais;
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
    this.appliedMaterial = applyMeshNormalMaterial
    this.castShadow = true;
    this.groundPlaneVisible = true;

    var baseSphere = new THREE.SphereGeometry(4, 10, 10); // Radius, WidthSegment, HeightSegments
    this.radius = baseSphere.parameters.radius;
    this.widthSegments = baseSphere.parameters.widthSegments;
    this.heightSegments = baseSphere.parameters.heightSegments;
    this.phiStart = 0;
    this.phiLength = Math.PI * 2;
    this.thetaStart = 0;
    this.thetaLength = Math.PI;

    // Função que redesenha e atualiza os controles do menu e recria a geometria.
    this.redraw = function () {

      // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
      // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
      redrawGeometryAndUpdateUI(gui, scene, controls, function() {
        return new THREE.SphereGeometry(controls.radius, controls.widthSegments, controls.heightSegments,
                  controls.phiStart, controls.phiLength, controls.thetaStart, controls.thetaLength);
      });
    };
  };

  // GUI de controle e ajuste de valores especificos da geometria do objeto
  var gui = new dat.GUI();
  gui.add(controls, 'radius', 0, 40).onChange(controls.redraw);
  gui.add(controls, 'widthSegments', 0, 20).onChange(controls.redraw);
  gui.add(controls, 'heightSegments', 0, 20).onChange(controls.redraw);
  gui.add(controls, 'phiStart', 0, 2 * Math.PI).onChange(controls.redraw);
  gui.add(controls, 'phiLength', 0, 2 * Math.PI).onChange(controls.redraw);
  gui.add(controls, 'thetaStart', 0, 2 * Math.PI).onChange(controls.redraw);
  gui.add(controls, 'thetaLength', 0, 2 * Math.PI).onChange(controls.redraw);

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