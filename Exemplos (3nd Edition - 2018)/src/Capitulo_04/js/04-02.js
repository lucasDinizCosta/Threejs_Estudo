/********************************************************************************
 * -> MeshDepthMaterial não é influenciado pela luz mas sim em relação a        *
 *    proximidade com a câmera.                                                 *
 * -> Há a possibilidade de recombinação de materiais diferentes.               *
 * -> A distância entre as propriedades near e far em relação a câmera define   *
 *    o brilho e a taxa na qual os objetos desaparecem.                         *
 ********************************************************************************/

function init() {

  // Utiliza padrões de camera e status
  var stats = initStats();                  // Status de fps ou ms da aplicação
  var renderer = initRenderer();

  // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
  var scene = new THREE.Scene();
  scene.overrideMaterial = new THREE.MeshDepthMaterial();

  // Cria uma camera em perspectiva e posiciona 
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 50, 110);    //fov, aspect ratio, near, far
  camera.position.set(-50, 40, 50);
  camera.lookAt(scene.position);

  // call the render function
  var step = 0;

  // Funções de controle dos objetos em cena
  var controls = new function () {
    this.cameraNear = camera.near;
    this.cameraFar = camera.far;
    this.rotationSpeed = 0.02;
    this.numberOfObjects = scene.children.length;

    this.removeCube = function () {
      var allChildren = scene.children;
      var lastObject = allChildren[allChildren.length - 1];
      if (lastObject instanceof THREE.Mesh) {               // Verificação se o ultimo objeto é uma Mesh
        scene.remove(lastObject);
        this.numberOfObjects = scene.children.length;
      }
    };

    this.addCube = function () {

      var cubeSize = Math.ceil(3 + (Math.random() * 3));
      var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      var cubeMaterial = new THREE.MeshLambertMaterial({            
        color: Math.random() * 0xffffff
      });
      var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.castShadow = true;

      // position the cube randomly in the scene
      cube.position.x = -60 + Math.round((Math.random() * 100));
      cube.position.y = Math.round((Math.random() * 10));
      cube.position.z = -100 + Math.round((Math.random() * 150));

      // add the cube to the scene
      scene.add(cube);
      this.numberOfObjects = scene.children.length;
    };

    this.outputObjects = function () {
      console.log(scene.children);
    }
  };

  var gui = new dat.GUI();                                          // GUI (Lateral) de controle e ajuste de valores
  addBasicMaterialSettings(gui, controls, scene.overrideMaterial);  // Adiciona no menu lateral os elementos basicos de um material
  var spGui = gui.addFolder("THREE.MeshDepthMaterial");
  spGui.add(scene.overrideMaterial, 'wireframe');
  spGui.add(scene.overrideMaterial, 'wireframeLinewidth', 0, 20);

  gui.add(controls, 'rotationSpeed', 0, 0.5);
  gui.add(controls, 'addCube');
  gui.add(controls, 'removeCube');
  gui.add(controls, 'cameraNear', 0, 100).onChange(function (e) {
    camera.near = e;
    camera.updateProjectionMatrix();
  });
  gui.add(controls, 'cameraFar', 50, 200).onChange(function (e) {
    camera.far = e;
    camera.updateProjectionMatrix();
  });

  for(var i = 0; i < 10; i++){  // Criação de 10 cubos
    controls.addCube();
  }

  render();

  function render() {
    stats.update();

    // Rotaciona o cubo em torno de seus eixos
    scene.traverse(function (e) {
      if (e instanceof THREE.Mesh) {

        e.rotation.x += controls.rotationSpeed;
        e.rotation.y += controls.rotationSpeed;
        e.rotation.z += controls.rotationSpeed;
      }
    });

    // Renderiza usando a função "requestAnimationFrame" que atualiza a 
    // interface dentro de um intervalo de tempo específico
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}