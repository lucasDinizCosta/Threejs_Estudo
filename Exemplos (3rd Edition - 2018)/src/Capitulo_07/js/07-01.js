/**
 *  Exemplo que exibe um número de sprites. Um sprite é um plano 2D que sempre fica 
 *  de frente pra camera
 */
function init() {

    // Utiliza padrões para Status, renderer e camera
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera();
    var clock = new THREE.Clock();
    var trackballControls = initTrackballControls(camera, renderer);            // Inicializa o controle da camera pelo mouse
  
    // Cria a cena que prende os elementos(luz, objetos...)
    // Cria uma cena com iluminação padrão
    var scene = new THREE.Scene();
  
    // Posiciona e centraliza o ponto da camera no centro da cena
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 150;
  
    camera.lookAt(new THREE.Vector3(0, 0, 0));              // Direciona a visão da camera para a posição padrão
  
    createSprites();
    render();
  
    function createSprites() {
      for (var x = -15; x < 15; x++) {
        for (var y = -10; y < 10; y++) {
          var material = new THREE.SpriteMaterial({
            color: Math.random() * 0xffffff
          });
  
          // THREE.SpriteMaterial ou THREE.SpriteCanvasMaterial
          var sprite = new THREE.Sprite(material);          // Instancia um sprite com o material de cor aleatória
          sprite.position.set(x * 4, y * 4, 0);
          scene.add(sprite);
        }
      }
    }
  
    function render() {
      stats.update();
      trackballControls.update(clock.getDelta());       // Controle com o mouse
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
}