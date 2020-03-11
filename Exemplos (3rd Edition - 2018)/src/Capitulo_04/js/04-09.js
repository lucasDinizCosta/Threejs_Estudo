/****************************************************************************************************
 *  -> MeshStandardMaterial: É um material que leva em conta a física apropriada para determinar    *
 *  como reagir à luz presente na cena. É ótimo para objetos bilhantes e com aparência metálica.    *
 *  Além disso permite criar objetos com uma precisão mais realista da parte visual.                *
 *                                                                                                  *
 *                                                                                                  *
 *  -> Duas propriedades de destaque:                                                               *
 *     1) metalness: Determina o quão metálico é o material.                                        *
 *        não metalicos tem valor 0, e metálicos com valor próximo de 1 e por padrão é 0.5.         *
 *                                                                                                  *
 *     2) roughness: Define o quão bruto e rígido é o material de modo                              *
 *        que determina como a luz no material será difusa.                                         *
 *        - default - 0.5                                                                           *
 *        - reflexivo como espelho - 0                                                              *
 *        - Difunde a luz total - 1                                                                 *
 *                                                                                                  *
 ***************************************************************************************************/

function init() {
    // Utiliza padrões de camera, status e render
    var stats = initStats();                        // Status de fps ou ms da aplicação 
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();
    addLargeGroundPlane(scene);
  
    // Adiciona iluminação SpotLight para as sombras
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-0, 30, 60);
    spotLight.castShadow = true;
    spotLight.intensity = 0.6;
    scene.add(spotLight);
  
    // call the render function
    var step = 0;
    var material = new THREE.MeshStandardMaterial({color: 0x7777ff});

    // Funções de controle dos objetos em cena
    var controls = new function () {
      this.color = material.color.getStyle();
      this.emissive = material.emissive.getStyle();
    };
  
    var gui = new dat.GUI();                                // GUI de controle e ajuste de valores
    
    addBasicMaterialSettings(gui, controls, material);      // Adiciona no menu lateral os elementos basicos de um material
    addMeshSelection(gui, controls, material, scene);       // Adiciona varios objetos diferentes para facilitar a visualização dos efeitos

    var spGui = gui.addFolder("THREE.MeshStandardMaterial");
    spGui.addColor(controls, 'color').onChange(function (e) {
      material.color.setStyle(e)
    });
    spGui.addColor(controls, 'emissive').onChange(function (e) {
      material.emissive = new THREE.Color(e);
    });
    spGui.add(material, 'metalness', 0, 1, 0.01);
    spGui.add(material, 'roughness', 0, 1, 0.01);
    spGui.add(material, 'wireframe');
    spGui.add(material, 'wireframeLinewidth', 0, 20);
  
    camera.lookAt(controls.selected.position);
    render();
  
    function render() {
      stats.update();
  
      if (controls.selected) controls.selected.rotation.y = step += 0.01;
  
      // Renderiza usando a função "requestAnimationFrame" que atualiza a 
      // interface dentro de um intervalo de tempo específico
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
  }