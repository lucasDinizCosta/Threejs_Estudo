/******************************
 *                            *
 *    HIGH QUALITY TEXTURES   *
 *                            *
 *****************************/

function mainHighQuality() {
    console.log("High Quality of the textures");

    // Initialize the renderer to load textures before the scene
    var renderer = initRenderer();              // View function in util/utils
    renderer.setClearColor("rgb(30, 30, 40)");

    // Load all elements before the execution 
    var assets = {
        objects:{       //Easy assigning.
            skyBox:{
                type: 'mesh',
                geometry: 'skyBoxGeometry', // assing attribute with geometry stored on assets
                material: 'skyBoxMaterial',
                map: 'skyBoxMap',
            },
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
                //normalMap: 'earthNormalMap',         // mapeamento das normais
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
            skyBoxGeometry: new THREE.SphereGeometry(600, 50, 50),
            sunGeometry: new THREE.SphereGeometry(12, 50, 50),
            mercuryGeometry: new THREE.SphereGeometry(12, 50, 50),
            venusGeometry: new THREE.SphereGeometry(12, 50, 50),
            moonGeometry: new THREE.SphereGeometry(12, 50, 50),
            earthGeometry: new THREE.SphereGeometry(12, 50, 50),
            marsGeometry: new THREE.SphereGeometry(12, 50, 50),
            jupiterGeometry: new THREE.SphereGeometry(12, 50, 50),
            saturnGeometry: new THREE.SphereGeometry(12, 50, 50),
            /*saturnRingGeometry: new THREE.RingGeometry({
                innerRadius: 16,
                outerRadius: 20,
                thetaSegments: 8,
                phiSegments: 8,
                thetaStart: 0,
                thetaLength: Math.PI * 2
            }),*/
            saturnRingGeometry: new THREE.RingBufferGeometry(13, 20, 64, 64, 0, Math.PI * 2),
            uranusGeometry: new THREE.SphereGeometry(12, 50, 50),
            neptuneGeometry: new THREE.SphereGeometry(12, 50, 50),
        },
        textures: {
            skyBoxMap:{
                path: "./assets/textures/space/8k_stars_milky_way.jpg", fileSize: 1909
            },
            sunMap:{
                path: "./assets/textures/space/8k_sun.jpg", fileSize: 3699
            },
            mercuryMap:{
                path: "./assets/textures/space/8k_mercury.jpg", fileSize: 15037
            },
            venusMap:{
                path: "./assets/textures/space/8k_venus_surface.jpg", fileSize: 12526
            },
            moonMap:{
                path: "./assets/textures/space/8k_moon.jpg", fileSize: 15037
            },
            earthMap:{
                path: "./assets/textures/space/8k_earth.jpg", fileSize: 64860
            },
            /*earthNormalMap:{
                path: "./assets/textures/space/8k_earth_normal_map.png", fileSize: 9163
            },*/
            earthSpecularMap:{
                path: "./assets/textures/space/8k_earthSpec.png", fileSize: 1872
            },
            marsMap:{
                path: "./assets/textures/space/8k_mars.jpg", fileSize: 8401
            },
            jupiterMap:{
                path: "./assets/textures/space/8k_jupiter.jpg", fileSize: 3085
            },
            saturnMap:{
                path: "./assets/textures/space/8k_saturn.jpg", fileSize: 1102
            },
            saturnRingMap:{
                path: "./assets/textures/space/8k_saturn_ring_alpha.png", fileSize: 12
            },
            uranusMap:{
                path: "./assets/textures/space/2k_uranus.jpg", fileSize: 78
            },
            neptuneMap:{
                path: "./assets/textures/space/2k_neptune.jpg", fileSize: 242
            },
        },
        materials: {
            skyBoxMaterial: new THREE.MeshLambertMaterial({side: 1}),
            sunMaterial: new THREE.MeshBasicMaterial(),
            mercuryMaterial: new THREE.MeshLambertMaterial(),
            venusMaterial: new THREE.MeshLambertMaterial(),
            moonMaterial: new THREE.MeshLambertMaterial(),
            earthMaterial: new THREE.MeshLambertMaterial(),
            marsMaterial: new THREE.MeshLambertMaterial(),
            jupiterMaterial: new THREE.MeshLambertMaterial(),
            saturnMaterial: new THREE.MeshLambertMaterial(),
            saturnRingMaterial: new THREE.MeshBasicMaterial({side: 2}),
            uranusMaterial: new THREE.MeshLambertMaterial(),
            neptuneMaterial: new THREE.MeshLambertMaterial(),
        }
    };

    // Loading Screen
    var ls = new LoadScreen(renderer,{type:'stepped-circular-fancy-offset', progressColor:'#f80',infoStyle:{padding:'0'}}).onComplete(setScene).start(assets);

    function setScene(){
        console.log("Elements loaded");

        // use the basic elements
        var scene = new THREE.Scene();  // Create main scene;
        var stats = initStats();        // To show FPS information
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

        var pointlight = new THREE.PointLight({
            color: 0xffffff, 
            intesity: 1, 
            distance: 0,
            decay: 2
        });
        pointlight.position.set(0, 0, 0);

        var pointLightSphereGeometry = new THREE.SphereGeometry(3, 25, 25);
        var pointLightSphereMaterial = new THREE.MeshPhongMaterial({color: "white"});
        var pointLightSphere = new THREE.Mesh(pointLightSphereGeometry, pointLightSphereMaterial);
        pointLightSphere.position.set(-70, 0, 150 );
        pointLightSphere.add(pointlight);   //Add light to sphere
        scene.add(pointLightSphere);

        // Show axes (parameter is size of each axis)
        var axes = new THREE.AxesHelper(80);
        axes.name = "AXES";
        axes.visible = false;
        scene.add(axes);

        // Enable mouse rotation, pan, zoom etc.
        var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.target.set(0, 0, -1);

        // Skybox of galaxy
        var skyBox = assets.objects.skyBox;
        skyBox.color =  "white";
        scene.add(skyBox);

        function insertSolarObjectsOnScene(objectArray){
            var sun = assets.objects.sun;
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
    
            // Venus
            var venus = assets.objects.venus;
            venus.rotation.y = (1/6) * Math.PI;
            objectArray.push(venus);
            venus.visible = false;
            scene.add(venus);
    
            // Moon
            var moon = assets.objects.moon;
            moon.rotation.y = (1/6) * Math.PI;
            objectArray.push(moon);
            moon.visible = false;
            scene.add(moon);
    
            // Earth
            var earth = assets.objects.earth;
            earth.rotation.y = (1/6) * Math.PI;
            objectArray.push(earth);
            earth.visible = false;
            scene.add(earth);
    
            // Mars
            var mars = assets.objects.mars;
            mars.rotation.y = (1/6) * Math.PI;
            objectArray.push(mars);
            mars.visible = false;
            scene.add(mars);
    
            // Jupiter
            var jupiter = assets.objects.jupiter;
            jupiter.rotation.y = (1/6) * Math.PI;
            objectArray.push(jupiter);
            jupiter.visible = false;
            scene.add(jupiter);
    
            // Saturn
            var saturn = assets.objects.saturn;
            saturn.rotation.y = (1/6) * Math.PI;
            objectArray.push(saturn);
            saturn.visible = false;
            scene.add(saturn);
    
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

           
            //scene.add(saturnRing);
    
            // Uranus
            var uranus = assets.objects.uranus;
            uranus.rotation.y = (1/6) * Math.PI;
            objectArray.push(uranus);
            uranus.visible = false;
            scene.add(uranus);
    
            // Neptune
            var neptune = assets.objects.neptune;
            neptune.rotation.y = (1/6) * Math.PI;
            objectArray.push(neptune);
            neptune.visible = false;
            scene.add(neptune);
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
            this.lightFollowCam = true;
    
            // Geometry
            this.meshNumber = 4;//4;
            this.mesh = objectArray[this.meshNumber];
            this.animation = true;
            this.radius = 10;
            this.detail = 0;
            this.size = 1.0;
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
    
        // Firs object is visible
        controls.mesh.visible = true;
    
        // GUI de controle e ajuste de valores especificos da geometria do objeto
        var gui = new dat.GUI();
    
        var guiFolder = gui.addFolder("Properties");
        guiFolder.open(); // Open the folder
        /*guiFolder.add(controls, "axes").listen().onChange(function(e) {
            if (controls.axes) {
                axes.visible = true;
            } else {
                axes.visible = false;
            }
        });*/
        
        guiFolder.add(controls, "animation").listen().onChange(function(e) {
            if (controls.animation) {
                controls.rotation = 0.01;
            } 
            else{
                controls.rotation = 0;
            }
        });

        guiFolder.add(controls, "lightFollowCam").listen().onChange(function(e) {
            if (!controls.lightFollowCam) {
                pointLightSphere.position.set(-70, 0, 150 );
            } 
        });
    
        guiFolder.add(controls, 'type', ['Sun', 'Mercury', 'Venus', 'Moon', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']).onChange(function(e) {
            controls.chooseObject();
        });
    
          // Reajuste da renderização com base na mudança da janela
        function onResize(){
            camera.aspect = window.innerWidth / window.innerHeight;  //Atualiza o aspect da camera com relação as novas dimensões
            camera.updateProjectionMatrix();                         //Atualiza a matriz de projeção
            renderer.setSize(window.innerWidth, window.innerHeight); //Define os novos valores para o renderizador
            //console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
        }
    
        window.addEventListener('resize', onResize, false);         // Ouve os eventos de resize
    
        function render() {
            stats.update();
            orbitControls.update();                 // Atualiza o controle da câmera
            if (controls.lightFollowCam) {
                pointLightSphere.position.copy(camera.position);
            } 
    
            // Rotating the mesh selected
            controls.mesh.rotation.y -= controls.rotation;
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        }

        ls.remove(render);   // Remove the interface of loading and play loop of render
    }
}


/******************************
 *                            *
 *  MEDIUM QUALITY TEXTURES   *
 *                            *
 *****************************/


function mainMediumQuality() {
    console.log("Medium Quality of the textures");

    // Initialize the renderer to load textures before the scene
    var renderer = initRenderer();              // View function in util/utils
    renderer.setClearColor("rgb(30, 30, 40)");

    // Load all elements before the execution 
    var assets = {
        objects:{       //Easy assigning.
            skyBox:{
                type: 'mesh',
                geometry: 'skyBoxGeometry', // assing attribute with geometry stored on assets
                material: 'skyBoxMaterial',
                map: 'skyBoxMap',
            },
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
                //normalMap: 'earthNormalMap',         // mapeamento das normais
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
            skyBoxGeometry: new THREE.SphereGeometry(600, 50, 50),
            sunGeometry: new THREE.SphereGeometry(12, 50, 50),
            mercuryGeometry: new THREE.SphereGeometry(12, 50, 50),
            venusGeometry: new THREE.SphereGeometry(12, 50, 50),
            moonGeometry: new THREE.SphereGeometry(12, 50, 50),
            earthGeometry: new THREE.SphereGeometry(12, 50, 50),
            marsGeometry: new THREE.SphereGeometry(12, 50, 50),
            jupiterGeometry: new THREE.SphereGeometry(12, 50, 50),
            saturnGeometry: new THREE.SphereGeometry(12, 50, 50),
            saturnRingGeometry: new THREE.RingBufferGeometry(13, 20, 64, 64, 0, Math.PI * 2),
            uranusGeometry: new THREE.SphereGeometry(12, 50, 50),
            neptuneGeometry: new THREE.SphereGeometry(12, 50, 50),
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
            /*earthNormalMap:{
                path: "./assets/textures/space/2k_earth_normal_map.png", fileSize: 476
            },*/
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
                path: "./assets/textures/space/SaturnRing.jpg", fileSize: 13
            },
            uranusMap:{
                path: "./assets/textures/space/2k_uranus.jpg", fileSize: 78
            },
            neptuneMap:{
                path: "./assets/textures/space/2k_neptune.jpg", fileSize: 242
            },
        },
        materials: {
            skyBoxMaterial: new THREE.MeshLambertMaterial({side: 1}),
            sunMaterial: new THREE.MeshBasicMaterial(),
            mercuryMaterial: new THREE.MeshLambertMaterial(),
            venusMaterial: new THREE.MeshLambertMaterial(),
            moonMaterial: new THREE.MeshLambertMaterial(),
            earthMaterial: new THREE.MeshLambertMaterial(),
            marsMaterial: new THREE.MeshLambertMaterial(),
            jupiterMaterial: new THREE.MeshLambertMaterial(),
            saturnMaterial: new THREE.MeshLambertMaterial(),
            saturnRingMaterial: new THREE.MeshBasicMaterial({side: 2}),
            uranusMaterial: new THREE.MeshLambertMaterial(),
            neptuneMaterial: new THREE.MeshLambertMaterial(),
        }
    };

    // Loading Screen
    var ls = new LoadScreen(renderer,{type:'stepped-circular-fancy-offset', progressColor:'#f80',infoStyle:{padding:'0'}}).onComplete(setScene).start(assets);

    function setScene(){
        console.log("Elements loaded");

        // use the basic elements
        var scene = new THREE.Scene();  // Create main scene;
        var stats = initStats();        // To show FPS information
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

        var pointlight = new THREE.PointLight({
            color: 0xffffff, 
            intesity: 1, 
            distance: 0,
            decay: 2
        });
        pointlight.position.set(0, 0, 0);

        var pointLightSphereGeometry = new THREE.SphereGeometry(3, 25, 25);
        var pointLightSphereMaterial = new THREE.MeshPhongMaterial({color: "white"});
        var pointLightSphere = new THREE.Mesh(pointLightSphereGeometry, pointLightSphereMaterial);
        pointLightSphere.position.set(-70, 0, 150 );
        pointLightSphere.add(pointlight);   //Add light to sphere
        scene.add(pointLightSphere);

        // Show axes (parameter is size of each axis)
        var axes = new THREE.AxesHelper(80);
        axes.name = "AXES";
        axes.visible = false;
        scene.add(axes);

        // Enable mouse rotation, pan, zoom etc.
        var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.target.set(0, 0, -1);

        // Skybox of galaxy
        var skyBox = assets.objects.skyBox;
        skyBox.color =  "white";
        scene.add(skyBox);

        function insertSolarObjectsOnScene(objectArray){
            var sun = assets.objects.sun;
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
    
            // Venus
            var venus = assets.objects.venus;
            venus.rotation.y = (1/6) * Math.PI;
            objectArray.push(venus);
            venus.visible = false;
            scene.add(venus);
    
            // Moon
            var moon = assets.objects.moon;
            moon.rotation.y = (1/6) * Math.PI;
            objectArray.push(moon);
            moon.visible = false;
            scene.add(moon);
    
            // Earth
            var earth = assets.objects.earth;
            earth.rotation.y = (1/6) * Math.PI;
            objectArray.push(earth);
            earth.visible = false;
            scene.add(earth);
    
            // Mars
            var mars = assets.objects.mars;
            mars.rotation.y = (1/6) * Math.PI;
            objectArray.push(mars);
            mars.visible = false;
            scene.add(mars);
    
            // Jupiter
            var jupiter = assets.objects.jupiter;
            jupiter.rotation.y = (1/6) * Math.PI;
            objectArray.push(jupiter);
            jupiter.visible = false;
            scene.add(jupiter);
    
            // Saturn
            var saturn = assets.objects.saturn;
            saturn.rotation.y = (1/6) * Math.PI;
            objectArray.push(saturn);
            saturn.visible = false;
            scene.add(saturn);
    
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

           
            //scene.add(saturnRing);
    
            // Uranus
            var uranus = assets.objects.uranus;
            uranus.rotation.y = (1/6) * Math.PI;
            objectArray.push(uranus);
            uranus.visible = false;
            scene.add(uranus);
    
            // Neptune
            var neptune = assets.objects.neptune;
            neptune.rotation.y = (1/6) * Math.PI;
            objectArray.push(neptune);
            neptune.visible = false;
            scene.add(neptune);
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
            this.lightFollowCam = true;
    
            // Geometry
            this.meshNumber = 4;//4;
            this.mesh = objectArray[this.meshNumber];
            this.animation = true;
            this.radius = 10;
            this.detail = 0;
            this.size = 1.0;
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
    
        // Firs object is visible
        controls.mesh.visible = true;
    
        // GUI de controle e ajuste de valores especificos da geometria do objeto
        var gui = new dat.GUI();
    
        var guiFolder = gui.addFolder("Properties");
        guiFolder.open(); // Open the folder
        /*guiFolder.add(controls, "axes").listen().onChange(function(e) {
            if (controls.axes) {
                axes.visible = true;
            } else {
                axes.visible = false;
            }
        });*/
        
        guiFolder.add(controls, "animation").listen().onChange(function(e) {
            if (controls.animation) {
                controls.rotation = 0.01;
            } 
            else{
                controls.rotation = 0;
            }
        });

        guiFolder.add(controls, "lightFollowCam").listen().onChange(function(e) {
            if (!controls.lightFollowCam) {
                pointLightSphere.position.set(-70, 0, 150 );
            } 
        });
    
        guiFolder.add(controls, 'type', ['Sun', 'Mercury', 'Venus', 'Moon', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']).onChange(function(e) {
            controls.chooseObject();
        });
    
          // Reajuste da renderização com base na mudança da janela
        function onResize(){
            camera.aspect = window.innerWidth / window.innerHeight;  //Atualiza o aspect da camera com relação as novas dimensões
            camera.updateProjectionMatrix();                         //Atualiza a matriz de projeção
            renderer.setSize(window.innerWidth, window.innerHeight); //Define os novos valores para o renderizador
            //console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
        }
    
        window.addEventListener('resize', onResize, false);         // Ouve os eventos de resize
    
    
        function render() {
            stats.update();
            orbitControls.update();                 // Atualiza o controle da câmera
            if (controls.lightFollowCam) {
                pointLightSphere.position.copy(camera.position);
            } 
    
            // Rotating the mesh selected
            controls.mesh.rotation.y -= controls.rotation;
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        }


        ls.remove(render);   // Remove the interface of loading and play loop of render
    }

}