// Importando módulos
import * as THREE from "../../../libs/build/three.module.js";
import { VRButton } from "../../../libs/three/jsm/webxr/VRButton.js";
import { DragControls } from "../../../libs/three/jsm/controls/DragControls.js";
//import { OrbitControls } from '../../../libs/three/jsm/controls/OrbitControls.js';
import { XRControllerModelFactory } from "../../../libs/three/jsm/webxr/XRControllerModelFactory.js";

function main(language) {
	var scene = new THREE.Scene();
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
	renderer.xr.enabled = true; //tell your instance of WebGLRenderer to enable XR rendering

	// FIX: TRANSPARENCY Problem
	//  https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
	// Em seguida, os objetos serão renderizados na ordem em que são adicionados à cena 
	renderer.sortObjects = false; 

	var rotationCamera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	); //var camera = initCamera(new THREE.Vector3(0, 10, 20));
	rotationCamera.up.set(0, 1, 0);
	rotationCamera.position.set(0, 12, 17);
	var bookCamera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	); //var camera = initCamera(new THREE.Vector3(0, 10, 20));
	bookCamera.position.set(0, 12, -1);
	bookCamera.up.set(0, 1, 0);
	bookCamera.lookAt(0, 0, 0);
	var pictureCamera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	); //var camera = initCamera(new THREE.Vector3(0, 10, 20));
	pictureCamera.position.set(0, 12, 8);
	pictureCamera.up.set(0, 1, 0);
	pictureCamera.lookAt(0, 10.7, -12);
	var defaultCamera = rotationCamera;

	var cameraVR = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	cameraVR.position.set(0, 1.6, 0);
	let dolly = new THREE.Group(); // This helps move the camera
	dolly.position.set(
		defaultCamera.position.x,
		defaultCamera.position.y,
		defaultCamera.position.z
	);
	scene.add(dolly);
	dolly.add(cameraVR);

	let geometryMarker = new THREE.RingGeometry(30 * 0.0025, 30 * 0.005, 64); //(0.0025, 0.005, 64);
	let materialMarker = new THREE.MeshBasicMaterial({ color: 0xffff00 });
	let circleMarker = new THREE.Mesh(geometryMarker, materialMarker);
	cameraVR.add(circleMarker);
	circleMarker.position.set(0, 0, -5); // -0.2
	geometryMarker = new THREE.RingGeometry(31 * 0.0025, 31 * 0.003, 64);//(0.0025, 0.005, 64);
	materialMarker = new THREE.MeshBasicMaterial({ color: 0x00000 });
	let circleBGMarker = new THREE.Mesh(geometryMarker, materialMarker);
	cameraVR.add(circleBGMarker);
	circleBGMarker.position.set(0, 0, -5); // -0.2
	geometryMarker = new THREE.RingGeometry(30 * 0.005, 30 * 0.006, 64);//(0.0025, 0.005, 64);
	materialMarker = new THREE.MeshBasicMaterial({ color: 0x00000 });
	circleBGMarker.add(new THREE.Mesh(geometryMarker, materialMarker));

	const intersected = [];
	const tempMatrix = new THREE.Matrix4();

	// Time controller
	var timeAfter = 0;
	var dt = 0;
	var timeRaycaster = 0;

	// Creating raycaster objects
	var raycaster = new THREE.Raycaster();
	var raycasterPictures = new THREE.Raycaster(); // To create a ghost image when the picture is moving from the wall

	// Animation pages
	let animationList = [];
	let speedAnimation = 1.8; // 1.5

	// Raycaster and mouse Controllers
	let objectRaycaster = [],
		objectRaycasterClonePictures = [];
	let objectLooked = null,
		objectImagePlane = null,
		selectedImage = null,
		pointCollisionRayCaster = null;
	let pictureLooked = null;

	// Controls of sidebar
	var controls = new (function () {
		(this.book = new THREE.Group()),
			// Game Attributes
			(this.fails = 0),
			(this.hits = 0),
			/**************************
			 *          States        *
			 *  0 => Game Running     *
			 *  1 => Victory          *
			 *  2 => Loose            *
			 *                        						*
			 **************************/
			(this.state = 0),
			(this.timer = {
				minutes: 0,
				seconds: 0,
				updateTime: function (dt) {
					this.seconds += dt;
					if (this.seconds > 59) {
						this.seconds = 0;
						this.minutes++;
					}
				},
			}),
			(this.menu = {
				object: null,
				canvas: null,
				ctx: null, // Context
				drawMenu: function () {
					this.ctx.lineWidth = 2;
					this.ctx.strokeStyle = "black";
					this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
					this.ctx.font = "Bold 38px Arial";
					this.ctx.fillStyle = "rgb(255, 255, 0)";
					this.ctx.fillText("MAIN MENU", 350, 45);
					this.ctx.fillText("FAILS: " + controls.fails, 30, 100);
					this.ctx.fillText("HITS: " + controls.hits, 300, 100);
					this.ctx.fillText(
						`TIMER:  ${controls.timer.minutes.toLocaleString(undefined, {minimumIntegerDigits: 2,})} :  ${controls.timer.seconds.toFixed(0).toLocaleString(undefined, { minimumIntegerDigits: 2 })}`,
						500,
						100
					);
					this.object.material.map.needsUpdate = true; //Update the canvas texture
				},
				clearMenu: function () {
					this.ctx.fillStyle = "rgba(10, 10, 10)";
					this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
					this.object.material.map.needsUpdate = true; //Update the canvas texture
				},
			}),
			// Pictures and Painting Wall
			(this.pictures = []),
			(this.imageClone = null),
			(this.orderPicturesBook = []),
			(this.messageVictory = null),
			(this.messageLoose = null),
			// bookAttributes
			(this.angleBeginPage = 0),
			(this.angleFinishPage = 180),
			(this.angleRatePage = 1.8), //0.75
			// page and sheet attributes
			(this.widthPage = 12),
			(this.lengthPage = 14),
			(this.heightBook = 0.5),
			(this.amountSheets = 0),
			(this.currentSheet = 0),
			(this.amountPages = 0),
			(this.buttons = []), // Read(Left sheet, Right sheet), Exit, ZoomIn, ZoomOut, Retry
			(this.sizeButton = 1.75),
			(this.cameraOption = 0), // 0 => rotationCamera, 1 => bookCamera, 2 => pictureCamera

			// Functions
			(this.adjustbuttons = function () {
				if (this.cameraOption == 0) {
					if (this.currentSheet < this.amountSheets) {
						if (this.currentSheet > 0) {
							this.buttons[0].visible = true;
							this.buttons[1].visible = true;
						} else {
							this.buttons[0].visible = false;
							this.buttons[1].visible = true;
						}
					} else {
						// End of book
						this.buttons[0].visible = true;
						this.buttons[1].visible = false;
					}
					this.buttons[3].visible = true;
					this.buttons[4].visible = false;
				} else {
					this.buttons[0].visible = false;
					this.buttons[1].visible = false;
				}
			}),
			(this.animationBook = function () {
				for (let i = 0; i < animationList.length; i++) {
					if (animationList[i].sideOption == 1) {
						if ( animationList[i].animationAngle > animationList[i].angleFinish) {
							animationList[i].animationAngle = 0;
							animationList.splice(i, 1);
							continue;
						}
						animationList[i].animationAngle =
							animationList[i].animationAngle + speedAnimation;
						animationList[i].rotateZ(THREE.Math.degToRad(speedAnimation));
					} else {
						if ( animationList[i].animationAngle < -animationList[i].angleFinish) {
							animationList[i].animationAngle = 0;
							animationList.splice(i, 1);
							continue;
						}
						animationList[i].animationAngle = animationList[i].animationAngle - speedAnimation;
						animationList[i].rotateZ(THREE.Math.degToRad(-speedAnimation));
					}
				}
			}),
			(this.animationScenary = function () {
				this.menu.clearMenu();
				this.menu.drawMenu();
				this.animationBook();
			}),
			(this.createBook = function () {
				for (let index = 0; index < this.pictures.length; index++) {
					this.createPage(this.orderPicturesBook[index]);
				}
				scene.add(this.book);
			}),
			(this.createButtons = function () {
				let readButtonGeometry = new THREE.PlaneGeometry(
					this.sizeButton,
					this.sizeButton,
					0.1,
					0.1
				);
				let readButtonMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/icons/read.png"),
					side: THREE.DoubleSide,
				});
				let readButton = new THREE.Mesh(readButtonGeometry, readButtonMaterial);
				readButton.position.set(
					-this.widthPage / 2,
					this.book.position.y + 0.5,
					this.book.position.z +
						this.lengthPage / 2 +
						0.25 +
						this.sizeButton / 2
				); //readButton.position.set(0, this.book.position.y + 5, 0);
				this.buttons.push(readButton);
				this.buttons[0].objectType = 3;
				this.buttons[0].visible = false;
				this.buttons[0].rotateX(THREE.Math.degToRad(-70));
				scene.add(this.buttons[0]);
				readButtonGeometry = new THREE.PlaneGeometry(
					this.sizeButton,
					this.sizeButton,
					0.1,
					0.1
				);
				readButtonMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/icons/read.png"),
					side: THREE.DoubleSide,
				});
				readButton = new THREE.Mesh(readButtonGeometry, readButtonMaterial);
				readButton.position.set(
					this.widthPage / 2,
					this.book.position.y + 0.5,
					this.book.position.z +
						this.lengthPage / 2 +
						0.25 +
						this.sizeButton / 2
				); //readButton.position.set(0, this.book.position.y + 5, 0);
				this.buttons.push(readButton);
				this.buttons[1].visible = false;
				this.buttons[1].objectType = 4;
				this.buttons[1].rotateX(THREE.Math.degToRad(-70));
				scene.add(this.buttons[1]);
				let backButtonGeometry = new THREE.PlaneGeometry(
					this.sizeButton,
					this.sizeButton,
					0.1,
					0.1
				);
				let backButtonMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/icons/back.png"),
					side: THREE.DoubleSide,
				});
				let backButton = new THREE.Mesh(backButtonGeometry, backButtonMaterial);
				backButton.position.set(0, this.book.position.y + 1.5, 0);
				backButton.rotateX(THREE.Math.degToRad(-90));
				this.buttons.push(backButton);
				this.buttons[2].visible = false;
				this.buttons[2].objectType = 5;
				scene.add(this.buttons[2]);
				if (this.amountSheets > 0) {
					this.buttons[1].visible = true;
				}
				let zoomInButtonGeometry = new THREE.PlaneGeometry(
					this.sizeButton,
					this.sizeButton,
					0.1,
					0.1
				);
				let zoomInButtonMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/icons/zoomin.png"),
					side: THREE.DoubleSide,
				});
				let zoomInButton = new THREE.Mesh(
					zoomInButtonGeometry,
					zoomInButtonMaterial
				);
				this.buttons.push(zoomInButton);
				this.buttons[3].position.set(10, 20.25, -11.8);
				this.buttons[3].objectType = 6;
				scene.add(this.buttons[3]);
				let zoomOutButtonGeometry = new THREE.PlaneGeometry(
					this.sizeButton,
					this.sizeButton,
					0.1,
					0.1
				);
				let zoomOutButtonMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/icons/zoomout.png"),
					side: THREE.DoubleSide,
				});
				let zoomOutButton = new THREE.Mesh(
					zoomOutButtonGeometry,
					zoomOutButtonMaterial
				);
				this.buttons.push(zoomOutButton);
				this.buttons[4].position.set(10, 20.25, -11.9);
				this.buttons[4].objectType = 7;
				this.buttons[4].visible = false;
				scene.add(this.buttons[4]);
				let buttonRetryGeometry = new THREE.PlaneGeometry(3, 1.5, 0.1, 0.1);
				let buttonRetryMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/icons/retry.png"),
					side: THREE.DoubleSide,
				});
				let buttonRetry = new THREE.Mesh(
					buttonRetryGeometry,
					buttonRetryMaterial
				);
				this.buttons.push(buttonRetry);
				this.buttons[5].position.set(13, 20.25, -11.9);
				this.buttons[5].objectType = 8;
				scene.add(this.buttons[5]);
			}),
			(this.createImageClone = function () {
				let panelGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				let panelMaterial = new THREE.MeshStandardMaterial({
					color: "rgb(255,255,255)",
					side: THREE.DoubleSide,
				});
				this.imageClone = new THREE.Mesh(panelGeometry, panelMaterial);
				this.imageClone.position.set(-100, -100, -100);
				scene.add(this.imageClone);
			}),
			(this.createMenu = function () {
				// create a canvas element
				let canvas1 = document.createElement("canvas");
				let context1 = canvas1.getContext("2d");
				canvas1.width = 1024;
				canvas1.height = 128; //Set dimensions of the canvas texture to adjust aspect ratio

				// canvas contents will be used for a texture
				let texture1 = new THREE.Texture(canvas1);
				texture1.needsUpdate = true;

				let material1 = new THREE.MeshBasicMaterial({
					map: texture1,
					side: THREE.DoubleSide,
				});
				material1.transparent = true;
				let mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(29.5, 3), material1);
				mesh1.position.set(0, 20.4, -12.1);
				this.menu.object = mesh1;
				this.menu.canvas = canvas1;
				this.menu.ctx = context1;
				scene.add(mesh1);
			}),
			(this.createMessages = function () {
				// Victory and Loose
				let messageVictoryGeometry = new THREE.PlaneGeometry(26, 8, 0.1, 0.1);
				let messageVictoryMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/messageVictory.png"),
					side: THREE.DoubleSide,
				});
				this.messageVictory = new THREE.Mesh(
					messageVictoryGeometry,
					messageVictoryMaterial
				);
				this.messageVictory.position.set(0, 9, -11.9);
				this.messageVictory.visible = false;
				scene.add(this.messageVictory);
				let messageLooseGeometry = new THREE.PlaneGeometry(26, 8, 0.1, 0.1);
				let messageLooseMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/messageLoose.png"),
					side: THREE.DoubleSide,
				});
				this.messageLoose = new THREE.Mesh(
					messageLooseGeometry,
					messageLooseMaterial
				);
				this.messageLoose.position.set(0, 9, -11.9);
				this.messageLoose.visible = false;
				scene.add(this.messageLoose);
			}),
			(this.createPage = function (indexPicture) {
				if (this.amountPages % 2 == 0) {
					//Pair pages on the book
					// Adjust of rotation of the sheets inside of book
					for (let i = 0; i < this.book.children.length; i++) {
						let sheetAux = this.book.children[i];
						sheetAux.angleBegin = sheetAux.angleBegin + this.angleRatePage;
						sheetAux.angleFinish = 180 - i * this.angleRatePage; //- sheetAux.angleBegin;     //this.angleBeginPage;
						sheetAux.rotateZ(THREE.Math.degToRad(this.angleRatePage)); // rotation default of page
					}

					let sheet = new THREE.Group(); // Support the elements -- Center of rotation page

					// Page Background
					let pageGeometry = new THREE.PlaneGeometry(
						this.widthPage,
						this.lengthPage,
						0.1,
						0.1
					);
					let pageMaterial = new THREE.MeshBasicMaterial({
						transparent: true, //opacity: 0.5,
						map: textureLoader.load("../assets/parchment_alpha.png"),
						side: THREE.DoubleSide,
					});
					let page = new THREE.Mesh(pageGeometry, pageMaterial);
					page.name = "page_" + this.amountPages;
					page.position.set(this.widthPage / 2, 0, 0);
					page.rotateX(THREE.Math.degToRad(-90));
					sheet.add(page);
					sheet.position.set(0, this.heightBook, 0);
					sheet.sideOption = 0; //0 => Right, 1 => Left
					page.sheet = sheet;
					page.objectType = 0; // Page type
					page.indexPicture = indexPicture;

					// Image plane
					let imageGeometry = new THREE.PlaneGeometry(9, 4.5, 0.1, 0.1);
					let imageMaterial = new THREE.MeshBasicMaterial({
						color: "rgb(255, 255, 255)",
						side: THREE.DoubleSide,
					});
					let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
					imagePlane.position.set(0, this.lengthPage / 4.5, 0.01);
					imagePlane.objectType = 2;
					imagePlane.name = "imageBlock-Page_" + this.amountPages;
					page.add(imagePlane);
					imagePlane.indexPicture = indexPicture;

					// Informations block
					let informationGeometry = new THREE.PlaneGeometry( 9.6, 6.08, 0.1, 0.1 );
					let informationMaterial = new THREE.MeshBasicMaterial({
						transparent: true,
						side: THREE.DoubleSide,
						map: textureLoader.load(
							"../assets/pictures/information/" + language + "/" + indexPicture +".png"
						),
					});
					let informationPlane = new THREE.Mesh(informationGeometry, informationMaterial);
					informationPlane.name = "informationBlock-Page_" + this.amountPages;
					informationPlane.position.set(0, -this.lengthPage / 5, 0.025); //0.01
					page.add(informationPlane);
					this.amountSheets++;
					this.book.add(sheet); // Added sheet with page on the book
					sheet.angleBegin = this.angleBeginPage;
					sheet.angleFinish = this.angleFinishPage;
					sheet.animationAngle = 0;

					// Adjust finish angle
					for (let i = 0; i < this.book.children.length; i++) {
						let sheetAux = this.book.children[i];
						sheetAux.angleFinish =
							180 - i * this.angleRatePage - sheetAux.angleBegin; //this.angleBeginPage;
					}
				} else {
					let sheet = this.book.children[this.book.children.length - 1]; // Take a sheet to insert a page on the book
				
					// Page Background
					let pageGeometry = new THREE.PlaneGeometry(
						this.widthPage,
						this.lengthPage,
						0.1,
						0.1
					);
					let pageMaterial = new THREE.MeshBasicMaterial({
						transparent: true, //opacity: 0.5,
						map: textureLoader.load("../assets/parchment_alpha.png"),
						side: THREE.DoubleSide, //side:THREE.DoubleSide,
					});
					let page = new THREE.Mesh(pageGeometry, pageMaterial);
					page.name = "page_" + this.amountPages;
					page.position.set(this.widthPage / 2, -0.005, 0);
					page.rotateX(THREE.Math.degToRad(-90));
					sheet.add(page);
					sheet.position.set(0, this.heightBook, 0);
					sheet.sideOption = 0; // 0 => Right, 1 => Left
					page.sheet = sheet;
					page.objectType = 0; // Page type
					page.indexPicture = indexPicture;

					// Image plane
					let imageGeometry = new THREE.PlaneGeometry(
						this.widthPage / 1.5,
						this.lengthPage / 3,
						0.1,
						0.1
					);
					let imageMaterial = new THREE.MeshBasicMaterial({
						color: "rgb(255, 255, 255)",
						side: THREE.DoubleSide,
					});
					let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
					imagePlane.position.set(0, this.lengthPage / 4.5, -0.01);
					imagePlane.rotateY(THREE.Math.degToRad(180));
					imagePlane.objectType = 2;
					imagePlane.indexPicture = indexPicture;
					imagePlane.name = "imageBlock-Page_" + this.amountPages;
					page.add(imagePlane);

					// Informations block
					let informationGeometry = new THREE.PlaneGeometry(
						9.6,
						6.08,
						0.1,
						0.1
					);
					let informationMaterial = new THREE.MeshBasicMaterial({
						transparent: true /*opacity: 0.9,*/,
						side: THREE.DoubleSide,
						map: textureLoader.load(
							"../assets/pictures/information/" + language + "/" + indexPicture + ".png"
						),
					});
					let informationPlane = new THREE.Mesh(
						informationGeometry,
						informationMaterial
					);
					informationPlane.name = "informationBlock-Page_" + this.amountPages;
					informationPlane.position.set(0, -this.lengthPage / 5, -0.025); // -0.01
					informationPlane.rotateY(THREE.Math.degToRad(180));
					page.add(informationPlane);
					//this.book.add(sheet);       // Added sheet with page on the book
				}
				this.amountPages++;
			}),
			(this.createPicturesPanel = function (scene) {
				let painelGeometry = new THREE.BoxGeometry(30, 19.5, 5);
				let painelMaterial = new THREE.MeshStandardMaterial({
					transparent: true,
					opacity: 0.5,
					map: textureLoader.load("../assets/general/wood-2.jpg"),
					side: THREE.DoubleSide,
				});
				let panelPlane = new THREE.Mesh(painelGeometry, painelMaterial);
				panelPlane.position.set(0, 9.75, -15.1);
				scene.add(panelPlane);
				let skyboxGeometry = new THREE.SphereGeometry(200, 128, 128);
				let skyboxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/amir-timur-museum.jpeg"),
					side: THREE.DoubleSide,
				});
				let skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
				skybox.rotateY(60);
				skybox.position.set(0, 0, 50);
				scene.add(skybox);

				/** Pictures */

				let pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				let pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/1.jpg"),
					side: THREE.DoubleSide,
				});
				let picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.position.set(-10, 4.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 1;
				picture.name = "picture_01";
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				let nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				let nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/1.png"),
					side: THREE.DoubleSide,
				});
				let nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(-10, 1.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/2.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.name = "picture_02";
				picture.position.set(0, 4.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 2;
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/2.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(0, 1.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/3.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.position.set(10, 4.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 3;
				picture.name = "picture_03";
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/3.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(10, 1.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/4.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.position.set(-10, 10.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 4;
				picture.name = "picture_04";
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/4.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(-10, 7.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/5.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.name = "picture_05";
				picture.position.set(0, 10.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 5;
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/5.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(0, 7.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/6.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.position.set(10, 10.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 6;
				picture.name = "picture_06";
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/6.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(10, 7.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/7.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.position.set(-10, 16.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 7;
				picture.name = "picture_07";
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/7.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(-10, 13.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/8.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.name = "picture_08";
				picture.position.set(0, 16.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 8;
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/8.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(0, 13.5, -12);
				scene.add(nameBox);
				pictureGeometry = new THREE.PlaneGeometry(8, 4, 0.1, 0.1);
				pictureMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/9.jpg"),
					side: THREE.DoubleSide,
				});
				picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
				picture.position.set(10, 16.5, -12);
				picture.objectType = 1; //Image type
				picture.indexPicture = 9;
				picture.name = "picture_09";
				scene.add(picture);
				this.pictures.push(picture);
				this.orderPicturesBook.push(picture.indexPicture);
				nameBoxGeometry = new THREE.PlaneGeometry(8, 1, 0.1, 0.1);
				nameBoxMaterial = new THREE.MeshBasicMaterial({
					map: textureLoader.load("../assets/pictures/name/9.png"),
					side: THREE.DoubleSide,
				});
				nameBox = new THREE.Mesh(nameBoxGeometry, nameBoxMaterial);
				nameBox.position.set(10, 13.5, -12);
				scene.add(nameBox);
			}),
			(this.createScenary = function () {
				var spotLight = new THREE.SpotLight(0xffffff);
				spotLight.position.copy(new THREE.Vector3(0, 15, 15));
				spotLight.shadow.mapSize.width = 2048;
				spotLight.shadow.mapSize.height = 2048;
				spotLight.shadow.camera.fov = 15;
				spotLight.castShadow = true;
				spotLight.decay = 2;
				spotLight.penumbra = 0.05;
				spotLight.name = "spotLight";
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

				this.createMenu();
				this.createImageClone();
				this.createPicturesPanel(scene);
				this.orderPicturesBook = this.shuffleList(this.orderPicturesBook);
				this.createBook();
				this.createButtons();
				this.createMessages();

				pictureLooked = null;
				animationList = [];
				objectRaycaster = [];
				objectRaycasterClonePictures = [];

				// Pages of book
				for (let i = 0; i < this.book.children.length; i++) {
					let pageGroupRotation = this.book.children[i];
					for (let j = 0; j < pageGroupRotation.children.length; j++) {
						objectRaycaster.push(pageGroupRotation.children[j]); //Put inside only page without the group rotation
						objectRaycaster.push(pageGroupRotation.children[j].children[0]); // Image Block
					}
				}

				// Adding the images of paintwall
				for (let i = 0; i < this.pictures.length; i++) {
					objectRaycaster.push(this.pictures[i]);
					objectRaycasterClonePictures.push(this.pictures[i]);
				}

				// Buttons
				for (let i = 0; i < this.buttons.length; i++) {
					objectRaycaster.push(this.buttons[i]);
				}

				// Raycaster and mouse Controllers
				objectLooked = null;
				selectedImage = null;
			}),
			(this.emptyScene = function () {
				// Recreate VR Camera

				/*cameraVR = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
						cameraVR.position.set(0, 1.6, 0);
						dolly = new THREE.Group();      // This helps move the camera
						dolly.position.set(defaultCamera.position.x, defaultCamera.position.y, defaultCamera.position.z);
						scene.add( dolly );*/

				//console.log("Empty Scene");
				while (scene.children.length > 0) {
					//OU scene.remove.apply(scene, scene.children);
					scene.remove(scene.children[0]);
				}
				this.fails = 0;
				this.hits = 0;
				this.state = 0;
				this.timer.seconds = 0;
				this.timer.minutes = 0;
				this.amountSheets = 0;
				this.currentSheet = 0;
				this.amountPages = 0;
				this.buttons = [];
				this.pictures = [];
				this.orderPicturesBook = [];
				objectLooked = null;
				selectedImage = null;
				pictureLooked = null;
				objectRaycaster = [];
				objectRaycasterClonePictures = [];
				this.imageClone = null;
				this.book = new THREE.Group();
			}),
			(this.removeEntity = function (object) {
				let selected = scene.getObjectByName(object.name);
				scene.remove(selected);
			}),
			(this.removePictureFromWall = function (image, imagePlane) {
				for (let i = 0; i < this.pictures.length; i++) {
					if (this.pictures[i].indexPicture == image.indexPicture) {
						this.pictures.splice(i, 1);
						break;
					}
				}

				for (let j = 0; j < objectRaycaster.length; j++) {
					if (objectRaycaster[j].objectType == 1) {
						// picture of the wall
						if (objectRaycaster[j].indexPicture == image.indexPicture) {
							objectRaycaster.splice(j, 1);
							break;
						}
					}
				}
				for (let j = 0; j < objectRaycaster.length; j++) {
					if (objectRaycaster[j] == imagePlane) {
						// Remove imageBlock of the page
						objectRaycaster.splice(j, 1);
						break;
					}
				}

				for (let j = 0; j < objectRaycasterClonePictures.length; j++) {
					if (
						objectRaycasterClonePictures[j].indexPicture == image.indexPicture
					) {
						objectRaycasterClonePictures.splice(j, 1);
						break;
					}
				}
				this.removeEntity(image);
				objectLooked = null;
				selectedImage = null;
				controls.imageClone.position.set(-100, -100, -100);
				controls.imageClone.rotateX(THREE.Math.degToRad(90));
			}),
			(this.removeAllPictures = function () {
				for (let i = 0; i < this.pictures.length; i++) {
					let aux = this.pictures[i];
					this.removeEntity(aux);
				}
				objectRaycasterClonePictures = [];
				objectLooked = null;
				selectedImage = null;
				controls.imageClone.position.set(-100, -100, -100);
				controls.imageClone.rotateX(THREE.Math.degToRad(90));
			}),
			(this.shuffleList = function (list) {
				let auxOrderList = [];
				let auxList = [];
				for (let i = 0; i < list.length; i++) {
					auxList.push(list[i]);
				}
				for (let i = 0; i < auxList.length; i++) {
					let randomIndex = Math.floor(Math.random() * auxList.length);
					auxOrderList.push(auxList[randomIndex]);
					auxList.splice(randomIndex, 1);
					i--; // FIX remove when works with ".length"
				}
				return auxOrderList;
			});
	})();
	controls.createScenary();

	// Reajuste da renderização com base na mudança da janela
	function onResize() {
		rotationCamera.aspect = window.innerWidth / window.innerHeight; //Atualiza o aspect da camera com relação as novas dimensões
		rotationCamera.updateProjectionMatrix(); //Atualiza a matriz de projeção
		bookCamera.aspect = window.innerWidth / window.innerHeight;
		bookCamera.updateProjectionMatrix();
		pictureCamera.aspect = window.innerWidth / window.innerHeight;
		pictureCamera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight); //Define os novos valores para o renderizador
	}

	window.addEventListener("resize", onResize, false); // Ouve os eventos de resize

	//Only verify if has a collision with the pictures
	function checkRaycasterClonePictures() {
		if (selectedImage == null) {
			// FIX the bug of change the picture when moving above another picture
			raycasterPictures.setFromCamera(
				{ x: circleMarker.position.x, y: circleMarker.position.y },
				cameraVR
			);
			let intersects = raycasterPictures.intersectObjects(
				objectRaycasterClonePictures
			);
			if (intersects.length > 0) {
				let pictureLooked = intersects[0].object;
				if (pictureLooked.visible && objectLooked.visible) {
					// picture is not visible, only the clone it is
					controls.imageClone.position.x = pictureLooked.position.x;
					controls.imageClone.position.y = pictureLooked.position.y;
					controls.imageClone.position.z = pictureLooked.position.z + 0.2;
					controls.imageClone.material = pictureLooked.material.clone();
				}
			}
		}
	}

	// A cor do espaço de imagem na pagina muda pra verde

	function checkRaycasterOnImageAtPages() {
		if (
			objectLooked != null &&
			selectedImage != null &&
			objectLooked.objectType == 2
		) {
			objectImagePlane = objectLooked;
			objectImagePlane.material.color = new THREE.Color("rgb(0,180,0)");
		} else {
			if (objectImagePlane != null) {
				objectImagePlane.material.color = new THREE.Color("rgb(255,255,255)");
				objectImagePlane = null;
			}
		}
	}

	// Adiciona o renderer no elemento de VR
	document.body.appendChild(VRButton.createButton(renderer));

	/************************************************
	 *
	 * CONTROLADOR DO VR
	 *
	 ************************************************/

	let controller1 = renderer.xr.getController(0);
	controller1.addEventListener("select", onSelect);
	controller1.addEventListener("selectstart", onSelectStart);
	controller1.addEventListener("selectend", onSelectEnd);

	let controller2 = renderer.xr.getController(1);
	controller2.addEventListener("select", onSelect);
	controller2.addEventListener("selectstart", onSelectStart);
	controller2.addEventListener("selectend", onSelectEnd);
	scene.add(controller2);

	const controllerModelFactory = new XRControllerModelFactory();

	let controllerGrip1 = renderer.xr.getControllerGrip(0);
	controllerGrip1.add(
		controllerModelFactory.createControllerModel(controllerGrip1)
	);
	scene.add(controllerGrip1);

	let controllerGrip2 = renderer.xr.getControllerGrip(1);
	controllerGrip2.add(
		controllerModelFactory.createControllerModel(controllerGrip2)
	);
	scene.add(controllerGrip2);

	function onSelect() {
		if (objectLooked != null) {
			raycasterController();
		}
	}

	function onSelectStart(event) {
		const controller = event.target;
		if (controls.cameraOption == 0) {
			if (selectedImage != null) {
				if (selectedImage.objectType == 1) {
					/*controls.imageClone.position.x = pointCollisionRayCaster.x;
					controls.imageClone.position.y = pointCollisionRayCaster.y;
					controls.imageClone.position.z = -3.35; //pointCollisionRayCaster.z;  
					*/
					controller.attach(controls.imageClone);
					controller.userData.selected = controls.imageClone;
				}
			}
		}
	}

	function onSelectEnd(event) {
		const controller = event.target;
		if (controller.userData.selected !== undefined) {
			const object = controller.userData.selected;
			if (controls.cameraOption == 0) {
				if (objectLooked != null && objectLooked.objectType == 2) {
					if (selectedImage != null) {
						if (objectLooked.indexPicture == selectedImage.indexPicture) {
							objectLooked.material = selectedImage.material.clone(); // Generate a clone of material and replace on image plane
							controls.hits++;
							controls.removePictureFromWall(selectedImage, objectLooked); // Remove imagePlane and picture of panel
							if (controls.pictures.length == 0) {
								controls.state = 1;
								controls.messageVictory.visible = true;
							}
						} else {
							controls.fails++;
							if (controls.fails > 2) {
								controls.state = 2;
								//console.log("You lose");
								controls.removeAllPictures();
								controls.messageLoose.visible = true;
							}
						}
						objectImagePlane = null;
					}
				}
				if (selectedImage != null) {
					// Drop the picture
					selectedImage.visible = true;
					controls.imageClone.position.set(-100, -100, -100);
					controls.imageClone.rotateX(THREE.Math.degToRad(90));
				}
				selectedImage = null;
			}
			controller.userData.selected = undefined;
		}
	}

	function raycasterController() {
		switch (controls.cameraOption) {
			case 0: // rotationCamera
				{
					switch (objectLooked.objectType) {
						case 0:
							if (objectLooked.sheet.animationAngle == 0) {
								//Don't rotate if the page is moving
								if (objectLooked.sheet.sideOption == 0) {
									objectLooked.sheet.sideOption = 1;
									controls.currentSheet++;
								} else {
									objectLooked.sheet.sideOption = 0;
									controls.currentSheet--;
								}
								controls.adjustbuttons();
								animationList.push(objectLooked.sheet);
							}
							break;
						case 1: // Collide with image
							selectedImage = objectLooked;
							selectedImage.visible = false;
							controls.imageClone.rotateX(THREE.Math.degToRad(-90));
							break;
						case 2: // Collide with imagePlane on Page
							//
							//
							break;
						case 3: // Read Left page Button
							controls.cameraOption = 1; // Turn camera option
							controls.adjustbuttons();
							controls.buttons[2].visible = true;
							controls.buttons[2].position.set(
								-controls.widthPage - controls.sizeButton / 2,
								controls.buttons[2].position.y,
								0
							);
							bookCamera.position.set(-controls.widthPage / 2, 10, 1); // Y = 25
							defaultCamera = bookCamera;
							dolly.position.set(
								defaultCamera.position.x,
								defaultCamera.position.y,
								defaultCamera.position.z
							); //dolly.position.set(5 , 10, 20);
							//cameraVR.lookAt(0, 0, 0);
							cameraVR.rotateX(THREE.Math.degToRad(-90));
							break;
						case 4: // Read Right page Button
							controls.cameraOption = 1; // Turn camera option
							controls.adjustbuttons();
							controls.buttons[2].visible = true;
							controls.buttons[2].position.set(
								controls.widthPage + controls.sizeButton / 2,
								controls.buttons[2].position.y,
								0
							);
							bookCamera.position.set(controls.widthPage / 2 , 10, 1);
							defaultCamera = bookCamera;
							dolly.position.set(
								defaultCamera.position.x,
								defaultCamera.position.y,
								defaultCamera.position.z
							); //dolly.position.set(5 , 10, 20);
							//dolly.rotateX(THREE.Math.degToRad(-90));
							cameraVR.rotateX(THREE.Math.degToRad(-90));
							//cameraVR.lookAt(0, 0, 0);
							//cameraVR.rotation.set(0,0,0);
							//cameraVR.lookAt(0, 0, 0);
							//cameraVR.lookAt(controls.widthPage / 2, 0, 0);
							break;
						case 6: // Zoom In
							controls.cameraOption = 2;
							defaultCamera = pictureCamera;
							dolly.position.set(
								defaultCamera.position.x,
								defaultCamera.position.y,
								defaultCamera.position.z
							); //dolly.position.set(5 , 10, 20);
							controls.buttons[3].position.z = -11.9;
							controls.buttons[4].position.z = -11.8;
							controls.buttons[3].visible = false;
							controls.buttons[4].visible = true;
							break;
						case 8: // Retry Button
							controls.emptyScene();
							controls.createScenary();
							break;
					}
				}
				break;
			case 1: //  bookCamera
				{
					switch (objectLooked.objectType) {
						case 5: // Exit Button
							controls.cameraOption = 0;
							defaultCamera = rotationCamera;
							controls.adjustbuttons();
							dolly.position.set(
								defaultCamera.position.x,
								defaultCamera.position.y,
								defaultCamera.position.z
							); //dolly.position.set(5 , 10, 20);
							controls.buttons[2].visible = false;
							cameraVR.rotateX(0);
							break;
					}
				}
				break;
			case 2: // Picture Camera
				{
					switch (objectLooked.objectType) {
						case 7: // Zoom Out
							controls.cameraOption = 0;
							defaultCamera = rotationCamera;
							dolly.position.set(
								defaultCamera.position.x,
								defaultCamera.position.y,
								defaultCamera.position.z
							); //dolly.position.set(5 , 10, 20);
							controls.buttons[3].position.z = -11.8;
							controls.buttons[4].position.z = -11.9;
							controls.buttons[3].visible = true;
							controls.buttons[4].visible = false;
							break;
						case 8: // Retry Button
							controls.emptyScene();
							controls.cameraOption = 0;
							defaultCamera = rotationCamera;
							dolly.position.set(
								defaultCamera.position.x,
								defaultCamera.position.y,
								defaultCamera.position.z
							); //dolly.position.set(5 , 10, 20);
							controls.createScenary();
							break;
					}
				}
				break;
		}
	}

	function getIntersections(elements) {
		raycaster.setFromCamera(
			{ x: circleMarker.position.x, y: circleMarker.position.y },
			cameraVR
		);
		return raycaster.intersectObjects(elements);
	}

	function checkRaycaster() {
		let intersects = getIntersections(objectRaycaster);
		if (intersects.length > 0) {
			objectLooked = intersects[0].object;
			if (!objectLooked.visible) {
				// Object is not visible
				objectLooked = null;
				pointCollisionRayCaster = null;
			} else {
				pointCollisionRayCaster = intersects[0].point;
			}
		} else {
			if (objectLooked != null) {
				objectLooked = null;
				pointCollisionRayCaster = null;
			}
		}
	}

	renderer.setAnimationLoop(render);

	function render(t) {
		dt = (t - timeAfter) / 1000;
		checkRaycaster();
		controls.animationScenary();
		switch (controls.state) {
			case 0: // Game Running
				controls.timer.updateTime(dt);
				if (controls.cameraOption == 0) {
					checkRaycasterOnImageAtPages();
					checkRaycasterClonePictures();
				}
				break;
			case 1: // Victory
				break;
			case 2: // Loose
				break;
		}
		renderer.render(scene, cameraVR);
		timeAfter = t;
		requestAnimationFrame(render);
	}

	// Add a small and simple ground plane
	function createGroundPlane(width, height) {
		// create the ground plane
		var planeGeometry = new THREE.PlaneGeometry(width, height, 10, 10);
		var planeMaterial = new THREE.MeshStandardMaterial({
			map: textureLoader.load("../assets/general/floor-wood.jpg"),
			side: THREE.DoubleSide,
		});
		var plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.receiveShadow = true;
		return plane;
	}
}

// Exportando métodos e variáveis que serão vísiveis no módulo
export { main };
