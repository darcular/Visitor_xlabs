/**
 * @author Yikai Gong
 */

var xLabs = xLabs || {};

xLabs.Visitor = function(){
    this.container = null;
    this.camera = null;
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
    this.building = null;
    this.gui;
    this.importObj;
}

xLabs.Visitor.prototype = {
    init : function(){
        this.container= document.getElementById('container');
        this.renderer = new THREE.WebGLRenderer({antialias: false});
        this.renderer.setSize(this.width,this.height);
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
//        this.scene.add(this.object);
        THREEx.WindowResize(this.renderer, this.camera);
        this.initXLabsController();
        this.initCamera();
        this.initGround();
        this.initSky();
        this.initLight();
        this.initGUI();
        this.loadObject('assets/models/HosierLane/xLabs model.obj', 'assets/models/HosierLane/xLabs model.mtl'); //'assets/models/HosierLane/xLabs model.mtl'
//        this.loadObject('assets/models/car/audi_body.obj', 'assets/models/car/audi_body.mtl');
    },
    start : function(){
        var self = this;
        function animation(){
            requestAnimationFrame(animation);
            self.renderer.render(self.scene, self.camera);
        }
        animation();
    },
    initCamera : function(){
        this.camera = new THREE.PerspectiveCamera(50, this.width/this.height, 0.1, 30000);
        this.camera.position.set(0,3,0);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
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
        //TODO
    },
    initXLabsController : function(){
        this.xLabsController = new xLabs.webCamController();
    },
    loadObject : function(obj_path, mtll_path){
        var self = this;
        this.loader = new THREE.OBJMTLLoader();
        this.loader.load(obj_path, mtll_path, function(object){
            self.addObject(object);
        });


//        var mtlLoader = new THREE.MTLLoader("/assets/models/HosierLane/");
//        mtlLoader.load(mtll_path, function(materialCreator){
//            materialCreator.preload();
//            var objLoader = new THREE.OBJLoader();
//            objLoader.load(obj_path, function(object){
//                object.traverse(function(child){
//                    if (child instanceof THREE.Mesh){
//                        if(child.material.name){
//                            var material = materialCreator.create(child.material.name);
//                            if(material) child.material = material;
//                        }
//                    }
//                });
//                self.addObject(object);
//            });
//        });
    },
    addObject : function(object){
//        object.applyMatrix(new THREE.Matrix4().makeScale(0.2,0.2,0.2))
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