function main() {
    // use the defaults
    var scene = new THREE.Scene(); // Create main scene
    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    //document.getElementById("status-output").appendChild(stats.dom);
    document.body.appendChild(stats.dom);

    var renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById("webgl-output").appendChild(renderer.domElement);
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); //var camera = initCamera(new THREE.Vector3(0, 10, 20));
    camera.lookAt(0, 0, 0);
    camera.position.set(5, 15, 30);
    camera.up.set(0, 1, 0);

    var clock = new THREE.Clock();

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.copy(new THREE.Vector3(12, 15, 15));
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.fov = 15;
    spotLight.castShadow = true;
    spotLight.decay = 2;
    spotLight.penumbra = 0.05;
    spotLight.name = "spotLight"

    scene.add(spotLight);

    var ambientLight = new THREE.AmbientLight(0x343434);
    ambientLight.name = "ambientLight";
    scene.add(ambientLight);

    // Show axes (parameter is size of each axis)
    var axes = new THREE.AxesHelper(12);
    axes.name = "AXES";
    axes.visible = true;
    scene.add(axes);

    var groundPlane = createGroundPlane(30, 30); // width and height
    groundPlane.rotateX(THREE.Math.degToRad(-90));
    scene.add(groundPlane);

    // Enable mouse rotation, pan, zoom etc.
    var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 0, 0);
    orbitControls.minDistance = 25;
    orbitControls.maxDistance = 100;

    // DragControls
    var dragControls;// = new DragControls( objects, camera, renderer.domElement );

    // Object Material for all objects
    var objectMaterial = new THREE.MeshPhongMaterial({ color: "rgb(255, 0, 0)" });

    // Add objects to scene
    var objectArray = new Array();
    scene.add(createTetrahedron(4.0, 0));
    scene.add(createCube(5.0));
    scene.add(createOctahedron(4.0, 0));
    scene.add(createDodecahedron(4.0, 0));
    scene.add(createIcosahedron(4.0, 0));

    // Position of the cube
    objectArray[1].position.y = 5;

    // Creating raycaster objects
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    window.addEventListener( 'mousemove', onMouseMove, false );

    function onMouseMove( event ) {

        event.preventDefault();
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
    
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    }

    // Controls of sidebar
    var controls = new function() {
        var self = this;

        // Axes
        this.axes = false;

        this.castShadow = true;
        this.groundPlaneVisible = true;

        // Physics
        this.animation = true;
        this.rotation = 0.015;
        this.wireframe = false;
        this.color = "rgb(255, 0, 0)";

        // Geometry
        this.mesh = objectArray[0];
        this.meshNumber = 0;
        this.radius = 10;
        this.detail = 0;
        this.type = 'Tetrahedron';
        this.size = 1.0;

        this.choosePoligon = function() {
            objectArray[this.meshNumber].visible = false;
            switch (this.type) {
                case 'Tetrahedron':
                    this.meshNumber = 0;
                    break;
                case 'Cube':
                    this.meshNumber = 1;
                    break;
                case 'Octahedron':
                    this.meshNumber = 2;
                    break;
                case 'Dodecahedron':
                    this.meshNumber = 3;
                    break;
                case 'Icosahedron':
                    this.meshNumber = 4;
                    break;
            }
            objectArray[this.meshNumber].visible = true;
            this.mesh = objectArray[this.meshNumber];
            dragControls = new THREE.DragControls([this.mesh], camera, renderer.domElement ); //dragControls = new DragControls( objects, camera, renderer.domElement );
        }

        this.resizePoligon = function() {
            const poligon = objectArray[this.meshNumber]
            const radius = poligon.name === "Cube" ? poligon.geometry.parameters.height : poligon.geometry.parameters.radius

            poligon.scale.set(this.size, this.size, this.size)
                // console.log(poligon)
            poligon.position.y = radius * this.size * 1.1
        }

        this.updateColor = function() {
            // removing the objects with the old material color
            for (let i = 0; i < objectArray.length; i++) {
                //scene.remove(scene.getObjectByName("particles1"));
                scene.remove(objectArray[i]);
            }
            objectArray = new Array();
            objectMaterial = new THREE.MeshPhongMaterial({ color: controls.color }); // Setting the material with new color

            // Recreating those objects
            scene.add(createTetrahedron(4.0, 0));
            scene.add(createCube(5.0));
            scene.add(createOctahedron(4.0, 0));
            scene.add(createDodecahedron(4.0, 0));
            scene.add(createIcosahedron(4.0, 0));

            // Position of the cube
            objectArray[1].position.y = 5;

            controls.choosePoligon();

            // Correcting if the wireframe option is tick
            this.wireframeController();
        }

        this.wireframeController = function() {
            if (this.wireframe) {
                objectMaterial.wireframe = true;
            } else {
                objectMaterial.wireframe = false;
            }
        }
    }

    dragControls = new THREE.DragControls([controls.mesh], camera, renderer.domElement ); //dragControls = new DragControls( objects, camera, renderer.domElement );

    // add event listener to highlight dragged objects

    dragControls.addEventListener( 'dragstart', function ( event ) {

        event.object.material.emissive.set( 0xaaaaaa );

    } );

    dragControls.addEventListener( 'dragend', function ( event ) {

        event.object.material.emissive.set( 0x000000 );

    } );

    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();

    var guiFolder = gui.addFolder("Properties");
    guiFolder.open(); // Open the folder
    guiFolder.add(controls, "animation").listen().onChange(function(e) {
        if (controls.animation) {
            controls.rotation = 0.015;
        } 
        else{
            controls.rotation = 0;
        }
    });
    guiFolder.addColor(controls, 'color').onChange(function(e) {
        controls.updateColor();
    });

    guiFolder.add(controls, 'wireframe').listen().onChange(function(e) {
        controls.wireframeController();
    });

    guiFolder.add(controls, 'type', ['Tetrahedron', 'Cube', 'Octahedron', 'Dodecahedron', 'Icosahedron']).onChange(function(e) {
        controls.choosePoligon();
        controls.resizePoligon()
    });

    gui.add(controls, 'size', 0.5, 2).listen().onChange(function(e) {
        controls.resizePoligon()
    })

    controls.choosePoligon(); // Update de selection of the polygon

    // 4 faces
    function createTetrahedron(radius, detail) {
        var geometry = new THREE.TetrahedronGeometry(radius, detail);
        var object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, radius * 1.1, 0.0);
        object.visible = false;
        object.name = "Tetrahedron";
        objectArray.push(object);
        return object;
    }

    // 6 faces
    function createCube(s) {
        let geometry = new THREE.BoxGeometry(s, s, s);
        let object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, s / 2.0, 0.0);
        object.visible = false;
        object.name = "Cube";
        objectArray.push(object);
        return object;
    }

    // 8 faces
    function createOctahedron(radius, detail) {
        var geometry = new THREE.OctahedronGeometry(radius, detail);
        var object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, radius, 0.0);
        object.visible = false;
        object.name = "Octahedro";
        objectArray.push(object);
        return object;
    }

    // 12 faces
    function createDodecahedron(radius, detail) {
        var geometry = new THREE.DodecahedronGeometry(radius, detail);
        var object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, radius, 0.0);
        object.visible = false;
        object.name = "Dodecahedron";
        objectArray.push(object);
        return object;
    }

    // 20 faces
    function createIcosahedron(radius, detail) {
        let geometry = new THREE.IcosahedronGeometry(radius, detail);
        let object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, radius, 0.0);
        object.visible = false;
        object.name = "Icosahedron";
        objectArray.push(object);
        return object;
    }

    /**
     * Add a small and simple ground plane
     */
    function createGroundPlane(width, height) {
        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(width, height, 10, 10);
        var planeMaterial = new THREE.MeshPhongMaterial({color:"rgb(200,200,200)", side:THREE.DoubleSide});
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        return plane;
    }

    // Reajuste da renderização com base na mudança da janela
    function onResize(){
        camera.aspect = window.innerWidth / window.innerHeight;  //Atualiza o aspect da camera com relação as novas dimensões
        camera.updateProjectionMatrix();                         //Atualiza a matriz de projeção
        renderer.setSize(window.innerWidth, window.innerHeight); //Define os novos valores para o renderizador
        //console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize, false);         // Ouve os eventos de resize

    var storedColor = [groundPlane.material.emissive.getHex(), controls.mesh.material.emissive.getHex()];

    // Se o mouse sai da tela
    function clearPickPosition() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        mouse.x = -100000;
        mouse.y = -100000;
    
    }

    mouse.click = false;

    window.addEventListener('mousedown', raycasterMoveObject);
    window.addEventListener('mouseup', function UP(){
        mouse.click = false; 
    });

    window.addEventListener('mouseout', clearPickPosition); //Mouse sai da tela
    window.addEventListener('mouseleave', clearPickPosition);

    controls.mesh.selected = false;

    document.addEventListener( 'click', onClick, false );
    var enableSelection = false;

    function raycasterMoveObject(){
        mouse.oldX = mouse.x;
        //mouse.oldY = mouse.y;

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        //var intersects = raycaster.intersectObjects( scene.children );
        //var intersects = raycaster.intersectObjects(scene.children);//raycaster.intersectObjects([controls.mesh, groundPlane]);//[groundPlane]
        var intersects = raycaster.intersectObject(controls.mesh);

        if(intersects.length > 0){
            intersects[0].object.material.emissive.setHex( 0x00ff00 );
            controls.mesh.selected = true;
            mouse.click = true;
            
        }
        else{
            controls.mesh.material.emissive.setHex(storedColor[1]);
            controls.mesh.selected = false;
        }

        /*intersects = raycaster.intersectObject(groundPlane);
        if(intersects.length > 0){
            intersects[0].object.material.emissive.setHex( 0x0000ff );
        }
        else{
            groundPlane.material.emissive.setHex(storedColor[0]);
        }*/
    }

    function raycasterController(){
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        //var intersects = raycaster.intersectObjects( scene.children );
       // var intersects = raycaster.intersectObjects(scene.children);//raycaster.intersectObjects([controls.mesh, groundPlane]);//[groundPlane]
        var intersects = raycaster.intersectObject(controls.mesh);
        //console.log(intersects);
        //console.log(storedColor);

        if(intersects.length > 0){
            intersects[0].object.material.emissive.setHex( 0x00ff00 );
            orbitControls.enableRotate = false;
        }
        else{
            controls.mesh.material.emissive.setHex(storedColor[1]);
            orbitControls.enableRotate = true;
        }

        intersects = raycaster.intersectObject(groundPlane);
        if(intersects.length > 0){
            intersects[0].object.material.emissive.setHex( 0x0000ff );
        }
        else{
            groundPlane.material.emissive.setHex(storedColor[0]);
        }
    }

    function onKeyDown( event ) {
        enableSelection = ( event.keyCode === 16 ) ? true : false;
    }

    function onKeyUp() {
        enableSelection = false;
    }

    function onClick( event ) {

        event.preventDefault();

        if ( enableSelection === true ) {

            var draggableObjects = dragControls.getObjects();
            draggableObjects.length = 0;

            //mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            //mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            /*raycaster.setFromCamera( mouse, camera );

            var intersections = raycaster.intersectObjects( objects, true );

            if ( intersections.length > 0 ) {

                var object = intersections[ 0 ].object;

                if ( group.children.includes( object ) === true ) {

                    object.material.emissive.set( 0x000000 );
                    scene.attach( object );

                } else {

                    object.material.emissive.set( 0xaaaaaa );
                    group.attach( object );

                }

                controls.transformGroup = true;
                draggableObjects.push( group );

            }

            if ( group.children.length === 0 ) {

                controls.transformGroup = false;
                draggableObjects.push( ...objects );

            }*/

        }

    }

    render();

    function render() {
        stats.update();
        orbitControls.update(clock.getDelta());
        raycasterController();

        // Rotating the mesh selected
        controls.mesh.rotation.x += controls.rotation;
        controls.mesh.rotation.y += controls.rotation;
        controls.mesh.rotation.z += controls.rotation;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}