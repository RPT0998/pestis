(function(ns) {
  ns.TiledMap = {
    /**
     * Current map config
     */
    mapConfig: undefined,

    /**
     * Current map
     */
    map: undefined,

    /**
     * All tilesets
     */
    tilesets: [],

    /**
     * All tiled images
     */
    images: {},

    /**
     * All tiled objects
     */
    objects: {},

    /**
     * Map of spawned objects
     * @type {{}}
     */
    spawnedObjects: {},


    getMapObject: function(id) {
      return this.objects[id];
    },

    loadMap: function(mapConfig) {
      var levelResources = '/resources/maps/' + mapConfig.name + '/';
      var levelFile = levelResources + mapConfig.name + '.json';
      this.load.tilemapTiledJSON(mapConfig.name, levelFile);

      var levelImages = levelResources + '/images/';

      for(var i=0, length=mapConfig.images.length; i < length; ++i) {
        var image = mapConfig.images[i];
        var imageName = image.substr(0, image.lastIndexOf('.'));
        var imageExtension = image.substr(image.lastIndexOf('.'));

        var imageFile = levelImages + imageName + imageExtension;
        var normalsFile = levelImages + imageName + "_n" + imageExtension;

        this.load.image(imageName, [ imageFile, normalsFile ]);
      }

      this.mapConfig = mapConfig;
    },

    buildMap: function() {
      this.map = this.make.tilemap({ key: this.mapConfig.name });
      this._addTilesets();
      this._createTilesetLayers();
      this._createObjectsFromLayer();
    },

    _addTilesets: function() {
      if(this.map !== undefined) {
        for(var i=0, length=this.map.tilesets.length; i < length; i++) {
          var tileset = this.map.tilesets[i];
          if(this._isTileLayerTileset(tileset)) {
            var tilesetImage = this.map.addTilesetImage(tileset.name, tileset.name, 16, 16);
            this.tilesets.push(tileset.name);
          } else {
            this.images[tileset.firstgid] = tileset;
          }
        }
      }
    },

    _createTilesetLayers: function() {
      if(this.map !== undefined) {
        var tileLayerNames = this.map.getTileLayerNames();

        for (var i = 0, length = tileLayerNames.length; i < length; i++) {
          var layer = this.map.getLayer(tileLayerNames[i]);
          var dynamicLayer = this.map.createDynamicLayer(layer.name, this.tilesets, 0, 0);
          dynamicLayer.setPipeline('Light2D');
        }
      }
    },

    _createObjectsFromLayer: function() {
      if(this.map !== undefined) {
        var objectLayerNames = this.map.getObjectLayerNames();

        for(var i=0,ilength=objectLayerNames.length; i < ilength; ++i) {
          var objectLayer = this.map.getObjectLayer(objectLayerNames[i]);
          var objects = objectLayer.objects;

          for(var j=0, olength=objects.length; j < olength; ++j) {
            var object = objects[j];

            this.objects[object.id] = object;

            if(this._isImageObject(object)) {
              var tileset = this.images[object.gid];
              var imageName = this._getTilesetImageKey(tileset);

              var sprite = this.add.sprite(object.x, object.y, imageName);
              sprite.id = object.id;
              sprite.name = object.name;

              if (object.width) { sprite.displayWidth = object.width; }
              if (object.height) { sprite.displayHeight = object.height; }

              var offset = {
                x: sprite.originX * object.width,
                y: (sprite.originY - 1) * object.height
              }

              if (object.rotation)
              {
                var angle = Phaser.Math.DegToRad(object.rotation);
                Phaser.Math.Rotate(offset, angle);
                sprite.rotation = angle;
              }

              sprite.x += offset.x;
              sprite.y += offset.y;

              if (object.flippedHorizontal !== undefined || object.flippedVertical !== undefined)
              {
                sprite.setFlip(object.flippedHorizontal, object.flippedVertical);
              }

              sprite.setPipeline('Light2D');

              this.spawnedObjects[sprite.id] = sprite;
            }
          }
        }
      }
    },

    _isImageObject: function(object) {
      return object.gid !== undefined;
    },

    _isTileLayerTileset: function(tileset) {
      return !_.endsWith(tileset.name, '.png');
    },

    _getTilesetImageKey: function(tileset) {
      var name = tileset.name;

      if(_.endsWith(name, '.png')) {
        var file = name.substr(name.lastIndexOf('/') + 1);
        name = file.substr(0, file.lastIndexOf('.'));
      }

      return name;
    }
  }
})(candlegamestools.namespace('candlegames.pestis.scenes.components'));