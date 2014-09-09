/**
 * @author Yikai Gong
 */

var xLabs = xLabs || {};
var normal = new THREE.Vector3();
var binormal = new THREE.Vector3();

xLabs.Visitor = function(){
    this.startMov = false;
    this.container = null;
    this.camera = null;
    this.chaseCamera = null;
    this.cameraTrack;
    this.tube;
    this.scene = null;
    this.renderer = null;
    this.ground = null;
    this.sky = null;
    this.orbitControl = null;
    this.light = null;
    this.xLabsController = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.loader = new THREE.OBJMTLLoader();
    this.parent = new THREE.Object3D();
    this.gui;
    this.importObj;
    this.tubeGeometry;
    this.cameraHelper;
}

xLabs.Visitor.prototype = {
    init : function(){
        this.container= document.getElementById('container');
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(this.width,this.height);
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.scene.add(this.parent);
//        this.scene.add(this.object);
        THREEx.WindowResize(this.renderer, this.camera);
        this.initXLabsController();
        this.initBasicController();
        this.initCamera();
        this.initGround();
        this.initSky();
        this.initLight();
        this.initGUI();
        this.loadObject('assets/models/HosierLane/xLabs model.obj', 'assets/models/HosierLane/xLabs model.mtl'); //'assets/models/HosierLane/xLabs model.mtl'
//        this.loadObject('assets/models/HosierLane/xLabs model.obj', null);
        this.initTrack();

//        this.loadObject('assets/models/car/audi_body.obj', 'assets/models/car/audi_body.mtl');

    },
    start : function(){
        var self = this;
        function animation(){
            requestAnimationFrame(animation);
            if(self.startMov)
                self.update();
//            console.log(self.tubeGeometry);
//            self.cameraHelper.update();
//            self.renderer.render(self.scene, keyBoardControler.chase ? self.chaseCamera : self.camera);
//            self.renderer.render(self.scene, self.chaseCamera);
        }

        animation();
    },
    initCamera : function(){
        this.camera = new THREE.PerspectiveCamera(50, this.width/this.height, 0.1, 30000);
        this.chaseCamera = new THREE.PerspectiveCamera(50, this.width/this.height, 0.1, 30000);
        this.parent.add(this.chaseCamera);
        this.chaseCamera.lookAt(new THREE.Vector3(-1,0,0));
        this.cameraHelper = new THREE.CameraHelper(this.chaseCamera);
        this.cameraHelper.visible = true;
        this.addObject(this.cameraHelper);
//        console.log(this.scene);
        this.camera.position.set(15,15,15);
        this.camera.lookAt(new THREE.Vector3(0,5,0));
//        this.camera.setViewOffset(this.width,this.height, this.width/4 , this.height/4, this.width/2, this.height/2);

        this.orbitControl = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.orbitControl.userPan = false;
        this.orbitControl.userPanSpeed = 0.0;
        this.orbitControl.minDistance = 0.1;
        this.orbitControl.maxDistance = Infinity;
        this.orbitControl.target = new THREE.Vector3(0,0,0);
    },
    initLight : function(){
        this.light = new THREE.SpotLight(0xffffff);
        this.light.position.set(0,10000,0);
        this.scene.add(this.light);
        var directionalLight;
        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        directionalLight.position.set( -1000, 500, - 1000 );
        this.scene.add( directionalLight );
        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        directionalLight.position.set( - 1000, 500, 1000 );
        this.scene.add( directionalLight );
        directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 1000, 500, -1000 );
        this.scene.add( directionalLight );
        directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 1000, 500, 1000 );
        this.scene.add( directionalLight );
    },
    initGround : function(){
        var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/image/checkerboard.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set( 10, 10 );
        // DoubleSide: render texture on both sides of mesh
        var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
        var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
        this.ground = new THREE.Mesh(floorGeometry, floorMaterial);
        this.ground.scale.set(0.5,0.5,0.5);
        this.ground.rotation.x = Math.PI / 2;
        this.ground.position.set(0, -0.5, 0);
        this.scene.add(this.ground);
    },
    initSky : function(){
        var d = new THREE.Texture([]);
        d.format = THREE.RGBFormat;
        d.flipY = false;
        var loader = new THREE.ImageLoader();
        var getSide;
        loader.load('assets/image/skyboxsun25degtest.png', function (image) {
            getSide = function ( x, y ){
                var size = 1024;
                var canvas = document.createElement( 'canvas' );
                canvas.width = size;
                canvas.height = size;
                var context = canvas.getContext( '2d' );
                context.drawImage( image, - x * size, - y * size );
                return canvas;
            };
            d.image[ 0 ] = getSide( 2, 1 ); // px
            d.image[ 1 ] = getSide( 0, 1 ); // nx
            d.image[ 2 ] = getSide( 1, 0 ); // py
            d.image[ 3 ] = getSide( 1, 2 ); // ny
            d.image[ 4 ] = getSide( 1, 1 ); // pz
            d.image[ 5 ] = getSide( 3, 1 ); // nz
            d.needsUpdate = true;
        });
        var cubeShader = THREE.ShaderLib['cube'];
        cubeShader.uniforms['tCube'].value = d;
        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });
        this.sky = new THREE.Mesh(new THREE.BoxGeometry( 10000, 10000, 10000 ),skyBoxMaterial);
        this.scene.add(this.sky);
    },
    initXLabsController : function(){
        this.xLabsController = new xLabs.webCamController();
    },
    loadObject : function(obj_path, mtll_path){
        var self = this;
        this.loader = new THREE.OBJMTLLoader();
        this.loader.load(obj_path, mtll_path, function(object){
            self.addObject(object);
            self.startMov = true;
        });
    },
    initTrack : function(){
        this.cameraTrack = new THREE.ClosedSplineCurve3([
            new THREE.Vector3(-1.65,0.78,0.28),
            new THREE.Vector3(-14.67,0.78,0.28),new THREE.Vector3(-19.22,0.78,-4.04),
            new THREE.Vector3(-20.00,0.78,-30.39),new THREE.Vector3(-16.60,0.78,-35.37),
            new THREE.Vector3(-2.16,0.78,-35.37),new THREE.Vector3(1.65,0.78,-30.43),
            new THREE.Vector3(1.32,0.78,-4.54)]);
        this.tubeGeometry = new THREE.TubeGeometry(this.cameraTrack, 50, 1, 2, true);
        this.tubeMaterial = new THREE.MeshBasicMaterial({color:0xFF3300,wireframe:true});
        this.tubeMaterial.visible=true;
        this.tube = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
        this.addObject(this.tube);
//        this.startMov = true;
    },
    initBasicController : function () {
        window.addEventListener('keyup', function(event) { onKeyUp(event); }, false);
        window.addEventListener('keydown', function(event) { onKeyDown(event); }, false);
        window.addEventListener('keypress', function(event) { onKeyPress(event); });
    },
    update : function(){
//        var ratio = (Math.cos(degInRad(2*customRotation))+1)/2;
        var ratio = Math.cos(degInRad(customRotation));
        t += j*ratio;
        if(t>1) t-=1;
        if(t<0) t+=1;
        var self = this;
//        var time = Date.now();
//        var looptime = 40 * 1000;
//        var t = ( time % looptime ) / looptime;
//        console.log(customRotation);
//        console.log((Math.cos(degInRad(2*customRotation))+1)/2);
//        if(keyBoardControler.up)
//            t=0;
//        var t = (( time % looptime ) / looptime)*(Math.sin(degInRad(90+customRotation))+1)/2;

//        console.log(j);
        var pos = this.tubeGeometry.parameters.path.getPointAt( t );
        pos.y += 1.1;
        this.chaseCamera.position.copy(pos);
        direction = this.tubeGeometry.parameters.path.getTangentAt(t);
        this.chaseCamera.lookAt(pos.add(direction));
        this.chaseCamera.rotateOnAxis(new THREE.Vector3(0, 1, 0), degInRad(customRotation));
//        this.chaseCamera.lookAt(pos.add(direction));
        this.cameraHelper.update();

        if(keyBoardControler.left)
            customRotation += 1;
//            this.chaseCamera.rotateOnAxis(new THREE.Vector3(0, 1, 0), degInRad(1));
        if(keyBoardControler.right)
            customRotation -=1;
//            this.chaseCamera.rotateOnAxis(new THREE.Vector3(0, 1, 0), degInRad(-1));
        if(keyBoardControler.up){
            console.log(this.tubeGeometry.parameters.path.getTangentAt(t));
            j+=0.00001;
        }
        if(keyBoardControler.down){
//            console.log(this.tubeGeometry.parameters.path);
            j-=0.00001;
        }
        this.xLabsController.update(function(result){
            customRotation+=result;
        });
        this.renderer.render(self.scene, keyBoardControler.chase ? self.chaseCamera : self.camera);
    },
    addObject : function(object){
        this.scene.add(object);
    },
    initGUI : function (){
        var self = this;
        this.gui = new dat.GUI();
        this.importObj = document.createElement("input");
        this.importObj.type = 'file';
        this.importObj.multiple={};
        this.importObj.addEventListener("change", onFileChange);
        var parameters =
        {
            a: function() {self.importObj.click();},
            b: function() {}
        };
        // gui.add( parameters )
        this.gui.add( parameters, 'a' ).name('Import');
        this.gui.add( parameters, 'b' ).name('Clear');
//    this.gui.open();
        this.gui.close();
    }
}

var materialCreator;
var object;
function onFileChange(event){
    var fileReader;
    var objFile;
    var mtlFile;
    for(var i = 0; i < visitor.importObj.files.length ; i++){
        var filename = visitor.importObj.files[i].name
        var extension = filename.split( '.' ).pop().toLowerCase();
        if(extension === "obj"){
            objFile = visitor.importObj.files[i];
        }
        else if(extension === "mtl"){
            mtlFile = visitor.importObj.files[i];
        }
    }
    if(!objFile){
        alert("no .obj file specified");
        return;
    }
    if(mtlFile){
        readMTL(mtlFile);
    }
    else{
        readOBJ(objFile);
    }

    function readMTL (mtlFile) {
        var fileReader = new FileReader();
        fileReader.onload = function(event){
            var contents = event.target.result;
            var option = {};
            option.side = THREE.DoubleSide;
            materialCreator = new THREE.MTLLoader("/assets/models/HosierLane/", option).parse(contents);
            readOBJ(objFile, materialCreator);
        }
        fileReader.readAsText(mtlFile);
    }

    function readOBJ (objectFile, materialCreator){
        var fileReader = new FileReader();
        fileReader.onload = function(event){
            var contents = event.target.result;
            var object = new THREE.OBJLoader().parse(contents);
            if(materialCreator){
                materialCreator.preload();
                object.traverse(function(child){
                    if(child instanceof THREE.Mesh){
                        if(child.material.name){
                            var material = materialCreator.create(child.material.name);
                            if(material) child.material = material;
                        }
                    }
                });
            }
            object.position.set(0,2,0);
            visitor.scene.add(object);
        }
        fileReader.readAsText(objectFile);
    }
    console.log(objFile);
    console.log(mtlFile);
}

var direction;
var customRotation = 0;
var t = 0.0;
var j = 0.0005;