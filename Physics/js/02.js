function init() {

  Physijs.scripts.worker = 'libs/other/physijs/physijs_worker.js';
  Physijs.scripts.ammo = 'ammo.js';


  // use the defaults
  var stats = initStats();
  var renderer = initRenderer();
  var camera = initCamera(new THREE.Vector3(70, 20, 0));

  // Enable mouse rotation, pan, zoom etc.
  var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  orbitControls.target.set(0, 0, 0);
  orbitControls.minDistance = 25;
  orbitControls.maxDistance = 100;

  var clock = new THREE.Clock();
  var scene = new Physijs.Scene({reportSize: 10, fixedTimeStep: 1 / 60});
  
  // Positioning Lights

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

  var textureLoader = new THREE.TextureLoader();
  var sideBound = 5;            // BoxSize

  // setup controls
  var gui = new dat.GUI();
  var controls = {
    gravityX: 0,
    gravityY: -50,
    gravityZ: 0,
    mesh: null,
    ramp: [],
    frictionRamp: 0.9,
    restitutionRamp: 0.3,
    visibleBox: true,
    visibleAxis: true,
    animation: true,
    friction: 0.5,
    angleRamp: 30,                              // Degrees of inclination of the ramp

    createRamp: function(){
      for(let i = 0; i < this.ramp.length; i++){
        scene.remove(this.ramp[i]);         // Remove old version
      }
      this.ramp = [];

      var ramp_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial(
          {map: textureLoader.load('assets/textures/general/bathroom.jpg')}
        ),
        this.frictionRamp, this.restitutionRamp
      ); //Friction and restitution
    
      // Adjust the texture
      ramp_material.map.repeat.set(3, 3);
      ramp_material.map.wrapS = THREE.RepeatWrapping;
      ramp_material.map.wrapT = THREE.RepeatWrapping;
    
      var ramp = new Physijs.BoxMesh(new THREE.BoxGeometry(30, 0.1, 20), ramp_material, 0);
      ramp.castShadow = true;
      ramp.receiveShadow = true;

      let altura = Math.sin(this.angleRamp * (Math.PI/180)) * 30;
      let fixDistRamp = 0.5;
      ramp.position.y = altura/2 + fixDistRamp;    //  8
      ramp.rotation.y = THREE.MathUtils.degToRad(90);
      ramp.rotation.z = THREE.MathUtils.degToRad(this.angleRamp);
      this.ramp.push(ramp);
      scene.add(ramp);

      var wall_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial(
          {map: textureLoader.load('assets/textures/general/bathroom.jpg'),
          side: THREE.DoubleSide
        }
        ),
        this.frictionRamp, this.restitutionRamp
      ); //Friction and restitution
    
      // Adjust the texture
      wall_material.map.repeat.set(3, 3);
      wall_material.map.wrapS = THREE.RepeatWrapping;
      wall_material.map.wrapT = THREE.RepeatWrapping;

      var wall_sides_material = Physijs.createMaterial(new THREE.MeshBasicMaterial({
          transparent: true, opacity: 0.4, color: 0xcFFFFFF, side: THREE.DoubleSide
        }),
          this.frictionRamp, this.restitutionRamp
      ); //Friction and restitution

      var backWall = new  Physijs.BoxMesh(new THREE.BoxGeometry(20, altura, 0.1), wall_material, 0);
      backWall.position.z = - ((altura - altura/2) / Math.tan(this.angleRamp * (Math.PI/180)));
      backWall.position.y = altura/2 + fixDistRamp;
      this.ramp.push(backWall);
      scene.add(backWall);

      var groundWall = new  Physijs.BoxMesh(new THREE.BoxGeometry(20, 0.1, (altura / Math.tan(controls.angleRamp * (Math.PI/180)))), wall_material, 0);
      groundWall.position.y = fixDistRamp;
      this.ramp.push(groundWall);
      scene.add(groundWall);

      // Adiciona os pontos da face lateral

      // Left Side
      var points = [];
      points.push(new THREE.Vector3(10, altura + fixDistRamp, backWall.position.z));
      points.push(new THREE.Vector3(10, fixDistRamp, 
        /*backWall.position.z + Math.round(
        Math.sqrt(900 - Math.pow(altura, 2))*/
        backWall.position.z + (Math.cos(this.angleRamp * Math.PI/180) * 30)
      ));
      points.push(new THREE.Vector3(10, fixDistRamp, backWall.position.z));
      points.push(new THREE.Vector3(10, altura + fixDistRamp, backWall.position.z));

      // Usa os mesmos pontos para criar o objeto geometrico convexo
      var geometry = new THREE.ConvexGeometry( points );
      geometry.computeVertexNormals();                        // Computa as normais
      geometry.computeFaceNormals();                          // Computa as normais de cada face
      geometry.normalsNeedUpdate = true;
      var leftWall = new Physijs.ConvexMesh(geometry, wall_sides_material, 0);

      geometry.computeVertexNormals();                        // Computa as normais
      geometry.computeFaceNormals();                          // Computa as normais de cada face
      geometry.normalsNeedUpdate = true;

      this.ramp.push(leftWall);
      scene.add(leftWall);

      //console.log("altura: " + altura, "angle: "+this.angleRamp, "backWall.position.z: "+ backWall.position.z);

      // Right Side
      points = [];
      points.push(new THREE.Vector3(-10, altura + fixDistRamp, backWall.position.z));
      points.push(new THREE.Vector3(-10, fixDistRamp, 
        /*backWall.position.z + Math.round(
        Math.sqrt(900 - Math.pow(altura, 2))*/
      backWall.position.z + (Math.cos(this.angleRamp * Math.PI/180) * 30)
      ));
      points.push(new THREE.Vector3(-10, fixDistRamp, backWall.position.z));
      points.push(new THREE.Vector3(-10, altura + fixDistRamp, backWall.position.z));

      // Usa os mesmos pontos para criar o objeto geometrico convexo
      geometry = new THREE.ConvexGeometry( points );
      geometry.computeVertexNormals();                        // Computa as normais
      geometry.computeFaceNormals();                          // Computa as normais de cada face
      geometry.normalsNeedUpdate = true;
      var rightWall = new Physijs.ConvexMesh(geometry, wall_sides_material, 0);
      this.ramp.push(rightWall);
      scene.add(rightWall);
    },

    createBox: function(){
      if(controls.mesh != null)
        scene.remove(controls.mesh);         // Remove old version

      var block_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial(
          {map: textureLoader.load('assets/textures/general/stone.jpg')}
        ),
        controls.friction, .1
      ); //Friction and restitution
      controls.mesh = new Physijs.BoxMesh(new THREE.BoxGeometry(sideBound, sideBound, sideBound), 
      block_material, 1);     //geometry, material and mass
      controls.mesh.castShadow = true;
      controls.mesh.receiveShadow = true;
      controls.mesh.position.y = 16.48;
      controls.mesh.position.z = -9.5;
      controls.mesh.rotation.y = THREE.MathUtils.degToRad(90);
      controls.mesh.rotation.z = THREE.MathUtils.degToRad(30); 
      scene.add(controls.mesh);

      handleCollision = function( collided_with, linearVelocity, angularVelocity ) {
				switch ( ++this.collisions ) {
					
					case 1:
            this.material.color.setHex(0xcc8855);
            console.log(collided_with);
						break;
					
					case 2:
            this.material.color.setHex(0xbb9955);
            console.log(collided_with);
            /*this.rotation.set(0, 0, 0);
            this.__dirtyRotation = true;
            this.setAngularVelocity(new THREE.Vector3(0, 0, 0));*/
            
						break;
					
					case 3:
						this.material.color.setHex(0xaaaa55);
						break;
					
					case 4:
						this.material.color.setHex(0x99bb55);
						break;
					
					case 5:
						this.material.color.setHex(0x88cc55);
						break;
					
					case 6:
						this.material.color.setHex(0x77dd55);
						break;
				}
      }
      controls.mesh.collisions = 0;
      controls.mesh.addEventListener( 'collision', handleCollision );

      createAxisOnObject(controls.mesh, sideBound);     // Put center axis on object
      createForcesDiagram(controls.mesh, sideBound, 0); // id to identify collision and plot the forces
    },

    resetSimulation: function(){
      this.mesh.position.x = 0;
      this.mesh.position.y = 16.48;
      this.mesh.position.z = -9.5;

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
  
  controls.createRamp();
  controls.createBox();

  var objectMenu = gui.addFolder("object Menu");
  objectMenu.add(controls, "resetSimulation");
  objectMenu.add(controls, "animation").onChange(function(e){
    if(controls.animation){
      controls.mesh.mass = 1;
    }
    else{
      
      controls.mesh.mass = 0;

      // You may also want to cancel the object's velocity
      controls.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
      controls.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
    }
  });
  objectMenu.add(controls, "visibleBox").onChange(function(e){
    if(controls.visibleBox){
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
  objectMenu.add(controls, "friction", 0, 1, 0.01).onChange(
    function(e) {
      controls.createBox();           // Recria o objeto pois a fisica é mudada
    }
  );
  objectMenu.add(controls, "angleRamp", 0, 60, 2).onChange(
    function(e) {
      controls.createRamp();           // Recria o objeto pois a fisica é mudada
    }
  );
  

  /*gui.add(controls, "gravityX", -100, 100, 1).onChange(function(e) {scene.setGravity(new THREE.Vector3(controls.gravityX, controls.gravityY, controls.gravityZ))});
  gui.add(controls, "gravityY", -100, 100, 1).onChange(function(e) {scene.setGravity(new THREE.Vector3(controls.gravityX, controls.gravityY, controls.gravityZ))});
  gui.add(controls, "gravityZ", -100, 100, 1).onChange(function(e) {scene.setGravity(new THREE.Vector3(controls.gravityX, controls.gravityY, controls.gravityZ))});*/

  scene.setGravity(new THREE.Vector3(0, -50, 0));
  createGroundAndWalls(scene);

  // do the basic rendering
  render();
  function render() {
    stats.update();
    var delta = clock.getDelta();
    orbitControls.update(delta);                 // Atualiza o controle da câmera
   
    requestAnimationFrame(render);
    scene.simulate(undefined, 2);
    renderer.render(scene, camera);
  }
}

// id to identify collision and plot the forces
function createForcesDiagram(object, size, id){
  let heightCenter = 3/2 * size;
  var block_material = Physijs.createMaterial(
    new THREE.MeshBasicMaterial(
      {color: 0xEEEEEE}
    ),
    0, 0);    //Friction and restitution
  var centerDiagram = new Physijs.SphereMesh(new THREE.SphereGeometry(0.5, 64, 64), 
  block_material, 0);   //geometry, material and mass
  centerDiagram.position.y = heightCenter;
  centerDiagram.position.x = 0;
  centerDiagram.position.z = 0;

  size = size/3;

  // Axes of origin of block
  var groupForces = new THREE.Group;
  groupForces.name = "Forces-" + id;
  object.add(groupForces);
  groupForces.add(centerDiagram);

  switch(id){
    case 0: { // Com atrito
      /**********
       *  Peso  *
       *********/

      var dir = new THREE.Vector3(0, 1, 0 );
      dir.normalize();  //normalize the direction vector (convert to vector of length 1)
      var origin = new THREE.Vector3(0, 0, 0);
      var length = size + 2;
      var hex = 0xff0000;
      var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      arrowHelper.rotation.z = THREE.MathUtils.degToRad(150);
      centerDiagram.add(arrowHelper);

      /************
       *  Normal  *
       ************/

      dir = new THREE.Vector3(0, 1, 0 );
      dir.normalize();  //normalize the direction vector (convert to vector of length 1)
      origin = new THREE.Vector3(0, 0, 0);
      length = size + 2;
      hex = 0x00ff00;
      arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      centerDiagram.add(arrowHelper);

      /************
       *  Atrito  *
       ***********/
      dir = new THREE.Vector3(1, 0, 0);
      dir.normalize(); //normalize the direction vector (convert to vector of length 1)
      origin = new THREE.Vector3(0, 0, 0);
      length = size + 2;
      hex = 0x0000ff;
      arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      centerDiagram.add(arrowHelper);
      break;
    }
    case 1:{        // Sem atrito
      /**********
       *  Peso  *
       *********/

      var dir = new THREE.Vector3(0, 1, 0 );
      dir.normalize();  //normalize the direction vector (convert to vector of length 1)
      var origin = new THREE.Vector3(0, 0, 0);
      var length = size + 2;
      var hex = 0xff0000;
      var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      arrowHelper.rotation.z = THREE.MathUtils.degToRad(150);
      centerDiagram.add(arrowHelper);

      /************
       *  Normal  *
       ************/

      dir = new THREE.Vector3(0, 1, 0 );
      dir.normalize();  //normalize the direction vector (convert to vector of length 1)
      origin = new THREE.Vector3(0, 0, 0);
      length = size + 2;
      hex = 0x00ff00;
      arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      centerDiagram.add(arrowHelper);
      break;
    }
    case 2:{        // Colisão com caixa de madeira
      /**********
       *  Peso  *
       *********/

      var dir = new THREE.Vector3(0, 1, 0 );
      dir.normalize();  //normalize the direction vector (convert to vector of length 1)
      var origin = new THREE.Vector3(0, 0, 0);
      var length = size + 2;
      var hex = 0xff0000;
      var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      //arrowHelper.rotation.z = THREE.MathUtils.degToRad(150);
      centerDiagram.add(arrowHelper);

      /************
       *  Normal  *
       ************/

      dir = new THREE.Vector3(0, 1, 0 );
      dir.normalize();  //normalize the direction vector (convert to vector of length 1)
      origin = new THREE.Vector3(0, 0, 0);
      length = size + 2;
      hex = 0x00ff00;
      arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      centerDiagram.add(arrowHelper);

      /************
       *  Atrito  *
       ***********/
      dir = new THREE.Vector3(1, 0, 0);
      dir.normalize(); //normalize the direction vector (convert to vector of length 1)
      origin = new THREE.Vector3(0, 0, 0);
      length = size + 2;
      hex = 0x0000ff;
      arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      centerDiagram.add(arrowHelper);
      break;
    }
  }
}

/**************************************************
 * Eixos de orientação do objeto                  *
 * @param {*} object                              *
 * @param {*} size                                *
 **************************************************/

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
  var length = size + 2;
  var hex = 0xff0000;

  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  groupAxis.add(arrowHelper);

  // Y
  dir = new THREE.Vector3(0, 1, 0 );

  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();

  origin = new THREE.Vector3(0, 0, 0);
  length = size + 2;
  hex = 0x00ff00;

  arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  groupAxis.add(arrowHelper);

  // Z
  dir = new THREE.Vector3(0, 0, 1);

  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();

  origin = new THREE.Vector3(0, 0, 0);
  length = size + 2;
  hex = 0x0000ff;

  arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  groupAxis.add(arrowHelper);
}

/**********************************************
 * Adiciona uma caixa de madeira na cena      *
 * @param {*} scene                           *
 *********************************************/

function createGroundAndWalls(scene) {
  var textureLoader = new THREE.TextureLoader();
  var ground_material = Physijs.createMaterial(
          new THREE.MeshStandardMaterial(
            {map: textureLoader.load('assets/textures/general/wood-2.jpg')}
          ),
          .9, .3);

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
  //glassBox(scene);
}


function glassBox(scene){
  var wall_material = Physijs.createMaterial(new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1}), 0.9, 0.7);
  var leftWall = new  Physijs.BoxMesh(new THREE.BoxGeometry(0.1, 60, 120), wall_material, 0);
  leftWall.position.x = -60;
  leftWall.position.y = 30;
  scene.add(leftWall);
  var topWall = new  Physijs.BoxMesh(new THREE.BoxGeometry(0.1, 100, 120), wall_material, 0);
  topWall.position.x = 60;
  topWall.position.y = 30;
  scene.add(topWall);
  /*var wall3 = new  Physijs.BoxMesh(new THREE.BoxGeometry(50, 100, 1), wall_material, 0);
  wall3.position.y = 50;
  wall3.position.z = -40; 
  scene.add(wall3);
  var wall4 = new  Physijs.BoxMesh(new THREE.BoxGeometry(50, 100, 1), wall_material, 0);
  wall4.position.y = 50;
  wall4.position.z = 40; 
  scene.add(wall4);*/
}
