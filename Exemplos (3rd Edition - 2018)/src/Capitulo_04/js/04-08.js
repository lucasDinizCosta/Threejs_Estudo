/****************************************************************************
 *  -> MeshToonMaterial: Uma extensão à MeshPhongMaterial que tenta criar   *
 *    objetos que parecem desenhados à mão.                                 *
 ***************************************************************************/

function init() {

    // Utiliza padrões de camera, status e renderer
    var stats = initStats();                    // Status de fps ou ms da aplicação 
    var renderer = initRenderer();
    var camera = initCamera();
  
    // Cria a cena que prende todos os elementos, sejam eles: Luzes, Texturas, Objetos e etc...
    var scene = new THREE.Scene();
    addLargeGroundPlane(scene);
  
    // Adiciona iluminação SpotLight para as sombras
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-0, 30, 60);
    spotLight.castShadow = true;                // Cria sombras
    spotLight.intensity = 0.6;
    scene.add(spotLight);
  
    // call the render function
    var step = 0;
    var material = new THREE.MeshToonMaterial({color: 0x7777ff});

    // Funções de controle dos objetos em cena
    var controls = new function () {
      this.color = material.color.getStyle();
      this.emissive = material.emissive.getStyle();
      this.specular = material.specular.getStyle();
    };
  
    var gui = new dat.GUI();                // GUI de controle e ajuste de valores
    
    addBasicMaterialSettings(gui, controls, material);  // Adiciona no menu lateral os elementos basicos de um material
    addMeshSelection(gui, controls, material, scene);   // Adiciona varios objetos diferentes para facilitar a visualização dos efeitos

    var spGui = gui.addFolder("THREE.MeshToonMaterial");
    spGui.addColor(controls, 'color').onChange(function (e) {
      material.color.setStyle(e)
    });
    spGui.addColor(controls, 'emissive').onChange(function (e) {
      material.emissive = new THREE.Color(e);
    });
    spGui.addColor(controls, 'specular').onChange(function (e) {
      material.specular = new THREE.Color(e);
    });
    spGui.add(material, 'shininess', 0, 100, )
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