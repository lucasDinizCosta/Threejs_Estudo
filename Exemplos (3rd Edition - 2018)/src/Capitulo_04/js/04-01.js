function init(){

    // Utiliza padrões de camera e status
    var stats = initStats();                        // Status de fps ou ms da aplicação 
    var camera = initCamera();

    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();

    // Cria um renderizador webGL e atribui um tamanho
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0x000000));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMap.enabled = true;                              //Ativa o sombreado no "mundo"
    // webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;           //Propriedades das sombras

    /**
        Tipos de sombras que o renderer pode trabalhar:

        THREE.BasicShadowMap
        THREE.PCFShadowMap (default)
        THREE.PCFSoftShadowMap
        THREE.VSMShadowMap
    */

    // Cria um renderizador Canvas e atribui um tamanho
    var canvasRenderer = new THREE.CanvasRenderer();
    canvasRenderer.setSize(window.innerWidth, window.innerHeight);
    renderer = webGLRenderer;

    var groundGeom = new THREE.PlaneGeometry(100, 100, 4, 4);   // Width, Height, WidthSegments, HeightSegments
    var groundMesh = new THREE.Mesh(groundGeom, new THREE.MeshBasicMaterial({
        color: 0x777777
    }));
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -20;
    scene.add(groundMesh);

    // Criando as geometrias dos objetos
    var sphereGeometry = new THREE.SphereGeometry(14, 20, 20);  // radius, widthSegments, HeightSegments
    var cubeGeometry = new THREE.BoxGeometry(15, 15, 15);       // {width: 4, height: 4, depth: 4, widthSegments: undefined, heightSegments: undefined, depthSegments: undefined}
    var planeGeometry = new THREE.PlaneGeometry(14, 14, 4, 4);

    var meshMaterial = new THREE.MeshBasicMaterial({
        color: 0x7777ff,
        name: 'Basic Material',
        flatShading: true           // Define se o material é renderizado com sombreamento simples. O padrão é falso.
    });

    // Criando os objetos com a geometria particular de cada um e o material comum
    var sphere = new THREE.Mesh(sphereGeometry, meshMaterial);
    var cube = new THREE.Mesh(cubeGeometry, meshMaterial);
    var plane = new THREE.Mesh(planeGeometry, meshMaterial);

    // Posicionamento da esfera
    sphere.position.x = 0;
    sphere.position.y = 3;
    sphere.position.z = 2;

    cube.position = sphere.position;
    plane.position = sphere.position;

    // Adição da esfera na cena
    scene.add(cube);

    // Posiciona a camera e o centro do foco
    camera.position.x = -20;
    camera.position.y = 50;
    camera.position.z = 40;
    camera.lookAt(new THREE.Vector3(10, 0, 0));

    // Adiciona iluminação ambiente sutil
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    // Adiciona iluminação SpotLight para as sombras
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;                // Cria sombras
    scene.add(spotLight);

    // Adiciona a saída do renderizador para um elemento da página HTML
    document.getElementById("webgl-output").appendChild(renderer.domElement);

    // Chama a função do renderizador
    var step = 0;
    var oldContext = null;

    // Funções de controle dos objetos em cena
    var controls = new function () {
        this.rotationSpeed = 0.02;
        this.bouncingSpeed = 0.03;
    
        this.color = meshMaterial.color.getStyle();
        this.selectedMesh = "cube";
        this.renderer = "webGLRenderer";
    
        // Mudança no modo de renderização: WebGL ou Canvas
        this.switchRenderer = function () {
          if (renderer instanceof THREE.WebGLRenderer) {
            renderer = canvasRenderer;
            document.getElementById("webgl-output").innerHTML = "";
            document.getElementById("webgl-output").appendChild(renderer.domElement);
            this.renderer = "canvasRenderer";
          } else {
            renderer = webGLRenderer;
            document.getElementById("webgl-output").innerHTML = "";
            document.getElementById("webgl-output").appendChild(renderer.domElement);
            this.renderer = "webGLRenderer";
          }
        }
      };

    var gui = new dat.GUI();    // GUI de controle e ajuste de valores
    var selectedMesh = cube;

    addBasicMaterialSettings(gui, controls, meshMaterial);  // Adiciona no menu lateral os elementos basicos de um material

    var spGui = gui.addFolder("THREE.MeshBasicMaterial");
    spGui.addColor(controls, 'color').onChange(function (e) {
        meshMaterial.color.setStyle(e)
    });
    spGui.add(meshMaterial, 'wireframe');
    spGui.add(meshMaterial, 'wireframeLinewidth', 0, 20);
    spGui.add(meshMaterial, 'wireframeLinejoin', ['round', 'bevel', 'miter']).onChange(function (e) {
        meshMaterial.wireframeLinejoin = e
    });
    spGui.add(meshMaterial, 'wireframeLinecap', ['butt', 'round', 'square']).onChange(function (e) {
        meshMaterial.wireframeLinecap = e
    });

    gui.add(controls, "renderer").listen();         //Escuta a mudança no valor da variável a atualiza na interface

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
    gui.add(controls, 'switchRenderer');

    render();

    function render() {     //Estabelece um loop de animação
        stats.update();

        selectedMesh.rotation.y = step += 0.01;

        // Renderiza usando a função "requestAnimationFrame" que atualiza a 
        // interface dentro de um intervalo de tempo específico
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}