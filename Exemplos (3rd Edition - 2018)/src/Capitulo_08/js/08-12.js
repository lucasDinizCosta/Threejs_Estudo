function init() {

    // setup the scene for rendering
    var camera = initCamera(new THREE.Vector3(10, 10, 10));
    var loaderScene = new BaseLoaderScene(camera);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Cria o eixo de coordenadas
    var axes = new THREE.AxesHelper(10);
    axes.name = "AXES";
    axes.visible = false;
    loaderScene.scene.add(axes);

    var controls = new function () {
      //Eixos
      this.axes = false;
      this.axesSize = 10;
      this.object = "diamond";

      this.updateAxes = function(){
        loaderScene.scene.remove(axes);                                 //Remove o eixo antigo
        axes = new THREE.AxesHelper(controls.axesSize);
        axes.visible = this.axes;
        loaderScene.scene.add(axes);
      }

      this.remove = function(){
        var selectedObject = loaderScene.scene.getObjectByName("Objeto");
        loaderScene.scene.remove(selectedObject);
      }
    };
  
    // Menu lateral
    var gui = new dat.GUI();
    gui.add(controls, "axes").listen().onChange(function(e){
        if(controls.axes){
            axes.visible = true;
        }
        else{
            axes.visible = false;
        }
    });
    gui.add(controls, "axesSize", 1, 40).listen().onChange(function(e){
        controls.updateAxes();
    });
  
    var guiObjects = gui.addFolder("Objects");
    guiObjects.add(controls, 'object', ["diamond", "aspirin"]).listen().onChange(function(e){
      controls.remove();
      carregaObjeto();
    });
  
    var loader = new THREE.PDBLoader();

    carregaObjeto();

    function carregaObjeto(){
      switch(controls.object){
        case "diamond":
          {
            loader.load("../../assets/models/molecules/diamond.pdb", function (geometries) {
          
              var group = new THREE.Object3D();
              group.name = "Objeto";
          
              // Cria a geometria de átomos
              var geometryAtoms = geometries.geometryAtoms;
              
              for (var i = 0; i < geometryAtoms.attributes.position.count; i++) {
                var startPosition = new THREE.Vector3();
                startPosition.x = geometryAtoms.attributes.position.getX(i);
                startPosition.y = geometryAtoms.attributes.position.getY(i);
                startPosition.z = geometryAtoms.attributes.position.getZ(i);
          
                var color = new THREE.Color();
                color.r = geometryAtoms.attributes.color.getX(i);
                color.g = geometryAtoms.attributes.color.getY(i);
                color.b = geometryAtoms.attributes.color.getZ(i);
          
                var material = new THREE.MeshPhongMaterial({
                  color: color
                });
          
                var sphere = new THREE.SphereGeometry(0.2);
                var mesh = new THREE.Mesh(sphere, material);
                mesh.position.copy(startPosition);
                group.add(mesh);
              }
          
              // Cria as ligações
              var geometryBonds = geometries.geometryBonds;
          
              for (var j = 0; j < geometryBonds.attributes.position.count; j += 2) {
                var startPosition = new THREE.Vector3();
                startPosition.x = geometryBonds.attributes.position.getX(j);
                startPosition.y = geometryBonds.attributes.position.getY(j);
                startPosition.z = geometryBonds.attributes.position.getZ(j);
          
                var endPosition = new THREE.Vector3();
                endPosition.x = geometryBonds.attributes.position.getX(j + 1);
                endPosition.y = geometryBonds.attributes.position.getY(j + 1);
                endPosition.z = geometryBonds.attributes.position.getZ(j + 1);
          
                // use the start and end to create a curve, and use the curve to draw
                // a tube, which connects the atoms
                var path = new THREE.CatmullRomCurve3([startPosition, endPosition]);
                var tube = new THREE.TubeGeometry(path, 1, 0.04);
                var material = new THREE.MeshPhongMaterial({
                  color: 0xcccccc
                });
                var mesh = new THREE.Mesh(tube, material);
                group.add(mesh);
              }
          
              loaderScene.render(group, camera);
            });
          }
          break;

        case "aspirin":
          {
            // also possible to use diamond.pdb
            loader.load("../../assets/models/molecules/aspirin.pdb", function (geometries) {
          
              var group = new THREE.Object3D();
              group.name = "Objeto";
          
              // Cria a geometria de átomos
              var geometryAtoms = geometries.geometryAtoms;
              
              for (var i = 0; i < geometryAtoms.attributes.position.count; i++) {
                var startPosition = new THREE.Vector3();
                startPosition.x = geometryAtoms.attributes.position.getX(i);
                startPosition.y = geometryAtoms.attributes.position.getY(i);
                startPosition.z = geometryAtoms.attributes.position.getZ(i);
          
                var color = new THREE.Color();
                color.r = geometryAtoms.attributes.color.getX(i);
                color.g = geometryAtoms.attributes.color.getY(i);
                color.b = geometryAtoms.attributes.color.getZ(i);
          
                var material = new THREE.MeshPhongMaterial({
                  color: color
                });
          
                var sphere = new THREE.SphereGeometry(0.2);
                var mesh = new THREE.Mesh(sphere, material);
                mesh.position.copy(startPosition);
                group.add(mesh);
              }
          
              // Cria as ligações
              var geometryBonds = geometries.geometryBonds;
          
              for (var j = 0; j < geometryBonds.attributes.position.count; j += 2) {
                var startPosition = new THREE.Vector3();
                startPosition.x = geometryBonds.attributes.position.getX(j);
                startPosition.y = geometryBonds.attributes.position.getY(j);
                startPosition.z = geometryBonds.attributes.position.getZ(j);
          
                var endPosition = new THREE.Vector3();
                endPosition.x = geometryBonds.attributes.position.getX(j + 1);
                endPosition.y = geometryBonds.attributes.position.getY(j + 1);
                endPosition.z = geometryBonds.attributes.position.getZ(j + 1);
          
                // use the start and end to create a curve, and use the curve to draw
                // a tube, which connects the atoms
                var path = new THREE.CatmullRomCurve3([startPosition, endPosition]);
                var tube = new THREE.TubeGeometry(path, 1, 0.04);
                var material = new THREE.MeshPhongMaterial({
                  color: 0xcccccc
                });
                var mesh = new THREE.Mesh(tube, material);
                group.add(mesh);
              }
          
              loaderScene.render(group, camera);
            });
          }
          break;          
      }
    }
}