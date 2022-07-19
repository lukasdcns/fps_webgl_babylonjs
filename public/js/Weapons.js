Weapons = function(Player) {
    this.Player = Player;
    this.bottomPosition = new BABYLON.Vector3(0.5, -2.5, 1);
    this.topPositionY = -0.5;
    this.rocketLauncher = this.newWeapon(Player);

    this.fireRate = 600;
    this._deltaFireRate = this.fireRate;
    this.canFire = true;
    this.launchBullets = false;

    let _this = this;
    let engine = Player.game.scene.getEngine();

    Player.game.scene.registerBeforeRender(function() {
        if (!_this.canFire) {
            _this._deltaFireRate -= engine.getDeltaTime();
            if (_this._deltaFireRate <= 0) {
                _this.canFire = true;
                _this._deltaFireRate = _this.fireRate;
            }
        }
    });
};

Weapons.prototype = {
    newWeapon : function(Player) {
        let newWeapon;
        newWeapon = BABYLON.Mesh.CreateBox('rocketLauncher', 0.5, Player.game.scene);

        // Nous faisons en sorte d'avoir une arme d'apparence plus longue que large
        newWeapon.scaling = new BABYLON.Vector3(1,0.7,2);

        // On l'associe à la caméra pour qu'il bouge de la même facon
        newWeapon.parent = Player.camera;

        // On positionne le mesh APRES l'avoir attaché à la caméra
        newWeapon.position = this.bottomPosition.clone();
        newWeapon.position.y = this.topPositionY;

        // Ajoutons un material Rouge pour le rendre plus visible
        let materialWeapon = new BABYLON.StandardMaterial('rocketLauncherMat', Player.game.scene);
        materialWeapon.diffuseColor=new BABYLON.Color3(1,0,0);

        newWeapon.material = materialWeapon;

        return newWeapon
    },
    fire : function(pickInfo) {
        this.launchBullets = true;
    },
    stopFire : function(pickInfo) {
        this.launchBullets = false;
    },
    launchFire : function() {
        if (this.canFire) {
            this.createRocket(this.Player.camera.playerBox)
            this.canFire = false; 
        }
    },
    createRocket : function(playerPosition, direction) {
        let positionValue = this.rocketLauncher.absolutePosition.clone();
        let rotationValue = playerPosition.rotation; 
        let Player = this.Player;
        let newRocket = BABYLON.Mesh.CreateBox("rocket", 1, Player.game.scene);
        newRocket.direction = new BABYLON.Vector3(
            Math.sin(rotationValue.y) * Math.cos(rotationValue.x),
            Math.sin(-rotationValue.x),
            Math.cos(rotationValue.y) * Math.cos(rotationValue.x)
        )
        newRocket.position = new BABYLON.Vector3(
            positionValue.x + (newRocket.direction.x * 1) , 
            positionValue.y + (newRocket.direction.y * 1) ,
            positionValue.z + (newRocket.direction.z * 1));
        newRocket.rotation = new BABYLON.Vector3(rotationValue.x,rotationValue.y,rotationValue.z);
        newRocket.scaling = new BABYLON.Vector3(0.5,0.5,1);
        newRocket.isPickable = false;
    
        newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene);
        newRocket.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        newRocket.registerAfterRender(function () {
            newRocket.translate(new BABYLON.Vector3(0, 0, 1), 1, 0);
            let rayRocket = new BABYLON.Ray(newRocket.position, newRocket.direction);
            let meshFound = newRocket.getScene().pickWithRay(rayRocket);

            if (!meshFound || meshFound.distance < 10) {
                newRocket.dispose();
            }
        });
    },
};