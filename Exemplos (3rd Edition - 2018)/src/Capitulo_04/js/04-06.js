
/** 
 * -> Pode ser usado para superficies sem brilho e opacas
 * -> Facilmente utilizável e correponde aos elementos de luz em cena
 * -> Propriedades:
 *      color, opacity,shading, blending, depthTest, depthWrite, wireframe, wireframeLinewidth,
 *   wireframeLinecap, wireframeLineJoin, vertexColors, and fog.
*/

function init() {
    // Utiliza padrões de camera, status e renderizador
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();
  
    var groundGeom = new THREE.PlaneGeometry(100, 100, 4, 4);       //width, height, widthSegments, heightSegments
    var groundMesh = new THREE.Mesh(groundGeom, new THREE.MeshBasicMaterial({
      color: 0x555555
    }));
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -20;
    scene.add(groundMesh);
  
    var sphereGeometry = new THREE.SphereGeometry(14, 20, 20);
    var cubeGeometry = new THREE.BoxGeometry(15, 15, 15);
    var planeGeometry = new THREE.PlaneGeometry(14, 14, 4, 4);
  
  
    var meshMaterial = new THREE.MeshLambertMaterial({
      color: 0x7777ff
    });
    var sphere = new THREE.Mesh(sphereGeometry, meshMaterial);
    var cube = new THREE.Mesh(cubeGeometry, meshMaterial);
    var plane = new THREE.Mesh(planeGeometry, meshMaterial);
  
    var selectedMesh = cube;
  
    // Posiciona a esfera
    sphere.position.x = 0;
    sphere.position.y = 3;
    sphere.position.z = 2;
  
    cube.position = sphere.position;
    plane.position = sphere.position;
  
    // Adiciona a esfera na cena
    scene.add(cube);
  
    // Adiciona iluminação ambiente sutil
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);
  
    // Adiciona iluminação SpotLight para as sombras
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-30, 60, 60);
    spotLight.castShadow = true;            //gera Sombras
    scene.add(spotLight);
  
    // call the render function
    var step = 0;
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
      this.rotationSpeed = 0.02;
      this.bouncingSpeed = 0.03;
  
      this.opacity = meshMaterial.opacity;
      this.transparent = meshMaterial.transparent;
      this.overdraw = meshMaterial.overdraw;
      this.visible = meshMaterial.visible;
      this.emissive = meshMaterial.emissive.getHex();       //Cor emitida pelo material
  
      // this.ambient = meshMaterial.ambient.getHex();
      this.side = "front";
  
      this.color = meshMaterial.color.getStyle();
      this.wrapAround = false;
      this.wrapR = 1;
      this.wrapG = 1;
      this.wrapB = 1;
  
      this.selectedMesh = "cube";
    };
  
    var gui = new dat.GUI();    // GUI de controle e ajuste de valores
    addBasicMaterialSettings(gui, controls, meshMaterial);

    var spGui = gui.addFolder("THREE.MeshLambertMaterial");
    spGui.addColor(controls, 'color').onChange(function (e) {
      meshMaterial.color.setStyle(e)
    });
    spGui.addColor(controls, 'emissive').onChange(function (e) {
      meshMaterial.emissive = new THREE.Color(e);
    });
    spGui.add(meshMaterial, 'wireframe');
    spGui.add(meshMaterial, 'wireframeLinewidth', 0, 20);
  
    // Função da biblioteca auxiliar "util.js"
    // Carrega para o "mundo" o objeto Gopher e sobre esse objeto é atribuído o material e algumas propriedades
    loadGopher(meshMaterial).then(function(gopher) {
      gopher.scale.x = 4;
      gopher.scale.y = 4;
      gopher.scale.z = 4;
      gui.add(controls, 'selectedMesh', ["cube", "sphere", "plane", "gopher"]).onChange(function (e) {
  
        scene.remove(plane);
        scene.remove(cube);
        scene.remove(sphere);
        scene.remove(gopher);
    
        switch (e) {
          case "cube":
            scene.add(cube);
            selectedMesh = cube;
            break;
          case "sphere":
            scene.add(sphere);
            selectedMesh = sphere;
            break;
          case "plane":
            scene.add(plane);
            selectedMesh = plane;
            break;
          case "gopher":
            scene.add(gopher);
            selectedMesh = gopher;
            break;
        }
      });
    });
  
    render();
  
    function render() {
      stats.update();
  
      selectedMesh.rotation.y = step += 0.01;
  
      // Renderiza usando a função "requestAnimationFrame" que atualiza a 
      // interface dentro de um intervalo de tempo específico
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
  }