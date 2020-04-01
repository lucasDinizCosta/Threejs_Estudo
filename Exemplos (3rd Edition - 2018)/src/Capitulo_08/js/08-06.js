/**
 * Utiliza a classe/biblioteca "../../libs/three/loaders/OBJLoader.js" auxiliar para carregar
 * os arquivos
 * 
 * Carregamento de objetos OBJ e MTL:
 * OBJ: Define a geometria.
 * MTL: Define o material utilizado.
 */
function init() {

    // setup the scene for rendering
    var camera = initCamera(new THREE.Vector3(50, 50, 50));
    var loaderScene = new BaseLoaderScene(camera);
    camera.lookAt(new THREE.Vector3(0, 15, 0));
  
    var loader = new THREE.OBJLoader();
    loader.load('../../assets/models/pinecone/pinecone.obj', function (mesh) {      // Carrega o arquivo na mesh determinada
  
      var material = new THREE.MeshLambertMaterial({
        color: 0x5C3A21
      });
  
      // loadedMesh is a group of meshes. For 
      // each mesh set the material, and compute the information 
      // three.js needs for rendering.
      mesh.children.forEach(function (child) {                      // Computa cada vértice e ligações da geometria so sólido
        child.material = material;                                  // Utiliza o mesmo material para vertices e partições
        child.geometry.computeVertexNormals();
        child.geometry.computeFaceNormals();
      });
  
      mesh.scale.set(120,120,120)
  
      // call the default render loop.
      loaderScene.render(mesh, camera);
    });
}