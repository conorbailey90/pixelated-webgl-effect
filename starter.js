import './style.css'
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const canvas = document.querySelector('.webgl')

class CanvasWebgl{
  constructor(canvas){
    this.canvas = canvas;
    
    this.scene = new THREE.Scene();

    this.setDimensions();
    this.setup();
    this.addEventListeners()
    this.createMesh()
    this.animate()
  }

  setDimensions(){
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    this.aspectRatio = this.sizes.width / this.sizes.height
    
  }

  setup(){
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 100)
    this.camera.position.z = 5;
    this.scene.add(this.camera)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enabled = true;
  }


  addEventListeners(){
    // Reset camera dimensions on screen resize
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight
  
      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();
  
      // Update Renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
    })
    // Full screen on double click
    window.addEventListener('dblclick', () => {
      const fullscreenElement = document.fullscreenElement || document.webkitFullScreenElement;
      if(!fullscreenElement){
          console.log('go full screen')
          this.canvas.requestFullscreen()
      }else{
          console.log('exit full screen')
          document.exitFullscreen()
      }
    })
    
  }

  createMesh(){
    this.geometry = new THREE.BoxGeometry(1,1,1);
    this.material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh)
  }

  animate(){
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.animate.bind(this))
  }
}

new CanvasWebgl(canvas)
