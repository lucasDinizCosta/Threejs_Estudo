/**
 * Ta ocorrendo o seguinte erro: [.WebGL-0x3bd59f35e800]RENDER WARNING: Render count or primcount is 0.
 * mas funciona
 */
function init() {

    // Utiliza padrões de camera e status e renderer
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();
  
    // Adiciona iluminação SpotLight para as sombras
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);
  
    var group = new THREE.Mesh();               // Cria um grupo

    // Adiciona todos os elementos do cubo mágico
    var mats = [];                          // Array de materiais
    mats.push(new THREE.MeshBasicMaterial({
      color: 0x009e60
    }));
    mats.push(new THREE.MeshBasicMaterial({
      color: 0x0051ba
    }));
    mats.push(new THREE.MeshBasicMaterial({
      color: 0xffd500
    }));
    mats.push(new THREE.MeshBasicMaterial({
      color: 0xff5800
    }));
    mats.push(new THREE.MeshBasicMaterial({
      color: 0xC41E3A
    }));
    mats.push(new THREE.MeshBasicMaterial({
      color: 0xffffff
    }));
  
    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        for (var z = 0; z < 3; z++) {
          var cubeGeom = new THREE.BoxGeometry(2.9, 2.9, 2.9);
          var cube = new THREE.Mesh(cubeGeom, mats);
          cube.position.set(x * 3 - 3, y * 3 - 3, z * 3 - 3);
  
          group.add(cube);
        }
      }
    }
  
    group.scale.copy(new THREE.Vector3(2,2,2));

    // call the render function
    scene.add(group);
    
    var step = 0;
  
    var controls = new function () {
      this.rotationSpeed = 0.01;
      this.numberOfObjects = scene.children.length;
    };
  
    var gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.5);
    gui.add(controls, 'numberOfObjects');
  
    render();
  
    //debugger;
    
    function render() {
      stats.update();
  
      group.rotation.y = step += controls.rotationSpeed;
      group.rotation.z = step -= controls.rotationSpeed;
      group.rotation.x = step += controls.rotationSpeed;

      // Renderiza usando a função "requestAnimationFrame" que atualiza a 
      // interface dentro de um intervalo de tempo específico
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
  }