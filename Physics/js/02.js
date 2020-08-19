function init(controller) {
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
  var scene = new Physijs.Scene();//({reportSize: 5, fixedTimeStep: 1 / 60});
  var gravity = -9.8;
  scene.setGravity(new THREE.Vector3(0, gravity, 0));
  
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
  var controls = {
    angleRamp: 30,                              // Degrees of inclination of the ramp
    animation: true,
    frictionRamp: 0.9,
    frictionBox: 0.5,
    gravityX: 0,
    gravityY: -9.8,
    gravityZ: 0,
    groupForces: null,
    massBox: 1, 
    mesh: null,
    ramp: [],
    widthRamp: 30,
    restitutionRamp: 0.3,
    startPosition: {
      x: 0,
      y: 0,
      z: 0,
    },
    startOldPosition: {
      x: 0,
      y: 0,
      z: 0,
    },
    visibleBox: true,
    visibleAxis: false,

    // Paineis
    informations: document.getElementById("informations"),
    canvasForces: document.getElementById("forces-canvas-box"),
    panels: {
      informations: false,
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
    
      var ramp = new Physijs.BoxMesh(new THREE.BoxGeometry(this.widthRamp, 0.1, 20), ramp_material, 0);
      ramp.castShadow = true;
      ramp.receiveShadow = true;

      let altura = Math.sin(this.angleRamp * (Math.PI/180)) * this.widthRamp;
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
      this.startPosition.y = /*- fixDistRamp*2 + 0.2 +*/  backWall.position.y * 2 + Math.sqrt(sideBound);
      this.startPosition.z = backWall.position.z + sideBound/2;

      // Calculando posicao inicial do bloco
      let centerPointRamp = new THREE.Vector3(ramp.position.x, ramp.position.y, ramp.position.z);
      let heightPointRamp = new THREE.Vector3(backWall.position.x, altura, backWall.position.z);
      let mediumPointRamp = new THREE.Vector3(backWall.position.x, ramp.position.y, backWall.position.z);
      let mediumPointGroundRamp = new THREE.Vector3(backWall.position.x, 0, backWall.position.z);

      // Calculate the unit vector of direction of the center ramp to the height point
      let unitVector = {
        component: new THREE.Vector3(0, 0, 0),
        module: 0,
      };
      unitVector.component.x =  centerPointRamp.x - heightPointRamp.x;
      unitVector.component.y =  centerPointRamp.y - heightPointRamp.y;
      unitVector.component.z =  centerPointRamp.z - heightPointRamp.z;
      unitVector.module = Math.sqrt(unitVector.component.x * unitVector.component.x + 
      unitVector.component.y * unitVector.component.y + 
      unitVector.component.z + unitVector.component.z);
      
      // Unitary Vector
      unitVector.component.x = unitVector.component.x / unitVector.module;
      unitVector.component.y = unitVector.component.y / unitVector.module;
      unitVector.component.z = unitVector.component.z / unitVector.module;

      let tempStartPosition = new THREE.Vector3(
        heightPointRamp.x + unitVector.component.x * (unitVector.module/2),
        heightPointRamp.y + unitVector.component.y * (unitVector.module/2), 
        heightPointRamp.z + unitVector.component.z * (unitVector.module/2)
      );

      // Calculating the start position of the block
      // Calculate the new unit vector of tempStartPosition to mediumPointRamp
      let unitVector2 = {
        component: new THREE.Vector3(0, 0, 0),
        module: 0,
      };
      unitVector2.component.x = tempStartPosition.x - mediumPointGroundRamp.x;
      unitVector2.component.y = tempStartPosition.y - mediumPointGroundRamp.y;
      unitVector2.component.z = tempStartPosition.z - mediumPointGroundRamp.z;
      unitVector2.module = Math.sqrt(unitVector2.component.x * unitVector2.component.x + 
      unitVector2.component.y * unitVector2.component.y + 
      unitVector2.component.z + unitVector2.component.z);
      
      // Unitary Vector
      unitVector2.component.x = unitVector2.component.x / unitVector2.module;
      unitVector2.component.y = unitVector2.component.y / unitVector2.module;
      unitVector2.component.z = unitVector2.component.z / unitVector2.module;

      // Set the start position of the box
      if(this.angleRamp > 40){
        this.startPosition.x = mediumPointGroundRamp.x + 
        (unitVector2.component.x * ((sideBound * Math.sqrt(2))/2 + unitVector2.module));
        this.startPosition.y = mediumPointGroundRamp.y + 
        (unitVector2.component.y * Math.ceil((sideBound)/2 + 0.5 + unitVector2.module));
        this.startPosition.z = mediumPointGroundRamp.z + 
        (unitVector2.component.z * Math.ceil((sideBound)/2 + 0.5 + unitVector2.module));
      }
      else{
        this.startPosition.x = mediumPointGroundRamp.x + 
        (unitVector2.component.x * ((sideBound * Math.sqrt(2))/2 + unitVector2.module));
        this.startPosition.y = mediumPointGroundRamp.y + 
        (unitVector2.component.y * Math.ceil((sideBound)/2 + unitVector2.module));
        this.startPosition.z = mediumPointGroundRamp.z + 
        (unitVector2.component.z * Math.ceil((sideBound)/2 + unitVector2.module));
      }

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
        this.frictionBox, .1
      ); //Friction and restitution
      this.mesh = new Physijs.BoxMesh(new THREE.BoxGeometry(sideBound, sideBound, sideBound), 
      block_material, this.massBox);     //geometry, material and mass
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      if(this.ramp.length != 0){
        this.mesh.position.x = this.startPosition.x;
        this.mesh.position.y = this.startPosition.y;//(this.startPosition.y * 16.47)/15;
        this.mesh.position.z = this.startPosition.z;//(this.startPosition.z * -9.5)/-12.99; //-9.5;
      }
      else{
        this.mesh.position.x = this.startPosition.x;
        this.mesh.position.y = this.startPosition.y;//16.47;
        this.mesh.position.z = this.startPosition.z;//-9.5;
      }
      this.mesh.rotation.set(0, 0, 0);
      this.mesh.rotation.y = THREE.MathUtils.degToRad(90);
      this.mesh.rotation.z = THREE.MathUtils.degToRad(this.angleRamp);
      scene.add(this.mesh);

      handleCollision = function( collided_with, linearVelocity, angularVelocity ) {
        if(collided_with.name === "ground"){
          controls.groupForces.children[0].visible = false;
          controls.groupForces.children[1].visible = true;
          controls.groupForces.children[2].visible = false;
          //console.log("Chao");
        }
        else{
          controls.groupForces.children[0].visible = true;
          controls.groupForces.children[1].visible = false;
          controls.groupForces.children[2].visible = false;
          //console.log("Rampa");
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
      //this.createRamp();           // Recria o objeto pois a fisica é mudada
      //this.createBox();           // Recria o objeto pois a fisica é mudada
      
      // You may also want to cancel the object's velocity
      this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
      this.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));

      /*this.mesh.position.x = this.startPosition.x;
      this.mesh.position.y = (this.startPosition.y * 16.47)/15;
      this.mesh.position.z = (this.startPosition.z * -9.5)/-12.99; //-9.5;
      */
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

      updateDisplay(gui);           // Update GUI

      document.getElementById("alertPanel").style.display = "none";
      this.animation = true;
    },

    startSimulation: function(){
      this.createRamp();           // Recria o objeto pois a fisica é mudada
      this.createBox();           // Recria o objeto pois a fisica é mudada
      this.updateDates();

      document.getElementById("alertPanel").style.display = "none";
      this.animation = true;
    },

    updateForces: function(){
      if(this.mesh != null){
        this.groupForces.position.x = this.mesh.position.x; 
        this.groupForces.position.y = this.mesh.position.y + sideBound * 1.75; 
        this.groupForces.position.z = this.mesh.position.z;
      }
    },

    updateDates: function(){
      //this.angleOldRamp = this.angleRamp;
      //this.frictionOldBox = this.frictionBox;
      updateInstructionPanel(gravity, this);
    },
  };
  controller = controls;            //Reference to out of the init function
  controls.startSimulation();
  // Don't active the first simulation
  document.getElementById("alertPanel").style.display = "block";
  this.animation = false;

  function updateInstructionPanel(gravity, controls){
    // Adjust values of the Instructions Panel
    document.getElementById("gravityCoefficient").innerHTML = gravity * -1;
    document.getElementById("frictionCoefficient").innerHTML = controls.frictionBox;
    document.getElementById("thetaAngleDegree").innerHTML = controls.angleOldRamp;
    document.getElementById("thetaAngleRadians").innerHTML = THREE.MathUtils.degToRad(controls.angleRamp).toFixed(3);
    document.getElementById("thetaAngleSin").innerHTML = Math.sin(THREE.MathUtils.degToRad(controls.angleRamp)).toFixed(3);
    document.getElementById("thetaAngleCos").innerHTML = Math.cos(THREE.MathUtils.degToRad(controls.angleRamp)).toFixed(3);
    document.getElementById("thetaAngleTan").innerHTML = Math.tan(THREE.MathUtils.degToRad(controls.angleRamp)).toFixed(3);
    document.getElementById("weightForce").innerHTML = (controls.massBox * Math.abs(gravity)).toFixed(2);
    document.getElementById("weightXForce").innerHTML = ((controls.massBox * Math.abs(gravity)) 
    * Math.sin(THREE.MathUtils.degToRad(controls.angleRamp))).toFixed(2);
    document.getElementById("weightYForce").innerHTML = ((controls.massBox * Math.abs(gravity)) 
    * Math.cos(THREE.MathUtils.degToRad(controls.angleRamp))).toFixed(2);
    document.getElementById("normalForce").innerHTML = ((controls.massBox * Math.abs(gravity)) 
    * Math.cos(THREE.MathUtils.degToRad(controls.angleRamp))).toFixed(2);
    document.getElementById("frictionForce").innerHTML = (controls.frictionBox * (controls.massBox * Math.abs(gravity)) 
    * Math.cos(THREE.MathUtils.degToRad(controls.angleRamp))).toFixed(2);
  }

  updateInstructionPanel(gravity, controls);
  controls.animation = false;                   //animação parada

  // Criando atributos do menu lateral
  var objectMenu = gui.addFolder("Menu");
  objectMenu.open();
  //objectMenu.add(controls, "animation").name("Animation");
  objectMenu.add(controls, "frictionBox", 0, 1, 0.01).name("Friction").onChange(function(e){
    controls.createRamp();           // Recria o objeto pois a fisica é mudada
    controls.createBox();           // Recria o objeto pois a fisica é mudada
    controls.updateDates();

    document.getElementById("alertPanel").style.display = "block";
    controls.animation = false;
  });
  objectMenu.add(controls, "angleRamp", 10, 50, 2).name("Angle (°)").onChange(function(e){
    controls.createRamp();           // Recria o objeto pois a fisica é mudada
    controls.createBox();           // Recria o objeto pois a fisica é mudada
    controls.updateDates();

    document.getElementById("alertPanel").style.display = "block";
    controls.animation = false;
  });
  objectMenu.add(controls.panels, "informations").onChange(function(e){
    if(controls.panels.informations){
      controls.informations.style.display = "flex";
      onResizePanels();                     // redraw the canvas forces
    }
    else{
      controls.informations.style.display = "none";
    }
  }).name("Informations");
  objectMenu.add(controls, "resetSimulation").name("Reset Simulation");     // Attribute a different name to the button
  objectMenu.add(controls, "startSimulation").name("Start Simulation");

  // Update GUI Elements
  function updateDisplay(gui) {
    for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
    }
    for (var f in gui.__folders) {
        updateDisplay(gui.__folders[f]);
    }
}

  window.addEventListener('resize', function(){
    onResize(camera, renderer);
  });  // Ajuste de tela

  window.onload = function(){
    document.getElementById('close').onclick = function(){
        /*this.parentNode.parentNode.parentNode
        .removeChild(this.parentNode.parentNode);*/
        this.parentNode.style.display = "none";
        return false;
    };
    document.getElementById('close2').onclick = function(){
        /*this.parentNode.parentNode.parentNode
        .removeChild(this.parentNode.parentNode);*/
        this.parentNode.parentNode.style.display = "none";
        //controls.panels.informations = false;
        controls.panels.informations = false;
        updateDisplay(gui);
        return false;
    };
  };


  createGroundAndWalls(scene);
  render();
  function render() {
    stats.update();
    var delta = clock.getDelta();
    orbitControls.update(delta);                 // Atualiza o controle da câmera

    // Diagrama de forças
    controls.updateForces();
    
    if(controls.animation){
      
      scene.simulate(undefined, 2);      //scene.simulate();
    }
    //controls.updateForces();
    // scene.simulate();
    //scene.simulate(undefined, 2); //scene.simulate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  // https://www.programmersought.com/article/5332673853/
  //controls.mesh.setCcdMotionThreshold(1);
  
}

function setRenderer(){
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(0x000);
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

function onResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

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