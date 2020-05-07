function main(){
	//////////////////////////////////////////////////////////////////////////////////
	//		Init
	//////////////////////////////////////////////////////////////////////////////////

	// use the defaults
    var scene = new THREE.Scene();                  // Create main scene
	var stats = initStats();                        // To show FPS information
	//var camera = new THREE.Camera();
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);    //var camera = initCamera(new THREE.Vector3(0, 10, 20));
    camera.lookAt(0, 0, 0);
    camera.position.set(5, 15, 30);
    camera.up.set( 0, 1, 0 );
	scene.add(camera);

    var clock = new THREE.Clock();
	var light = initDefaultLighting(scene, new THREE.Vector3(5, 10, 0));  // Use default light


	// init renderer
	var renderer	= new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.shadowMap.enabled = true;
	
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
    renderer.setSize(window.innerWidth, window.innerHeight);
	//renderer.setSize( 640, 480 );

	// Adiciona a saída do renderizador para um elemento da página HTML
	document.getElementById("webgl-output").appendChild(renderer.domElement);	//document.body.appendChild( renderer.domElement );
	
	// Show axes (parameter is size of each axis)
    var axes = new THREE.AxesHelper(1);
    axes.name = "AXES";
    axes.visible = false;
    scene.add(axes);

    var groundPlane = createGroundPlane(1.90, 1.90); // width and height
    groundPlane.rotateX(degreesToRadians(-90));
	scene.add(groundPlane);   
	
	// Object Material for all objects
    var objectMaterial = new THREE.MeshPhongMaterial({color:"rgb(255, 0, 0)"});

    // Add objects to scene
    var objectArray = new Array();
    scene.add(createTetrahedron(0.50, 0));
    scene.add(createCube(0.5));
    scene.add(createOctahedron(0.5, 0));
    scene.add(createDodecahedron(0.5, 0));
    scene.add(createIcosahedron(0.5, 0));
    
    // Position of the cube
	objectArray[1].position.y = 0.5;
	
	// Controls of sidebar
    var controls = new function () {
        var self = this;

        // Axes
        this.axes = false;
        this.axesSize = 0.5;

        this.updateAxes = function(){
            scene.remove(axes);                                 //Remove o eixo antigo
            axes = new THREE.AxesHelper(controls.axesSize);
            axes.visible = this.axes;
            scene.add(axes);
        }

        // Inicia a geometria e material de base a serem controlados pelo menu interativo
        //this.appliedMaterial = applyMeshNormalMaterial;
        this.castShadow = true;
        this.groundPlaneVisible = true;

        //Physics
        this.rotation = 0.02;
        this.color = "rgb(255, 0, 0)";

        // Geometry
        this.mesh = objectArray[0];
        this.meshNumber = 0;
        this.radius = 10;
        this.detail = 0;
        this.type = 'Tetrahedron';

        this.choosePoligon = function(){
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
        }

        this.updateColor = function(){
            // removing the objects with the old material color
            for(let i = 0; i < objectArray.length; i++){            
                //scene.remove(scene.getObjectByName("particles1"));
                scene.remove(objectArray[i]);
            }
            objectArray = new Array();
            objectMaterial = new THREE.MeshPhongMaterial({color:controls.color});   // Setting the material with new color
            
            // Recreating those objects
            scene.add(createTetrahedron(0.5, 0));
			scene.add(createCube(0.5));
			scene.add(createOctahedron(0.5, 0));
			scene.add(createDodecahedron(0.5, 0));
			scene.add(createIcosahedron(0.5, 0));
            
            // Position of the cube
            objectArray[1].position.y = 0.5;

            controls.choosePoligon();
        }
	}
	
	// GUI de controle e ajuste de valores especificos da geometria do objeto
	var gui = new dat.GUI();

    var guiFolder = gui.addFolder("Properties");
    guiFolder.open();                                       // Open the folder
    guiFolder.add(controls, "axes").listen().onChange(function(e){
        if(controls.axes){
        	axes.visible = true;
        }
        else{
        	axes.visible = false;
        }
    });
    guiFolder.add(controls, "axesSize", 0.1, 3).listen().onChange(function(e){
         controls.updateAxes();
    });
    guiFolder.add(controls, 'rotation', 0, 0.5);
    //gui.add(controls, 'radius', 0, 40).step(1).onChange(controls.redraw);
    //gui.add(controls, 'detail', 0, 3).step(1).onChange(controls.redraw);
    guiFolder.addColor(controls, 'color').onChange(function(e){
        controls.updateColor();
    });

    guiFolder.add(controls, 'type', ['Tetrahedron','Cube', 'Octahedron', 'Dodecahedron', 'Icosahedron']).onChange(function(e){
        controls.choosePoligon();
    });

    controls.choosePoligon();               // Update de selection of the polygon

    // 4 faces
    function createTetrahedron(radius, detail)
    {
        var geometry = new THREE.TetrahedronGeometry(radius, detail);
        var object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, radius, 0.0);
        object.visible = false;
        object.name = "Tetrahedron";
        objectArray.push(object);
        return object;
    }

    // 6 faces
    function createCube(s)
    {
        let geometry = new THREE.BoxGeometry(s, s, s);
        let object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, s/2.0, 0.0);
        object.visible = false;
        object.name = "Cube";
        objectArray.push(object);
        return object;
    }

    // 8 faces
    function createOctahedron(radius, detail)
    {
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
    function createDodecahedron(radius, detail)
    {
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
    function createIcosahedron(radius, detail)
    {
        let geometry = new THREE.IcosahedronGeometry(radius, detail);
        let object = new THREE.Mesh(geometry, objectMaterial);
        object.castShadow = true;
        object.position.set(0.0, radius, 0.0);
        object.visible = false;
        object.name = "Icosahedron";
        objectArray.push(object);
        return object;
    }
    

	////////////////////////////////////////////////////////////////////////////////
	//          Controlador arToolkitSource
	////////////////////////////////////////////////////////////////////////////////

	var arToolkitSource = new THREEx.ArToolkitSource({
		// to read from the webcam
		sourceType : 'webcam',

		// // to read from an image
		// sourceType : 'image',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

		// to read from a video
		// sourceType : 'video',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',

		// resolution of at which we initialize the source image
		//sourceWidth: 640,
		//sourceHeight: 480,

		// resolution displayed for the source
		displayWidth: window.innerWidth,  //window.innerWidth,
		displayHeight: window.innerHeight//window.innerHeight
	})

	// Reajustes caso a janela seja redimensionada
	arToolkitSource.init(function onReady(){
		onResize();
	})

	// handle resize
	window.addEventListener('resize', function(){
		onResize();
	});

	function onResize(){
		arToolkitSource.onResizeElement();
		arToolkitSource.copyElementSizeTo(renderer.domElement);
		if( arToolkitContext.arController !== null ){
			arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////
	//          initialize arToolkitContext
	////////////////////////////////////////////////////////////////////////////////


	// create atToolkitContext
	var arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
		detectionMode: 'mono',

		// tune the maximum rate of pose detection in the source image
		//maxDetectionRate: 60,
		// resolution of at which we detect pose in the source image
		canvasWidth: window.innerWidth,	//640
		canvasHeight: window.innerHeight,	//480

		// debug - true if one should display artoolkit debug canvas, false otherwise
		//debug: false,

		// enable image smoothing or not for canvas copy - default to true
		// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
		// imageSmoothingEnabled : true,
	})

	// initialize it
	arToolkitContext.init(function onCompleted(){
		// copy projection matrix to camera
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////////////////////////
	//          Create a ArMarkerControls
	////////////////////////////////////////////////////////////////////////////////

	// init controls for camera
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
		type : 'pattern',
		patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
		// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
		// as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
		changeMatrixMode: 'cameraTransformMatrix'
	});

	// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
	scene.visible = false;

	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////

	function updateAR(){
		if( arToolkitSource.ready === false )	return;

		arToolkitContext.update( arToolkitSource.domElement );

		// update scene.visible if the marker is seen
		scene.visible = camera.visible;
	}

	render();
    function render() {
		updateAR();
        stats.update();
        // Rotating the mesh selected
        controls.mesh.rotation.x += controls.rotation;
        controls.mesh.rotation.y += controls.rotation;
        controls.mesh.rotation.z += controls.rotation;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
}