
  function init() {

    // Utiliza padrões de camera, status e renderizador
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();
    var groundPlane = addLargeGroundPlane(scene);
    groundPlane.position.y = -10;

    initDefaultLighting(scene);     // Adiciona uma iluminação padrão de cena
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
      var self = this;
  
      // Inicia a geometria e material de base a serem controlados pelo menu interativo
      // applyMeshNormalMaterial é uma funcão da biblioteca "util.js"

      this.appliedMaterial = applyMeshNormalMaterial;
      this.castShadow = true;
      this.groundPlaneVisible = true;

      this.radius = 4;
      this.thetaStart = 0.3 * Math.PI * 2;
      this.thetaLength = 0.3 * Math.PI * 2;
      this.segments = 10;
  
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {

        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return new THREE.CircleGeometry(self.radius, self.segments, self.thetaStart, self.thetaLength);
        });
      };
    };
    console.log(controls);
  
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();
    gui.add(controls, 'radius', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'segments', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'thetaStart', 0, 2 * Math.PI).onChange(controls.redraw);
    gui.add(controls, 'thetaLength', 0, 2 * Math.PI).onChange(controls.redraw);

    // Adiciona a seção de materiais
    gui.add(controls, 'appliedMaterial', {
      meshNormal: applyMeshNormalMaterial, 
      meshStandard: applyMeshStandardMaterial
    }).onChange(controls.redraw);

    gui.add(controls, 'castShadow').onChange(function(e) {controls.mesh.castShadow = e});
    gui.add(controls, 'groundPlaneVisible').onChange(function(e) {groundPlane.material.visible = e});
  
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
