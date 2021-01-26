function main() {
    
    // TODO: Afastar a câmera pra que seja possível visualizar todas as fotos
    // TODO: Criar a primeira versão com textos e imagens correspondentes para vermos se a ideia funciona (ideia é termos 9 imagens em um grid 3 x 3) -- 
    // TODO: Finalizar a implementação do sistema de acerto e erro -- 
    //      >> Tem que criar um contador para acabar o 'jogo' ao errar X vezes
    // TODO: Fixar o texto com resolução: 1024 x 624; Razão de aspecto: 1,64 -- 
    // TODO: Ao clicar, transladar o centro da imagem rotacionada para o local do cursor para facilitar a colagem (deixar por último) --
    // TODO: Painel Lateral ao de madeira com um botão reload pra recarregar a cena
    // TODO: Encontrar 9 imagens pro painel

    // use the defaults
    var scene = new THREE.Scene();
    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
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
    camera.position.set(0, 15, 28);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    var defaultCamera = camera;
    var upperCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); //var camera = initCamera(new THREE.Vector3(0, 10, 20));
    upperCamera.position.set(0, 25, 0);
    upperCamera.up.set(0, 1, 0);
    upperCamera.lookAt(0, 0, 0);
    var clock = new THREE.Clock();
    // Enable mouse rotation, pan, zoom etc.
    var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 10, 9);
    orbitControls.minDistance = 20;
    orbitControls.maxDistance = 60;
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.copy(new THREE.Vector3(0, 15, 15));
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
    var axes = new THREE.AxesHelper(24);
    axes.name = "AXES";
    axes.visible = true;
    scene.add(axes);

    var groundPlane = createGroundPlane(30, 30); // width and height
    groundPlane.rotateX(THREE.Math.degToRad(-90));
    scene.add(groundPlane);

    // Creating raycaster objects
    var raycaster = new THREE.Raycaster();
    var raycasterPictures = new THREE.Raycaster();      // To create a ghost image when the picture is moving from the wall
    var mouse = new THREE.Vector2();

    //textureLoader.minFilter = THREE.LinearFilter;

    // Controls of sidebar
    var controls = new function() {
        // Add objects to scene
        this.book = new THREE.Group(),

        // Game Attributes
        this.fails = 0,
        this.correct = 0,
        this.timer = {
            minutes: 0,
            seconds: 0,
        },
        this.menu = {
            object: null,
            retryButton: null, 
        },

        // Pictures and Painting Wall
        this.pictures = [],
        this.imageClone = null,
        this.orderPicturesBook = [],
        this.messageVictory = null,

        // bookAttributes
        this.angleBeginPage = 0,        
        this.angleFinishPage = 180,        
        this.angleRatePage = 0.75,      //0.15  

        // page and sheet attributes
        this.widthPage = 12,         
        this.lengthPage = 14,        
        this.heightBook = 0.5,
        this.amountSheets = 0,
        this.currentSheet = 0,
        this.amountPages = 0,

        // Button Read / Exit
        this.buttonsBook = [null, null, null],    // Read(Left sheet, Right sheet), Exit
        this.sizeButton = 1.75,
        this.cameraOption = 0,                    // 0 => rotationCamera, 1 => UpperCamera

        // Functions
        this.adjustButtonsBook = function(){
            if(this.cameraOption != 1){
                if(this.currentSheet < this.amountSheets){ 
                    if(this.currentSheet > 0){
                        this.buttonsBook[0].visible = true;
                        this.buttonsBook[1].visible = true;
                    }
                    else{
                        this.buttonsBook[0].visible = false;
                        this.buttonsBook[1].visible = true;
                    }
                }
                else{                                   // End of book
                    this.buttonsBook[0].visible = true;
                    this.buttonsBook[1].visible = false;
                }
            }
            else{
                this.buttonsBook[0].visible = false;
                this.buttonsBook[1].visible = false;
            }
        },
        this.createBook = function(){
            for (let index = 0; index < this.pictures.length; index++) {
                this.createPage(this.orderPicturesBook[index]);  
            }
            scene.add(this.book);
            this.createButtonsBook();
        },
        this.createButtonsBook = function(){
            let readButtonGeometry = new THREE.PlaneGeometry(this.sizeButton, this.sizeButton, 0.1, 0.1);
            let readButtonMaterial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: textureLoader.load("../assets/icons/read.png"),
            });
            let readButton = new THREE.Mesh(readButtonGeometry, readButtonMaterial);
            readButton.position.set(-this.widthPage/2, this.book.position.y + 0.5, this.book.position.z + this.lengthPage/2 + 0.5 + this.sizeButton/2); //readButton.position.set(0, this.book.position.y + 5, 0); 
            this.buttonsBook[0] = readButton;
            this.buttonsBook[0].objectType = 2;
            this.buttonsBook[0].visible = false;
            this.buttonsBook[0].rotateX(THREE.Math.degToRad(-90));
            scene.add(this.buttonsBook[0]);
            readButtonGeometry = new THREE.PlaneGeometry(this.sizeButton, this.sizeButton, 0.1, 0.1);
            readButtonMaterial = new THREE.MeshBasicMaterial({
                side:THREE.DoubleSide,
                map: textureLoader.load("../assets/icons/read.png"),
            });
            readButton = new THREE.Mesh(readButtonGeometry, readButtonMaterial);
            readButton.position.set(this.widthPage/2, this.book.position.y + 0.5, this.book.position.z + this.lengthPage/2 + 0.5 + this.sizeButton/2); //readButton.position.set(0, this.book.position.y + 5, 0); 
            this.buttonsBook[1] = readButton;
            this.buttonsBook[1].visible = false;
            this.buttonsBook[1].objectType = 3;
            this.buttonsBook[1].rotateX(THREE.Math.degToRad(-90));
            scene.add(this.buttonsBook[1]);
            let backButtonGeometry = new THREE.PlaneGeometry(this.sizeButton, this.sizeButton, 0.1, 0.1);
            let backButtonMaterial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: textureLoader.load("../assets/icons/back.png")
            });
            let backButton = new THREE.Mesh(backButtonGeometry, backButtonMaterial);
            backButton.position.set(0, this.book.position.y + 1.5, 0);
            backButton.rotateX(THREE.Math.degToRad(-90));
            this.buttonsBook[2] = backButton;
            this.buttonsBook[2].visible = false;
            this.buttonsBook[2].objectType = 4;
            scene.add(this.buttonsBook[2]);
            if(this.amountSheets > 0){
                this.buttonsBook[1].visible = true;
            }
        },
        this.createImageClone = function(){
            let panelGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            let panelMaterial = new THREE.MeshStandardMaterial({
                color: "rgb(255,255,255)", side: THREE.DoubleSide
            });
            this.imageClone = new THREE.Mesh(panelGeometry, panelMaterial);
            this.imageClone.position.set(-100, -100, -100);
            scene.add(this.imageClone);
        },
        this.createMenu = function(){
            
            //let menu = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            /////// draw text on canvas /////////

            // create a canvas element
            var canvas1 = document.createElement('canvas');
            var context1 = canvas1.getContext('2d');
            canvas1.style.width = `600px`;
            canvas1.style.height = `1200px`;
            console.log(canvas1);
            context1.width = 300;//"600px";
            context1.height = 600;//"600px";
            context1.fillStyle = "white";
            context1.fillRect(0, 0, 800, 160);
            context1.strokeStyle = "black";
            context1.strokeRect(0, 0, context1.width, context1.height);
            context1.font = "Bold 30px Arial";
            context1.fillStyle = "rgba(255,0,0,0.95)";
            context1.fillText('HELLO WORLD!', 2, 26);
            
            // canvas contents will be used for a texture
            var texture1 = new THREE.Texture(canvas1);
            texture1.needsUpdate = true;
            
            var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
            material1.transparent = false;//true;

            var mesh1 = new THREE.Mesh(
                new THREE.PlaneGeometry(8, 16),//new THREE.PlaneGeometry(canvas1.width, canvas1.height),
                material1
            );
            mesh1.position.set(17.5, 8.5, -8.1);
            mesh1.rotateY(THREE.Math.degToRad(-30));
            scene.add( mesh1 );
        },
        this.createMessageVictory = function(){
            let messageVictoryGeometry = new THREE.PlaneGeometry(26, 8, 0.1, 0.1);
            let messageVictoryMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/messageVictory.png"), side: THREE.DoubleSide
            });
            this.messageVictory = new THREE.Mesh(messageVictoryGeometry, messageVictoryMaterial);
            this.messageVictory.position.set(0, 5, -12);
            this.messageVictory.visible = false;
            scene.add(this.messageVictory); 
        },
        this.createPage = function (indexPicture){
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
                sheet.add(page);
                sheet.position.set(0, this.heightBook, 0);
                sheet.page = this.numberPage;
                sheet.sideOption = 0;              //0 => Right, 1 => Left
                page.sheet = sheet;
                page.objectType = 0;               //Page type
                page.indexPicture = indexPicture;

                // Image plane
                let imageGeometry = new THREE.PlaneGeometry(9, 4.5, 0.1, 0.1);
                let imageMaterial = new THREE.MeshStandardMaterial({
                    color:"rgb(255, 255, 255)", side: THREE.DoubleSide
                });
                let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
                imagePlane.position.set(0, this.lengthPage/4.5, 0.01);
                page.add(imagePlane);

                // Informations block
                let informationGeometry = new THREE.PlaneGeometry(9.6, 6.08, 0.1, 0.1);
                let informationMaterial = new THREE.MeshBasicMaterial({
                    transparent: true,
                    //color: "white",
                    side: THREE.DoubleSide,
                    map: textureLoader.load("../assets/text-10-transparent(1024x624).png")
                });
                let informationPlane = new THREE.Mesh(informationGeometry, informationMaterial);
                informationPlane.position.set(0, -this.lengthPage/5, 0.01);
                page.add(informationPlane);
                this.amountSheets++;
                this.book.add(sheet);       // Added sheet with page on the book
                sheet.angleBegin = this.angleBeginPage;
                sheet.angleFinish = this.angleFinishPage;
                sheet.animationAngle = 0;

                // Adjust finish angle
                for(let i = 0; i < this.book.children.length; i++){
                    let sheetAux = this.book.children[i];
                    sheetAux.angleFinish = 180 - i * this.angleRatePage - sheetAux.angleBegin;     //this.angleBeginPage;
                }
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
                page.position.set(this.widthPage / 2, -0.005, 0);
                page.rotateX(THREE.Math.degToRad(-90));
                sheet.add(page);
                sheet.position.set(0, this.heightBook, 0);
                sheet.page = this.numberPage;
                sheet.sideOption = 0;              // 0 => Right, 1 => Left
                page.sheet = sheet;
                page.objectType = 0;               // Page type
                page.indexPicture = indexPicture;

                // Image plane
                let imageGeometry = new THREE.PlaneGeometry(this.widthPage/1.5, this.lengthPage/3, 0.1, 0.1);
                let imageMaterial = new THREE.MeshStandardMaterial({
                    color:"rgb(255, 255, 255)", side:THREE.DoubleSide
                });
                let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
                imagePlane.position.set(0, this.lengthPage/4.5, -0.01);
                imagePlane.rotateY(THREE.Math.degToRad(180));
                page.add(imagePlane);

                // Informations block
                let informationGeometry = new THREE.PlaneGeometry(9.6, 6.08, 0.1, 0.1);
                let informationMaterial = new THREE.MeshBasicMaterial({
                    transparent: true, /*opacity: 0.9,*/
                    //color: "white",
                    side: THREE.DoubleSide,
                    map:  textureLoader.load("../assets/text-10-transparent(1024x624).png")
                });
                let informationPlane = new THREE.Mesh(informationGeometry, informationMaterial);
                informationPlane.position.set(0, -this.lengthPage/5, -0.01);
                informationPlane.rotateY(THREE.Math.degToRad(180));
                page.add(informationPlane);
                this.book.add(sheet);       // Added sheet with page on the book
            }
            this.amountPages++;
        },
        this.createPicturesPanel = function(scene){
            let painelGeometry = new THREE.BoxGeometry(30, 17, 5);
            let painelMaterial = new THREE.MeshStandardMaterial({
                transparent: true,
                opacity: 0.5,
                map: textureLoader.load("../assets/general/wood-2.jpg"), side: THREE.DoubleSide
            });
            let panelPlane = new THREE.Mesh(painelGeometry, painelMaterial);
            panelPlane.position.set(0, 8.5, -15.1);
            scene.add(panelPlane);
            let skyboxGeometry = new THREE.SphereGeometry(100, 64, 64);
            let skyboxMaterial = new THREE.MeshBasicMaterial({
                map: textureLoader.load("../assets/museum.jpg"), side: THREE.DoubleSide   
            });
            let skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
            scene.add(skybox);
    
            /** Pictures */
    
            let pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            let pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/1.jpg"), side: THREE.DoubleSide
            });
            let picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.position.set(-10, 4, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 0;
            picture.name = "picture_00";
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);
            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/2.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.name = "picture_01";
            picture.position.set(-0, 4, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 1;
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);
            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/3.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.position.set(10, 4, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 2;
            picture.name = "picture_02";
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);


            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/4.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.position.set(-10, 9, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 3;
            picture.name = "picture_04";
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);
            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/5.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.name = "picture_05";
            picture.position.set(0, 9, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 4;
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);
            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/6.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.position.set(10, 9, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 5;
            picture.name = "picture_06";
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);

            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/7.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.position.set(-10, 14, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 6;
            picture.name = "picture_07";
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);
            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/9.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.name = "picture_08";
            picture.position.set(0, 14, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 7;
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);
            pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
            pictureMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/paintings/4.jpg"), side: THREE.DoubleSide
            });
            picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
            picture.position.set(10, 14, -12);
            picture.objectType = 1;          //Image type
            picture.indexPicture = 8;
            picture.name = "picture_09";
            scene.add(picture);
            this.pictures.push(picture);
            this.orderPicturesBook.push(picture.indexPicture);
        },
        this.createScenary = function(){
            this.createMenu();
            this.createImageClone();
            this.createPicturesPanel(scene);
            this.orderPicturesBook = this.shuffleList(this.orderPicturesBook);
            this.createBook();
            this.createMessageVictory();
        },
        this.removeEntity = function(object){
            let selected = scene.getObjectByName(object.name);
            scene.remove(selected);
        },
        this.removePictureFromWall = function(image){
            for (let i = 0; i < this.pictures.length; i++) {
                if(this.pictures[i].indexPicture == image.indexPicture){
                    this.pictures.splice(i, 1);
                    break;
                }
            }
            for (let j = 0; j < objectRaycaster.length; j++) {
                if(objectRaycaster[j].indexPicture == image.indexPicture){
                    objectRaycaster.splice(j, 1);
                    break;
                }
            }
            for (let j = 0; j < objectRaycasterClonePictures.length; j++) {
                if(objectRaycasterClonePictures[j].indexPicture == image.indexPicture){
                    objectRaycasterClonePictures.splice(j, 1);
                    break;
                }
            }
            this.removeEntity(image);
            objectLooked = null;
            selectedImage = null;
            controls.imageClone.position.set(-100, -100, -100);
            controls.imageClone.rotateX(THREE.Math.degToRad(90));
        },
        this.shuffleList = function(list){
            let auxOrderList = [];
            let auxList = [];
            for(let i = 0; i < list.length; i++){
                auxList.push(list[i]);
            }
            for(let i = 0; i < auxList.length; i++){
                let randomIndex = Math.floor(Math.random() * auxList.length)
                auxOrderList.push(auxList[randomIndex]);
                auxList.splice(randomIndex, 1);
            };
            auxOrderList.push(auxList[0]);   // Last element on the list
            return auxOrderList;
        }
    }
    controls.createScenary();
    let dragControls = new THREE.DragControls([controls.imageClone], camera, renderer.domElement ); //dragControls = new DragControls( objects, camera, renderer.domElement );
    dragControls.addEventListener( 'dragstart', function ( event ) {
        //console.log('drag start');
    });
    dragControls.addEventListener ( 'drag', function( event ){
        //console.log('drag');
        event.object.position.z = -3.35; // This will prevent moving z axis, but will be on -3.35 line. change this to your object position of z axis.
    });
    dragControls.addEventListener( 'dragend', function ( event ) {
        //console.log('drag end');
    });
    
    let animationList = [];
    let speedAnimation = 1.8;   // 1.5
    
    // Reajuste da renderização com base na mudança da janela
    function onResize(){
        camera.aspect = window.innerWidth / window.innerHeight;  //Atualiza o aspect da camera com relação as novas dimensões
        camera.updateProjectionMatrix();                         //Atualiza a matriz de projeção
        renderer.setSize(window.innerWidth, window.innerHeight); //Define os novos valores para o renderizador
    }

    window.addEventListener('resize', onResize, false);         // Ouve os eventos de resize

    clearPickPosition();
    // Se o mouse sai da tela
    function clearPickPosition() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        mouse.x = -100000;
        mouse.y = -100000;
    }

    window.addEventListener( 'mousemove', onMouseMove, false );

    function onMouseMove(event) {
        event.preventDefault();
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    window.addEventListener('mouseup', function up(event){
        //console.log(event);
        if(event.button == 0){              // Left Button
            if(controls.cameraOption == 0){ // Camera Upper
                if(objectLooked != null){
                    if(objectLooked.objectType == 0 && selectedImage != null && 
                    (objectLooked.indexPicture == selectedImage.indexPicture)
                    ){
                        objectLooked.children[0].material = selectedImage.material.clone(); // Generate a clone of material and replace on image plane   
                        controls.hits++;
                        console.log("Hits: ", controls.hits); 
                        controls.removePictureFromWall(selectedImage);   
                        if(controls.pictures.length == 0){
                            controls.messageVictory.visible = true;
                        }   
                    }
                    else{
                        controls.fails++;
                        console.log("Fails: ", controls.fails);
                    }
                }
                if(selectedImage != null){       // Drop the picture
                    selectedImage.visible = true;
                    controls.imageClone.position.set(-100, -100, -100);
                    controls.imageClone.rotateX(THREE.Math.degToRad(90));
                }
                selectedImage = null;
                orbitControls.enableRotate = true;      // Enable rotation on camera
            }
        }
    });
    window.addEventListener('mouseout', clearPickPosition);       // Mouse sai da tela
    window.addEventListener('mouseleave', clearPickPosition);
    window.addEventListener('mousedown', raycasterController);
    function raycasterController(event){
        //console.log(event);
        if(event.button == 0){              // Left Button
            if(objectLooked != null){
                orbitControls.enableRotate = false;         // Disable the rotation on camera when raycasting detect an object
                switch(objectLooked.objectType){
                    case 0:
                        if((objectLooked.sheet.animationAngle == 0) && 
                        (controls.cameraOption == 0)){     //Don't rotate if the page is moving
                            if(objectLooked.sheet.sideOption == 0){
                                objectLooked.sheet.sideOption = 1;
                                controls.currentSheet++;
                            }
                            else{
                                objectLooked.sheet.sideOption  = 0;
                                controls.currentSheet--;
                            }
                            controls.adjustButtonsBook();
                            animationList.push(objectLooked.sheet);
                        }
                        break;
                    case 1:     // Collide with image
                        selectedImage = objectLooked;
                        selectedImage.visible = false;
                        controls.imageClone.position.x = pointCollisionRayCaster.x;
                        controls.imageClone.position.y = pointCollisionRayCaster.y;
                        controls.imageClone.position.z = -3.35; //pointCollisionRayCaster.z;  
                        controls.imageClone.rotateX(THREE.Math.degToRad(-90));
                        //controls.imageClone.position.copy(pointCollisionRayCaster);
                        break;
                    case 2:     // Read Left page Button
                        controls.cameraOption = 1;      // Turn camera option
                        defaultCamera = upperCamera;
                        controls.adjustButtonsBook();
                        controls.buttonsBook[2].visible = true;
                        defaultCamera.position.set(-controls.widthPage/2, 17, 0);   // Y = 25
                        controls.buttonsBook[2].position.set(-controls.widthPage - controls.sizeButton/2, controls.buttonsBook[2].position.y, 0);   
                        break;
                    case 3:     // Read Right page Button
                        controls.cameraOption = 1;      // Turn camera option
                        defaultCamera = upperCamera;
                        controls.adjustButtonsBook();
                        controls.buttonsBook[2].visible = true;
                        defaultCamera.position.set(controls.widthPage/2, 17, 0);
                        controls.buttonsBook[2].position.set(controls.widthPage + controls.sizeButton/2, controls.buttonsBook[2].position.y, 0);   
                        break;
                    case 4:     // Exit Button
                        controls.cameraOption = 0;
                        defaultCamera = camera;
                        controls.adjustButtonsBook();
                        controls.buttonsBook[2].visible = false;
                        break;
                }
            }
        }
    }

    let objectRaycaster = [];
    let objectRaycasterClonePictures = [];

    // Pages of book
    for (let i = 0; i < controls.book.children.length; i++) {
        let pageGroupRotation = controls.book.children[i];
        for(let j = 0; j < pageGroupRotation.children.length; j++){
            objectRaycaster.push(pageGroupRotation.children[j]);        //Put inside only page without the group rotation
        }
    }

    // Adding the images of paintwall
    for(let i = 0; i < controls.pictures.length; i++){
        objectRaycaster.push(controls.pictures[i]);
        objectRaycasterClonePictures.push(controls.pictures[i]);
    }

    // Buttons
    objectRaycaster.push(controls.buttonsBook[0]);
    objectRaycaster.push(controls.buttonsBook[1]);
    objectRaycaster.push(controls.buttonsBook[2]);

    // Raycaster and mouse Controllers 
    let objectLooked = null;
    let selectedImage = null;
    let pointCollisionRayCaster = null;      

    function checkRaycaster(){
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, defaultCamera);
        let intersects = raycaster.intersectObjects(objectRaycaster);
        if(intersects.length > 0){
            objectLooked = intersects[0].object;
            pointCollisionRayCaster = intersects[0].point;
            if(!objectLooked.visible){ // Object is not visible
                objectLooked = null;
                pointCollisionRayCaster = null;   
            }
        }
        else{
            objectLooked = null;
            pointCollisionRayCaster = null;
        }
    }

    //Only verify if has a collision with the pictures
    function checkRaycasterClonePictures(){        
        if(selectedImage == null){                       // FIX the bug of change the picture when moving above another picture
            raycasterPictures.setFromCamera(mouse, defaultCamera);
            let intersects = raycasterPictures.intersectObjects(objectRaycasterClonePictures);            
            if(intersects.length > 0){
                let pictureLooked = intersects[0].object;
                if(pictureLooked.visible && objectLooked.visible){      // picture is not visible, only the clone it is
                    controls.imageClone.position.x = pictureLooked.position.x;
                    controls.imageClone.position.y = pictureLooked.position.y;
                    controls.imageClone.position.z = pictureLooked.position.z + 0.2;
                    controls.imageClone.material = pictureLooked.material.clone();
                }
            }
        }
    }

    render();

    function render() {
        stats.update();
        orbitControls.update(clock.getDelta());
        checkRaycaster();
        checkRaycasterClonePictures();
        animationBook();
        requestAnimationFrame(render);
        renderer.render(scene, defaultCamera);
    }

    // Add a small and simple ground plane
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

    function animationBook(){
        for (let i = 0; i < animationList.length; i++) {
            if(animationList[i].sideOption == 1){
                if(animationList[i].animationAngle > animationList[i].angleFinish){
                    animationList[i].animationAngle = 0;
                    animationList.splice(i, 1);
                    continue;
                }
                animationList[i].animationAngle = animationList[i].animationAngle + speedAnimation;
                animationList[i].rotateZ(THREE.Math.degToRad(speedAnimation));
            }
            else{
                if(animationList[i].animationAngle < (-animationList[i].angleFinish)){
                    animationList[i].animationAngle = 0;
                    animationList.splice(i, 1);
                    continue;
                }
                animationList[i].animationAngle = animationList[i].animationAngle - speedAnimation;
                animationList[i].rotateZ(THREE.Math.degToRad(- speedAnimation));
            }
        }
    }
}

