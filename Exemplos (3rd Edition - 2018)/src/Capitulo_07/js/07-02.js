function init() {

    // Utiliza padrões de dados
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
    var clock = new THREE.Clock();              // Relógio controla e regula o mouse
    var trackballControls = initTrackballControls(camera, renderer);        // Controle do mouse
  
    // Posicionamento da camera
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 150;
  
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  
    // Cria a cena que prende os elementos do "mundo"
    var scene = new THREE.Scene();

    // Cria o eixo de coordenadas
    var axes = new THREE.AxesHelper(10);
    axes.name = "AXES";
    axes.visible = false;
    scene.add(axes);

    // Controle das propriedades de elementos em cena
    var controls = new function(){
        this.axes = false;
        this.axesSize = 10;
        this.size = 2;
        this.vertexColors = true;

        this.updateAxes = function(){
            scene.remove(axes);                                 //Remove o eixo antigo
            axes = new THREE.AxesHelper(controls.axesSize);
            axes.visible = this.axes;
            scene.add(axes);
        }

        this.updateElements = function(){
            var selectedObject = scene.getObjectByName("PointsCloud");
            scene.remove(selectedObject);
            createPoints();
        }
    }
  
    createPoints();
    render();
  
    function createPoints() {
  
      var geom = new THREE.Geometry();
      var material = new THREE.PointsMaterial({
        size: controls.size,
        vertexColors: controls.vertexColors,                 
        color: 0xffffff
      });
  
      // Posicionamento dos pontos no cenario
      for (var x = -15; x < 15; x++) {
        for (var y = -10; y < 10; y++) {
          var particle = new THREE.Vector3(x * 4, y * 4, 0);
          geom.vertices.push(particle);
          geom.colors.push(new THREE.Color(Math.random() * 0xffffff));
        }
      }
  
      var cloud = new THREE.Points(geom, material);
      cloud.name = "PointsCloud";
      scene.add(cloud);
    }

    // Cria menu lateral
    var gui = new dat.GUI();
    var guiProperties = gui.addFolder("Properties");
    guiProperties.add(controls, "axes").listen().onChange(function(e){
       if(controls.axes){
        axes.visible = true;
       }
       else{
        axes.visible = false;
       }
    });
    guiProperties.add(controls, "axesSize", 1, 40).listen().onChange(function(e){
        controls.updateAxes();
    });
    guiProperties.add(controls, "size", 0.5, 6.5).listen().onChange(function(e){
        controls.updateElements();
    });
    guiProperties.add(controls, "vertexColors").listen().onChange(function(e){
        controls.updateElements();
    });
  
    function render() {
      stats.update();
      trackballControls.update(clock.getDelta());
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
}