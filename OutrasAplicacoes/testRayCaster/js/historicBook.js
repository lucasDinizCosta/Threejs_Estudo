function main() {
    
    // TODO: Criar a primeira versão com textos e imagens correspondentes para vermos se a ideia funciona (ideia é termos 9 imagens em um grid 3 x 3) -- 
    // TODO: Finalizar a implementação do sistema de acerto e erro -- 
    //      >> Tem que criar um contador para acabar o 'jogo' ao errar X vezes
    // TODO: Fixar o texto com resolução: 1024 x 624; Razão de aspecto: 1,64 -- 
    // TODO: Ao clicar, transladar o centro da imagem rotacionada para o local do cursor para facilitar a colagem (deixar por último) --
    // TODO: Painel Lateral ao de madeira com um botão reload pra recarregar a cena
    // TODO: Encontrar 9 imagens pro painel
    // TALVEZ O MENU LATERAL FICARIA MELHOR EM CIMA DO PAINEL DO QUE DO LADO

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

    // Time controlling
    var timeAfter = 0;
    var dt = 0;

    // Creating raycaster objects
    var raycaster = new THREE.Raycaster();
    var raycasterPictures = new THREE.Raycaster();      // To create a ghost image when the picture is moving from the wall
    var mouse = new THREE.Vector2();

    // Animation pages
    let animationList = [];
    let speedAnimation = 1.8;   // 1.5

    // Raycaster and mouse Controllers 
    let objectRaycaster = [];
    let objectRaycasterClonePictures = [];
    let objectLooked = null;
    let selectedImage = null;
    let pointCollisionRayCaster = null;  
    let dragControls;
    

    // Controls of sidebar
    var controls = new function() {
        // Add objects to scene
        this.book = new THREE.Group(),

        // Game Attributes
        this.fails = 0,
        this.hits = 0,
        this.buttonRetry = null,
        /**************************
         *          States        *
         *  0 => Game Running     * 
         *  1 => Victory          * 
         *  2 => Loose            * 
         *                        *
         **************************/
        this.state = 0,         
        this.timer = {
            minutes: 0,
            seconds: 0,
            updateTime: function(dt){
                this.seconds += (dt);
                if(this.seconds > 59){
                    this.seconds = 0;
                    this.minutes++;
                }
            }
        },
        this.menu = {
            object: null,
            canvas: null,
            ctx: null,          // Context
            retryButton: null,
            drawMenu: function(){
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "black";
                this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.font = "Bold 38px Arial";
                this.ctx.fillStyle = "rgb(255, 255, 0)";
                this.ctx.fillText("MENU PRINCIPAL", 380, 45);
                this.ctx.fillText("FAILS: " + controls.fails, 30, 100);
                this.ctx.fillText(" HITS: " + controls.hits, 200, 100);
                this.ctx.fillText(" TIMER:  " + controls.timer.minutes + " : " + controls.timer.seconds.toFixed(0), 350, 100);
                this.object.material.map.needsUpdate = true;        //Update the canvas texture
            },
            clearMenu: function(){
                this.ctx.fillStyle = "rgba(10, 10, 10)";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.object.material.map.needsUpdate = true;        //Update the canvas texture
                //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            },
        },

        // Pictures and Painting Wall
        this.pictures = [],
        this.imageClone = null,
        this.orderPicturesBook = [],
        this.messageVictory = null,
        this.messageLoose = null,

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
        this.animationBook = function(){
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
        },
        this.animationScenary = function(){
            this.menu.clearMenu();
            this.menu.drawMenu();
            this.animationBook();
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
            this.buttonsBook[0].objectType = 3;
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
            this.buttonsBook[1].objectType = 4;
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
            this.buttonsBook[2].objectType = 5;
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
            // create a canvas element
            let canvas1 = document.createElement('canvas');
            let context1 = canvas1.getContext('2d');
            canvas1.width = 1024;
            canvas1.height = 128;   //Set dimensions of the canvas texture to adjust aspect ratio
            
            // canvas contents will be used for a texture
            let texture1 = new THREE.Texture(canvas1);
            texture1.needsUpdate = true;
            
            let material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
            material1.transparent = true; //true;
            let mesh1 = new THREE.Mesh(
                new THREE.PlaneGeometry(30, 3),
                material1
            );
            mesh1.position.set(0, 18.5, -12.1);
            this.menu.object = mesh1;
            this.menu.canvas = canvas1;
            this.menu.ctx = context1;
            scene.add(mesh1);
            
            // Button Retry
            let buttonRetryGeometry = new THREE.PlaneGeometry(3, 1.5, 0.1, 0.1);
            let buttonRetryMaterial = new THREE.MeshBasicMaterial({
                //color: "rgb(255, 255, 0)",
                map: textureLoader.load("../assets/icons/retry.png"), side: THREE.DoubleSide
            });
            this.buttonRetry = new THREE.Mesh(buttonRetryGeometry, buttonRetryMaterial);
            this.buttonRetry.position.set(13, 18.25, -11.9);
            this.buttonRetry.objectType = 6;
            scene.add(this.buttonRetry); 
        },
        this.createMessages = function(){       // Victory and Loose
            let messageVictoryGeometry = new THREE.PlaneGeometry(26, 8, 0.1, 0.1);
            let messageVictoryMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/messageVictory.png"), side: THREE.DoubleSide
            });
            this.messageVictory = new THREE.Mesh(messageVictoryGeometry, messageVictoryMaterial);
            this.messageVictory.position.set(0, 9, -12);
            this.messageVictory.visible = false;
            scene.add(this.messageVictory); 

            let messageLooseGeometry = new THREE.PlaneGeometry(26, 8, 0.1, 0.1);
            let messageLooseMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load("../assets/messageLoose.png"), side: THREE.DoubleSide
            });
            this.messageLoose = new THREE.Mesh(messageLooseGeometry, messageLooseMaterial);
            this.messageLoose.position.set(0, 9, -12);
            this.messageLoose.visible = false;
            scene.add(this.messageLoose); 
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
                page.objectType = 0;               // Page type
                page.indexPicture = indexPicture;

                // Image plane
                let imageGeometry = new THREE.PlaneGeometry(9, 4.5, 0.1, 0.1);
                let imageMaterial = new THREE.MeshStandardMaterial({
                    color:"rgb(255, 255, 255)", side: THREE.DoubleSide
                });
                let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
                imagePlane.position.set(0, this.lengthPage/4.5, 0.01);
                imagePlane.objectType = 2;
                page.add(imagePlane);
                imagePlane.indexPicture = indexPicture;
                

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
                imagePlane.objectType = 2;
                imagePlane.indexPicture = indexPicture;
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
            /*var axes = new THREE.AxesHelper(24);
            axes.name = "AXES";
            axes.visible = true;
            scene.add(axes);*/

            var groundPlane = createGroundPlane(30, 30); // width and height
            groundPlane.rotateX(THREE.Math.degToRad(-90));
            scene.add(groundPlane);

            this.createMenu();
            this.createImageClone();
            this.createPicturesPanel(scene);
            this.orderPicturesBook = this.shuffleList(this.orderPicturesBook);
            console.log(this.orderPicturesBook);
            this.createBook();
            this.createMessages();

            pictureLooked = null;
            animationList = [];
            objectRaycaster = [];
            objectRaycasterClonePictures = [];

            //Recreate DragControls
            dragControls = new THREE.DragControls([controls.imageClone], camera, renderer.domElement ); //dragControls = new DragControls( objects, camera, renderer.domElement );

            // Pages of book
            for (let i = 0; i < this.book.children.length; i++) {
                let pageGroupRotation = this.book.children[i];
                for(let j = 0; j < pageGroupRotation.children.length; j++){
                    objectRaycaster.push(pageGroupRotation.children[j]);        //Put inside only page without the group rotation
                    objectRaycaster.push(pageGroupRotation.children[j].children[0]);        // Image Block
                }
            }

            // Adding the images of paintwall
            for(let i = 0; i < this.pictures.length; i++){
                objectRaycaster.push(this.pictures[i]);
                objectRaycasterClonePictures.push(this.pictures[i]);
            }

            // Buttons
            objectRaycaster.push(this.buttonsBook[0]);
            objectRaycaster.push(this.buttonsBook[1]);
            objectRaycaster.push(this.buttonsBook[2]);
            objectRaycaster.push(this.buttonRetry);

            // Raycaster and mouse Controllers 
            objectLooked = null;
            selectedImage = null;
            pointCollisionRayCaster = null;   
        },
        this.emptyScene = function(){
            console.log("Empty Scene");
            while(scene.children.length > 0){       //OU scene.remove.apply(scene, scene.children);
                scene.remove(scene.children[0]); 
            }
            this.fails = 0;
            this.hits = 0;
            this.state = 0;
            this.buttonRetry = null;
            this.timer.seconds = 0;
            this.timer.minutes = 0;
            this.amountSheets = 0;
            this.currentSheet = 0;
            this.amountPages = 0;
            this.pictures = [];
            this.orderPicturesBook = [];
            objectLooked = null;
            selectedImage = null;
            pictureLooked = null;
            objectRaycaster = [];
            objectRaycasterClonePictures = [];
            this.imageClone = null;
            this.book = new THREE.Group;
        },
        this.removeEntity = function(object){
            let selected = scene.getObjectByName(object.name);
            scene.remove(selected);
        },
        this.removePictureFromWall = function(image, imagePlane){
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
            for (let j = 0; j < objectRaycaster.length; j++) {  // Remove imagePlane of raycaster
                if(objectRaycaster[j] == imagePlane){
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
        this.removeAllPictures = function(){
            for (let i = 0; i < this.pictures.length; i++) {
                let aux = this.pictures[i];
                this.removeEntity(aux);
            }
            objectRaycasterClonePictures = [];
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
    
    // DragControls functions

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
                if((objectLooked != null) && (objectLooked.objectType == 2)){
                    if(selectedImage != null){
                        if(objectLooked.indexPicture == selectedImage.indexPicture){
                            objectLooked.material = selectedImage.material.clone(); // Generate a clone of material and replace on image plane   
                            controls.hits++;
                            controls.removePictureFromWall(selectedImage, objectLooked);   // Remove imagePlane and picture of panel
                            if(controls.pictures.length == 0){
                                controls.state = 1;
                                controls.messageVictory.visible = true;
                            } 
                        }
                        else{
                            controls.fails++;
                            if(controls.fails > 2){
                                controls.state = 2;
                                //console.log("You lose");
                                controls.removeAllPictures();
                                controls.messageLoose.visible = true;

                            } 
                        }
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
                    case 2:     // Collide with imagePlane on Page 
                        //
                        //
                        break;
                    case 3:     // Read Left page Button
                        controls.cameraOption = 1;      // Turn camera option
                        defaultCamera = upperCamera;
                        controls.adjustButtonsBook();
                        controls.buttonsBook[2].visible = true;
                        defaultCamera.position.set(-controls.widthPage/2, 17, 0);   // Y = 25
                        controls.buttonsBook[2].position.set(-controls.widthPage - controls.sizeButton/2, controls.buttonsBook[2].position.y, 0);   
                        break;
                    case 4:     // Read Right page Button
                        controls.cameraOption = 1;      // Turn camera option
                        defaultCamera = upperCamera;
                        controls.adjustButtonsBook();
                        controls.buttonsBook[2].visible = true;
                        defaultCamera.position.set(controls.widthPage/2, 17, 0);
                        controls.buttonsBook[2].position.set(controls.widthPage + controls.sizeButton/2, controls.buttonsBook[2].position.y, 0);   
                        break;
                    case 5:     // Exit Button
                        controls.cameraOption = 0;
                        defaultCamera = camera;
                        controls.adjustButtonsBook();
                        controls.buttonsBook[2].visible = false;
                        break;
                    case 6:     // Retry Button
                        controls.emptyScene();
                        controls.createScenary();
                        break;
                }
            }
        }
    }    

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

    requestAnimationFrame(render);

    function render(t) {
        dt = (t - timeAfter) / 1000;
        stats.update();
        orbitControls.update(clock.getDelta());
        checkRaycaster();
        controls.animationScenary();
        switch(controls.state){
            case 0:         // Game Running
                controls.timer.updateTime(dt);
                checkRaycasterClonePictures();
                break;
            case 1:         // Victory
                break;
            case 2:         // Loose
                break;
        }
        renderer.render(scene, defaultCamera);
        timeAfter = t;
        requestAnimationFrame(render);
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
}

