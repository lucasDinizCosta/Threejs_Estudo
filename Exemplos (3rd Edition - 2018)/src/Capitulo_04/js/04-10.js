/****************************************************************************************************
 *  -> MeshStandardMaterial: Mais próximo ao Mesh Standard Material, entretanto tem-se maior        *
 *  controle sobre a propriedade de reflexos nos objetos.                                           *
 *                                                                                                  *
 *  -> Tres propriedades de destaque:                                                               *
 *     1) clearCoat: Um valor que indica uma camada de revestimento em cima do material.            *
 *        Quanto maior esse valor, mais revestimento é aplicado e mais eficaz clearCoatRoughness.   *
 *        - default - 0                                                                             *
 *        - variação(0 a 1).                                                                        *
 *                                                                                                  *
 *     2) clearCoatRoughness: Define a rugosidade sobre o revestimento do material.                 *
 *        Maior rugosidade, maior será a difusão da luz. Utilizado junto a primera propriedade      *
 *        - default - 0                                                                             *
 *        - variação(0 a 1).                                                                        *
 *                                                                                                  *
 *     3) reflectivity: Reflexão para objetos não metálicos.                                        *
 *        Maior rugosidade, maior será a difusão da luz. Utilizado junto a primera propriedade      *
 *        - metálico - valor próximo ou igual a 1                                                   *
 *        - default - 0.5                                                                           *
 *        - variação(0 a 1).                                                                        *
 *                                                                                                  *
 ***************************************************************************************************/

function init() {

    // Utiliza padrões de camera, status e renderer
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
    var material = new THREE.MeshPhysicalMaterial({color: 0x7777ff});

    // Funções de controle dos objetos em cena
    var controls = new function () {
      this.color = material.color.getStyle();
      this.emissive = material.emissive.getStyle();
    };
  
    var gui = new dat.GUI();                             // GUI de controle e ajuste de valores
    
    addBasicMaterialSettings(gui, controls, material);   // Adiciona no menu lateral os elementos basicos de um material
    addMeshSelection(gui, controls, material, scene);    // Adiciona varios objetos diferentes para facilitar a visualização dos efeitos

    var spGui = gui.addFolder("THREE.MeshPhysicalMaterial");
    spGui.addColor(controls, 'color').onChange(function (e) {
      material.color.setStyle(e)
    });
    spGui.addColor(controls, 'emissive').onChange(function (e) {
      material.emissive = new THREE.Color(e);
    });
    spGui.add(material, 'metalness', 0, 1, 0.01);
    spGui.add(material, 'roughness', 0, 1, 0.01);
    spGui.add(material, 'clearCoat', 0, 1, 0.01);
    spGui.add(material, 'clearCoatRoughness', 0, 1, 0.01);
    spGui.add(material, 'reflectivity', 0, 1, 0.01);
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