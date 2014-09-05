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
}

xLabs.Visitor.prototype = {
    init : function(){
        this.container= document.getElementById('container');
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(this.width,this.height);
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
//        this.scene.add(this.object);
        THREEx.WindowResize(this.renderer, this.camera);

    },
    start : function(){

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
    },
    initGround : function(){
//        var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/image/checkerboard.jpg' );
//        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
//        floorTexture.repeat.set( 10, 10 );
//        var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
        var floorMaterial = new THREE.MeshBasicMaterial({color:THREE.blue});
        var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
        this.ground = new THREE.Mesh(floorGeometry, floorMaterial);
//        this.ground.scale.set(0.02,0.02,0.02);
        this.ground.rotation.x = Math.PI / 2;
        this.ground.add(this.ground);
    },
    initSky : function(){
        //TODO
    },
    initXLabsController : function(){
        this.xLabsController = new xLabs.webCamController();
    },
    loadObject : function(obj_path, mtll_path){
//        var self = this;
//        this.loader.load(obj_path, mtll_path, function(object){
//            self.addObject(object);
//        });
    }
}