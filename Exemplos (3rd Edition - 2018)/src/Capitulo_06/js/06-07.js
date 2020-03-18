// TODO: There is also a different way to do fonts now

/**
 * Site Converte fontes ttf ou outros formatos para TYPEFACE.json:
 * http://gero3.github.io/facetype.js/
 */

function init() {

    // use the defaults
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
    var scene = new THREE.Scene();
    initDefaultLighting(scene);
    var groundPlane = addLargeGroundPlane(scene)
    groundPlane.position.y = -30;
  
    var font_bitstream;
    var font_helvetiker_bold;
    var font_helvetiker_regular;
  
    var step = 0;
    var text1;
    var text2;
  
    // Carregando as fontes
    var fontload1 = new THREE.FontLoader();
    fontload1.load( '../../assets/fonts/bitstream_vera_sans_mono_roman.typeface.json', function ( response ) {
      controls.font = response;
      font_bitstream = response;
      controls.redraw();
      render();
    });
  
    var fontload2 = new THREE.FontLoader();
    fontload2.load( '../../assets/fonts/helvetiker_bold.typeface.json', function ( response ) {
      font_helvetiker_bold = response;
    });
  
    var fontload3 = new THREE.FontLoader();
    fontload3.load( '../../assets/fonts/helvetiker_regular.typeface.json', function ( response ) {
      font_helvetiker_regular = response;
    });

    // Novas fontes diferentes do exemplo
    var fontload4 = new THREE.FontLoader();
    fontload4.load( '../../assets/fonts/Arial_Regular.typeface.json', function ( response ) {
      font_arial_regular = response;
    });

    var fontload5 = new THREE.FontLoader();
    fontload5.load( '../../assets/fonts/Comic_Sans_MS_Regular.typeface.json', function ( response ) {
      font_ComicSansMS_regular = response;
    });

    var fontload6 = new THREE.FontLoader();
    fontload6.load( '../../assets/fonts/Georgia_Regular.typeface.json', function ( response ) {
      font_Georgia_regular = response;
    });

    var fontload7 = new THREE.FontLoader();
    fontload7.load( '../../assets/fonts/Times_New_Roman_Regular.typeface.json', function ( response ) {
      font_TimesNewRoman_regular = response;
    });
  
    // Funções de controle dos objetos em cena
    var controls = new function () {
  
      this.appliedMaterial = applyMeshNormalMaterial
      this.castShadow = true;
      this.groundPlaneVisible = true;
  
      this.stop = false;
      this.text = "Learning Three.js";
      this.size = 90;
      this.height = 90;
      this.bevelThickness = 2;
      this.bevelSize = 0.5;
      this.bevelEnabled = true;
      this.bevelSegments = 3;
      this.bevelEnabled = true;
      this.curveSegments = 12;
      this.steps = 1;
      this.fontName = "bitstream vera sans mono";

      // Função que redesenha e atualiza os controles do menu e recria a geometria.
      this.redraw = function () {
  
        switch (controls.fontName) {
          case 'bitstream vera sans mono': 
            controls.font = font_bitstream;
            break;
          case 'helvetiker': 
            controls.font = font_helvetiker_regular;
            break;
          case 'helvetiker bold': 
            controls.font = font_helvetiker_bold;
            break;
          // Fontes novas
          case 'Arial': 
            controls.font = font_arial_regular;
            break;
          case 'Times New Roman': 
            controls.font = font_TimesNewRoman_regular;
            break;
          case 'Comic Sans MS': 
            controls.font = font_ComicSansMS_regular;
            break;
          case 'Georgia': 
            controls.font = font_Georgia_regular;
            break;
        }
  
        redrawGeometryAndUpdateUI(gui, scene, controls, function() {
              var options = {
                size: controls.size,
                height: controls.height,
                weight: controls.weight,
                font: controls.font,
                bevelThickness: controls.bevelThickness,
                bevelSize: controls.bevelSize,
                bevelSegments: controls.bevelSegments,
                bevelEnabled: controls.bevelEnabled,
                curveSegments: controls.curveSegments,
                steps: controls.steps
              };
  
              var geom = new THREE.TextGeometry(controls.text, options)
              geom.applyMatrix(new THREE.Matrix4().makeScale(0.05,0.05,0.05));
              geom.center();
      
              return geom
            });
          };
        };
  
  
  
    var gui = new dat.GUI();
    gui.add(controls, 'stop').listen();           
    gui.add(controls, 'text').onChange(controls.redraw);         
    gui.add(controls, 'size', 0, 200).onChange(controls.redraw);
    gui.add(controls, 'height', 0, 200).onChange(controls.redraw);
    gui.add(controls, 'fontName', ['bitstream vera sans mono', 'helvetiker', 'helvetiker bold', 'Arial', 'Times New Roman', 'Comic Sans MS', 'Georgia']).onChange(controls.redraw);
    gui.add(controls, 'bevelThickness', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'bevelSize', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'bevelSegments', 0, 30).step(1).onChange(controls.redraw);
    gui.add(controls, 'bevelEnabled').onChange(controls.redraw);
    gui.add(controls, 'curveSegments', 1, 30).step(1).onChange(controls.redraw);
    gui.add(controls, 'steps', 1, 5).step(1).onChange(controls.redraw);
  
    // add a material section, so we can switch between materials
    gui.add(controls, 'appliedMaterial', {
      meshNormal: applyMeshNormalMaterial, 
      meshStandard: applyMeshStandardMaterial
    }).onChange(controls.redraw)
    
    gui.add(controls, 'castShadow').onChange(function(e) {controls.mesh.castShadow = e});
    gui.add(controls, 'groundPlaneVisible').onChange(function(e) {groundPlane.material.visible = e});
  
    function render() {
      stats.update();
  
      if(!controls.stop){
        controls.mesh.rotation.y = step += 0.005;
        controls.mesh.rotation.x = step;
        controls.mesh.rotation.z = step;
      }

      // render using requestAnimationFrame
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
}