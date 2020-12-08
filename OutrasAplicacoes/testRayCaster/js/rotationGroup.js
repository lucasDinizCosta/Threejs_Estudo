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
    camera.position.set(0, 15, 30);
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
        this.angleFinishPage = 180,        
        this.angleRatePage = 1,      //0.15  

        // imagePanel
        this.imageList = [],
        this.pasteImage = [],   //[image, page]

        // page and sheet attributes
        this.widthPage = 12,         //Padrao antigo: 4
        this.lengthPage = 14,        //Padrao antigo: 6
        this.heightBook = 0.5,
        this.amountSheets = 0,
        this.amountPages = 0,
        this.createPage = function (){
            if(this.amountPages % 2 == 0){   //Pair pages on the book
                // Adjust of rotation of the sheets inside of book
                for(let i = 0; i < this.book.children.length; i++){
                    let sheetAux = this.book.children[i];
                    sheetAux.angleBegin = sheetAux.angleBegin + this.angleRatePage;
                    sheetAux.angleFinish = 180 - i * this.angleRatePage; //- sheetAux.angleBegin;     //this.angleBeginPage;
                    sheetAux.rotateZ(THREE.Math.degToRad(this.angleRatePage));  // rotation default of page
                }

                let sheet = new THREE.Group();          // Support the elements -- Center of rotation page

                // Page Background
                let pageGeometry = new THREE.PlaneGeometry(this.widthPage, this.lengthPage, 0.1, 0.1);
                let pageMaterial = new THREE.MeshStandardMaterial({
                    transparent: true, //opacity: 0.5,
                    map: textureLoader.load("../assets/parchment_alpha.png"), side:THREE.DoubleSide
                });
                //pageMaterial.depthWrite = false;            // FIX the bug of transparency  --- https://github.com/mrdoob/three.js/issues/9977
                let page = new THREE.Mesh(pageGeometry, pageMaterial);
                page.position.set(this.widthPage / 2, 0, 0);
                page.rotateX(THREE.Math.degToRad(-90));
                page.receiveShadow = true;
                sheet.add(page);
                sheet.position.set(0, this.heightBook, 0);
                sheet.page = this.numberPage;
                sheet.sideOption = 0;              //0 => Right, 1 => Left
                page.sheet = sheet;
                page.objectType = 0;               //Page type

                // Image plane

                let imageGeometry = new THREE.PlaneGeometry(this.widthPage/1.5, this.lengthPage/3, 0.1, 0.1);
                let imageMaterial = new THREE.MeshStandardMaterial({
                    color:"rgb(255, 255, 255)", side:THREE.DoubleSide
                });
                let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
                imagePlane.receiveShadow = true;
                imagePlane.position.set(0, this.lengthPage/4.5, 0.01);
                page.add(imagePlane);

                // Informations block

                let informationGeometry = new THREE.PlaneGeometry(this.widthPage/1.25, this.lengthPage/2.75, 0.1, 0.1);
                let informationMaterial = new THREE.MeshStandardMaterial({
                    color:"rgb(170, 0, 0)", side:THREE.DoubleSide
                });
                let informationPlane = new THREE.Mesh(informationGeometry, informationMaterial);
                //imagePlane.receiveShadow = true;
                informationPlane.position.set(0, -this.lengthPage/4.5, 0.01);
                page.add(informationPlane);
                this.amountSheets++;
                this.book.add(sheet);       // Added sheet with page on the book
                sheet.angleBegin = this.angleBeginPage;
                sheet.angleFinish = this.angleFinishPage;

                // Adjust finish angle
                for(let i = 0; i < this.book.children.length; i++){
                    let sheetAux = this.book.children[i];
                    sheetAux.angleFinish = 180 - i * this.angleRatePage - sheetAux.angleBegin;     //this.angleBeginPage;
                    //sheetAux.angleBegin = sheetAux.angleBegin + this.angleRatePage;
                    //sheetAux.rotateZ(THREE.Math.degToRad(this.angleRatePage));  // rotation default of page
                }

                //sheet.angleBegin = sheetAux.angleBegin + this.angleRatePage;
                //sheet.angleFinish = 180 - i * this.angleRatePage //- sheetAux.angleBegin;     //this.angleBeginPage;
            }
            else{
                let sheet = this.book.children[this.book.children.length - 1]; // Take a sheet to insert a page on the book
                
                // Page Background
                let pageGeometry = new THREE.PlaneGeometry(this.widthPage, this.lengthPage, 0.1, 0.1);
                let pageMaterial = new THREE.MeshStandardMaterial({
                    transparent: true, //opacity: 0.5,
                    map: textureLoader.load("../assets/parchment_alpha.png"), side:THREE.DoubleSide
                });
                let page = new THREE.Mesh(pageGeometry, pageMaterial);
                page.position.set(this.widthPage / 2, -0.001, 0);
                page.rotateX(THREE.Math.degToRad(-90));
                page.receiveShadow = true;
                sheet.add(page);
                sheet.position.set(0, this.heightBook, 0);
                sheet.page = this.numberPage;
                sheet.sideOption = 0;              //0=> Right, 1=> Left
                page.sheet = sheet;
                page.objectType = 0;          //Page type

                // Image plane

                let imageGeometry = new THREE.PlaneGeometry(this.widthPage/1.5, this.lengthPage/3, 0.1, 0.1);
                let imageMaterial = new THREE.MeshStandardMaterial({
                    color:"rgb(255, 255, 255)", side:THREE.DoubleSide
                });
                let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
                imagePlane.receiveShadow = true;
                imagePlane.position.set(0, this.lengthPage/4.5, -0.01);
                page.add(imagePlane);

                // Informations block

                let informationGeometry = new THREE.PlaneGeometry(this.widthPage/1.25, this.lengthPage/2.75, 0.1, 0.1);
                let informationMaterial = new THREE.MeshStandardMaterial({
                    color:"rgb(170, 0, 0)", side:THREE.DoubleSide
                });
                let informationPlane = new THREE.Mesh(informationGeometry, informationMaterial);
                informationPlane.position.set(0, -this.lengthPage/4.5, -0.01);
                page.add(informationPlane);
                this.book.add(sheet);       // Added sheet with page on the book
            }
            this.amountPages++;
        }
    }
    
    function test(){
        //console.log(controls.book.children[0]);
        console.log("AngleBegin      --      AngleFinish:");
        for (let i = 0; i < controls.book.children.length; i++) {
            let element = controls.book.children[i];
            console.log("element.angleBegin: " + element.angleBegin, "element.angleFinish: " + element.angleFinish);
            /*for (let j = 0; j < element.children.length; j++) {
                let element2 = element.children[j];
                console.log(element2);
                console.log("element2.angleBegin: " + element2.angleBegin, "element2.angleFinish: " + element2.angleFinish);
            }*/
        }
    }

    for (let index = 0; index < 5; index++) {
        controls.createPage();  
    }
    //controls.createPage();
    //controls.createPage();
    //controls.createPage();
    scene.add(controls.book);
    
    test();
    // GUI de controle e ajuste de valores especificos da geometria do objeto
    //var gui = new dat.GUI();

    /*  
     * Teste painel de imagens 
     */
    var paintWall = [];
    var painelGeometry = new THREE.BoxGeometry(30, 10, 5);//new THREE.PlaneGeometry(30, 10, 0.1, 0.1);
    var painelMaterial = new THREE.MeshStandardMaterial({
        //color:"rgb(255, 255, 255)", side:THREE.DoubleSide
        transparent: true,
        opacity: 0.5,
        map: textureLoader.load("../assets/general/wood-2.jpg"), side: THREE.DoubleSide
    });
    var panelPlane = new THREE.Mesh(painelGeometry, painelMaterial);
    panelPlane.position.set(0, 5, -15.1);
    //panelPlane.objectType = 1;          //Image type
    scene.add(panelPlane);

    var panelGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
    var panelMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load("../assets/paintings/3.jpg"), side: THREE.DoubleSide
    });
    var panelPlane = new THREE.Mesh(panelGeometry, panelMaterial);
    panelPlane.position.set(-10, 7, -12);
    panelPlane.objectType = 1;          //Image type

    scene.add(panelPlane);
    paintWall.push(panelPlane);

    var panelGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
    var panelMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load("../assets/paintings/4.jpg"), side: THREE.DoubleSide
    });
    var panelPlane = new THREE.Mesh(panelGeometry, panelMaterial);
    panelPlane.position.set(-0, 7, -12);
    panelPlane.objectType = 1;          //Image type

    scene.add(panelPlane);
    paintWall.push(panelPlane);

    var panelGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
    var panelMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load("../assets/paintings/1.jpg"), side: THREE.DoubleSide
    });
    var panelPlane = new THREE.Mesh(panelGeometry, panelMaterial);
    panelPlane.position.set(10, 7, -12);
    panelPlane.objectType = 1;          //Image type

    scene.add(panelPlane);
    paintWall.push(panelPlane);

    var skyboxGeometry = new THREE.SphereGeometry(100, 64, 64);
    var skyboxMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load("../assets/museum.jpg"), side: THREE.DoubleSide   
    });
    var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    /**
     * Add a small and simple ground plane
     */

    function createGroundPlane(width, height) {
        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(width, height, 10, 10);
        var planeMaterial = new THREE.MeshStandardMaterial({
            color:"rgb(200,200,200)",
            side:THREE.DoubleSide, 
            transparent: true,
            opacity: 0.5
        });
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

    window.addEventListener('mouseup', function up(){
        if(objectLooked != null && dragAndDropImage[0] != null){
            if(objectLooked.objectType == 0){
                objectLooked.material.copy(dragAndDropImage[0].material);
                dragAndDropImage[0] = null;
            }
        }
        else{
            dragAndDropImage[0] = null;
        }
        mouse.click = false;
        orbitControls.enableRotate = true;      // Enable rotation on camera
    });
    window.addEventListener('mouseout', clearPickPosition);       // Mouse sai da tela
    window.addEventListener('mouseleave', clearPickPosition);
    window.addEventListener('mousedown', raycasterController);
    function raycasterController(){
        if(objectLooked != null){
            orbitControls.enableRotate = false;         // Disable the rotation on camera when raycasting detect an object
            if(objectLooked.objectType == 0){
                if(objectLooked.sheet.sideOption == 0){
                    //objectLooked.sheet.rotateZ(THREE.Math.degToRad(180));
                    objectLooked.sheet.rotateZ(THREE.Math.degToRad(objectLooked.sheet.angleFinish));
                    objectLooked.sheet.sideOption = 1;
                }
                else{
                    objectLooked.sheet.rotateZ(
                    THREE.Math.degToRad(
                        -objectLooked.sheet.angleFinish 
                    ));
                    objectLooked.sheet.sideOption = 0;
                }
            }
            else if(objectLooked.objectType == 1){
                dragAndDropImage[0] = objectLooked;
            }
        }

        mouse.click = true;
    }

    let objectRaycaster = []
    for (let i = 0; i < controls.book.children.length; i++) {
        let pageGroupRotation = controls.book.children[i];
        objectRaycaster.push(pageGroupRotation.children[0]);        //Put inside only page without the group rotation
    }

    //Adding the images
    objectRaycaster.push(panelPlane);

    // Raycaster and mouse Controllers 
    let objectLooked = null;
    let dragAndDropImage = [null, null]   //Image, Page

    function checkRaycaster(){
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(objectRaycaster);
        if(intersects.length > 0){
            let objectCollided = intersects[0].object;
            if(objectCollided.objectType == 0){
                //console.log("PAGE");
                objectLooked = objectCollided;
            }
            else{
                //console.log("IMAGE");
                objectLooked = objectCollided;
            }
        }
        else{
            objectLooked = null;
        }
    }

    render();

    function render() {
        stats.update();
        orbitControls.update(clock.getDelta());
        checkRaycaster();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

}

