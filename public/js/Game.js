document.addEventListener('DOMContentLoaded', () => {
    new Game('app');
}, false);

Game = function(canvasId) {
    let canvas = document.getElementById(canvasId);
    let engine = new BABYLON.Engine(canvas, true);
    this.engine = engine;
    let _this = this;
    _this.actualTime = Date.now();
    
    this.scene = this._initScene(engine);
    let _player = new Player(_this, canvas);
    let _arena = new Arena(_this);

    // Permet au jeu de tourner
    engine.runRenderLoop(function() {
        _this.fps = Math.round(1000 / engine.getDeltaTime());
        _player._checkMove((_this.fps) / 60);
        _this.scene.render();

        if (_player.camera.weapons.launchBullets === true) {
            _player.camera.weapons.launchFire();
        }
    });

    // Ajuste la vue 3D si la fenetre est agrandi ou diminué
    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    }, false);
}

Game.prototype = {
    // Prototype d'initialisation de la scène
    _initScene : function(engine) {
        let scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0.9,0.9,0.9);
        scene.gracity = new BABYLON.Vector3(0, -9.81, 0);
        scene.collisionsEnabled = true;
        
        return scene;
    }
}