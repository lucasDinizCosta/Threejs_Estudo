/**
 * radialSegments: número de lados do poligono de base, quanto maior o valor mais suave e circular
 * se torna o cilindro. Default: 8.
 * radiusBottom: Valor do raio da base. Default: 20
 * radiusTop: Valor do raio do topo. Default: 20
 * heigth: Altura do cilindro. Default: 100
 * heightSegments: Numero de partições ao longo da altura. Default: 1
 * thetaStart: Angulo inicial de geração do solido. Default: 0
 * thetaLength: Angulação final de geração do sólido. Default: 2*PI
 * openEnded: Se o sólido é fechado no topo e na base. Default: false
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
  
      this.radiusTop = 20;
      this.radiusBottom = 20;
      this.height = 20;
      this.radialSegments = 8;
      this.heightSegments = 8;
      this.openEnded = false;
      this.thetaStart = 0;
      this.thetaLength = 2 * Math.PI;
      
      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {

        // Função da "util.js" que cria o objeto 'mesh' dentro de controls com as propriedades basicas
        // Além disso é responsavel por redesenhar e atualizar o objeto e a interface
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
          return new THREE.CylinderGeometry(controls.radiusTop, controls.radiusBottom,
                    controls.height, controls.radialSegments, controls.heightSegments, controls.openEnded,
                    controls.thetaStart, controls.thetaLength
                  )
        });
      };
    };
  
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();
    gui.add(controls, 'radiusTop', -40, 40).onChange(controls.redraw);
    gui.add(controls, 'radiusBottom', -40, 40).onChange(controls.redraw);
    gui.add(controls, 'height', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'radialSegments', 1, 20).step(1).onChange(controls.redraw);
    gui.add(controls, 'heightSegments', 1, 20).step(1).onChange(controls.redraw);
    gui.add(controls, 'openEnded').onChange(controls.redraw);
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