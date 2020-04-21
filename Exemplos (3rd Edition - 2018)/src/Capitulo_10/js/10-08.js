/************************************************************************************************************
 * ------------------------------------   Bumpmap  -------------------------------------------------------  *
 *                                                                                                          * 
 * =>   Bumpmap (mapa de relevo): é usado para criar uma profundidade maior ao material, além de gerar      *
 * uma certa rugosidade no material.                                                                        *
 *      A intensidade do pixel define a altura do bump. Um mapa de relevo contém apenas a altura  relativa  *
 * de um pixel. Não diz nada sobre a direção da encosta. Portanto, o nível de detalhe e a percepção de      *
 * profundidade que você pode alcançar com um mapa de relevo são limitados. Para mais detalhes, você pode   *
 * usar um mapa normal.                                                                                     *
 *                                                                                                          *
 * Cubo direito: Com bumpmap;                                                                               *
 * Cubo esquerdo: Sem bumpmap;                                                                              *
 *                                                                                                          *
 ***********************************************************************************************************/

function init() {

  // use the defaults
  var stats = initStats();
  var renderer = initRenderer();
  var camera = initCamera(new THREE.Vector3(0, 20, 40));
  var trackballControls = initTrackballControls(camera, renderer);
  var clock = new THREE.Clock();

  // create a scene, that will hold all our elements such as objects, cameras and lights.
  // and add some simple default lights
  var scene = new THREE.Scene();
  var textureLoader = new THREE.TextureLoader();
  var groundPlane = addLargeGroundPlane(scene, true);
  groundPlane.position.y = -8;

  initDefaultLighting(scene);
  scene.add(new THREE.AmbientLight(0x444444));

  var gui = new dat.GUI();
  var controls = {};

  var cube = new THREE.BoxGeometry(16, 16, 16);
  var cubeMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load("../../assets/textures/stone/stone.jpg"),
      metalness: 0.2,
      roughness: 0.07
  });

  var cubeMaterialWithBumpMap = cubeMaterial.clone();
  cubeMaterialWithBumpMap.bumpMap = textureLoader.load("../../assets/textures/stone/stone-bump.jpg");

  var cube1 = addGeometryWithMaterial(scene, cube, 'cube-1', gui, controls, cubeMaterial);
  cube1.position.x = -17;
  cube1.rotation.y = (1/3) * Math.PI;

  var cube2 = addGeometryWithMaterial(scene, cube, 'cube-2', gui, controls, cubeMaterialWithBumpMap);
  cube2.position.x = 17;
  cube2.rotation.y = (-1/3) * Math.PI;

  gui.add(cubeMaterialWithBumpMap, "bumpScale", -1, 1, 0.001);

  render();
  function render() {
    stats.update();
    trackballControls.update(clock.getDelta());
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}
