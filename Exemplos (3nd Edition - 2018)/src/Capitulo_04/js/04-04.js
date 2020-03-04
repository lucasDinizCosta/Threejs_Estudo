function init() {

    // Utiliza padrões de camera e status
    var stats = initStats();            // Status de fps ou ms da aplicação 
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();
  
    // Cria uma camera em perspectiva e posiciona 
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-20, 30, 40);
    camera.lookAt(new THREE.Vector3(10, 0, 0));
  
    // Cria um renderizador webGL e atribui um tamanho e cor
    var renderer;
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0x000000));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
  
    // Cria um renderizador Canvas e atribui um tamanho
    var canvasRenderer = new THREE.CanvasRenderer();
    canvasRenderer.setSize(window.innerWidth, window.innerHeight);
    renderer = webGLRenderer;
  
    var groundGeom = new THREE.PlaneGeometry(100, 100, 4, 4);
    var groundMesh = new THREE.Mesh(groundGeom, new THREE.MeshBasicMaterial({
      color: 0x777777
    }));
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -20;
    scene.add(groundMesh);
  
    // Criando a geometria dos objetos
    var sphereGeometry = new THREE.SphereGeometry(14, 20, 20);
    var cubeGeometry = new THREE.BoxGeometry(15, 15, 15);
    var planeGeometry = new THREE.PlaneGeometry(14, 14, 4, 4);
  
    // Criando um material normal geral para os objetos em cena
    var meshMaterial = new THREE.MeshNormalMaterial();

    // Criando os objetos com a geometria determinada e o material
    var sphere = new THREE.Mesh(sphereGeometry, meshMaterial);
    var cube = new THREE.Mesh(cubeGeometry, meshMaterial);
    var plane = new THREE.Mesh(planeGeometry, meshMaterial);
  
    var selectedMesh = cube;
  
    // Posicionando a esfera
    sphere.position.x = 0;
    sphere.position.y = 3;
    sphere.position.z = 2;
  
    // Cria um vetor normal em cada uma das faces da esfera
    for (var f = 0, fl = sphere.geometry.faces.length; f < fl; f++) {
      var face = sphere.geometry.faces[f];
      var centroid = new THREE.Vector3(0, 0, 0);
      centroid.add(sphere.geometry.vertices[face.a]);
      centroid.add(sphere.geometry.vertices[face.b]);
      centroid.add(sphere.geometry.vertices[face.c]);
      centroid.divideScalar(3);
  
      var arrow = new THREE.ArrowHelper(
        face.normal,
        centroid,
        2,
        0x3333FF,
        0.5,
        0.5);
      sphere.add(arrow);                // Adiciona o vetor normal da face como filho da sphere
      arrow.visible = false;            // Desabilita a visualização dele
    }
  
    cube.position = sphere.position;
    plane.position = sphere.position;
  
    // Adiciona uma esfera na scene
    scene.add(cube);
  
    // Adiciona iluminação ambiente sutil
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);
  
    // Adiciona iluminação SpotLight para as sombras
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;            // Cria sombras
    scene.add(spotLight);
  
    // Adiciona a saida em um elemento da página
    document.getElementById("webgl-output").appendChild(renderer.domElement);
  
    // call the render function
    var step = 0;
    var oldContext = null;
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
      this.rotationSpeed = 0.02;
      this.bouncingSpeed = 0.03;
      this.selectedMesh = "cube";
      this.vetorNormal = false;
    };
  
    var gui = new dat.GUI();                                // GUI de controle e ajuste de valores
    addBasicMaterialSettings(gui, controls, meshMaterial);  // Adiciona no menu lateral os elementos basicos de um material

    var guiSphere = gui.addFolder("Sphere - Propriedades");
    guiSphere.add(controls, 'vetorNormal').onChange(function(e){
        if(controls.vetorNormal){
            for(let i = 0; i < sphere.children.length; i++){    // Ativa a visibilidade de todos os vetores normais
                sphere.children[i].visible = true;
            }
        }
        else{
            for(let i = 0; i < sphere.children.length; i++){    // Retira a visibilidade de todos os vetores normais
                sphere.children[i].visible = false;
            }
        }
    });

  
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