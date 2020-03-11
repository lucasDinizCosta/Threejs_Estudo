function init() {

    // Utiliza padrões de camera, status e renderer
    var stats = initStats();                    // Status de fps ou ms da aplicação 
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();
  
    var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
  
    var meshMaterial1 = createMaterial("vertex-shader",
      "fragment-shader-1");
    var meshMaterial2 = createMaterial("vertex-shader",
      "fragment-shader-2");
    var meshMaterial3 = createMaterial("vertex-shader",
      "fragment-shader-3");
    var meshMaterial4 = createMaterial("vertex-shader",
      "fragment-shader-4");
    var meshMaterial5 = createMaterial("vertex-shader",
      "fragment-shader-5");
    var meshMaterial6 = createMaterial("vertex-shader",
      "fragment-shader-6");
  
  
    var material = [meshMaterial1, meshMaterial2, meshMaterial3, meshMaterial4, meshMaterial5, meshMaterial6];
    var cube = new THREE.Mesh(cubeGeometry, material);
  
    // Adiciona uma esfera na cena
    scene.add(cube);
  
    // Adiciona uma luz sutil para iluminar o ambiente
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);
  
    // Adiciona uma luz spotlight para gerar as sombras
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;            // Gera as sombras
    scene.add(spotLight);
  
    // call the render function
    var step = 0;
    var oldContext = null;
  
    // Controla os objetos presentes em cena
    var controls = new function () {
      this.rotationSpeed = 0.02;
      this.bouncingSpeed = 0.03;
  
      this.opacity = meshMaterial1.opacity;
      this.transparent = meshMaterial1.transparent;
  
      this.visible = meshMaterial1.visible;
      this.side = "front";
  
      this.wireframe = meshMaterial1.wireframe;
      this.wireframeLinewidth = meshMaterial1.wireframeLinewidth;
  
      this.selectedMesh = "cube";
  
      this.shadow = "flat";
  
    };
  
  
    render();
  
    function render() {
      stats.update();
  
      cube.rotation.y = step += 0.01;
      cube.rotation.x = step;
      cube.rotation.z = step;
  
      cube.material.forEach(function (e) {
        e.uniforms.time.value += 0.01;
      });
  
  
      // render using requestAnimationFrame
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
  
    function createMaterial(vertexShader, fragmentShader) {
      var vertShader = document.getElementById(vertexShader).innerHTML;
      var fragShader = document.getElementById(fragmentShader).innerHTML;
  
      var attributes = {};
      var uniforms = {
        time: {
          type: 'f',
          value: 0.2
        },
        scale: {
          type: 'f',
          value: 0.2
        },
        alpha: {
          type: 'f',
          value: 0.6
        },
        resolution: {
          type: "v2",
          value: new THREE.Vector2()
        }
      };
  
      uniforms.resolution.value.x = window.innerWidth;
      uniforms.resolution.value.y = window.innerHeight;
  
      var meshMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true
  
      });
  
  
      return meshMaterial;
    }
}