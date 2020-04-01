function init() {

    // setup the scene for rendering
    var camera = initCamera(new THREE.Vector3(50, 50, 50));
    var loaderScene = new BaseLoaderScene(camera);
    camera.lookAt(new THREE.Vector3(0, 15, 0));
  
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath("../../assets/models/butterfly/");
    mtlLoader.load('butterfly.mtl', function (materials) {          // Dentro do carregamento de materiais carrega-se o objeto
      materials.preload();                                          // Faz a leitura do arquivo e retorna um vetor de materiais
  
      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('../../assets/models/butterfly/butterfly.obj', function (object) {     // Objeto carregado do arquivo -- Parte da geometria
  
        // move wings to more horizontal position
        [0, 2, 4, 6].forEach(function (i) {
          object.children[i].rotation.z = 0.3 * Math.PI
        });
  
        [1, 3, 5, 7].forEach(function (i) {
          object.children[i].rotation.z = -0.3 * Math.PI
        });
  
        // configure the wings,
        var wing2 = object.children[5];
        var wing1 = object.children[4];
  
        wing1.material.opacity = 0.9;
        wing1.material.transparent = true;
        wing1.material.depthTest = false;
        wing1.material.side = THREE.DoubleSide;
  
        wing2.material.opacity = 0.9;
        wing2.material.depthTest = false;
        wing2.material.transparent = true;
        wing2.material.side = THREE.DoubleSide;
  
        object.scale.set(140, 140, 140);
        mesh = object;
  
        object.rotation.x = 0.2;
        object.rotation.y = -1.3;
  
        loaderScene.render(mesh, camera);
      });
    });
  }