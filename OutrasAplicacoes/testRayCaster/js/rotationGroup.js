function main() {
    // use the defaults
    var scene = new THREE.Scene();
    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    //document.getElementById("status-output").appendChild(stats.dom);
    document.body.appendChild(stats.dom);

    var textureLoader = new THREE.TextureLoader();

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
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
    orbitControls.minDistance = 10;
    orbitControls.maxDistance = 100;

    // Object Material for all objects
    var objectMaterial = new THREE.MeshPhongMaterial({ color: "rgb(255, 0, 0)" });

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
        // Axes
        this.axes = false,

        // Add objects to scene
        this.book = new THREE.Group(),

        // bookAttributes
        this.angleBeginPage = 0,

        // teste
        this.mesh;

        // pageAttributes
        this.widthPage = 4,
        this.lengthPage = 6,
        this.heightBook = 0.5,
        this.numberPage = 1,
        this.counterPages = 0,
        this.createPage = function (){
            var group = new THREE.Group();
            var planeGeometry = new THREE.PlaneGeometry(this.widthPage, this.lengthPage, 0.1, 0.1);
            var planeMaterial = new THREE.MeshStandardMaterial({
                //color:"rgb(255, 255, 255)", side:THREE.DoubleSide
                transparent: true,// opacity: 0.4,
                map: textureLoader.load("../assets/parchment_alpha.png"), side:THREE.DoubleSide
            });
            var plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.position.set(this.widthPage / 2, 0, 0);
            plane.rotateX(THREE.Math.degToRad(-90));
            plane.receiveShadow = true;
            group.add(plane);
            group.position.set(0, this.heightBook, 0);
            group.page = this.numberPage;
            this.numberPage++;
            this.counterPages++;
            this.book.add(group);
            group.rotateZ(THREE.Math.degToRad(this.angleBeginPage));
            group.state = 0;            //0=> normal side, 1=> switch page
            plane.group = group;
            this.angleBeginPage += 0.8;
            

            this.mesh = plane;
        }
    }

    /*for (let index = 0; index < 100; index++) {
        controls.createPage();  
    }*/
    controls.createPage();
    controls.createPage();
    scene.add(controls.book);
    
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    var gui = new dat.GUI();

    var guiFolder = gui.addFolder("Properties");
    /*guiFolder.open(); // Open the folder
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
    })*/

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

    function raycasterMoveObject(){

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        console.log(controls.book);
        let objects = []
        for (let i = 0; i < controls.book.children.length; i++) {
            let pageGroupRotation = controls.book.children[i];
            objects.push(pageGroupRotation.children[0]);        //Put inside only page without the group rotation
        }
        console.log(objects);
        // calculate objects intersecting the picking ray
        //var intersects = raycaster.intersectObjects( scene.children );
        //var intersects = raycaster.intersectObjects(scene.children);//raycaster.intersectObjects([controls.mesh, groundPlane]);//[groundPlane]
        var intersects = raycaster.intersectObjects(objects);

        if(intersects.length > 0){
            let objectCollided = intersects[0].object;
            //objectCollided.material.emissive.setHex( 0x00ff00 );
            console.log(objectCollided);
            if(objectCollided.group.state == 0){
                objectCollided.group.rotateZ(THREE.Math.degToRad(180));
                objectCollided.group.state = 1;
            }
            else{
                objectCollided.group.rotateZ(THREE.Math.degToRad(0));
                objectCollided.group.state = 0;
            }
            //mouse.click = true;
            
        }
        else{
            /*controls.mesh.material.emissive.setHex(storedColor[1]);
            controls.mesh.selected = false;*/
        }

        /*intersects = raycaster.intersectObject(groundPlane);
        if(intersects.length > 0){
            intersects[0].object.material.emissive.setHex( 0x0000ff );
        }
        else{
            groundPlane.material.emissive.setHex(storedColor[0]);
        }*/
    }

    render();

    function render() {
        stats.update();
        orbitControls.update(clock.getDelta());

        // Rotating the mesh selected
        /*group.rotateZ(THREE.Math.degToRad(angleSpeed * 1/30));
        if(group.rotation.z > THREE.Math.degToRad(180)){
            angleSpeed *=- 1;
        }
        else{

        }*/
        /*controls.mesh.rotation.x += controls.rotation;
        controls.mesh.rotation.y += controls.rotation;
        controls.mesh.rotation.z += controls.rotation;*/
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
}