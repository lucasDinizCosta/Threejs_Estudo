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
      
      var baseGeom = new THREE.BoxGeometry(4, 10, 10, 4, 4, 4); // width, height, depth, widthSegments, heightSegments, depthSegments
      this.width = baseGeom.parameters.width;
      this.height = baseGeom.parameters.height;
      this.depth = baseGeom.parameters.depth;
  
      this.widthSegments = baseGeom.parameters.widthSegments;
      this.heightSegments = baseGeom.parameters.heightSegments;
      this.depthSegments = baseGeom.parameters.depthSegments;
  
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {
        
        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return new THREE.BoxGeometry(controls.width, controls.height, controls.depth, Math.round(
                     controls.widthSegments), Math.round(controls.heightSegments), Math.round(
                     controls.depthSegments));
        });
      };
    };
  
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();
    gui.add(controls, 'width', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'height', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'depth', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'widthSegments', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'heightSegments', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'depthSegments', 0, 10).onChange(controls.redraw);
    
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
  