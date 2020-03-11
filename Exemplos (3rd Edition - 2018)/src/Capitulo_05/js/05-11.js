
function init() {

    // Utiliza padrões de camera, status e renderizador
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    // Adiciona uma iluminação padrão de cena
    var scene = new THREE.Scene();
    var groundPlane = addLargeGroundPlane(scene);
    groundPlane.position.y = -10;
    initDefaultLighting(scene);
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
      var self = this;
  
      // Inicia a geometria e material de base a serem controlados pelo menu interativo
      this.appliedMaterial = applyMeshNormalMaterial;
      this.castShadow = true;
      this.groundPlaneVisible = true;
  
      this.radius = 10;
      this.detail = 0;
      this.type = 'Icosahedron';
      
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {

        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          var polyhedron;
          switch (controls.type) {
                    case 'Icosahedron':
                      polyhedron = new THREE.IcosahedronGeometry(controls.radius, controls.detail);
                      break;
                    case 'Tetrahedron':
                      polyhedron = new THREE.TetrahedronGeometry(controls.radius, controls.detail);
                      break;
                    case 'Octahedron':
                      polyhedron = new THREE.OctahedronGeometry(controls.radius, controls.detail);
                      break;
                    case 'Dodecahedron':
                      polyhedron = new THREE.DodecahedronGeometry(controls.radius, controls.detail);
                      break;
                    case 'Custom':
                      // (x, y, z) de cada vertice
                      var vertices = [
                         1,  1,  1, 
                        -1, -1,  1, 
                        -1,  1, -1, 
                         1, -1, -1
                      ];
            
                      // Essas são as faces que precisam ser criadas a partir dos vértices.
                      var indices = [
                        2, 1, 0, 
                        0, 3, 2, 
                        1, 3, 0, 
                        2, 3, 1
                      ];
            
                      polyhedron = new THREE.PolyhedronGeometry(vertices, indices, controls.radius, controls.detail);
                      break;
                  }
  
          return polyhedron;
        });
      };
    };
  
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();
    gui.add(controls, 'radius', 0, 40).step(1).onChange(controls.redraw);
    gui.add(controls, 'detail', 0, 3).step(1).onChange(controls.redraw);
    gui.add(controls, 'type', ['Icosahedron', 'Tetrahedron', 'Octahedron', 'Dodecahedron', 'Custom']).onChange(controls.redraw);

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