document.addEventListener('DOMContentLoaded', () => {
    // Initialize THREE.js
    const container = document.getElementById('environment-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
  
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);
  
    // Add a grid helper to the scene
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);
  
    // Add lights to the scene
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
  
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
  
    // Create a rotating cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-3, 1, 0); // Position the cube
    scene.add(cube);
  
    // Create a sphere
    const sphereGeometry = new THREE.SphereGeometry(0.75, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, 1, 0); // Position the sphere
    scene.add(sphere);
  
    // Create a torus knot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
    const torusKnotMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    torusKnot.position.set(0, 1, -3); // Position the torus knot
    scene.add(torusKnot);
  
    // Create a plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
    scene.add(plane);
  
    // Position the camera
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 1, 0);
  
    // Render loop
    function animate() {
      requestAnimationFrame(animate);
  
      // Rotate objects
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
  
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;
  
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
  
      renderer.render(scene, camera);
    }
  
    animate();
  });
  