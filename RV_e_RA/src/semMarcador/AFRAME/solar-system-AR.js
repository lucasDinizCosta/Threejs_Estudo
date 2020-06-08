/******************************
 *                            *
 *  MEDIUM QUALITY TEXTURES   *
 *                            *
 *****************************/


function mainMediumQuality() {
    console.log("Medium Quality of the textures");

    // It's necessary to create renderer before than load Assets because they use the renderer
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);            //Improve Ratio of pixel in function of the of device
    renderer.setSize(window.innerWidth, window.innerHeight); //640, 480

    // Adiciona a saída do renderizador para um elemento da página HTML
    document.getElementById("webgl-output").appendChild(renderer.domElement);

    // Load all elements before the execution 
    var assets = {
        objects:{       //Easy assigning.
            sun:{
                type: 'mesh',
                geometry: 'sunGeometry',
                material: 'sunMaterial',
                map: 'sunMap',
            },
            mercury:{
                type: 'mesh',
                geometry: 'mercuryGeometry',
                material: 'mercuryMaterial',
                map: 'mercuryMap',
            },
            venus:{
                type: 'mesh',
                geometry: 'venusGeometry',
                material: 'venusMaterial',
                map: 'venusMap',
            },
            moon:{
                type: 'mesh',
                geometry: 'moonGeometry',
                material: 'moonMaterial',
                map: 'moonMap',
            },
            earth: {
                type: 'mesh',
                geometry: 'earthGeometry',
                material: 'earthMaterial',
                map: 'earthMap',
                specularMap: 'earthSpecularMap',     // mapeamento da luz especular(Reflexão)
            },
            mars:{
                type: 'mesh',
                geometry: 'marsGeometry',
                material: 'marsMaterial',
                map: 'marsMap',
            },
            jupiter:{
                type: 'mesh',
                geometry: 'jupiterGeometry',
                material: 'jupiterMaterial',
                map: 'jupiterMap',
            },
            saturn:{
                type: 'mesh',
                geometry: 'saturnGeometry',
                material: 'saturnMaterial',
                map: 'saturnMap',
            },
            saturnRing:{
                type: 'mesh',
                geometry: 'saturnRingGeometry',
                material: 'saturnRingMaterial',
                map: 'saturnRingMap',
            },
            uranus:{
                type: 'mesh',
                geometry: 'uranusGeometry',
                material: 'uranusMaterial',
                map: 'uranusMap',
            },
            neptune:{
                type: 'mesh',
                geometry: 'neptuneGeometry',
                material: 'neptuneMaterial',
                map: 'neptuneMap',
            },
        },
        geometries: {
            sunGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            mercuryGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            venusGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            moonGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            earthGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            marsGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            jupiterGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            saturnGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            saturnRingGeometry: new THREE.RingBufferGeometry(0.6, 0.9, 64, 64, 0, Math.PI * 2),
            uranusGeometry: new THREE.SphereGeometry(0.5, 50, 50),
            neptuneGeometry: new THREE.SphereGeometry(0.5, 50, 50),
        },
        textures: {
            skyBoxMap:{
                path: "./assets/textures/space/2k_stars_milky_way.jpg", fileSize: 254
            },
            sunMap:{
                path: "./assets/textures/space/2k_sun.jpg", fileSize: 824
            },
            mercuryMap:{
                path: "./assets/textures/space/2k_mercury.jpg", fileSize: 877
            },
            venusMap:{
                path: "./assets/textures/space/2k_venus_surface.jpg", fileSize: 889
            },
            moonMap:{
                path: "./assets/textures/space/2k_moon.jpg", fileSize: 1057
            },
            earthMap:{
                path: "./assets/textures/space/2k_earth.jpg", fileSize: 467
            },
            earthSpecularMap:{
                path: "./assets/textures/space/2k_earth_specular_map.png", fileSize: 324
            },
            marsMap:{
                path: "./assets/textures/space/2k_mars.jpg", fileSize: 754
            },
            jupiterMap:{
                path: "./assets/textures/space/2k_jupiter.jpg", fileSize: 500
            },
            saturnMap:{
                path: "./assets/textures/space/2k_saturn.jpg", fileSize: 201
            },
            saturnRingMap:{
                path: "./assets/textures/space/2k_saturn_ring_alpha.png", fileSize: 13
            },
            uranusMap:{
                path: "./assets/textures/space/2k_uranus.jpg", fileSize: 78
            },
            neptuneMap:{
                path: "./assets/textures/space/2k_neptune.jpg", fileSize: 242
            },
        },
        materials: {
            sunMaterial: new THREE.MeshBasicMaterial(),
            mercuryMaterial: new THREE.MeshBasicMaterial(),
            venusMaterial: new THREE.MeshBasicMaterial(),
            moonMaterial: new THREE.MeshBasicMaterial(),
            earthMaterial: new THREE.MeshBasicMaterial(),
            marsMaterial: new THREE.MeshBasicMaterial(),
            jupiterMaterial: new THREE.MeshBasicMaterial(),
            saturnMaterial: new THREE.MeshBasicMaterial(),
            saturnRingMaterial: new THREE.MeshBasicMaterial({side: 2}),
            uranusMaterial: new THREE.MeshBasicMaterial(),
            neptuneMaterial: new THREE.MeshBasicMaterial(),
        }
    };

    // Loading Screen
    var ls = new LoadScreen(renderer,{type:'stepped-circular-fancy-offset', progressColor:'#f80',infoStyle:{padding:'0'}}).onComplete(setScene).start(assets);

    function setScene(){
        console.log("Elements loaded");

        // use the defaults
        // use the basic elements
        var scene = new THREE.Scene();  // Create main scene;
        var clock = new THREE.Clock();
        
        // Setting Camera
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.lookAt(0, 0, 0);
        camera.position.set(5, 15, 50);
        camera.up.set(0, 1, 0);
        scene.add(camera);

        //  Setting the Lights

        var ambientLight = new THREE.AmbientLight(0x343434);
        ambientLight.name = "ambientLight";
        scene.add(ambientLight);

        // Show axes (parameter is size of each axis)
        var axes = new THREE.AxesHelper(80);
        axes.name = "AXES";
        axes.visible = false;
        scene.add(axes);

        function insertSolarObjectsOnScene(objectArray){
            var sun = assets.objects.sun;
            sun.position.set(0.0,0.5,0.0);
            sun.rotation.y = (1/6) * Math.PI;
            objectArray.push(sun);
            sun.visible = false;
            scene.add(sun);
            
    
            // Mercury
            var mercury = assets.objects.mercury;
            mercury.rotation.y = (1/6) * Math.PI;
            objectArray.push(mercury);
            mercury.visible = false;
            scene.add(mercury);
            mercury.position.set(0.0,0.5,0.0);
    
            // Venus
            var venus = assets.objects.venus;
            venus.rotation.y = (1/6) * Math.PI;
            objectArray.push(venus);
            venus.visible = false;
            scene.add(venus);
            venus.position.set(0.0,0.5,0.0);
    
            // Moon
            var moon = assets.objects.moon;
            moon.rotation.y = (1/6) * Math.PI;
            objectArray.push(moon);
            moon.visible = false;
            scene.add(moon);
            moon.position.set(0.0,0.5,0.0);
    
            // Earth
            var earth = assets.objects.earth;
            earth.rotation.y = (1/6) * Math.PI;
            objectArray.push(earth);
            earth.visible = false;
            scene.add(earth);
            earth.position.set(0.0,0.5,0.0);
    
            // Mars
            var mars = assets.objects.mars;
            mars.rotation.y = (1/6) * Math.PI;
            objectArray.push(mars);
            mars.visible = false;
            scene.add(mars);
            mars.position.set(0.0,0.5,0.0);
    
            // Jupiter
            var jupiter = assets.objects.jupiter;
            jupiter.rotation.y = (1/6) * Math.PI;
            objectArray.push(jupiter);
            jupiter.visible = false;
            scene.add(jupiter);
            jupiter.position.set(0.0,0.5,0.0);
    
            // Saturn
            var saturn = assets.objects.saturn;
            saturn.rotation.y = (1/6) * Math.PI;
            objectArray.push(saturn);
            saturn.visible = false;
            scene.add(saturn);
            saturn.position.set(0.0,0.5,0.0);
    
            // Saturn ring
    
            var saturnRing = assets.objects.saturnRing;
            saturnRing.rotation.x = Math.PI/2;
            saturnRing.material.opacity = 1;
            saturnRing.material.transparent = true;
            /*var geometry = saturnRing.geometry;//new THREE.RingBufferGeometry(3, 5, 64);
            var pos = geometry.attributes.position;
            var v3 = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++){
                v3.fromBufferAttribute(pos, i);
                geometry.attributes.uv.setXY(i, v3.length() < 4 ? 0 : 1, 1);
            }*/
            saturn.add(saturnRing);                 //Add on planet
    
            // Uranus
            var uranus = assets.objects.uranus;
            uranus.rotation.y = (1/6) * Math.PI;
            objectArray.push(uranus);
            uranus.visible = false;
            scene.add(uranus);
            uranus.position.set(0.0,0.5,0.0);
    
            // Neptune
            var neptune = assets.objects.neptune;
            neptune.rotation.y = (1/6) * Math.PI;
            objectArray.push(neptune);
            neptune.visible = false;
            scene.add(neptune);
            neptune.position.set(0.0,0.5,0.0);
        }
    
        // Add objects to scene
        var objectArray = new Array();
    
        // Creating de planets and stars
        insertSolarObjectsOnScene(objectArray);
    
        // Controls of sidebar
        var controls = new function() {
            // Axes
            this.axes = false;
    
            // Physics
            this.rotation = 0.01;
    
            // Geometry
            this.meshNumber = 4;//4;
            this.mesh = objectArray[this.meshNumber];
            this.animation = true;
            this.size = 0.5;
            this.type = "Earth";//"Earth";
    
            this.chooseObject = function() {
                objectArray[this.meshNumber].visible = false;
                switch (this.type) {
                    case 'Sun':
                        this.meshNumber = 0;
                        break;
                    case 'Mercury':
                        this.meshNumber = 1;
                        break;
                    case 'Venus':
                        this.meshNumber = 2;
                        break;
                    case 'Moon':
                        this.meshNumber = 3;
                        break;
                    case 'Earth':
                        this.meshNumber = 4;
                        break;
                    case 'Mars':
                        this.meshNumber = 5;
                        break;
                    case 'Jupiter':
                        this.meshNumber = 6;
                        break;
                    case 'Saturn':
                        this.meshNumber = 7;
                        break;
                    case 'Uranus':
                        this.meshNumber = 8;
                        break;
                    case 'Neptune':
                        this.meshNumber = 9;
                        break;
                }
                objectArray[this.meshNumber].visible = true;
                this.mesh = objectArray[this.meshNumber];
            }
        }
    
        // First object is visible
        controls.mesh.visible = true;
    
        // GUI de controle e ajuste de valores especificos da geometria do objeto
        var gui = new dat.GUI();
    
        var guiFolder = gui.addFolder("Properties");
        guiFolder.open(); // Open the folder
        guiFolder.add(controls, "axes").listen().onChange(function(e) {
            if (controls.axes) {
                axes.visible = true;
            } else {
                axes.visible = false;
            }
        });
        
        guiFolder.add(controls, "animation").listen().onChange(function(e) {
            if (controls.animation) {
                controls.rotation = 0.01;
            } 
            else{
                controls.rotation = 0;
            }
        });
    
        guiFolder.add(controls, 'type', ['Sun', 'Mercury', 'Venus', 'Moon', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']).onChange(function(e) {
            controls.chooseObject();
        });

        ////////////////////////////////////////////////////////////////////////////////
        //          Handler arToolkitSource
        ////////////////////////////////////////////////////////////////////////////////

        var arToolkitSource = new THREEx.ArToolkitSource({
            // to read from the webcam
            sourceType: 'webcam',

        })

        arToolkitSource.init(function onReady() {
            // Esse timeout força a interface de AR se redimensionar com base no tempo passado
            setTimeout(onResize, 1000);
        });

        // handle resize
        window.addEventListener('resize', function() {
            onResize();
        });

        function onResize() {
            arToolkitSource.onResizeElement();
            arToolkitSource.copyElementSizeTo(renderer.domElement);
            if (arToolkitContext.arController !== null) {
                arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
            }

            //camera.aspect = window.innerWidth / window.innerHeight;  //Atualiza o aspect da camera com relação as novas dimensões
            //camera.updateProjectionMatrix();                         //Atualiza a matriz de projeção
            //renderer.setSize(window.innerWidth, window.innerHeight); //Define os novos valores para o renderizador
            //console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
        }

        ////////////////////////////////////////////////////////////////////////////////
        //          initialize arToolkitContext
        ////////////////////////////////////////////////////////////////////////////////


        // create atToolkitContext
        var arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/data/camera_para.dat',
            detectionMode: 'mono',
        })

        // initialize it
        arToolkitContext.init(function onCompleted() {
            // copy projection matrix to camera
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        });

        ////////////////////////////////////////////////////////////////////////////////
        //          Create a ArMarkerControls
        ////////////////////////////////////////////////////////////////////////////////

        // init controls for camera
        var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'data/data/patt.hiro',
            // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
            // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
            changeMatrixMode: 'cameraTransformMatrix'
        });

        // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
        scene.visible = false;

        //////////////////////////////////////////////////////////////////////////////////
        //		Rendering of camera and solids
        //////////////////////////////////////////////////////////////////////////////////

        function updateAR() {
            if (arToolkitSource.ready === false) return;

            arToolkitContext.update(arToolkitSource.domElement);

            // update scene.visible if the marker is seen
            scene.visible = camera.visible;
        }
    
        function render() {
            updateAR();
    
            // Rotating the mesh selected
            controls.mesh.rotation.y -= controls.rotation;
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        }

        ls.remove(render);   // Remove the interface of loading and play loop of render
    }

}