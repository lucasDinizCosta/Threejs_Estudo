/**************************************************************************************
 * ----------------------------- Métodos e definições ------------------------------- *
 *                                                                                    *
 * => THREE.AnimationClip: Ao carregar um modelo que contem animações, pode-se obser- *
 * var um campo correspondente as animações denominado "animations". Esse campo con-  *
 * tem uma lista de objetos do tipo "THREE.AnimationClip";                            *
 *    Um "THREE.AnimationClip" geralmente mantém os dados para uma determinada anima- *
 * ção ou atividade que o modelo que você carregou pode executar                      *
 *                                                                                    *
 * => THREE.AnimationMixer: É usado para controlar o número de objetos de             *
 * "THREE.AnimationClip". Ele garante que o tempo da animação esteja correto e possi- *
 * bilite a sincronização conjunta de animações, ou mover de forma limpa de uma anima-*
 * ção para outra.                                                                    *
 *                                                                                    *
 * => THREE.AnimationAction: O próprio THREE.AnimationMixer não expõe um grande número*
 * de funções para controlar a animação, entretanto é feito através de objetos do tipo*
 * "THREE.AnimationAction", no qual são retornados quando adicionamos um              *
 * "THREE.AnimationClip" a um "THREE.AnimationMixer" (ou você pode obtê-los posterior-*
 * mente, usando as funções fornecidas pelo THREE.AnimationMixer).                    *
 *                                                                                    *
 *                                                                                    *
 **************************************************************************************/

function init() {
  var stats = initStats();
  var renderer = initRenderer();
  var camera = initCamera();
  var scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x333333));
  
  camera.position.set(0, 15, 70);

  var trackballControls = initTrackballControls(camera, renderer);
  var clock = new THREE.Clock();

  var mixer = new THREE.AnimationMixer();
  var clipAction;
  var frameMesh;
  var mesh;
  
  initDefaultLighting(scene);
  var loader = new THREE.JSONLoader();
  loader.load('../../assets/models/horse/horse.js', function (geometry, mat) {
      geometry.computeVertexNormals();
      geometry.computeMorphNormals();       // Focado em suavização da animação

      var mat = new THREE.MeshLambertMaterial({morphTargets: true, vertexColors: THREE.FaceColors});
      mesh = new THREE.Mesh(geometry, mat);
      mesh.scale.set(0.15, 0.15, 0.15);
      mesh.translateY(-10);
      mesh.translateX(10);

      /***************************************************************************
       * O construtor para esse objeto leva como argumento um "THREE.Object3D"   *
       * (por exemplo, um THREE.Mesh de um THREE.Group).                         *
       *                                                                         *
       **************************************************************************/

      mixer = new THREE.AnimationMixer( mesh );

      // or create a custom clip from the set of morphtargets
      // var clip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'gallop', geometry.morphTargets, 30 );
      animationClip = geometry.animations[0];

      /**************************************************************************
       * Cria um THREE.AnimationAction que pode ser usado para controlar o      *
       * THREE.AnimationClip transmitido. Se o clipe de animação for para um    *
       * objeto raiz diferente, você também pode transmiti-lo.                  *
       *                                                                        *
       * ".clipAction(animationClip, optionalRoot)"                             *
       *************************************************************************/

      clipAction = mixer.clipAction( animationClip ).play();    
      
      /**************************************************************************
       * Atribui o tipo de loop (loopMode) e o número de repetições.            *
       *                                                                        *
       * "setLoop(loopMode, repetitions)"                                       *
       *************************************************************************/
      /**************************************************************************
       * -------------------------- Tipos de loop ----------------------------- *
       *                                                                        *
       *    O tipo de loop é uma ação atribuida na função "setLoop", pode ser   *
       * da seguinte forma:                                                     *
       * A) THREE.LoopOnce: Executa o clip uma única vez.                       *
       * B) THREE.LoopRepeat: Repete o clip baseado no número de repetições que *
       * foi atribuido.                                                         *
       * C) THREE.LoopPingPong: Executa o clip baseado no número de repetições, *
       * mas alterna o sentido para frente e dps inverte, reproduzindo para trás*
       *                                                                        *
       *************************************************************************/

      clipAction.setLoop(THREE.LoopRepeat);
      scene.add(mesh)

      // enable the controls
      enableControls()
  })

  var controls = {
    keyframe: 0,
    time: 0,
    timeScale: 1,
    repetitions: Infinity,
    stopAllAction: function() {mixer.stopAllAction()},

    // warp
    warpStartTimeScale: 1,
    warpEndTimeScale: 1,
    warpDurationInSeconds: 2,
    warp: function() {clipAction.warp(controls.warpStartTimeScale, controls.warpEndTimeScale, controls.warpDurationInSeconds)},
    fadeDurationInSeconds: 2,
    fadeIn: function() {clipAction.fadeIn(controls.fadeDurationInSeconds)},
    fadeOut: function() {clipAction.fadeOut(controls.fadeDurationInSeconds)},
    effectiveWeight: 0,
    effectiveTimeScale: 0
  }

  // control which keyframe to show
  function enableControls() {
    /**************************************************************************
     * ------------------------ Funções presentes --------------------------- *
     *                                                                        *
     * => clampWhenFinished: Quando definida como true, a animação será       *
     * interrompida quando atingir o último frane. O default é false.         *
     *                                                                        *
     * => enabled: Quando definido como false, isso desativará a ação atual   *
     * para que não tenha efeito no modelo. Quando a ação for reativada, a    *
     * animação continuará de onde parou.                                     *
     *                                                                        *
     * => paused: Quando definida como true, pausa a execução do clip.        *
     *                                                                        *
     * => fadeIn(durationInSeconds): Aumenta a propriedade de "weight"(peso)  *
     * lentamente de 0 para1 dentro do intervalo de tempo passado.            *
     *                                                                        *
     * => fadeOut(durationInSeconds): Diminui a propriedade de "weight"(peso) *
     * lentamente de 0 para 1, dentro do intervalo de tempo passado.          *
     *                                                                        *
     * => timeScale: É uma escala usada para acelara ou desacelerar a anima-  *
     * ção. Se o valor da propriedade for 0, a animação será pausada          *
     *                                                                        *
     * => warp(startTimeScale, endTimeScale, durationInSeconds): Altera a     *
     * propriedade "timeScale" de "startTimeScale" para "endTimeScale" dentro *
     * do durationInSeconds especificado.                                     *
     *                                                                        *
     * => weight: O efeito que esta animação tem no modelo de uma escala de   *
     * 0 a 1. Quando definido como 0, você não verá nenhuma transformação do  *
     * modelo nessa animação e, quando definido como 1, verá o efeito completo*
     * dessa animação.                                                        *
     *                                                                        *
     * => zeroSlopeAtStart: Quando definido como true (que é o padrão), isso  *
     * garantirá uma transição suave entre clipes separados.                  *
     *                                                                        *
     *************************************************************************/

    var gui = new dat.GUI();
    var mixerFolder = gui.addFolder("AnimationMixer");
    mixerFolder.add(controls, "time").listen();
    mixerFolder.add(controls, "timeScale", 0, 5).onChange(function (timeScale) {mixer.timeScale = timeScale});
    mixerFolder.add(controls, "stopAllAction").listen();
    var actionFolder = gui.addFolder("AnimationAction");
    actionFolder.add(clipAction, "clampWhenFinished").listen();
    actionFolder.add(clipAction, "enabled").listen();
    actionFolder.add(clipAction, "paused").listen();
    actionFolder.add(clipAction, "loop", { LoopRepeat: THREE.LoopRepeat, LoopOnce: THREE.LoopOnce, LoopPingPong: THREE.LoopPingPong }).onChange(function(e) {
      if (e == THREE.LoopOnce || e == THREE.LoopPingPong) {
        clipAction.reset();
        clipAction.repetitions = undefined;
        clipAction.setLoop(parseInt(e), undefined);
        console.log(clipAction);
      } else {
        clipAction.setLoop(parseInt(e), controls.repetitions);
      }
    });
    actionFolder.add(controls, "repetitions", 0, 100).listen().onChange(function(e) {
      if (clipAction.loop == THREE.LoopOnce || clipAction.loop == THREE.LoopPingPong) {
        clipAction.reset();
        clipAction.repetitions = undefined;
        clipAction.setLoop(parseInt(clipAction.loop), undefined);
      } else {
        clipAction.setLoop(parseInt(e), controls.repetitions);
      }
    });
    actionFolder.add(clipAction, "time", 0, animationClip.duration, 0.001).listen();
    actionFolder.add(clipAction, "timeScale", 0, 5, 0.1).listen();
    actionFolder.add(clipAction, "weight", 0, 1, 0.01).listen();
    actionFolder.add(controls, "effectiveWeight", 0, 1, 0.01).listen();
    actionFolder.add(controls, "effectiveTimeScale", 0, 5, 0.01).listen();
    actionFolder.add(clipAction, "zeroSlopeAtEnd").listen();
    actionFolder.add(clipAction, "zeroSlopeAtStart").listen();
    actionFolder.add(clipAction, "stop");
    actionFolder.add(clipAction, "play");
    actionFolder.add(clipAction, "reset");
    actionFolder.add(controls, "warpStartTimeScale", 0, 10, 0.01);
    actionFolder.add(controls, "warpEndTimeScale", 0, 10, 0.01);
    actionFolder.add(controls, "warpDurationInSeconds", 0, 10, 0.01);
    actionFolder.add(controls, "warp");
    actionFolder.add(controls, "fadeDurationInSeconds", 0, 10, 0.01);
    actionFolder.add(controls, "fadeIn");
    actionFolder.add(controls, "fadeOut");
    
    gui.add(controls, "keyframe", 0, 15).step(1).onChange(function (frame) { showFrame(frame);});
  }

  function showFrame(frame) {
    if (mesh) {
      scene.remove(frameMesh);
      var newVertices = mesh.geometry.morphTargets[frame].vertices;
      frameMesh = mesh.clone();
      frameMesh.geometry.vertices = newVertices;
      frameMesh.translateX(-30);
      frameMesh.translateZ(-10);
      scene.add(frameMesh);
    }
  }

  render();
  function render() {
    stats.update();
    var delta = clock.getDelta();
    trackballControls.update(delta);
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    if (mixer && clipAction) {
      /************************************************************************
       * mixer.update(delta): é utilizado para informar ao mixer como o tempo *
       * foi passado entre o render loop e o loop anterior                    *
       *                                                                      *
       ************************************************************************/
      mixer.update( delta ); 
      controls.time = mixer.time;
      controls.effectiveTimeScale = clipAction.getEffectiveTimeScale();
      controls.effectiveWeight = clipAction.getEffectiveWeight();
    }
  }   
}