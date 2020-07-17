function init() {

  Physijs.scripts.worker = 'libs/other/physijs/physijs_worker.js';
  Physijs.scripts.ammo = 'ammo.js';


  // use the defaults
  var stats = initStats();
  var renderer = initRenderer();
  var camera = initCamera(new THREE.Vector3(0, 50, 60));

  // Enable mouse rotation, pan, zoom etc.
  var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  orbitControls.target.set(0, 0, 0);
  orbitControls.minDistance = 25;
  orbitControls.maxDistance = 100;

  var clock = new THREE.Clock();
  var scene = new Physijs.Scene;

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 40, 70);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.fov = 20;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.05;
  spotLight.name = "spotLight";

  scene.add(spotLight);

  var ambientLight = new THREE.AmbientLight(0x343434);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);
  scene.add(new THREE.AmbientLight(0x0393939));

  // Axis
  var axis = new THREE.AxisHelper(300);
  scene.add(axis);

  // Create ramp
  var textureLoader = new THREE.TextureLoader();
  var ramp_material = Physijs.createMaterial(
    new THREE.MeshStandardMaterial(
      {map: textureLoader.load('assets/textures/general/bathroom.jpg')}
    ),
    .9, .3); //Friction and restitution

  var ramp = new Physijs.BoxMesh(new THREE.BoxGeometry(30, 0.1, 20), ramp_material, 0);
  ramp.castShadow = true;
  ramp.receiveShadow = true;
  ramp.position.y = 10;
  ramp.rotation.y = THREE.MathUtils.degToRad(90);
  ramp.rotation.z = THREE.MathUtils.degToRad(30);
  scene.add(ramp);

  var block_material = Physijs.createMaterial(
    new THREE.MeshStandardMaterial(
      {map: textureLoader.load('assets/textures/general/metal-rust.jpg')}
    ),
    .9, 0.5);    //Friction and restitution
  var sideBound = 4;
  var sphereMesh = new Physijs.SphereMesh(new THREE.SphereGeometry(sideBound, 64, 64), block_material, 1);   //geometry, material and mass
  sphereMesh.castShadow = true;
  sphereMesh.receiveShadow = true;
  sphereMesh.position.y = 15;
  sphereMesh.rotation.y = THREE.MathUtils.degToRad(90);
  sphereMesh.rotation.z = THREE.MathUtils.degToRad(30); 
  scene.add(sphereMesh);

  sphereMesh.setLinearVelocity(new THREE.Vector3(0, 50, 0));

  createAxisOnObject(sphereMesh, sideBound); // Put center axis on object

  // setup controls
  var gui = new dat.GUI();
  var controls = {
    gravityX: 0,
    gravityY: -50,
    gravityZ: 0,
    mesh: sphereMesh,
    visibleSphere: true,
    visibleAxis: true,
    animation: true,

    resetSimulation: function(){
      this.mesh.position.x = 0;
      this.mesh.position.y = 15;
      this.mesh.position.z = 0;

      this.mesh.rotation.set(0, 0, 0);
      this.mesh.rotation.y = THREE.MathUtils.degToRad(90);
      this.mesh.rotation.z = THREE.MathUtils.degToRad(30);

      // https://github.com/chandlerprall/Physijs/wiki/Updating-an-object's-position-&-rotation
      // Permite a mudança de posição
      this.mesh.__dirtyPosition = true;
      this.mesh.__dirtyRotation = true;

      // You may also want to cancel the object's velocity
      this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
      this.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
    }
  };

  var objectMenu = gui.addFolder("object Menu");
  objectMenu.add(controls, "resetSimulation");
  objectMenu.add(controls, "animation").onChange(function(e){
    if(controls.animation){
      controls.mesh.mass = 1;
    }
    else{
      controls.mesh.mass = 0;
    }
  });
  objectMenu.add(controls, "visibleSphere").onChange(function(e){
    if(controls.visibleSphere){
      controls.mesh.visible = true;
    }
    else{
      controls.mesh.visible = false;
    }
  });
  objectMenu.add(controls, "visibleAxis").onChange(function(e){
    if(controls.visibleAxis){
      controls.mesh.getObjectByName("Axis").visible = true;
    }
    else{
      controls.mesh.getObjectByName("Axis").visible = false;
    }
  });
  console.log(sphereMesh);
  

  gui.add(controls, "gravityX", -100, 100, 1).onChange(function(e) {scene.setGravity(new THREE.Vector3(controls.gravityX, controls.gravityY, controls.gravityZ))});
  gui.add(controls, "gravityY", -100, 100, 1).onChange(function(e) {scene.setGravity(new THREE.Vector3(controls.gravityX, controls.gravityY, controls.gravityZ))});
  gui.add(controls, "gravityZ", -100, 100, 1).onChange(function(e) {scene.setGravity(new THREE.Vector3(controls.gravityX, controls.gravityY, controls.gravityZ))});

  scene.setGravity(new THREE.Vector3(0, -50, 0));
  createGroundAndWalls(scene);


  // do the basic rendering
  render();
  function render() {
    stats.update();
    var delta = clock.getDelta();
    orbitControls.update(delta);                 // Atualiza o controle da câmera
   
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    scene.simulate(undefined, 1);
  }
}

function createAxisOnObject(object, size){
  // Axes of origin of block
  var groupAxis = new THREE.Group;
  groupAxis.name = "Axis";
  object.add(groupAxis);

  // X
  var dir = new THREE.Vector3(1, 0, 0 );

  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();

  var origin = new THREE.Vector3(0, 0, 0);
  var length = size + 3;
  var hex = 0xff0000;

  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  groupAxis.add(arrowHelper);

  // Y
  dir = new THREE.Vector3(0, 1, 0 );

  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();

  origin = new THREE.Vector3(0, 0, 0);
  length = size + 3;
  hex = 0x00ff00;

  arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  groupAxis.add(arrowHelper);

  // Z
  dir = new THREE.Vector3(0, 0, 1);

  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();

  origin = new THREE.Vector3(0, 0, 0);
  length = size + 3;
  hex = 0x0000ff;

  arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  groupAxis.add(arrowHelper);
}

function createGroundAndWalls(scene) {
  var textureLoader = new THREE.TextureLoader();
  var ground_material = Physijs.createMaterial(
          new THREE.MeshStandardMaterial(
            {map: textureLoader.load('assets/textures/general/wood-2.jpg')}
          ),
          .9, .3
  );

  var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(120, 1, 120), ground_material, 0);
  ground.castShadow = true;
  ground.receiveShadow = true;

  var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 120), ground_material, 0);
  borderLeft.position.x = -59;
  borderLeft.position.y = 2;
  borderLeft.castShadow = true;
  borderLeft.receiveShadow = true;

  ground.add(borderLeft);

  var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 120), ground_material, 0);
  borderRight.position.x = 59;
  borderRight.position.y = 2;
  borderRight.castShadow = true;
  borderRight.receiveShadow = true;

  ground.add(borderRight);

  var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(116, 3, 2), ground_material, 0);
  borderBottom.position.z = 59;
  borderBottom.position.y = 2;
  borderBottom.castShadow = true;
  borderBottom.receiveShadow = true;

  ground.add(borderBottom);

  var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(116, 3, 2), ground_material, 0);
  borderTop.position.z = -59;
  borderTop.position.y = 2;
  borderTop.castShadow = true;
  borderTop.receiveShadow = true;

  ground.add(borderTop);

  scene.add(ground);

  ground_material = Physijs.createMaterial(
    new THREE.MeshStandardMaterial(
      {map: textureLoader.load('assets/textures/ground/grasslight-big.jpg')}
    ),
    .9, .3
  );

  ground = new Physijs.BoxMesh(new THREE.BoxGeometry(1024, 0.5, 1024), ground_material, 0);
  ground.position.y = - 0.5;
  ground.castShadow = true;
  ground.receiveShadow = true;

  scene.add(ground);
}
