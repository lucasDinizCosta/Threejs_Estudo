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
  
    // call the render function
    var step = 0;
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
  
      // Inicia a geometria e material de base a serem controlados pelo menu interativo  
      this.appliedMaterial = applyMeshNormalMaterial;
      this.castShadow = true;
      this.groundPlaneVisible = true;
  
      this.amount = 2;                  //Profundidade do objeto
      this.bevelThickness = 2;          //
      this.bevelSize = 0.5;
      this.bevelEnabled = true;
      this.bevelSegments = 3;
      this.bevelEnabled = true;
      this.curveSegments = 12;
      this.steps = 1;
  
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {
        
        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          var options = {
            amount: controls.amount,
            bevelThickness: controls.bevelThickness,
            bevelSize: controls.bevelSize,
            bevelSegments: controls.bevelSegments,
            bevelEnabled: controls.bevelEnabled,
            curveSegments: controls.curveSegments,
            steps: controls.steps
          };
    
          var geom = new THREE.ExtrudeGeometry(drawShape(), options);
          geom.applyMatrix(new THREE.Matrix4().makeTranslation(-20, 0, 0));
          geom.applyMatrix(new THREE.Matrix4().makeScale(0.4,0.4,0.4));
          return geom;
        });
      };
    };
  
    var gui = new dat.GUI();
    gui.add(controls, 'amount', 0, 20).onChange(controls.redraw);
    gui.add(controls, 'bevelThickness', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'bevelSize', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'bevelSegments', 0, 30).step(1).onChange(controls.redraw);
    gui.add(controls, 'bevelEnabled').onChange(controls.redraw);
    gui.add(controls, 'curveSegments', 1, 30).step(1).onChange(controls.redraw);
    gui.add(controls, 'steps', 1, 5).step(1).onChange(controls.redraw);
  
    // add a material section, so we can switch between materials
    gui.add(controls, 'appliedMaterial', {
      meshNormal: applyMeshNormalMaterial, 
      meshStandard: applyMeshStandardMaterial
    }).onChange(controls.redraw)
    
    gui.add(controls, 'castShadow').onChange(function(e) {controls.mesh.castShadow = e})
    gui.add(controls, 'groundPlaneVisible').onChange(function(e) {groundPlane.material.visible = e})
  
    function drawShape() {
  
      // create a basic shape
      var shape = new THREE.Shape();
  
      // startpoint
      shape.moveTo(10, 10);
  
      // straight line upwards
      shape.lineTo(10, 40);
  
      // the top of the figure, curve to the right
      shape.bezierCurveTo(15, 25, 25, 25, 30, 40);
  
      // spline back down
      shape.splineThru(
        [new THREE.Vector2(32, 30),
          new THREE.Vector2(28, 20),
          new THREE.Vector2(30, 10),
        ]);
  
      // curve at the bottom
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
  
    var step = 0;
    controls.redraw();
    render();
    
    function render() {
      stats.update();
      controls.mesh.rotation.y = step += 0.005;
      controls.mesh.rotation.x = step;
      controls.mesh.rotation.z = step;
  
      // render using requestAnimationFrame
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
}