/**
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim & kkukshtel / simile
 */

( function () {

	var video          = document.createElement( 'video' );
	var precision      = 3;
	var linesGeometry  = new THREE.Geometry();
	var pointsGeometry = new THREE.Geometry();

	RGBDVideo = function ( properties ) {

		var depthWidth   = properties.depthImageSize.x;
		var depthHeight  = properties.depthImageSize.y;
		var isPlaying    = false;
		var imageTexture = THREE.ImageUtils.loadTexture( 'files/' + properties.name + '.png' );
		var videoTexture = new THREE.Texture( video );

		for ( var y = 0; y < depthHeight; y += precision ) {
			for ( var x = 0, x2 = precision; x < depthWidth; x += precision, x2 += precision ) {
				linesGeometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
				linesGeometry.vertices.push( new THREE.Vector3( x2, y, 0 ) );
			}
		}

		for ( var y = 0; y < depthHeight; y += precision ) {
			for ( var x = 0; x < depthWidth; x += precision ) {
				pointsGeometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
			}
		}

		THREE.Object3D.call( this );

		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.format = THREE.RGBFormat;
		videoTexture.generateMipmaps = false;

		var linesMaterial = new THREE.ShaderMaterial( {

			uniforms: {
				"map":         { type: "t", value: imageTexture },
				"opacity":     { type: "f", value: 0.25 },
				"mindepth":    { type: "f", value: properties.nearClip },
				"maxdepth":    { type: "f", value: properties.farClip },
				"imageWidth":  { type: "f", value: properties.depthImageSize.x },
				"imageHeight": { type: "f", value: properties.depthImageSize.y },
				"focalX":      { type: "f", value: properties.depthFocalLength.x },
				"focalY":      { type: "f", value: properties.depthFocalLength.y },
				"principleX":  { type: "f", value: properties.depthPrincipalPoint.x },
				"principleY":  { type: "f", value: properties.depthPrincipalPoint.y }
			},

			vertexShader:   document.getElementById( 'vs' ).textContent,
			fragmentShader: document.getElementById( 'fs' ).textContent,
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			depthWrite:     false,
			wireframe:      true,
			transparent:    true

		} );

		linesMaterial.linewidth = 1;

		this.add( new THREE.Line( linesGeometry, linesMaterial, THREE.LinePieces ) );

		var pointsMaterial = new THREE.ShaderMaterial( {

			uniforms: {

				"map":         { type: "t", value: imageTexture },
				"opacity":     { type: "f", value: 0.25 },
				"mindepth":    { type: "f", value: properties.nearClip },
				"maxdepth":    { type: "f", value: properties.farClip },
				"imageWidth":  { type: "f", value: properties.depthImageSize.x },
				"imageHeight": { type: "f", value: properties.depthImageSize.y },
				"focalX":      { type: "f", value: properties.depthFocalLength.x },
				"focalY":      { type: "f", value: properties.depthFocalLength.y },
				"principleX":  { type: "f", value: properties.depthPrincipalPoint.x },
				"principleY":  { type: "f", value: properties.depthPrincipalPoint.y }
			},

			vertexShader:   document.getElementById( 'vs' ).textContent,
			fragmentShader: document.getElementById( 'fs' ).textContent,
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			depthWrite:     false,
			transparent:    true

		} );

		this.add( new THREE.ParticleSystem( pointsGeometry, pointsMaterial ) );

		// progress bar
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3() );
		geometry.vertices.push( new THREE.Vector3( 1, 0, 0 ) );

		var progress        = new THREE.Line( geometry, new THREE.LineBasicMaterial( { linewidth: 1, opacity: 0.75 } ) );
		progress.position.x = - 100;
		progress.position.y = - 300;
		progress.position.z = - properties.nearClip + 500;
		progress.visible    = false;
		this.add( progress );

		var background        = new THREE.Line( geometry, new THREE.LineBasicMaterial( { linewidth: 1, opacity: 0.25 } ) );
		background.position.x = - 100;
		background.position.y = - 305;
		background.position.z = - properties.nearClip + 500;
		background.scale.x    = 200;
		background.visible    = false;
		this.add( background );


		var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.25, transparent: true } );

		// public
		var interval;

		this.rollover = function () {

			linesMaterial.uniforms.opacity.value  = 0.75;
			pointsMaterial.uniforms.opacity.value = 0.75;

		};

		this.rollout = function () {

			if ( isPlaying === true ) return;

			linesMaterial.uniforms.opacity.value  = 0.25;
			pointsMaterial.uniforms.opacity.value = 0.25;

		};

		this.play = function () {

			if ( isPlaying === true ) return;

			progress.visible   = true;
			background.visible = true;

			linesMaterial.uniforms.opacity.value  = 0.75;
			pointsMaterial.uniforms.opacity.value = 0.75;

			video.src = 'files/' + properties.name + '.webm';
			video.play();

			interval = setInterval( function () {

				if ( video.readyState === video.HAVE_ENOUGH_DATA ) {

					linesMaterial.uniforms.map.value = videoTexture;
					pointsMaterial.uniforms.map.value = videoTexture;

					progress.scale.x = ( video.currentTime / video.duration ) * 200;
					videoTexture.needsUpdate = true;

				}

			}, 1000 / 25 );

			isPlaying = true;

		};

		this.pause = function () {

			if ( isPlaying === false ) return;

			progress.visible = false;
			background.visible = false;

			linesMaterial.uniforms.opacity.value = 0.25;
			pointsMaterial.uniforms.opacity.value = 0.25;

			video.pause();

			clearInterval( interval );

			isPlaying = false;

		};

		this.isPlaying = function () {

			return isPlaying;

		};

	};

	RGBDVideo.prototype = Object.create( THREE.Object3D.prototype );

} )();
