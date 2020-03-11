function init() {

    // use the defaults
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
      this.curveSegments = 12;
  
      // Inicia a geometria e material de base a serem controlados pelo menu interativo
      this.appliedMaterial = applyMeshNormalMaterial;
      this.castShadow = true;
      this.groundPlaneVisible = true;
  
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {

        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return new THREE.ShapeGeometry(drawShape(), self.curveSegments).center();
        });
      };
    };
  
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();
    gui.add(controls, 'curveSegments', 1, 100, 1).onChange(controls.redraw);

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
      controls.mesh.rotation.y = step+=0.01
      controls.mesh.rotation.x = step
      controls.mesh.rotation.z = step
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
  }
  
  function drawShape() {
  
    // create a basic shape
    var shape = new THREE.Shape();
  
    // ponto de inicio
    shape.moveTo(10, 10);
  
    // linha reta para cima -- Parte esquerda da mascara
    shape.lineTo(10, 40);
  
    // No topo da figura, gera uma curva bezier para a direita
    shape.bezierCurveTo(15, 25, 25, 25, 30, 40);
  
    // spline back down
    shape.splineThru(
      [new THREE.Vector2(32, 30),
        new THREE.Vector2(28, 20),
        new THREE.Vector2(30, 10),
      ]);
  
    // curva quadratica para baixo --- Parte de cima 
    shape.quadraticCurveTo(20, 15, 10, 10);
  
    // add 'eye' hole one
    var hole1 = new THREE.Path();
    hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true);
    shape.holes.push(hole1);
  
    // add 'eye hole 2'
    var hole2 = new THREE.Path();
    hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true);
    shape.holes.push(hole2);
  
    // add 'mouth'
    var hole3 = new THREE.Path();
    hole3.absarc(20, 16, 2, 0, Math.PI, true);
    shape.holes.push(hole3);
  
    // return the shape
    return shape;
  }
  