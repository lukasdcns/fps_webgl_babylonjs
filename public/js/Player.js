Player = function (game, canvas) {
    let _this = this;

    this.game = game;
    this.axisMovement = [false, false, false, false];
    this.angularSensibility = 150;
    this.weaponShoot = false;

    canvas.addEventListener("mousedown", function (event) { 
        if (_this.controlEnabled && !_this.weaponShoot) {
            _this.weaponShoot = true;
            _this.handleUserMouseDown();
        }
    }, false);

    canvas.addEventListener("mouseup", function (event) {
        if (_this.controlEnabled && _this.weaponShoot) {
            _this.weaponShoot = false;
            _this.handleUserMouseUp();
        }
    }, false);

    window.addEventListener("keyup", function(event) {
        switch(event.keyCode){
            case 90:
            _this.camera.axisMovement[0] = false;
            break;
            case 83:
            _this.camera.axisMovement[1] = false;
            break;
            case 81:
            _this.camera.axisMovement[2] = false;
            break;
            case 68:
            _this.camera.axisMovement[3] = false;
            break;
        }
    }, false);
    
    window.addEventListener("keydown", function(event) {
        switch(event.keyCode){
            case 90:
            _this.camera.axisMovement[0] = true;
            break;
            case 83:
            _this.camera.axisMovement[1] = true;
            break;
            case 81:
            _this.camera.axisMovement[2] = true;
            break;
            case 68:
            _this.camera.axisMovement[3] = true;
            break;
        }
    }, false);

    window.addEventListener("mousemove", function(event) {
        if(_this.rotEngaged === true){
            _this.camera.playerBox.rotation.y+=event.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.playerBox.rotation.x + (event.movementY * 0.001 * (_this.angularSensibility / 250));
            if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
                _this.camera.playerBox.rotation.x+=event.movementY * 0.001 * (_this.angularSensibility / 250);
            }
        }
    }, false);
    
    this._initCamera(this.game.scene, canvas);
    this.controlEnabled = false;
    this._initPointerLock();
};

Player.prototype = {
    _initPointerLock : function() {
        var _this = this;
        
        // Requete pour la capture du pointeur
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(event) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);
    
        // Evenement pour changer le paramètre de rotation
        var pointerlockchange = function (event) {
            _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;
            } else {
                _this.rotEngaged = true;
            }
        };
        
        // Event pour changer l'état du pointeur, sous tout les types de navigateur
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },
    _initCamera : function(scene, canvas) {
        let playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene);
        playerBox.position = new BABYLON.Vector3(-20, 5, 0);
        playerBox.ellipsoid = new BABYLON.Vector3(2, 2, 2);

        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
        this.camera.playerBox = playerBox;
        this.camera.parent = this.camera.playerBox;
        this.camera.playerBox.checkCollisions = true;
        this.camera.playerBox.applyGravity = true;
        this.camera.isMain = true;
        this.camera.weapons = new Weapons(this);
        this.camera.axisMovement = [false, false, false, false];
        this.isAlive = true;
        
        let hitBoxPlayer = BABYLON.Mesh.CreateBox("hitBoxPlayer", 3, scene);
        hitBoxPlayer.parent = this.camera.playerBox;
        hitBoxPlayer.scaling.y = 2;
        hitBoxPlayer.isPickable = true;
        hitBoxPlayer.isMain = true;
        
    },
    _checkMove : function(ratioFps) {
        let relativeSpeed = this.speed / ratioFps;
        if(this.camera.axisMovement[0]){
            forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed, 
                0, 
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(forward);
        }
        if(this.camera.axisMovement[1]){
            backward = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed, 
                0, 
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(backward);
        }
        if(this.camera.axisMovement[2]){
            left = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed, 
                0, 
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(left);
        }
        if(this.camera.axisMovement[3]){
            right = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed, 
                0, 
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(right);
        }
        this.camera.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-1.5) * relativeSpeed ,0));
    },
    handleUserMouseDown : function() {
        if (this.isAlive === true) {
            this.camera.weapons.fire();
        }
    },
    handleUserMouseUp : function () {
        if (this.isAlive === true) {
            this.camera.weapons.stopFire();
        }
    }
};

function degToRad(deg) {
    return (Math.PI*deg)/180
}

function radToDeg(rad) {
    return (rad*180)/Math.PI
}