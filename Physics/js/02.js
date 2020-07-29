function init() {
  Physijs.scripts.worker = 'libs/other/physijs/physijs_worker.js';
  Physijs.scripts.ammo = 'ammo.js';

  // use the defaults
  var stats = initStats();
  var renderer = setRenderer();
  var camera = initCamera(new THREE.Vector3(70, 20, 0));
  var gui = new dat.GUI();

  // Enable mouse rotation, pan, zoom etc.
  var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  orbitControls.target.set(0, 0, 0);
  orbitControls.minDistance = 25;
  orbitControls.maxDistance = 100;
  var clock = new THREE.Clock();
  var scene = new Physijs.Scene({reportSize: 10, fixedTimeStep: 1 / 60});
  scene.setGravity(new THREE.Vector3(0, -9.8, 0));
  
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
  //var axis = new THREE.AxisHelper(300);
  //scene.add(axis);

  var textureLoader = new THREE.TextureLoader();
  var sideBound = 5;            // BoxSize

  // setup controls
  var controls = {
    gravityX: 0,
    gravityY: -9.8,
    gravityZ: 0,
    mesh: null,
    ramp: [],
    groupForces: null,
    frictionRamp: 0.9,
    restitutionRamp: 0.3,
    visibleBox: true,
    visibleAxis: false,
    animation: true,
    friction: 0.5,
    angleRamp: 30,                              // Degrees of inclination of the ramp
    startPosition: {
      x: 0,
      y: 0,
      z: 0,
    },

    // Paineis
    forcesCanvas: document.getElementById("forces-canvas-box"),
    panels: {
      forcesCanvas: true,
    },

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
      this.startPosition.y = altura;

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

      // Posicao inicial
      this.startPosition.x = 0;
      this.startPosition.z = backWall.position.z;

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
      if(this.mesh != null){
        scene.remove(this.mesh);         // Remove old version       -- Box
        this.mesh = null;
      }
      if(this.groupForces != null){
        scene.remove(this.groupForces);         // Remove old version -- GroupForces
        this.groupForces = null;
      }

      var block_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial(
          {map: textureLoader.load('assets/textures/general/stone.jpg')}
        ),
        this.friction, .1
      ); //Friction and restitution
      this.mesh = new Physijs.BoxMesh(new THREE.BoxGeometry(sideBound, sideBound, sideBound), 
      block_material, 1);     //geometry, material and mass
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      if(this.ramp.length != 0){
        this.mesh.position.x = this.startPosition.x;
        this.mesh.position.y = (this.startPosition.y * 16.47)/15;
        this.mesh.position.z = (this.startPosition.z * -9.5)/-12.99; //-9.5;
      }
      else{
        this.mesh.position.x = this.startPosition.x;
        this.mesh.position.y = 16.47;
        this.mesh.position.z = -9.5;
      }

      this.mesh.rotation.y = THREE.MathUtils.degToRad(90);
      this.mesh.rotation.z = THREE.MathUtils.degToRad(this.angleRamp);
      scene.add(this.mesh);

      handleCollision = function( collided_with, linearVelocity, angularVelocity ) {
        if(collided_with.name === "ground"){
          controls.groupForces.children[0].visible = false;
          controls.groupForces.children[1].visible = true;
          controls.groupForces.children[2].visible = false;
          console.log("Chao");
        }
        else{
          controls.groupForces.children[0].visible = true;
          controls.groupForces.children[1].visible = false;
          controls.groupForces.children[2].visible = false;
          console.log("Rampa");
        }
        this.collisions++;
      }
      this.mesh.collisions = 0;
      this.mesh.addEventListener( 'collision', handleCollision );

      createAxisOnObject(this.mesh, sideBound);     // Put center axis on object
      this.groupForces = createForcesDiagram(controls, sideBound);             // id to identify collision and plot the forces
      this.groupForces.rotation.y = THREE.MathUtils.degToRad(90);
      scene.add(this.groupForces);
    },

    resetSimulation: function(){
      this.createRamp();           // Recria o objeto pois a fisica é mudada
      this.createBox();           // Recria o objeto pois a fisica é mudada
      /*
      this.mesh.position.x = this.startPosition.x;
      this.mesh.position.y = this.startPosition.y;
      this.mesh.position.z = this.startPosition.z;

      this.mesh.rotation.set(0, 0, 0);
      this.mesh.rotation.y = THREE.MathUtils.degToRad(90);
      this.mesh.rotation.z = THREE.MathUtils.degToRad(this.angleRamp);

      // https://github.com/chandlerprall/Physijs/wiki/Updating-an-object's-position-&-rotation
      // Permite a mudança de posição
      this.mesh.__dirtyPosition = true;
      this.mesh.__dirtyRotation = true;

      // You may also want to cancel the object's velocity
      this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
      this.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
      */

    },

    updateForces: function(){
      if(this.mesh != null){
        this.groupForces.position.x = this.mesh.position.x; 
        this.groupForces.position.y = this.mesh.position.y + sideBound * 1.75; 
        this.groupForces.position.z = this.mesh.position.z;
      }

    },

  };
  
  controls.createRamp();
  controls.createBox();

  // Criando atributos do menu lateral
  var objectMenu = gui.addFolder("object Menu");
  objectMenu.add(controls, "resetSimulation");
  objectMenu.add(controls, "animation");
  objectMenu.add(controls, "friction", 0, 1, 0.01).onChange(
    function(e) {
      controls.createRamp();           // Recria o objeto pois a fisica é mudada
      controls.createBox();           // Recria o objeto pois a fisica é mudada
    }
  );
  objectMenu.add(controls, "angleRamp", 0, 60, 2).onChange(
    function(e) {
      controls.createRamp();           // Recria o objeto pois a fisica é mudada
      controls.createBox();           // Recria o objeto pois a fisica é mudada
    }
  );
  //objectMenu.add(controls, "panels.forcesCanvas");
  objectMenu.add(controls.panels, "forcesCanvas").onChange(function(e){
    if(controls.panels.forcesCanvas){
      controls.forcesCanvas.style.display = "block";
    }
    else{
      controls.forcesCanvas.style.display = "none";
    }
  });
  

  window.addEventListener('resize', function(){
    onResize(camera, renderer);
  });  // Ajuste de tela

  createGroundAndWalls(scene);
  render();
  function render() {
    stats.update();
    var delta = clock.getDelta();
    orbitControls.update(delta);                 // Atualiza o controle da câmera

    // Diagrama de forças
    /*if(controls.animation){
      controls.updateForces();
      scene.simulate(undefined, 2);
      //scene.simulate();
    }*/
    controls.updateForces();
    scene.simulate(undefined, 2); //scene.simulate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  // https://www.programmersought.com/article/5332673853/
  //controls.mesh.setCcdMotionThreshold(1);
  
}

function setRenderer(){
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x222);
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

function onResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update the panels position
  controls.forcesCanvas.style.left = (window.innerWidth - tela.width - 25) + "px";
  controls.forcesCanvas.style.bottom = '50px';
}

// id to identify collision and plot the forces
function createForcesDiagram(controls, size){
  //let heightCenter = 3/2 * size;
  var block_material = new THREE.MeshBasicMaterial(
      {color: 0xEEEEEE}
  );
  var centerDiagram = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), block_material);
  centerDiagram.position.y = 0;
  centerDiagram.position.x = 0;
  centerDiagram.position.z = 0;
  centerDiagram.rotation.z = THREE.MathUtils.degToRad(controls.angleRamp);

  size = size/3;

  // Axes of origin of block
  var groupForces = new THREE.Group;
  groupForces.name = "Forces";
  //object.add(groupForces);
  groupForces.add(centerDiagram);

              /**************
               * Com atrito *
               **************/

   /**********
   *  Peso  *
   *********/

  var dir = new THREE.Vector3(0, 1, 0 );
  dir.normalize();  //normalize the direction vector (convert to vector of length 1)
  var origin = new THREE.Vector3(0, 0, 0);
  var length = size + 2;
  var hex = 0xff0000;
  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  arrowHelper.rotation.z = THREE.MathUtils.degToRad(180 - controls.angleRamp);
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
  groupForces.add(centerDiagram);

            /**
             * Sem atrito
             */

  centerDiagram = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), block_material);
  centerDiagram.position.y = 0;
  centerDiagram.position.x = 0;
  centerDiagram.position.z = 0;
  centerDiagram.visible = false;

  /**********
   *  Peso  *
   *********/

  var dir = new THREE.Vector3(0, 1, 0 );
  dir.normalize();  //normalize the direction vector (convert to vector of length 1)
  var origin = new THREE.Vector3(0, 0, 0);
  var length = size + 2;
  var hex = 0xff0000;
  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  arrowHelper.rotation.z = THREE.MathUtils.degToRad(180);
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
  groupForces.add(centerDiagram);

          /**********************************
           * Colisão com o chão de madeira  *
           **********************************/
  
  centerDiagram = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), block_material);
  centerDiagram.position.y = 0;
  centerDiagram.position.x = 0;
  centerDiagram.position.z = 0;
  centerDiagram.visible = false;

  /**********
   *  Peso  *
   *********/

  var dir = new THREE.Vector3(0, 1, 0 );
  dir.normalize();  //normalize the direction vector (convert to vector of length 1)
  var origin = new THREE.Vector3(0, 0, 0);
  var length = size + 2;
  var hex = 0xff0000;
  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
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
  groupForces.add(centerDiagram);
  return groupForces;
}

/**************************************************
 * Eixos de orientação do objeto                  *
 * @param {*} object                              *
 * @param {*} size                                *
 **************************************************/

function createAxisOnObject(object, size){
  size = size/2;

  // Axes of origin of block
  var groupAxis = new THREE.Group;
  groupAxis.name = "Axis";
  groupAxis.visible = false;
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
  ground.name = "ground";

  var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 120), ground_material, 0);
  borderLeft.position.x = -59;
  borderLeft.position.y = 2;
  borderLeft.castShadow = true;
  borderLeft.receiveShadow = true;
  borderLeft.name = "ground";

  ground.add(borderLeft);

  var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 120), ground_material, 0);
  borderRight.position.x = 59;
  borderRight.position.y = 2;
  borderRight.castShadow = true;
  borderRight.receiveShadow = true;
  borderRight.name = "ground";

  ground.add(borderRight);

  var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(116, 3, 2), ground_material, 0);
  borderBottom.position.z = 59;
  borderBottom.position.y = 2;
  borderBottom.castShadow = true;
  borderBottom.receiveShadow = true;
  borderBottom.name = "ground";

  ground.add(borderBottom);

  var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(116, 3, 2), ground_material, 0);
  borderTop.position.z = -59;
  borderTop.position.y = 2;
  borderTop.castShadow = true;
  borderTop.receiveShadow = true;
  borderTop.name = "ground";

  ground.add(borderTop);
  scene.add(ground);
}